import { BaseRecord } from "@refinedev/core";
import alasql from "alasql";
import { CSSProperties, useRef } from "react";
import ReactECharts from 'echarts-for-react';
import { EChartsOption, BarSeriesOption } from "echarts";
import { useDashboardElement } from "../../g2f-dashboard/components/dashboard_element/hooks";
import { useChartActionHightlight, useChartEvents } from "../../g2f-dashboard/utils/usecharthightlight";
import { chartBusinessProps } from "../../utils";

interface DataProps {
    annee:number
    l_typ_reg_service:string
    tonnage_dma:number
    [key: string]: any
}

export interface ChartEvolutionTraitementProps {
    data: DataProps[]
    c_region?:string;
    onFocus?:any;
    focus_item?:string;
    style? : CSSProperties;
    year? : number
  }

export const ChartEvolutionTraitement: React.FC<ChartEvolutionTraitementProps> = ({data, onFocus, focus_item, style, year} )  => {
    const chartRef = useRef<any>()
    
    useChartEvents({chartRef:chartRef, onFocus:onFocus})
    useChartActionHightlight({chartRef:chartRef, target:{seriesName:focus_item}})
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
         },
         emphasis:{
            focus:'series'
        },
    })).sort((a:any,b:any) => (chartBusinessProps(a.name).sort || 0) - (chartBusinessProps(b.name).sort || 0)   )

    const option:EChartsOption = {
        series:series,
        tooltip:{
            show:true,
        },
        xAxis: [
            {
                type: 'category',
                data:categories.map((annee:number) => ({
                    value:annee,
                    textStyle: {
                        fontWeight: annee == year ? 700 : undefined,
                        fontSize: annee == year ? 14 : undefined
                    }
                }))
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