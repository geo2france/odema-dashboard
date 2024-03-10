import { BaseRecord } from "@refinedev/core"
import alasql from "alasql";
import { BarSeriesOption, EChartsOption } from "echarts";
import ReactECharts from 'echarts-for-react'; 
import { useChartHighlight } from "../../utils";
import { useRef } from "react";
import { useChartEvents } from "../../utils/usecharthighlight";

export interface IChartEvolutionISDND {
    data : BaseRecord[]
    aiot: string
    onClick: Function
}
export const ChartEvolutionISDND: React.FC<IChartEvolutionISDND> = ({ data, aiot, onClick }) => {
    const chartRef = useRef<any>();

    useChartEvents({chartRef:chartRef, onClick:onClick})

    const data_chart = data
    .filter((e) => e.aiot == aiot)
    .map((e) => ({ serie_name: e.name, value: e.tonnage, category: e.annee }))
    .sort((a, b) => a.category - b.category)

    const axie_category = [...new Set(data_chart.map(item => item.category))]
    .map((e) => ({
        value: e
    }));

    const myseries: BarSeriesOption[] = alasql(`
    SELECT d.[serie_name] AS name, ARRAY(d.[value]) AS data
    FROM ? d
    GROUP BY d.[serie_name]
`, [data_chart]).map((e: BaseRecord) => (
        {
            name:e.name,
            data:e.data,
            type: 'bar',
            stack: 'stack1',
            tooltip:{
                show:true,
                valueFormatter: (value:number) => (`${Math.round(Number(value)).toLocaleString()} t` )
            }
        }
    ))

    const option: EChartsOption ={
        series:myseries,
        legend: {top:'top', show:true},
        tooltip: {
            trigger: 'item'
        },
        xAxis: [
            {
                type: 'category',
                data: axie_category
            }
        ],
        yAxis: [
            {
                type: 'value'
            }
        ],
    }

    return (
        <ReactECharts
        option={option} ref={chartRef} style={{ height: "450px" }} />
    )
}