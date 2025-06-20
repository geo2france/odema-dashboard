import alasql from "alasql";
import { EChartsOption, PieSeriesOption } from "echarts";
import ReactECharts from 'echarts-for-react';  // or var ReactECharts = require('echarts-for-react');
import { chartBusinessProps } from "../../utils";
import { CSSProperties, useRef } from "react";
import { SimpleRecord, useChartActionHightlight, useChartEvents, useDashboardElement } from "api-dashboard";


export interface ChartPieTypeTraitementProps {
    data: any[] | SimpleRecord[]; // Spécifier les champs au niveau de la ressource
    data_territoire: any[] | SimpleRecord[]; // Le endpoint précédent ne fournie pas la POPANNEE
    c_region?:string;
    onFocus?:any;
    focus_item?:string;
    style? : CSSProperties
  }

const ChartPieTypeTraitement: React.FC<ChartPieTypeTraitementProps> = ({data, data_territoire, onFocus, focus_item, c_region='32', style} )  => {
    const chartRef = useRef<any>()
    
    useChartEvents({chartRef:chartRef, onFocus:onFocus})
    useChartActionHightlight({chartRef:chartRef, target:{name:focus_item}})
    useDashboardElement({chartRef})

    //TODO : Ajouter un onglet avec l'évolution des type de traitement par an (avec surbrillance de l'année en cours)
    //TODO : Ajouter des chiffres clé (Taux de recylage : valo matière + valo organique)
    const data_pie = (alasql(`SELECT 
    t.C_REGION, t.ANNEE, t.L_TYP_REG_SERVICE, sum(t.TONNAGE_DMA) as TONNAGE_DMA, a.pop_region
    FROM (
        SELECT c.Annee AS ANNEE, c.C_REGION, sum(c.VA_POPANNEE) as pop_region 
        FROM ? c 
        GROUP BY c.Annee, c.C_REGION
    ) as a
    JOIN ? t ON a.ANNEE = t.ANNEE AND t.C_REGION = a.C_REGION
    WHERE t.C_REGION = '${c_region}'
    GROUP BY t.C_REGION, t.ANNEE, t.L_TYP_REG_SERVICE, a.pop_region
    `, [data_territoire, data]) as SimpleRecord[]).map((e:SimpleRecord) => ({ratio_kg_hab:(e.TONNAGE_DMA*1000) / e.pop_region, ...e}))
    

   

    const myserie:PieSeriesOption = {
        type : 'pie',
        data : data_pie.map((e:SimpleRecord) => ({name:e.L_TYP_REG_SERVICE, value:(e.TONNAGE_DMA*1000) / e.pop_region, itemStyle:{color:chartBusinessProps(e.L_TYP_REG_SERVICE).color}  })).sort((a:SimpleRecord,b:SimpleRecord) => (chartBusinessProps(a.name).sort || 0) - (chartBusinessProps(b.name).sort ||0 ) ),
        radius: ['40%', '70%'],
        startAngle:-90,
        clockwise:true,
        itemStyle: {
          borderRadius: 10,
          borderColor: '#fff',
          borderWidth: 2
        },
        emphasis:{
            focus:'series'
        },
        label: {
            show: true,
            formatter: (params) => (`${Number(params.percent).toFixed(0)} %`)        
        },
        tooltip:{
            show:true,
            valueFormatter: (value) => (`${Number(value).toFixed(2)} kg/hab` )
        }
    }


    const option:EChartsOption = {
        series:[myserie],
        grid:{
            left:'95px',
        },
        legend: {top:'top', show:true},
        tooltip: {
            trigger: 'item'
        }
    }


    return (
        <ReactECharts option={option} ref={chartRef} style={ style} />
    )
}

export default ChartPieTypeTraitement