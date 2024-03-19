import { BaseRecord } from "@refinedev/core"
import alasql from "alasql";
import { BarSeriesOption, EChartsOption, LineSeriesOption } from "echarts";
import ReactECharts from 'echarts-for-react'; 
import { useRef } from "react";
import { useChartEvents } from "../../utils/usecharthighlight";

export interface IChartRaceBarISDND {
    data : BaseRecord[],
    year : number,
    aiot? : string,
    onClick : any
}

export const ChartRaceBarISDND: React.FC<IChartRaceBarISDND> = ({ data, onClick, aiot, year=2021 }) => {
    const chartRef = useRef<any>();

    useChartEvents({chartRef:chartRef, onClick:onClick})

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
            fontWeight: e.aiot == aiot ? 700 : 400
        }}))

    const data_chart = alasql(`
        SELECT [departement], [name], [aiot] as key, tonnage as [value], [capacite]
        FROM ?
        WHERE annee=${year} AND tonnage > 0
        ORDER BY tonnage ASC
    `,[data])

    const myserie:BarSeriesOption={
        type:'bar',
        name:'ISDND',
        tooltip:{
            valueFormatter: (value) => (`${Math.round(Number(value)).toLocaleString()} t` )
        },
        data:data_chart.map((e:BaseRecord) => ({
            value:e.value, name:e.name, key:e.key,
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
                data: axie_category
            }
        ],
        xAxis: [
            {
                type: 'value'
            }
        ],
        grid:{
            left:'250px',
            top:'20px'
        },
    }

    return (
            <ReactECharts
            option={option} ref={chartRef} style={{ height: "450px" }} />
    )
}
