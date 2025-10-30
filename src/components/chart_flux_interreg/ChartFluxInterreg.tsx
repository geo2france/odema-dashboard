import { ChartEcharts, useBlockConfig, useDataset, usePalette } from "@geo2france/api-dashboard/dsl"
import { BarSeriesOption, EChartsOption } from "echarts"


interface ChartFluxInterregProps {
    dataset?:string
    title?:string
    locationKey:string
    importKey:string
    exportKey:string
}
export const ChartFluxInterreg:React.FC<ChartFluxInterregProps> = ({dataset:dataset_id, title, locationKey, importKey, exportKey}) => {
    const dataset = useDataset(dataset_id)

    useBlockConfig({
        title: title,
        dataExport: dataset?.data
    })

    const colors = usePalette({nColors:2})

    const series:BarSeriesOption[] = 
        [  {
            name: 'Export',
            type: 'bar',
            id:'e',
            stack: 'stack',
            color:colors?.[0],
            data: dataset?.data?.map((r) => [r?.[exportKey]*-1, r?.[locationKey]])
            },
            {
            name: 'Import',
            id: 'i',
            color:colors?.[1],
            type: 'bar',
            stack: 'stack',
            data: dataset?.data?.map((r) => [r?.[importKey], r?.[locationKey]])
            }
        , {
            name: 'Solde (import - export)',
            id: 's',
            color:"grey",
            type: 'bar',
            data: dataset?.data?.map((r) => [r?.[importKey] - r?.[exportKey], r?.[locationKey]])
            }]

    const option:EChartsOption = {
        xAxis: [
            {
            name: 't',
            type: 'value',
            axisLabel: {
                    formatter: (value: number) => Math.abs(value).toLocaleString()
                }
            }
        ],
        grid: {
            top: '0%', 
            bottom: '15%'
        },
        legend : {
            show:true,
            bottom:0,
            padding:0,
            orient: 'horizontal',
            selected: {
                'Solde (import - export)': false,
            },
        },
        tooltip:{
            trigger:"axis"
        },
        yAxis: [
            {
            type: 'category',
            inverse: true,
            axisTick: {
                show: false
            },
            axisLabel : { interval: 0} //Force show all labels
            }],
        series: series
    }
    return (
        <ChartEcharts option={option} style={{height:300}}/>
    )
}