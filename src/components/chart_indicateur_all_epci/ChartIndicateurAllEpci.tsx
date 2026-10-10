import { datasetInput } from "@geo2france/api-dashboard"
import { ChartEcharts, useDataset } from "@geo2france/api-dashboard/dsl"
import { EChartsOption } from "echarts"

interface ChartIndicateurAllEpciProps {
    dataset: datasetInput
}

export const ChartIndicateurAllEpci:React.FC<ChartIndicateurAllEpciProps> = ({dataset:input_dataset}) => {

    const dataset = useDataset(input_dataset)

    const data = dataset?.data

    const option:EChartsOption = {
        xAxis: {
            type: 'category',
        },
        tooltip:{
            show:true
        },
        yAxis: {
            type: 'value'
        },
        series: [
            {
            data: data?.map( row => [row.libel_epci, row.ratio_dma_pr_2017]) ,
            type: 'bar'
            }
        ]
    };
    return <ChartEcharts option={option} />
}