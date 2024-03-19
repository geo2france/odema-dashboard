import { BaseRecord } from "@refinedev/core"
import alasql from "alasql";
import { BarSeriesOption, EChartsOption, LineSeriesOption } from "echarts";
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
        ORDER BY [annee]
    `, [data])

    const serie_tonnage: BarSeriesOption = {
        type: 'bar',
        name: 'Entrant',
        data: data_chart.map((e: BaseRecord) => (
            { value: [e.annee.toString(), e.tonnage] }
        )),
    }

    const serie_capacite: LineSeriesOption = {
        type: 'line', 
        name: 'Capacite', 
        itemStyle:{color:'#D44F4A'},
        showSymbol: false,
        step: 'end',
        data: data_chart.map((e: BaseRecord) => (
            { value: [e.annee.toString(), e.capacite] })
        ),
        markLine:{
            "label":{
                "position":"start",
                "textBorderColor":"#FEF8EF", 
                "textBorderWidth":3,
                "fontSize":13
            
            },
            "data":[
                [{
                        "name": "Objectif 2025 -50%",
                        "xAxis": "2025",
                        "yAxis": 1241112,
                        "symbol":"circle",
                        "lineStyle":{
                            "color":"#ff3333",
                            "width":1,
                            "type": 'dashed'
                        }
                    },{
                        "xAxis": "max",
                        "yAxis": 1200000,
                        "symbol":"arrow"
                }],
            ]
        },

    }
    const option:EChartsOption = {
        series:[serie_tonnage, serie_capacite],
        legend: {top:'top', show:true},
        xAxis: [
            {
                type: 'time',
            }
        ],
        yAxis: [
            {
                type: 'value',
                axisLabel:{formatter: (value:number) => `${value.toLocaleString()} t`}
            }
        ]
    }
    return (
        <ReactECharts
        option={option} ref={chartRef} style={{ height: "450px" }} /> 
    )
}