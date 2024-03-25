import { BaseRecord } from "@refinedev/core"
import alasql from "alasql";
import { BarSeriesOption, EChartsOption, LineSeriesOption } from "echarts";
import ReactECharts from 'echarts-for-react'; 
import { useRef } from "react";
import { useChartEvents } from "../../utils";

export interface IChartIsdndGlobalProps {
    data : BaseRecord[]
    year?:number
    onClick?: Function
}
export const ChartIsdndGlobal: React.FC<IChartIsdndGlobalProps> = ({ data, onClick=() => undefined, year }) => {
    const chartRef = useRef<any>();

    useChartEvents({chartRef:chartRef, onClick:onClick})


    const data_chart = alasql(`
        SELECT [annee], SUM([capacite]) as capacite, SUM([tonnage]) as tonnage 
        FROM ?
        GROUP BY [annee]
        ORDER BY [annee]
    `, [data])


    const data_objectif = [
        ['2010', 1241112*2],
        ['2025', 1241112],
        ['2050', 1241112]
    ]

    const serie_tonnage: BarSeriesOption = {
        type: 'bar',
        name: 'Tonnages enfouis',
        tooltip:{
            valueFormatter: (value) => (`${Math.round(Number(value)).toLocaleString()} t` )
        },
        data: data_chart.map((e: BaseRecord) => (
            {
                value: [e.annee.toString(), e.tonnage],
                itemStyle: {
                    color: e.annee == year ? '#C1232B' : undefined
                }
            }
        )),
    }

    const serie_capacite: LineSeriesOption = {
        type: 'line', 
        name: 'Capacité autorisée', 
        itemStyle:{color:'#D44F4A'},
        showSymbol: false,
        step: 'end',
        tooltip:{
            valueFormatter: (value) => (`${Math.round(Number(value)).toLocaleString()} t` )
        },
        data: data_chart.map((e: BaseRecord) => (
            { value: [e.annee.toString(), e.capacite]  })
        )
    }

const serie_objectif:LineSeriesOption = {
    type: 'line', 
    name: 'Objectif -50%', 
    showSymbol: true,
    data: data_objectif,
    areaStyle:{opacity:0.1}
}

    const option:EChartsOption = {
        series:[serie_tonnage, serie_capacite, serie_objectif],
        legend: {top:'top', show:true},
        xAxis: [
            {
                type: 'time'
            }
        ],
        tooltip: {
            trigger: 'axis',
        },
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