import alasql from "alasql";
import { CSSProperties, useMemo, useRef } from "react";
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
    normalize?:boolean
  }






export const ChartEvolutionDechet: React.FC<ChartEvolutionTypeDechetProps> = ({data, onFocus, focus_item, style, year, showObjectives=false, normalize=false} )  => {
    const chartRef = useRef<any>()
    
    const tooltipFormatter = (e:any) => `
        ${e.seriesName} <br>
        ${e.marker}
        ${e.name} :
        <b>${normalize ? 
            (e.value[3]*100).toLocaleString(undefined, {maximumFractionDigits: 1})+' %' :
            e.value[1].toLocaleString(undefined, {maximumFractionDigits: 0})+' kb/hab' 
        } 
        </b> 
        (${ normalize ? 
            e.value[1].toLocaleString(undefined, {maximumFractionDigits: 0})+' kg /hab' :
            e.value[2].toLocaleString(undefined, {maximumFractionDigits: 0})+' T'
        })`

    useChartEvents({chartRef:chartRef, onFocus:onFocus})
    useChartActionHightlight({chartRef:chartRef, target:{seriesName:focus_item}})
    useDashboardElement({chartRef})

    const data_chart = useMemo(() =>alasql(`SELECT 
        d.[annee], 
        d.[type], 
        SUM(d.[tonnage]) as tonnage, 
        SUM((d.[tonnage]/d.[population])*1000) as ratio,
        t.[ratio_annee_total]
    FROM ? d
    JOIN (
        SELECT x.[annee], SUM(x.[tonnage]/x.[population]*1000) as ratio_annee_total
        FROM ? x
        GROUP BY x.[annee]
    ) t ON d.[annee] = t.[annee]
    GROUP BY d.[annee], d.[type], t.[ratio_annee_total]
    `,[data, data]), //Somme par type de traitement
    [data])

    useChartData({data:data_chart})

    const data_chart2 = useMemo(() =>alasql(`
    SELECT [type], ARRAY(ARRAY[[annee], [tonnage], [ratio], [ratio]/[ratio_annee_total] ]) as data
    FROM ?
    GROUP BY [type]
    `,[data_chart]), //Regroupement par type de traitement (= série pour echarts bar)
    [data_chart])

    const categories = useMemo(() =>alasql(`SELECT ARRAY(DISTINCT [annee]) as annees FROM ?`, [data])[0].annees.sort().map((e:number) => e.toString()), [data])

    const series:BarSeriesOption[] = data_chart2.map((e:SimpleRecord) => ({
         name:e.type,
         data:e.data.map((e:number[]) => ([e[0].toString(), e[2], e[1], e[3] ])),
         type:'bar',
         stack:'total',
         itemStyle:{
              color:chartBusinessProps(e.type).color,
         },
         emphasis:{
            focus:'series'
        },
        encode:{
            y: normalize ? [3] : undefined
        }
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
                name:normalize ? 'Quantité de\ndéchets (%)':'Quantité (kg/hab)',
                axisLabel:{
                    formatter :  (value) =>  normalize ? `${value*100}` : `${value}`,
                },
                max: normalize ? 1 : undefined,
            }
        ]

    }
    return (
        <ReactECharts option={option} ref={chartRef} style={ style} />
    )
}