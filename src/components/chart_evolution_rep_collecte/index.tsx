import { BaseRecord } from "@refinedev/core"
import { chartBusinessProps } from "../../utils"
import { BarSeriesOption, EChartsOption } from "echarts";
import ReactECharts from 'echarts-for-react'; 
import alasql from "alasql";
import { useRef } from "react";
import { useChartAction, useChartEvents } from "../../utils/usecharthighlight";

export interface ChartEvolutionRepCollecteProps{
    data:BaseRecord[],
    filiere: 'd3e' | 'pa' | 'pchim' | 'tlc' | 'mnu' | 'disp_med' | 'pu' | 'vhu';
    year?:number
    onFocus?:any;
    focus_item?:string;
}


//TODO ajouter un "Segmented Controls" pour switcher vers des bares normalized ?
export const ChartEvolutionRepCollecte: React.FC<ChartEvolutionRepCollecteProps> = ({ data, filiere, onFocus, focus_item, year }) => {
    const chartRef = useRef<any>()

    useChartEvents({chartRef:chartRef, onFocus:onFocus})
    useChartAction({chartRef:chartRef, item:focus_item, highlight_key:'seriesName'})

    const data_chart = data
        .map((e) => ({ serie_name: chartBusinessProps(e.name).label, value: e.value, category: e.annee }))
        .sort((a, b) => a.category - b.category)

    console.log(data)

    const axie_category = [...new Set(data_chart.map(item => item.category))]
        .map((e) => ({
            value: e,
            textStyle: {
                fontWeight: e == year ? 700 : 400
            }
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
                itemStyle:{color:chartBusinessProps(e.name).color},
                tooltip:{
                    show:true,
                    valueFormatter: (value:number) => (`${Math.round(Number(value)).toLocaleString()} t` )
                }
            }
        ))

    const option: EChartsOption = {
        series: myseries,
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
    return (<ReactECharts
        option={option} ref={chartRef} style={{ height: "450px" }} />)
}