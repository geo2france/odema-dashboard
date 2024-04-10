import { GaugeSeriesOption } from 'echarts';
import ReactECharts, { EChartsOption } from 'echarts-for-react'; 
import { geekblue as palette , orange} from '@ant-design/colors';

export interface IChartGaugeTargetProps {
    value:number,
    value_trajectoire:number
}

export const ChartGaugeTarget: React.FC<IChartGaugeTargetProps> = ( {value, value_trajectoire} ) => {

    const color = value > value_trajectoire ? palette[5] : orange[5]

    const myserie:GaugeSeriesOption={
        type:"gauge",
        center: ['50%', '100%'],
        radius:'160%',
        startAngle: 180,
        endAngle: 0 ,
        min: 0,
        max: 100,
        data:[value],
        progress: {
            show: true,
            width: 20
          },
        itemStyle:{color:color},
        pointer: {
            show: false
            },  
        axisTick:{show:false},
        splitLine: {show:false},
        axisLabel:{show:false},
        axisLine: {
            lineStyle: {
              width: 20
            }
          },
        detail: { 
            show: true,
            formatter: '{value} %',
            color: 'inherit',
            offsetCenter: [0, '-15%'], fontSize: 18 
        },
    }

    const myserie2:GaugeSeriesOption={
        ...myserie,
        progress: {
            show: true,
            width: 5
        },
        axisLine:{show:false},
        itemStyle:{color:palette[2]},
        data:[value_trajectoire],z:99,
        detail:{show:false}
    }
    const option:EChartsOption = {
        series:[myserie,myserie2],
    }

    return(
        <ReactECharts
        option={option} style={{ height: "100px"}}/>
    )
}
