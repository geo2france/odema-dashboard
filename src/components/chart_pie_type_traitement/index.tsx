import { BaseRecord } from "@refinedev/core";
import alasql from "alasql";
import { EChartsOption, PieSeriesOption, SunburstSeriesOption } from "echarts";
import ReactECharts from 'echarts-for-react';  // or var ReactECharts = require('echarts-for-react');
import { DMAmapCategorieProps } from "../../utils";


interface ChartPieTypeTraitementProps {
    data: any[] | BaseRecord[]; // Spécifier les champs au niveau de la ressource
    data_territoire: any[] | BaseRecord[]; // Le endpoint précédent ne fournie pas la POPANNEE
    c_region?:string
  }

export const ChartPieTypeTraitement: React.FC<ChartPieTypeTraitementProps> = ( {data, data_territoire, c_region='32'} ) => {
    //TODO : Ajouter un onglet avec l'évolution des type de traitement par an (avec surbrillance de l'année en cours)
    const data_pie = alasql(`SELECT 
    t.C_REGION, t.ANNEE, t.L_TYP_REG_SERVICE, sum(t.TONNAGE_DMA) as TONNAGE_DMA, a.pop_region
    FROM (
        SELECT c.ANNEE, c.C_REGION, sum(c.VA_POPANNEE) as pop_region 
        FROM ? c 
        GROUP BY c.ANNEE, c.C_REGION
    ) as a
    JOIN ? t ON a.ANNEE = t.ANNEE AND t.C_REGION = a.C_REGION
    WHERE t.C_REGION = '${c_region}'
    GROUP BY t.C_REGION, t.ANNEE, t.L_TYP_REG_SERVICE, a.pop_region
    `, [data_territoire, data]).map((e:BaseRecord) => ({ratio_kg_hab:(e.TONNAGE_DMA*1000) / e.pop_region, ...e}))
    

   

    const myserie:PieSeriesOption = {
        type : 'pie',
        data : data_pie.map((e:BaseRecord) => ({name:e.L_TYP_REG_SERVICE, value:(e.TONNAGE_DMA*1000) / e.pop_region, itemStyle:{color:DMAmapCategorieProps(e.L_TYP_REG_SERVICE).color}  })).sort((a:BaseRecord,b:BaseRecord) => DMAmapCategorieProps(a.name).sort - DMAmapCategorieProps(b.name).sort ),
        radius: ['40%', '70%'],
        startAngle:-90,
        clockwise:true,
        itemStyle: {
          borderRadius: 10,
          borderColor: '#fff',
          borderWidth: 2
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
        <ReactECharts
        option={option} style={{ height: "450px"}}/>
    )
}