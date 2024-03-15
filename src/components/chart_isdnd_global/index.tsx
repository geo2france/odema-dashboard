import { BaseRecord } from "@refinedev/core"
import alasql from "alasql";
import { EChartsOption, LineSeriesOption } from "echarts";
import ReactECharts from 'echarts-for-react'; 
import { useRef } from "react";

export interface IChartIsdndGlobalProps {
    data : BaseRecord[]
    year?:number
    onClick?: Function
}
export const ChartIsdndGlobal: React.FC<IChartIsdndGlobalProps> = ({ data, onClick=() => undefined, year }) => {
    const chartRef = useRef<any>();

    const data_chart = alasql(`
        SELECT [annee], SUM([capacite]) as capacite, SUM([tonnage]) as tonnage 
        FROM ?
        GROUP BY [annee]
    `, [data])

    const serie_tonnage:LineSeriesOption={
        type:'line', name:'Entrant',
        data: data_chart.map((e:BaseRecord) => ({name:e.annee.toString(), value:e.tonnage}))
    }

    const axie_category = [...new Set(data_chart.map(item => item.annee))]
    .map((e:any) => ({
        value: e,
        textStyle: {
            fontWeight: e == year ? 700 : 400
        }
    }));

    const serie_capacite:LineSeriesOption={
        type:'line', name:'Capacite',      areaStyle: {},     step: 'end',

        data: data_chart.map((e:BaseRecord) => ({name:e.annee.toString(), value:e.capacite}))
    }
    const option:EChartsOption = {
        series:[serie_tonnage, serie_capacite],
        legend: {top:'top', show:true},
        xAxis: [
            {
                type: 'category',
                data: axie_category  
            }
        ],
        yAxis: [
            {
                type: 'value',
                axisLabel:{formatter: (value:number) => `${value.toLocaleString()} t`}
            }
        ],
    }
    return (
        <ReactECharts
        option={option} ref={chartRef} style={{ height: "450px" }} /> 
    )
}