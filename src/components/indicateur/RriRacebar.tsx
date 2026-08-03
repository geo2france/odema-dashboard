import { BaseChartProps } from "@geo2france/api-dashboard"
import { ChartEcharts, useDataset } from "@geo2france/api-dashboard/dsl"
import { EChartsOption, SeriesOption } from "echarts"
import { useMemo } from "react"
import { rri_agg } from "./rri"

interface RacebarEpciProps extends BaseChartProps {
    goalValue: number 
    balanceValue: number
    categoryKey?: string
}
const RacebarEpci:React.FC<RacebarEpciProps> = ({dataset:dataset_in, goalValue, balanceValue, categoryKey}) => {

    const dataset = useDataset(dataset_in)
    const data = dataset?.data

    //const decrease = goalValue < balanceValue

    const categryKeyIsInCols = categoryKey && data && (data?.length || 0) > 0 && Object.hasOwn(data[0], categoryKey);

    const categories = categoryKey && categryKeyIsInCols ? [...new Set(data?.map(d => d[categoryKey]))] : ['indicateur'] ;

    console.log('cat', categories)

    //const colors = usePalette({nColors: categories.length})

    // Aggréation tout axe confondu : permet de classer les territoires par valeur d'indicateur
    const data_agg = useMemo(
        () => data && rri_agg({ data })?.toSorted((a,b) => (a.valeur ?? 0)- (b.valeur ?? 0)),
        [data]);

    // Aggrégation selon l'axe choisi
    const data_agg_axe = useMemo(
        () => data && categryKeyIsInCols ? rri_agg({ data:data, axis:[categoryKey] })?.toSorted((a,b) => a.valeur - b.valeur) : data_agg,
        [data, data_agg, categoryKey, categryKeyIsInCols]) || [] ;
    
    console.log('data_agg', data_agg )
    console.log('data_agg_axe', data_agg_axe )
    // Libel des territoires par ordre de valeur agrégés tous axes (indicateurs complet)
    const lib_territories = [...new Set(data_agg?.map(d => d['libelle_epci']))]

    const series:SeriesOption[] = categories.map((category) => ( {
                type:"bar",
                name: category?.toString(),
                data: data_agg_axe?.
                    filter( r => categoryKey && categryKeyIsInCols ? r[categoryKey] == category : true)
                    .map((row) => [row.valeur, row.libelle_epci]).sort( (a,b) => b[0] - a[0] ),
                stack: "total"
               /* markLine:{
                    symbol: "none",
                    silent: false,
                    label: {
                        formatter: balanceValue?.toString(),
                        position: "insideEndTop"
                    },
                    lineStyle: {
                        color: "#9e9e9e",
                        type: "dashed",
                        width: 1
                    },
                    data: [ { xAxis: balanceValue } ]
                },*/

            }))


    const option: EChartsOption = {
      tooltip: {show:true},
      xAxis: { type: "value",  },
      yAxis: { type: "category" , 
            data: lib_territories,
            axisLabel: { 
                fontSize: 10 ,
                height: 12,
                color: (value )=> data?.find( r => r.libelle_epci == value)?.valeur > 50 ? 'green' : 'undefined',
                interval: 0,
                formatter : (label) => label?.replace('Communauté', 'C')?.replace(' de communes','C')?.replace(" d'agglomération", 'A')
            } },
      grid:{
        top:16
      },
      legend:{show:false},
      series: series,
    };
    return <ChartEcharts option={option} style={{height: 1000}}  replaceMerge= {['xAxis', 'series']} />
}

export default RacebarEpci