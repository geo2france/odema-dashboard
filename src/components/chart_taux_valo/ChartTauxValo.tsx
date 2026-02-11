import { CSSProperties, useMemo} from "react"
import alasql from "alasql";
import { BarSeriesOption, EChartsOption, LineSeriesOption } from "echarts";
import { SimpleRecord } from "@geo2france/api-dashboard";
import { interpolate } from "../../utils";
import { ChartEcharts, useBlockConfig, useDataset } from "@geo2france/api-dashboard/dsl";

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

interface ChartTauxValoProps {
    dataset: string;
    title?:string;
    yearKey?:string;
    style? : CSSProperties;
    year? : number;
    showObjectives?:boolean;
  }

export const ChartTauxValo: React.FC<ChartTauxValoProps> = ({dataset:dataest_id, style, year, title, yearKey="annee", showObjectives=false} )  => {

    const dataset = useDataset(dataest_id)
    const data = dataset?.data  as DataProps[] 

    useBlockConfig({title})

    const data_obj = [
        {annee:2009, value:0.429},
        {annee:2025, value:0.55},
        {annee:2030, value:0.6},
        {annee:2035, value:0.65},
    ]
    const dataChart = useMemo(()=>data && alasql(`
            SELECT 
                [annee], 
                SUM(CASE WHEN [libel_traitement]='Valorisation matière' THEN [tonnage] ELSE 0 END) as valo_matiere,
                SUM(CASE WHEN [libel_traitement]='Valorisation organique' THEN [tonnage] ELSE 0 END) as valo_orga,
                SUM(CASE WHEN [libel_traitement]!='Valorisation matière' and [libel_traitement]!='Valorisation organique' THEN [tonnage] ELSE 0 END) as autre_traitement,
                SUM([tonnage]) as tout_mode
            FROM ?
            GROUP BY [annee]
        `, [data]) as SimpleRecord[], [data])

    //useChartData({data:dataChart, dependencies:data})
    const serie_valo:BarSeriesOption = {
        type:'bar',
        name:'Valorisation',
        barGap:0,
        itemStyle:{
            color:'rgba(189, 217, 71, 1)'
        },
        showBackground: true,
        backgroundStyle: {
            color: 'rgba(180, 180, 180, 0.1)'
          },
        data: dataChart?.map((e:SimpleRecord) => [e[yearKey].toString(), (e.valo_orga+e.valo_matiere)/(e.tout_mode)]),
    }

    const serie_matiere:BarSeriesOption = {
        type:'bar',
        stack:'total',
        name:'Valorisation matière',
        itemStyle:{
            color:'yellow'
        },
        data: dataChart?.map((e:SimpleRecord) => [e[yearKey].toString(), (e.valo_matiere)/(e.tout_mode)]),
    }

    const serie_orga:BarSeriesOption = {
        type:'bar',
        stack:'total',
        name:'Valorisation organique',
        barWidth:"10%",
        itemStyle:{
            color:'rgba(108, 128, 51, 1)',
        },
        data: dataChart?.map((e:SimpleRecord) => [e[yearKey].toString(), (e.valo_orga)/(e.tout_mode)]),
    }

    const serie_obj:LineSeriesOption = {
        type:'line',
        name:'Objectif régional SRADDET',
        data: interpolate(data_obj.map((e:SimpleRecord)=> [e[yearKey], e.value])).map((e) => [e[0].toString(), e[1]]),
        lineStyle:{
            type:"dashed",
            width:2
        },
        symbolSize:(value) => data_obj.map((e) => e.annee.toString()).includes(value[0]) ? 4 : 0,
        color:"#91cc75"
    }

    const option:EChartsOption={
        series:[serie_valo, serie_matiere, serie_orga, ...(showObjectives ? [serie_obj] : [])],
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
                name:'Valorisation\nmatière (%)',
                max:1,
                axisLabel:{
                    formatter: (value:any) => `${(Number(value)*100).toLocaleString(undefined, {maximumFractionDigits:1})}`
                }
            }
        ]
    }

    return (
        <ChartEcharts option={option} style={style} />
    )
}
