import { BaseRecord } from "@refinedev/core"
import alasql from "alasql";
import { BarSeriesOption, EChartsOption } from "echarts";
import ReactECharts from 'echarts-for-react'; 

export interface IChartRaceBarISDND {
    data : BaseRecord[],
    year : number
}

export const ChartRaceBarISDND: React.FC<IChartRaceBarISDND> = ({ data, year=2021 }) => {

    const dptement_props = [
        {code:'02', color:'#038B4F'},
        {code:'80',color:'#a90000' },
        {code:'60', color:"#C2CB00"},
        {code:'59', color:"#25409A"},
        {code:'62', color:"#38A13F"},
    ]

    const axie_category = alasql(`SELECT DISTINCT [name] FROM ? WHERE annee=${year} AND tonnage > 0 ORDER BY tonnage ASC
    `, [data]).map((e:BaseRecord) => e.name)

    const data_chart = alasql(`
        SELECT [departement], [name], tonnage as [value]
        FROM ?
        WHERE annee=${year} AND tonnage > 0
        ORDER BY tonnage ASC
    `,[data])

    const myserie:BarSeriesOption={
        type:'bar',
        name:'ISDND',
        data:data_chart.map((e) => ({
            value:e.value, name:e.name,
            itemStyle:{color:dptement_props.find(i => i.code==e.departement)?.color}
        }
        ))
    }


    const option: EChartsOption ={
        series:[myserie],
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
            option={option} style={{ height: "450px" }} />
    )
}
