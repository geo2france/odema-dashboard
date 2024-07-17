import { BaseRecord } from "@refinedev/core"
import alasql from "alasql";
import { BarSeriesOption, EChartsOption, LineSeriesOption } from "echarts";
import ReactECharts from 'echarts-for-react'; 
import { CSSProperties, useRef } from "react";
import { useChartData, useDashboardElement, useChartEvents } from "g2f-dashboard";

export interface IChartRaceBarISDND {
    data : BaseRecord[],
    year : number,
    aiot? : string,
    onClick : any,
    style? : CSSProperties
}

export const ChartRaceBarISDND: React.FC<IChartRaceBarISDND> = ({ data, onClick, aiot, year=2021, style }) => {
    const chartRef = useRef<any>();

    useChartEvents({chartRef:chartRef, onClick:onClick})
    useDashboardElement({chartRef})

    const dptement_props = [
        {code:'02', color:'#038B4F'},
        {code:'80',color:'#a90000' },
        {code:'60', color:"#C2CB00"},
        {code:'59', color:"#25409A"},
        {code:'62', color:"#38A13F"},
    ]

    const axie_category = alasql(`SELECT DISTINCT [name], [aiot] FROM ? WHERE annee=${year} AND tonnage > 0 ORDER BY tonnage ASC
    `, [data]).map((e:BaseRecord) => ( {
        value:e.name,
        textStyle: {
            fontWeight: e.aiot == aiot ? 700 : 400,
        }}))

    const data_chart = alasql(`
        SELECT [departement], [name] as nom, [aiot] , tonnage, [capacite]
        FROM ?
        WHERE annee=${year} AND tonnage > 0
        ORDER BY tonnage ASC
    `,[data])

    useChartData({data:data_chart, dependencies:[year]})

    const myserie:BarSeriesOption={
        type:'bar',
        name:'ISDND',
        tooltip:{
            valueFormatter: (value) => (`${Math.round(Number(value)).toLocaleString()} t` )
        },
        data:data_chart.map((e:BaseRecord) => ({
            value:e.tonnage, name:e.nom, key:e.aiot,
            itemStyle:{color:dptement_props.find(i => i.code==e.departement)?.color}
        }
        ))
    }

    const serieCapacite:LineSeriesOption={
        type:'line',
        name:'Capacite',symbol:'roundRect', symbolSize:5,
        tooltip:{
            valueFormatter: (value) => (`${Math.round(Number(value)).toLocaleString()} t` )
        },
        lineStyle:{opacity:0},
        itemStyle:{color:'#D44F4A'},
        data:data_chart.map((e:BaseRecord) => ({
            value:e.capacite, name:e.name
        }))
    }


    const option: EChartsOption ={
        series:[myserie, serieCapacite],
        legend: {
            top:'top', 
            show:false
        },
        tooltip: {
            trigger: 'item'
        },
        yAxis: [
            {
                type: 'category',
                data: axie_category,
                axisLabel: {
                    interval: 0,
                    fontSize: 10,
                }
            }
        ],
        xAxis: [
            {
                type: 'value',
                axisLabel:{formatter: (value:number) => `${(value/1e3).toLocaleString()} kt`}
            }
        ],
        grid:{
            left:'250px',
            top:'20px'
        },
    }

    return (
            <ReactECharts
            option={option} ref={chartRef} style={style} />
    )
}
