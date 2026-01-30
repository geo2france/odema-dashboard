import { ChartEcharts, useBlockConfig, useDataset, usePaletteLabels } from "@geo2france/api-dashboard/dsl"
import { EChartsOption } from "echarts"


interface ChartDaeModeTraitementProps {
    dataset?: string
    title?:string
    dataKey: string
    nameKey: string
}

export const ChartDaeModeTraitement:React.FC<ChartDaeModeTraitementProps> = ({dataset:dataset_id, nameKey, dataKey}) => {

    const dataset  = useDataset(dataset_id) 
    const data = dataset?.data

    const COLORS = usePaletteLabels()

    useBlockConfig({
        title: 'Modes de traitement en 2022',
        dataExport: data
    })

    const total = data?.reduce((sum, item) => sum + item[dataKey], 0);

    const option:EChartsOption = {
        tooltip:{
            show: true,
            valueFormatter: (v) => `${v?.toLocaleString(undefined, {maximumFractionDigits:0})} t`
        },
        series:{
            type: 'bar',
            data: data?.map( r => [r[nameKey], r[dataKey], COLORS.find(c => c.label == r.lib_indicateur)?.color]),
            label:{
                show: true,
                position: 'right',
                formatter: (v) => (100*(v?.value  as number[])[1]/total!).toLocaleString(undefined, {maximumFractionDigits:0})+' %'
            },
            encode:{
                x:1,
                y:0
            },
            itemStyle: {
                color: (p:any) => p?.data?.[2] || '#000'
            },
        },
        xAxis: {type:'value', axisLabel:{formatter: (v) => `${(v/1e3).toLocaleString()} kt` } },
        yAxis: {type: 'category', }
    }
    return <ChartEcharts option={option} />
}