import { ChartEcharts, useDataset } from "@geo2france/api-dashboard/dsl"
import { EChartsOption } from "echarts"


interface ChartTiRatioProps {
    dataset?: string
}
export const ChartTiRatio: React.FC<ChartTiRatioProps> = ({dataset}) => {
    const data = useDataset(dataset)
    const chart_data = data?.data
    console.log(data?.data)
    const option:EChartsOption = {
         title: {
                text: 'Scatter with Jittering'
            },
            xAxis: {
                type: 'category',
                data: ['Classique', 'Incitative']
            },
            yAxis: {
                type: 'value'
            },
            series: [
                {
                name: 'Sleeping Hours',
                type: 'scatter',
                data : chart_data?.map((r) => [r.tarification, r.ratio]),
                colorBy: 'data',
                symbolSize: 5,
                itemStyle: {
                    opacity: 0.4,
                }
                }
            ]
    }
    return (
        <ChartEcharts option={option}/>
    )
}