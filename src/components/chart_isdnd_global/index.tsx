import { BaseRecord } from "@refinedev/core"
import alasql from "alasql";
import { BarSeriesOption, EChartsOption, LineSeriesOption } from "echarts";
import ReactECharts from 'echarts-for-react'; 
import { CSSProperties, useContext, useEffect, useRef } from "react";
import { useChartEvents } from "../../utils";
import { chartContext } from "../dashboard_element";

export interface IChartIsdndGlobalProps {
    data : BaseRecord[]
    year?:number
    onClick?: Function
    style?: CSSProperties
}
export const ChartIsdndGlobal: React.FC<IChartIsdndGlobalProps> = ({ data, onClick=() => undefined, year, style}) => {
    const chartRef = useRef<any>();
    const {setchartRef} = useContext(chartContext) //Gérer les cas où ce contexte n'existe pas

    useEffect(() => {
        if (setchartRef){
                setchartRef(chartRef)
            }
        }, [chartRef]
    ) //Simplifer dans le hook ? Par exemple creer un hook useDashboardElement ?

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
        z:3
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
        ),
        z:2
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
                axisLabel:{formatter: (value:number) => `${(value/1e6).toLocaleString()} Mt`}
            }
        ]
    }
    
    return (
        <ReactECharts
        option={option} ref={chartRef} style={style} />
    )
}