import { BaseRecord } from "@refinedev/core"
import alasql from "alasql";
import { BarSeriesOption, EChartsOption, LineSeriesOption } from "echarts";
import ReactECharts from 'echarts-for-react'; 
import { CSSProperties, useRef } from "react";
import { useChartEvents } from "../../utils/usecharthighlight";

export interface IChartEvolutionISDND {
    data : BaseRecord[]
    aiot: string
    year?:number
    onClick: Function
    style? : CSSProperties
}
export const ChartEvolutionISDND: React.FC<IChartEvolutionISDND> = ({ data, aiot, onClick, year, style }) => {
    const chartRef = useRef<any>();

    useChartEvents({chartRef:chartRef, onClick:onClick})

    const data_chart = data
    .filter((e) => e.aiot == aiot)
    .map((e) => ({ serie_name: e.name, value: e.tonnage, category: e.annee.toString(), capacite:e.capacite }))
    .sort((a, b) => a.category - b.category)

    const data_agg = alasql(`
        SELECT d.[serie_name] AS name, ARRAY(@[d.category, d.[value]]) AS data, ARRAY(@[d.category, d.[capacite]]) AS data_capacite
        FROM ? d
        GROUP BY d.[serie_name]
`, [data_chart])


    const myseries: BarSeriesOption[] = data_agg.map((e: BaseRecord) => (
        {
            name:`Entrants`,
            data:e.data.map((f:any[]) => ({
                value:[f[0], f[1]],
                itemStyle: {
                    color: f[0] == year ? '#C1232B' : undefined
                } 

             })),
            type: 'bar',
            stack: 'stack1',
            tooltip:{
                show:true,
                valueFormatter: (value:number) => (`${Math.round(Number(value)).toLocaleString()} t` )
            }
        }
    ))

    const myseries_capcite: LineSeriesOption[] = data_agg.map((e: BaseRecord) => (
        {
            name:`Capacite`,
            data:e.data_capacite,
            type: 'line',
            step: 'middle',
            itemStyle:{color:'#D44F4A'},
            tooltip:{
                show:true,
                valueFormatter: (value:number) => (`${Math.round(Number(value)).toLocaleString()} t` )
            }
        }
    ))

    const option: EChartsOption ={
        series:[...myseries,...myseries_capcite],
        legend: {top:'top', show:true},
        tooltip: {
            trigger: 'item'
        },
        xAxis: [
            {
                type: 'time',
               axisLabel:{rotate:-50},
               maxInterval:1000*60*60*24*365, //1 year max interval
               max:'2023'
            }
        ],
        yAxis: [
            {
                type: 'value',
                axisLabel:{formatter: (value:number) => `${(value/1e3).toLocaleString()} kt`}
            }
        ],
        grid:{
            left:'75px',
        },
    }

    return (
        <ReactECharts
        option={option} ref={chartRef} style={style} />
    )
}