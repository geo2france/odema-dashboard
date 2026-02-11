import { SimpleRecord } from "@geo2france/api-dashboard";
import { CSSProperties, useMemo } from "react";
import ReactECharts from 'echarts-for-react';
import { EChartsOption, LineSeriesOption } from "echarts";
import alasql from "alasql";
import { useBlockConfig, useDataset } from "@geo2france/api-dashboard/dsl";


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
    dataset: string;
    title?:string;
    dataObjectifs?:DataObjectifsProps[];
    onFocus?:any;
    focus_item?:string;
    style? : CSSProperties;
    year? : number;
  }

const formatter_currentyear = (value:number, year?:number) => {
    const value_year:number = value
    return value_year == year ? `{currentDate|${value_year} }` : value_year.toString()
}

export const ChartEvolutionObjectifs: React.FC<ChartEvolutionTypeDechetProps> = ({dataset:dataset_id, dataObjectifs, title, style, year} )  => {

    const dataset = useDataset(dataset_id);
    const data = dataset?.data as DataProps | undefined;

    const data_chart = data && useMemo(() => alasql(`
        SELECT 
            [annee], 
            SUM([ratio]) as ratio,
            SUM([tonnage]) as tonnage
        FROM ?
        GROUP BY [annee]
        `,[data]) , [data]
    ) as SimpleRecord[];
    
    useBlockConfig({title:title, dataExport:data_chart})

    const serie:LineSeriesOption = {
        name: "Déchet",
        type:'line',
        color:"#FF8282",
        data: data_chart?.map((e:SimpleRecord) => [e.annee.toString(), Math.round(e.ratio)])
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
            formatter: (p:any) => 
                `${p[0].axisValue}<br>` + 
                    p.map((item:any) => 
                        `<span style="display:inline-block;width:10px;height:10px;border-radius:50%;background:${item.color};margin-right:5px"></span>` +
                        `${item.seriesName} <b style="margin-left:16px">${item.value[1]} kg/hab</b>`
                    ).join('<br>')
        },
        xAxis: [
            {
                type: 'value',
                min:2009, max:2031,
                interval:2,
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
    return (
        <ReactECharts option={option} style={ style} />
    )
}
