import { ChartEcharts, useBlockConfig, useDataset } from "@geo2france/api-dashboard/dsl"
import { BarSeriesOption, EChartsOption } from "echarts"
import { chartBusinessProps } from "../../utils"
import { useRef } from "react"
import EChartsReact from "echarts-for-react"

interface ChartTrashbinProps {
    dataset:string
}
export const ChartTrashbin:React.FC<ChartTrashbinProps> = ({dataset:dataset_id}) => {

    const chartRef = useRef<EChartsReact | null>(null);
    const canvasWidth = chartRef?.current?.getEchartsInstance().getWidth()

    useBlockConfig({
        title: "Types de déchets collectés (porte-à-porte) par habitant"
    })

    const dataset = useDataset(dataset_id)
    const data = dataset?.data

    const total = dataset?.data?.reduce((sum, d) => sum + d.ratio, 0);

    const barWidth = 150

type BarSeriesWithName = BarSeriesOption & { name: string };
    const series:BarSeriesWithName[] = data?.sort((a,b) => b.ratio - a.ratio)
        .filter(d => d.ratio > 1)
        .map( d => ({
        type: 'bar',
        name: d.type_dechet,
        data: [d.ratio],
        color: chartBusinessProps(d.type_dechet).color,
        barWidth:barWidth,
        label:{
            show: (!!total && 100*(d.ratio / total) > 5),
            formatter : (p:any) => `${p.data.toLocaleString(undefined, {maximumFractionDigits:0})} kg`
        },
        stack: 'total',    })) ?? []

    const option:EChartsOption = {
        graphic: [
            {
                type:'image',
                z:3,
                left:'center',
                top:'5%',
                silent:true,
                style: {
                    image:"/poubelle.png",
                    height: 280,
                }
            }
        ],
        legend:{
            show: (canvasWidth ?? 800 )  > 500 , 
            left:8, 
            top:"middle",
            orient:"vertical", 
            data: series.map(s => s.name ?? '').reverse() // Reversed legend (top to bottom)
        },
        grid: {
            left: 'center',
            bottom: 10,
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
        tooltip: {
            show: true,
            formatter: (p:any) => `${p.marker} ${p.seriesName} : <b>${p.data.toLocaleString(undefined, {maximumFractionDigits:1})}</b> kg`
        },
        series : series

    }

    return (
        <ChartEcharts style={{width:"100%"}} option={option} ref={chartRef} 
            replaceMerge={['series']} // Nécessaire si des séries peuvent disparaitre entre rendus
            /> 
    )
}