import { CSSProperties, useMemo, useRef } from "react"
import ReactECharts from 'echarts-for-react';
import alasql from "alasql";
import { BarSeriesOption, EChartsOption, LineSeriesOption } from "echarts";
import { SimpleRecord, useChartData, useDashboardElement } from "api-dashboard";
import { interpolate } from "../../utils";

const formatter_currentyear = (value:number, year?:number) => {
    const value_year:number = new Date(value).getFullYear()
    return value_year == year ? `{currentDate|${value_year} }` : value_year.toString()
}

interface DataProps {
    annee:number
    type:string
    tonnage:number
    [key: string]: any
}

interface ChartDmaStockageProps {
    data: DataProps[]
    onFocus?:any;
    focus_item?:string;
    style? : CSSProperties;
    year? : number;
    showObjectives?:boolean;
  }

export const ChartDmaStockage: React.FC<ChartDmaStockageProps> = ({data, onFocus, focus_item, style, year, showObjectives=false} )  => {
    const chartRef = useRef<any>()
    useDashboardElement({chartRef});


    const data_obj = [
        {annee:2009, value:0.278},
        {annee:2035, value:0.1},
    ]
    const dataChart = useMemo(()=>alasql(`
            SELECT 
                [annee], 
                SUM(CASE WHEN [type]='Stockage' THEN [tonnage] ELSE 0 END) as stockage,
                SUM([tonnage]) as tout_mode
            FROM ?
            GROUP BY [annee]
        `, [data]) as SimpleRecord[], [data])

    useChartData({data:dataChart, dependencies:data})
    const serie_valo:BarSeriesOption = {
        type:'bar',
        name:'Stockage',
        barGap:0,
        itemStyle:{
            color:'#ED1C24'
        },
        showBackground: true,
        backgroundStyle: {
            color: 'rgba(180, 180, 180, 0.1)'
          },
        data: dataChart.map((e:SimpleRecord) => [e.annee.toString(), (e.stockage)/(e.tout_mode)]),
    }


    const serie_obj:LineSeriesOption = {
        type:'line',
        name:'Objectif régional SRADDET',
        data: interpolate(data_obj.map((e:SimpleRecord)=> [e.annee, e.value])).map((e) => [e[0].toString(), e[1]]),
        lineStyle:{
            type:"dashed",
            width:2
        },
        symbolSize:(value) => data_obj.map((e) => e.annee.toString()).includes(value[0]) ? 4 : 0,
        color:"#91cc75"
    }

    const option:EChartsOption={
        series:[serie_valo, ...(showObjectives ? [serie_obj] : [])],
        tooltip:{
            show:true, 
            trigger:'axis',
            valueFormatter:(value) => `${(Number(value)*100).toLocaleString(undefined, {maximumFractionDigits:1})} %`,
        },
        legend:{show:true, bottom:0},
        xAxis: [
            {
                type: 'time',
                axisLabel:{
                    formatter: (value:number) => formatter_currentyear(value, year),
                    rich: {
                      currentDate: {
                          fontWeight: 'bold'
                      }
                  },
  
                }
            }],
        yAxis: [
            {
                type: 'value',
                name:'Stockage (%)',
                max:1,
                axisLabel:{
                    formatter: (value:any) => `${(Number(value)*100).toLocaleString(undefined, {maximumFractionDigits:1})}`
                }
            }
        ]
    }

    return (
        <ReactECharts option={option} ref={chartRef} style={ style} />
    )
}
