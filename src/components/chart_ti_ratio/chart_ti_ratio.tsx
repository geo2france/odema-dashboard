import { ChartEcharts, useBlockConfig, useDataset } from "@geo2france/api-dashboard/dsl"
import { EChartsOption } from "echarts"

interface ChartTiRatioProps {
    dataset?: string
    color?:string
    dataKey:string
    title?:string
}
export const ChartTiRatio: React.FC<ChartTiRatioProps> = ({dataset, color, dataKey, title}) => {
    const data = useDataset(dataset)
    const chart_data = data?.data

    const groups = ["Classique", "Incitative"]
    useBlockConfig({
        title:title,
        dataExport: chart_data
    })
    const option:EChartsOption = {
            xAxis: {
                type: 'category',
                data: groups,
                name:'Tarification',
                jitter: 50,
                jitterOverlap:false
            },
            yAxis: {
                type: 'value',
                name: 'kg/hab'
            },
            tooltip : {
                show:true,
                trigger:"item"
            },
            series: [
                {
                type: 'scatter',
                data : chart_data?.map((r) => [r.tarification, r[dataKey], r.name ]),
                itemStyle: {
                    opacity: 0.4,
                    color: color
                    },
                tooltip : {
                    show:true,
                    formatter:(p:any) => `${p.data?.[2]} - <b>${p.data?.[1]?.toLocaleString()} kg/hab</b>`
                }
                },

            ]
    }
    return (
        // @ts-expect-error need update echarts
        <ChartEcharts option={option}/>
    )
}