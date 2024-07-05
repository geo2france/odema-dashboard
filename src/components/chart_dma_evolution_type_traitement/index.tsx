import { BaseRecord } from "@refinedev/core";
import alasql from "alasql";
import { CSSProperties, useRef } from "react";
import ReactECharts from 'echarts-for-react';
import { EChartsOption, BarSeriesOption } from "echarts";
import { useDashboardElement } from "../../g2f-dashboard/components/dashboard_element/hooks";
import { useChartActionHightlight } from "../../g2f-dashboard/utils/usecharthightlight";
import { chartBusinessProps, useChartEvents } from "../../utils";

export interface ChartEvolutionTraitementProps {
    data: any[] | BaseRecord[]; // Spécifier les champs au niveau de la ressource
    c_region?:string;
    onFocus?:any;
    focus_item?:string;
    style? : CSSProperties
  }

export const ChartEvolutionTraitement: React.FC<ChartEvolutionTraitementProps> = ({data, onFocus, focus_item, style} )  => {
    const chartRef = useRef<any>()
    
    useChartEvents({chartRef:chartRef, onFocus:onFocus})
    useChartActionHightlight({chartRef:chartRef, target:{name:focus_item}})
    useDashboardElement({chartRef})

    const data_chart = alasql(`SELECT [annee], [l_typ_reg_service], SUM([tonnage_dma]) as tonnage
    FROM ?
    GROUP BY [annee], [l_typ_reg_service]
    `,[data]) //Somme par type de traitement

    const data_chart2 = alasql(`
    SELECT [l_typ_reg_service], ARRAY(ARRAY[[annee], [tonnage]]) as data
    FROM ?
    GROUP BY [l_typ_reg_service]
    `,[data_chart]) //Regroupement par type de traitement (= série pour echarts bar)

    const categories = alasql(`SELECT ARRAY(DISTINCT [annee]) as annees FROM ?`, [data])[0].annees.sort().map((e:number) => e.toString())

     const series:BarSeriesOption[] = data_chart2.map((e:BaseRecord) => ({
         name:e.l_typ_reg_service,
         data:e.data.map((e:number[]) => [e[0].toString(), e[1]]),
         type:'bar',
         stack:'total',
         itemStyle:{
              color:chartBusinessProps(e.l_typ_reg_service).color,
         }
    })).sort((a:any,b:any) => (chartBusinessProps(a.name).sort || 0) - (chartBusinessProps(b.name).sort || 0)   )

    const option:EChartsOption = {
        series:series,
        tooltip:{
            show:true,
        },
        xAxis: [
            {
                type: 'category',
                data:categories
            }],
        yAxis: [
            {
                type: 'value'
            }
        ]

    }
    return (
        <ReactECharts option={option} ref={chartRef} style={ style} />
    )
}