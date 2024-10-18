import alasql from "alasql";
import { CSSProperties, useRef } from "react";
import ReactECharts from 'echarts-for-react';
import { EChartsOption, BarSeriesOption, LineSeriesOption } from "echarts";
import { SimpleRecord, useChartActionHightlight, useChartData, useChartEvents, useDashboardElement } from "g2f-dashboard"
import { chartBusinessProps  } from "../../utils";

interface DataProps {
    annee:number
    type:string
    tonnage:number
    population:number
    [key: string]: any
}

export interface ChartEvolutionTypeDechetProps {
    data: DataProps[]
    c_region?:string;
    onFocus?:any;
    focus_item?:string;
    style? : CSSProperties;
    year? : number;
    showObjectives?:boolean;
  }



const tooltipFormatter = (e:any) => `
    ${e.seriesName} <br>
    ${e.marker}
    ${e.name} :
    <b>${e.value[1].toLocaleString(undefined, {maximumFractionDigits: 0})} kg/hab</b> 
    (${e.value[2].toLocaleString(undefined, {maximumFractionDigits: 0})} T)`


export const ChartEvolutionDechet: React.FC<ChartEvolutionTypeDechetProps> = ({data, onFocus, focus_item, style, year, showObjectives=false} )  => {
    const chartRef = useRef<any>()
    
    useChartEvents({chartRef:chartRef, onFocus:onFocus})
    useChartActionHightlight({chartRef:chartRef, target:{seriesName:focus_item}})
    useDashboardElement({chartRef})

    const data_chart = alasql(`SELECT 
        [annee], 
        [type], 
        SUM([tonnage]) as tonnage, 
        SUM(([tonnage]/[population])*1000) as ratio
    FROM ?
    GROUP BY [annee], [type]
    `,[data]) //Somme par type de traitement
    
    useChartData({data:data_chart})

    const data_chart2 = alasql(`
    SELECT [type], ARRAY(ARRAY[[annee], [tonnage], [ratio]]) as data
    FROM ?
    GROUP BY [type]
    `,[data_chart]) //Regroupement par type de traitement (= série pour echarts bar)

    const categories = alasql(`SELECT ARRAY(DISTINCT [annee]) as annees FROM ?`, [data])[0].annees.sort().map((e:number) => e.toString())

    const series:BarSeriesOption[] = data_chart2.map((e:SimpleRecord) => ({
         name:e.type,
         data:e.data.map((e:number[]) => ([e[0].toString(), e[2], e[1] ])),
         type:'bar',
         stack:'total',
         itemStyle:{
              color:chartBusinessProps(e.type).color,
         },
         emphasis:{
            focus:'series'
        },
    })).sort((a:any,b:any) => (chartBusinessProps(a.name).sort || 0) - (chartBusinessProps(b.name).sort || 0)   )

    const objectifs:LineSeriesOption = {
        name:"Objectif",
        type:"line",
        data:[],
        markLine:{
            symbol: 'none',
            name:'toto',
            label:{
                 show:true,
                 position:'end',
                 color:'black',
                 formatter:'{b}\n{c} kg/hab'
            },
            lineStyle:{
                width:2,
                color:"red"
            },
            data:[{yAxis:541, name:"Obj. 2031"}],
        }
    }
    const option:EChartsOption = {
        series:[...series, ...(showObjectives ? [objectifs] : [])],
        tooltip:{
            show:true,
            formatter: tooltipFormatter
        },
        xAxis: [
            {
                type: 'category',
                data:categories.map((annee:number) => ({
                    value:annee,
                    textStyle: {
                        fontWeight: annee == year ? 700 : undefined,
                        fontSize: annee == year ? 14 : undefined
                    }
                }))
            }],
        yAxis: [
            {
                type: 'value',
                name:'Quantité (kg/hab)'
            }
        ]

    }
    return (
        <ReactECharts option={option} ref={chartRef} style={ style} />
    )
}