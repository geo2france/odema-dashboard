import alasql from "alasql";
import { BarSeriesOption, EChartsOption, LineSeriesOption } from "echarts";
import ReactECharts from 'echarts-for-react'; 
import { CSSProperties, useRef } from "react";
import { useChartData, useDashboardElement, useChartEvents, SimpleRecord } from "@geo2france/api-dashboard";

export interface IChartIsdndGlobalProps {
    data : SimpleRecord[]
    data_capacite : SimpleRecord[]
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
        WHERE c.[code_departement] in ('59','62','80','60','02')
        GROUP BY c.[annee]
        ORDER BY c.[annee]
    `, [data, data_capacite]) as SimpleRecord[];


    console.log(data_capacite.filter((row) => row.annee===2024))
    
    useChartData({data:data_chart}) //Pas de  dependencies : les données du graphique ne change pas

    const data_objectif = [
        ['2010', 1241112*2],
        ['2025', 1241112],
        ['2050', 1241112]
    ]

    const serie_tonnage: BarSeriesOption = {
        type: 'bar',
        name: 'Tonnages enfouis',
        color:'#DDB090',
        tooltip:{
            valueFormatter: (value) => (`${Math.round(Number(value)).toLocaleString()} t` )
        },
        data: data_chart.map((e: SimpleRecord) => (
            {
                value: [e.annee.toString(), e.tonnage],
                itemStyle: {
                    color: e.annee == year ? '#C3885E' : undefined
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
        data: data_chart.map((e: SimpleRecord) => (
            { value: [e.annee.toString(), e.capacite]  })
        ),
        z:2
    }

const serie_objectif:LineSeriesOption = {
    type: 'line', 
    name: 'Objectif -50%', 
    showSymbol: true,
    data: data_objectif,
    color:'#91cc75',
    areaStyle:{opacity:0.1}
}

    const option:EChartsOption = {
        series:[serie_tonnage, serie_capacite, serie_objectif],
        animation:false,
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