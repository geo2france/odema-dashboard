import { ChartEcharts, useDataset, usePalette } from "@geo2france/api-dashboard/dsl"
import { EChartsOption, MarkAreaComponentOption, SeriesOption } from "echarts"
import { rri_get_cols } from "./rri"
import { BaseChartProps } from "@geo2france/api-dashboard"

interface SingleAxisProps extends BaseChartProps{
    goalValue: number 
    balanceValue: number
    categoryKey?: string
}
const SingleAxis:React.FC<SingleAxisProps> = ({dataset:dataset_in, goalValue, balanceValue, categoryKey}) => {

    const dataset = useDataset(dataset_in)
    const data = dataset?.data
    const decrease = goalValue < balanceValue

    const categoryIsDimension = categoryKey && data && rri_get_cols(data).attributeCols.includes(categoryKey)
    //console.log('cols', data&& getColumns(data))
    const categories = 
        categoryIsDimension ? 
        [...new Set(data?.slice(1).map(d => d[categoryKey]))] : ['indicateur'] ;

    const colors = usePalette({nColors:categories.length}) 

    //Si la categoryKey retourne des valeurs différentes pour un même geocode, on ne la représente pas sur ce graphique.
    const series:SeriesOption[] = categories.map((category) => ( {
                type:"scatter",
                name: category?.toString(),
                data: data?.
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
        legend:{
            show: true,
            data: categories.map(String),
            type:'scroll',
        },
        yAxis:{
            type: "category"
        },
        color:colors,
        xAxis:{
            type: "value",
            //interval: 10
        },
        tooltip: {
            show:true,
            trigger:"item",
            //@ts-ignore
            formatter: (val) => `${val.data[3]} - ${val.data[0]} %`
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
}

export default SingleAxis;