import { SimpleRecord, useChartData, useDashboardElement } from "g2f-dashboard";
import { CSSProperties, useMemo, useRef } from "react";
import ReactECharts from 'echarts-for-react';
import { EChartsOption, LineSeriesOption } from "echarts";
import alasql from "alasql";


interface DataProps {
    annee:number
    ratio:number
    [key: string]: any
}

interface DataObjectifsProps {
    annee:number
    ratio:number
    [key: string]: any
}

export interface ChartEvolutionTypeDechetProps {
    data: DataProps[];
    dataObjectifs?:DataObjectifsProps[];
    onFocus?:any;
    focus_item?:string;
    style? : CSSProperties;
    year? : number;
  }

const formatter_currentyear = (value:number, year?:number) => {
    const value_year:number = new Date(value).getFullYear()
    return value_year == year ? `{currentDate|${value_year} }` : value_year.toString()
}

export const ChartEvolutionObjectifs: React.FC<ChartEvolutionTypeDechetProps> = ({data, dataObjectifs, onFocus, focus_item, style, year} )  => {
    const chartRef = useRef<any>()
    const data_chart = data && useMemo(() => alasql(`
        SELECT 
            [annee], 
            SUM([ratio]) as ratio,
            SUM([ratio_hg]) as ratio_hg
        FROM ?
        GROUP BY [annee]
        `,[data]) , [data]
    )
    useChartData({data:data_chart, dependencies:[data]})

    const serie:LineSeriesOption = {
        name: "Déchet",
        type:'line',
        color:"#FF8282",
        data: data_chart.map((e:SimpleRecord) => [e.annee.toString(), Math.round(e.ratio)])
    }

    const serie_obj:LineSeriesOption = {
        name: "Objectif régional",
        type:'line',
        data: dataObjectifs && dataObjectifs.map((e:SimpleRecord) => [e.annee.toString(), e.ratio]),
        color:"#91cc75",
        emphasis: { focus: "none" },
        lineStyle:{
            type:"dashed",
        }
    }
    const option:EChartsOption={
        series:[serie, serie_obj],
        legend:{show:true, bottom:0},
        tooltip:{
            show:true,
            trigger: 'axis',
            valueFormatter: (value) => ( `${value} kg/hab` )
        },
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
                name:'Quantité (kg/hab)',
                min:500,
                max:undefined
            }
        ]
    }
    useDashboardElement({chartRef})
    return (
        <ReactECharts option={option} ref={chartRef} style={ style} />
    )
}
