import alasql from "alasql";
import { CSSProperties, useMemo, useRef, useState } from "react";
import ReactECharts from 'echarts-for-react';
import { EChartsOption, LineSeriesOption } from "echarts";
import { SimpleRecord, useChartActionHightlight, useChartData, useChartEvents, useDashboardElement } from "@geo2france/api-dashboard"
import { chartBusinessProps  } from "../../utils";
import { Button } from "antd";
import { FaPercent } from "react-icons/fa";

interface DataProps {
    annee:number
    type:string
    tonnage:number
    population?:number
    ratio?:number
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
    normalize?:boolean;
    showNormalizeButton?:boolean;
  }






export const ChartEvolutionDechet: React.FC<ChartEvolutionTypeDechetProps> = ({data, onFocus, focus_item, style, year, showObjectives=false, normalize=false, showNormalizeButton=true} )  => {
    const chartRef = useRef<any>()
    
    const [normalizeState, setNormalizeState] = useState(normalize)

    const tooltipFormatter = (e:any) => `
        ${e.seriesName} <br>
        ${e.marker}
        ${e.name} :
        <b>${normalizeState ? 
            (e.value[3]*100).toLocaleString(undefined, {maximumFractionDigits: 1})+' %' :
            e.value[1].toLocaleString(undefined, {maximumFractionDigits: 0})+' kg/hab' 
        } 
        </b> 
        (${ normalizeState ? 
            e.value[1].toLocaleString(undefined, {maximumFractionDigits: 0})+' kg/hab - ' + e.value[2].toLocaleString(undefined, {maximumFractionDigits: 0})+' T':
            e.value[2].toLocaleString(undefined, {maximumFractionDigits: 0})+' T'
        })`

    useChartEvents({chartRef:chartRef, onFocus:onFocus})
    useChartActionHightlight({chartRef:chartRef, target:{seriesName:focus_item}})
    useDashboardElement({chartRef})

    const data_chart = useMemo(() =>alasql(`SELECT 
        d.[annee], 
        d.[type], 
        SUM(d.[tonnage]) as tonnage, 
        coalesce( SUM(d.[ratio]) ,SUM((d.[tonnage]/d.[population])*1000) ) as ratio,
        t.[ratio_annee_total]
    FROM ? d
    JOIN (
        SELECT x.[annee], coalesce( sum( x.[tonnage]/x.[population]*1000 ) , sum(x.[ratio]) ) as ratio_annee_total
        FROM ? x
        GROUP BY x.[annee]
    ) t ON d.[annee] = t.[annee]
    GROUP BY d.[annee], d.[type], t.[ratio_annee_total]
    `,[data, data]), //Somme par type de traitement
    [data]) as SimpleRecord[];

    useChartData({data:data_chart.map((e:SimpleRecord) => ({"Année":e.annee, "Type":chartBusinessProps(e.type).label, "Tonnage (T)":e.tonnage, "Ratio (kg/hab)":e.ratio}))})

    const data_chart2 = useMemo(() =>alasql(`
    SELECT [type], ARRAY(ARRAY[[annee], [tonnage], [ratio], [ratio]/[ratio_annee_total] ]) as data
    FROM ?
    GROUP BY [type]
    `,[data_chart]), //Regroupement par type de traitement (= série pour echarts bar)
    [data_chart]) as SimpleRecord[]

    const categories = useMemo(() => {
        const r = alasql(`SELECT ARRAY(DISTINCT [annee]) as annees FROM ?`, [data]) as { annees?: number[] }[]; 

        return r && r?.at(0)?.annees?.sort().map((e) => e)
    
    }, [data])

    const series = (data_chart2.map((e:SimpleRecord) => ({
         name:chartBusinessProps(e.type).label,
         data:categories?.map((y) => {
            const current = e.data.find((x:SimpleRecord) => x[0] == y) || [y, 0, 0, 0]
            return current
         }
        ).map((e) => ([e[0].toString(), e[2], e[1], e[3]]) ),
         type:'line',
         stack:'total',
         areaStyle: {},
         itemStyle:{
              color:chartBusinessProps(e.type).color,
         },
         emphasis:{
            itemStyle: {
                borderColor: '#383838',
                borderType: 'solid',
                borderWidth: 2,
              },
         },
        encode:{
            y: normalizeState ? [3] : undefined
        }
    }))as LineSeriesOption[]).sort((a:any,b:any) => (chartBusinessProps(a.name).sort || 0) - (chartBusinessProps(b.name).sort || 0)   )

    const objectifs:LineSeriesOption = { //A supprimer
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
        //@ts-ignore see https://github.com/apache/echarts/issues/19886
        legend:{
            show:true, 
            bottom:0, 
            type:'scroll',
            height:40,
            width:'90%',
            orient:'none'},
        tooltip:{
            show:true,
            formatter: tooltipFormatter
        },
        xAxis: [
            {
                type: 'category',
                boundaryGap: false,
                data:categories?.map((annee) => ({
                    value:annee.toString(),
                    textStyle: {
                        fontWeight: annee == year ? 700 : undefined,
                        fontSize: annee == year ? 14 : undefined
                    }
                }))
            }],
        yAxis: [
            {
                type: 'value',
                name:normalizeState ? 'Quantité de\ndéchets (%)':'Quantité (kg/hab)',
                axisLabel:{
                    formatter :  (value:number) =>  normalizeState ? `${value*100}` : `${value}`,
                },
                max: normalizeState ? 1 : undefined,
            }
        ]

    }
    return (
        <>
        {showNormalizeButton && <Button 
            type={normalizeState ? "primary" : undefined} 
            icon={<FaPercent />} 
            style={{position:'absolute', right:16, top:32+16, zIndex:1}}
            onClick={() => setNormalizeState(!normalizeState)} />
        }
        <ReactECharts option={option} notMerge={true} ref={chartRef} style={ style} /> 
        {/* notMerge est nécessaire en cas de suppression d'une série https://github.com/geo2france/odema-dashboard/issues/33 */}
        </>
    )
}