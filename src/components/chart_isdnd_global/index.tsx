import { BaseRecord } from "@refinedev/core"
import alasql from "alasql";
import { BarSeriesOption, EChartsOption, LineSeriesOption } from "echarts";
import ReactECharts from 'echarts-for-react'; 
import { CSSProperties, useRef } from "react";
import { useChartEvents } from "../../g2f-dashboard/utils/usecharthightlight";
import { useChartData, useDashboardElement } from "../../g2f-dashboard/components/dashboard_element/hooks";

export interface IChartIsdndGlobalProps {
    data : BaseRecord[]
    data_capacite : BaseRecord[]
    year?:number
    onClick?: Function
    style?: CSSProperties
}
export const ChartIsdndGlobal: React.FC<IChartIsdndGlobalProps> = ({ data, data_capacite, onClick=() => undefined, year, style}) => {
    const chartRef = useRef<any>();

    useDashboardElement({chartRef})
    useChartEvents({chartRef:chartRef, onClick:onClick})

    const data_chart = alasql(`
        SELECT c.[annee], SUM(c.[capacite]) as capacite, SUM(t.[tonnage]) as tonnage 
        FROM ? t
        RIGHT JOIN ? c ON c.[annee]=t.[annee] AND c.[aiot]=t.[aiot]
        GROUP BY c.[annee]
        ORDER BY c.[annee]
    `, [data, data_capacite])
    
    useChartData({data:data_chart, dependencies:[year]})

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