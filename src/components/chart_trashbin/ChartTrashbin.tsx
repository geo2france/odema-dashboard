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

    const poubelle64 = "data:image/svg+xml,%3Csvg viewBox='0 0 24 24' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cg id='SVGRepo_bgCarrier' stroke-width='0'%3E%3C/g%3E%3Cg id='SVGRepo_tracerCarrier' stroke-linecap='round' stroke-linejoin='round'%3E%3C/g%3E%3Cg id='SVGRepo_iconCarrier'%3E%3Cpath d='M5.82907 6.65808H18.6325V19.2906C18.6325 20.3951 17.7371 21.2906 16.6325 21.2906H7.82907C6.7245 21.2906 5.82907 20.3951 5.82907 19.2906V6.65808Z' stroke='%23333333' stroke-width='1' stroke-linecap='round' stroke-linejoin='round'%3E%3C/path%3E%3Cpath d='M4 5.74365L20.4615 5.74365' stroke='%23333333' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3C/path%3E%3Cpath d='M14.9134 3H9.54816L8.57266 5.74359H15.8889L14.9134 3Z' stroke='%23333333' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3C/path%3E%3C/g%3E%3C/svg%3E"
    const barWidth = 150

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
        tooltip: {show: true},
        series : series

    }

    return (
        <ChartEcharts option={option}/>
    )
}