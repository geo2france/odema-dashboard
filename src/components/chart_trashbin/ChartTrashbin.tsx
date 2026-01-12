import { ChartEcharts, useBlockConfig, useDataset } from "@geo2france/api-dashboard/dsl"
import { BarSeriesOption, EChartsOption, SeriesOption } from "echarts"
import { chartBusinessProps } from "../../utils"
interface ChartTrashbinProps {
    dataset:string
}
export const ChartTrashbin:React.FC<ChartTrashbinProps> = ({dataset:dataset_id}) => {
    useBlockConfig({
        title: "Gisement DMA"
    })

    const dataset = useDataset(dataset_id)
    const data = dataset?.data

    const total = dataset?.data?.reduce((sum, d) => sum + d.ratio, 0);

    const poubelle64 = "data:image/svg+xml;base64,PHN2ZyB2aWV3Qm94PSIwIDAgMjAwIDMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KICA8ZGVmcz4KICAgIDxtYXNrIGlkPSJiaW5NYXNrIj4KICAgICAgPCEtLSBUb3V0IGNhY2jDqSBwYXIgZMOpZmF1dCAtLT4KICAgICAgPHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0id2hpdGUiLz4KCiAgICAgIDwhLS0gSW50w6lyaWV1ciBkZSBsYSBwb3ViZWxsZSA9IHRyYW5zcGFyZW50IC0tPgogICAgICA8cGF0aCBkPSJNNTAgNjAgTDE1MCA2MCBMMTMwIDI2MCBMNzAgMjYwIFoiIGZpbGw9ImJsYWNrIi8+CiAgICA8L21hc2s+CiAgPC9kZWZzPgoKICA8IS0tIEZvbmQgb3BhcXVlIGF2ZWMgdHJvdSAtLT4KICA8cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZmZmZmZmIiBtYXNrPSJ1cmwoI2Jpbk1hc2spIi8+CgogIDwhLS0gQ29udG91ciBkZSBsYSBwb3ViZWxsZSAtLT4KICA8cGF0aCBkPSJNNTAgNjAgTDE1MCA2MCBMMTMwIDI2MCBMNzAgMjYwIFoiCiAgICAgICAgZmlsbD0ibm9uZSIKICAgICAgICBzdHJva2U9IiMzMzMiCiAgICAgICAgc3Ryb2tlLXdpZHRoPSI2Ii8+Cjwvc3ZnPg=="
    const barWidth = 100

    const series:BarSeriesOption[] = data?.sort((a,b) => b.ratio - a.ratio).map( d => ({
        type: 'bar',
        name: d.type_dechet,
        data: [d.ratio],
        color: chartBusinessProps(d.type_dechet).color,
        barWidth:barWidth,
        label:{show: (!!total && 100*(d.ratio / total) > 5) },
        stack: 'total',    })) ?? []


    console.log(series)

    const option:EChartsOption = {
        graphic: [
        {
            type: 'image',
            z: 3,               // au-dessus des bars
            left: 'center',
            top: '0%',
            silent: true, 
            style: {
                image: poubelle64,
                width: 200,
                height: 300,
                opacity: 1 //Debug
            }
        },
        ],
        grid: {
            left: 'center',
            bottom: 43,
            containLabel: false,
            width:barWidth
        },
          xAxis: {
            type: 'category',
            data: ['Ratio'],
            boundaryGap:false,
            show: false,
        },
        yAxis: {
            type: 'value',
            max:total,
            show: false,
        },
        tooltip: {show: true},
        series : series

    }

    return (
        <ChartEcharts option={option}/>
    )
}