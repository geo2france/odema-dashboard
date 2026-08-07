import { ChartEcharts, useDataset, usePalette } from "@geo2france/api-dashboard/dsl"
import { EChartsOption, MarkAreaComponentOption, SeriesOption } from "echarts"
import { rri_agg, rri_get_cols } from "./rri"
import { BaseChartProps } from "@geo2france/api-dashboard"
import { useMemo } from "react"

interface SingleAxisProps extends BaseChartProps{
    goalValue: number 
    balanceValue: number
    categoryKey?: string
    unit?: string
}
const SingleAxis:React.FC<SingleAxisProps> = ({dataset:dataset_in, goalValue, balanceValue, categoryKey, unit}) => {

    const dataset = useDataset(dataset_in)
    const data = dataset?.data
    const decrease = goalValue < balanceValue

    const rri_cols = data && rri_get_cols(data);

    const categryKeyIsInCols = categoryKey && 
        ( rri_cols?.attributeCols.includes(categoryKey) 
            || rri_cols?.dimensionCols.includes(categoryKey) 
            || rri_cols?.axisCols.includes(categoryKey) 
        )

    if(data && categryKeyIsInCols !== true)
    {
        console.warn(`${categoryKey} not in dataset`)
    }

    const categoryIsDimension = categoryKey && rri_cols?.attributeCols.includes(categoryKey)

    const chart_data = useMemo(
        () => data && categoryKey && !categoryIsDimension ? rri_agg({data, axis:rri_cols?.attributeCols}) : data,
        [data, categoryKey, categoryIsDimension]
    )

    //console.log('cols', data&& getColumns(data))

    // Detecter ici si la categoryKey est dans le JDD, si ce n'est pas le cas, retourner proprement en composant vide

    const categories = 
        categoryIsDimension && categryKeyIsInCols ? 
        [...new Set(data?.slice(1).map(d => d[categoryKey]))] : ['indicateur'] ;

    const colors = usePalette({nColors:categories.length}) 

    //Si la categoryKey retourne des valeurs différentes pour un même geocode, on ne la représente pas sur ce graphique.
    const series:SeriesOption[] = categories.map((category, index) => ( {
                type:"scatter",
                name: category?.toString(),
                color:colors?.[index],
                data: chart_data?. //⚠️⚠️⚠️ On ne prend pas la valeur aggrégée rajoute un rriAgg ici ! ⚠️
                    filter( r => categoryIsDimension ? r[categoryKey] == category : true)
                    .map((row) => [row.valeur, 1,  row.population, row.libelle_epci]).sort( (a,b) => b[2] - a[2] ),
                symbolSize: (val) => Math.max(2,Math.sqrt(val[2]) / 20),
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

    const  markArea:MarkAreaComponentOption = {
            silent: true,
            data: [
                [
                    {
                        xAxis: goalValue,
                        itemStyle: {
                            color: "rgba(145, 204, 117, 0.36)",
                        },
                    },
                    {
                        xAxis: decrease ? 0:100,
                    },
                ],
                [
                    {
                        xAxis: balanceValue,
                        itemStyle: {
                            color: "rgba(0, 132, 255, 0.15)", 
                        },
                    },
                    {
                        xAxis: goalValue,
                    },
                ],
            ],
        }

    const option:EChartsOption = {
        animation: false,
        legend:{
            show: true,
            data: categories.map(String),
            type:'scroll',
        },
        yAxis:{
            type: "category"
        },
        xAxis:{
            type: "value",
            name: unit,
            max:(value) => Math.round(Math.max(value.max, goalValue + goalValue*0.05)),
            //interval: 10
        },
        tooltip: {
            show:true,
            trigger:"item",
            formatter: (val) => !Array.isArray(val) && Array.isArray(val.data) ? `${val.data[3]} - ${val.data[0]} %` :''
        },
        series: [ 
        ...series,
        { // Fake serie with background
            name: 'background-fake-serie',
            markArea: markArea ,
            type:'scatter',
        }
            ]
    }
    return <ChartEcharts option={option}  replaceMerge= {['xAxis', 'series']} /> 
    // Devnote : si possible, trouver un moyen d'éviter replaceMerge car ca déclenche les animations a chaque rendu.
    // ReplaceMerge est nécessaire quand des séries générée dynamiquement disparaissent lors d'un changement de dataset, elle sont conservés à tords dans le rendu
    // Trouver un moyen de garder la série, et mettre data=null ( https://github.com/apache/echarts/issues/6202#issuecomment-315054637 )
}

export default SingleAxis;