import alasql from "alasql";
import { BarSeriesOption, EChartsOption, LineSeriesOption } from "echarts";
import ReactECharts from 'echarts-for-react'; 
import { CSSProperties, useRef } from "react";
import { useChartData, useDashboardElement, useChartEvents, SimpleRecord } from "api-dashboard";

export interface IChartEvolutionISDND {
    data : SimpleRecord[]
    data_capacite : SimpleRecord[]
    aiot: string
    year?:number
    onClick: Function
    style? : CSSProperties
}
export const ChartEvolutionISDND: React.FC<IChartEvolutionISDND> = ({ data, data_capacite, aiot, onClick, year, style }) => {
    const chartRef = useRef<any>();

    useChartEvents({chartRef:chartRef, onClick:onClick})
    useDashboardElement({chartRef})

    const data_chart = alasql(`
    SELECT c.[annee], SUM(c.[capacite]) as capacite, SUM(t.[tonnage]) as tonnage 
    FROM ? t
    RIGHT JOIN ? c ON c.[annee]=t.[annee] AND c.[aiot]=t.[aiot]
    WHERE c.[aiot]='${aiot}'
    GROUP BY c.[annee]
    ORDER BY c.[annee]
    `, [data, data_capacite]) as SimpleRecord[];

    useChartData({
        data:data_chart, 
        dependencies:[aiot]})


    const myseries: BarSeriesOption = 
        {
            name:`Entrants`,
            color:'#DDB090',
            data:data_chart.map((f:SimpleRecord) => ({
                value:[f.annee.toString(), f.tonnage],
                itemStyle: {
                    color: f.annee == year ? '#C3885E' : undefined
                } 

             })),
            type: 'bar',
            stack: 'stack1',
            tooltip:{
                show:true,
                valueFormatter: (value) => (`${Math.round(Number(value)).toLocaleString()} t` )
            }
        }

    const myseries_capcite: LineSeriesOption = {
        name:`Capacite`,
        data:data_chart.map((f:SimpleRecord) => ({
            value:[f.annee.toString(), f.capacite],
         })),
        type: 'line',
        step: 'middle',
        itemStyle:{color:'#D44F4A'},
        tooltip:{
            show:true,
            valueFormatter: (value) => (`${Math.round(Number(value)).toLocaleString()} t` )
        }
    }

    const option: EChartsOption ={
        series:[myseries, myseries_capcite],
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