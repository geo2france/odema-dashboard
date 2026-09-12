import { ChartEcharts, useDataset, usePalette } from "@geo2france/api-dashboard/dsl"
import { EChartsOption, MarkAreaComponentOption, SeriesOption } from "echarts"
import { rri_agg, rri_get_cols } from "./rri"
import { aggregator, BaseChartProps, useApplyEchartsHighlight, useSetHighlight } from "@geo2france/api-dashboard"
import { useMemo, useRef } from "react"
import EChartsReact from "echarts-for-react"

interface SingleAxisProps extends BaseChartProps{
    goalValue: number 
    balanceValue: number
    categoryKey?: string
    unit?: string

}
const SingleAxis:React.FC<SingleAxisProps> = ({dataset:dataset_in, goalValue, balanceValue, categoryKey, unit}) => {

    const chartRef = useRef<EChartsReact>(null);


    const dataset = useDataset(dataset_in)
    const data = dataset?.data
    const decrease = goalValue < balanceValue

    const setHighlight = useSetHighlight()
    useApplyEchartsHighlight({chartRef:chartRef})


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

    const data_full_agg = useMemo(
        () => data && rri_agg({data:data}),
        [data]
    );

    const mediane = aggregator({data: data_full_agg, dataKey:"valeur", aggregate:"median"}).value

    const chart_data = useMemo(
        () => data && categoryKey ?  rri_agg({data, axis:rri_cols?.attributeCols}) : [],
        [data, data_full_agg, categoryKey, categoryIsDimension]
    )


    // Detecter ici si la categoryKey est dans le JDD, si ce n'est pas le cas, retourner proprement en composant vide

    const categories = 
        categoryIsDimension && categryKeyIsInCols ? 
        [...new Set(data?.slice(1).map(d => d[categoryKey]))] : ['indicateur'] ;

    const colors = usePalette({nColors:categories.length}) 

    //Si la categoryKey retourne des valeurs différentes pour un même geocode, on ne la représente pas sur ce graphique.


    //Devnote : empêcher les séries annexes (objectif, mark) de disparaitre
    const series:SeriesOption[] = categories.map((category, index) => ( {
                type:"scatter",
                name: category?.toString(),
                emphasis: {
                    focus:"self",
                },
                id: category?.toString(),
                color:colors?.[index],
                data: chart_data
                    ?.filter( r => categoryIsDimension ? r[categoryKey] == category : true)
                    .map((row) => [row.valeur, 1,  row.population, row.libelle_epci, row.geocode_epci]).sort( (a,b) => b[2] - a[2] ),
                symbolSize: (val) => Math.max(2,Math.sqrt(val[2]) / 20),
                encode:{
                    itemName: 4,
                    itemId: 4,
                }
            }))

    const  markArea:MarkAreaComponentOption = {
            silent: true,
            blur: {
                itemStyle:{
                    opacity:1
                }
            },
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
        animation: true,
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
            markLine:{
                blur: {
                    lineStyle:{ opacity:1 },
                    label:{opacity : 1}
                },
                symbol: "none",
                silent: true,
                label: {
                    formatter: `Md. : ${mediane?.toLocaleString()} ${unit}`,
                    position: "end",
                    //rotate: 90
                },

                lineStyle: {
                    color: mediane ? "#9e9e9e" : 'transparent',
                    type: "dashed",
                    width: 1
                },
                    data: [ { xAxis: mediane || 0 }  ]
                },
        }
            ]
    }

    const hoverTimeout = useRef<ReturnType<typeof setTimeout>>();

    const onHover = (e: any) => {
        if (e.componentType !== 'series') return;

        clearTimeout(hoverTimeout.current);

        hoverTimeout.current = setTimeout(() => { //Temporiser pour éviter les clignotement lors du déplacement de la sourie
            setHighlight({
            property: 'geocode_epci',
            value: e.name,
            });
        }, 150);
    };

    const onOut = () => {
        clearTimeout(hoverTimeout.current);

        setHighlight({
            property: 'geocode_epci',
            value: null,
        });
    };

    return <ChartEcharts ref={chartRef} option={option}  replaceMerge= {['xAxis', 'series']} onEvents={{mouseover:onHover, mouseOut:onOut}}/> 
    // Devnote : si possible, trouver un moyen d'éviter replaceMerge car ca déclenche les animations a chaque rendu.
    // ReplaceMerge est nécessaire quand des séries générée dynamiquement disparaissent lors d'un changement de dataset, elle sont conservés à tords dans le rendu
    // Trouver un moyen de garder la série, et mettre data=null ( https://github.com/apache/echarts/issues/6202#issuecomment-315054637 )
}

export default SingleAxis;