import { chartBusinessProps } from "../../utils"
import { BarSeriesOption, EChartsOption } from "echarts";
import ReactECharts from 'echarts-for-react'; 
import alasql from "alasql";
import { CSSProperties, useRef } from "react";
import { SimpleRecord, useChartActionHightlight, useChartEvents } from "api-dashboard";

export interface ChartEvolutionRepCollecteProps{
    data:SimpleRecord[],
    filiere: 'd3e' | 'pa' | 'pchim' | 'tlc' | 'mnu' | 'disp_med' | 'pu' | 'vhu';
    year?:number
    onFocus?:any;
    focus_item?:string;
    style? : CSSProperties
}


//TODO ajouter un "Segmented Controls" pour switcher vers des bares normalized ?
export const ChartEvolutionRepCollecte: React.FC<ChartEvolutionRepCollecteProps> = ({ data, filiere, onFocus, focus_item, year, style }) => {
    const chartRef = useRef<any>()

    useChartEvents({chartRef:chartRef, onFocus:onFocus})
    useChartActionHightlight({chartRef:chartRef, target:{seriesName:focus_item}})

    const data_chart = data
        .map((e) => ({ serie_name: chartBusinessProps(e.name).label, value: e.value, category: e.annee }))
        .sort((a, b) => a.category - b.category)

    const axie_category = [...new Set(data_chart.map(item => item.category))]
        .map((e) => ({
            value: e,
            textStyle: {
                fontWeight: e == year ? 700 : 400
            }
        }));

    const myseries = (alasql(`
        SELECT d.[serie_name] AS name, ARRAY(d.[value]) AS data
        FROM ? d
        GROUP BY d.[serie_name]
    `, [data_chart]) as SimpleRecord[]).map((e: SimpleRecord) => (
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
        )) as BarSeriesOption[];

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
        option={option} ref={chartRef} style={ style } />)
}