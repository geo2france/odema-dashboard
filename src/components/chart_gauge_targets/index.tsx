import { GaugeSeriesOption } from 'echarts';
import ReactECharts, { EChartsOption } from 'echarts-for-react'; 
<<<<<<< HEAD
import { geekblue as palette , green, orange} from '@ant-design/colors';
=======
import { geekblue as palette , red, orange} from '@ant-design/colors';
>>>>>>> 89e0330 (objectifs page et component)

export interface IChartGaugeTargetProps {
    value:number,
    value_trajectoire:number
}

export const ChartGaugeTarget: React.FC<IChartGaugeTargetProps> = ( {value, value_trajectoire} ) => {

<<<<<<< HEAD
    const color = value > value_trajectoire ? green[5] : orange[5]

    const myserie:GaugeSeriesOption={
        type:"gauge",
        center: ['50%', '90%'],
        radius:'160%',
=======
    const color = value > value_trajectoire ? palette[5] : orange[5]

    const myserie:GaugeSeriesOption={
        type:"gauge",
        center: ['50%', '60%'],
>>>>>>> 89e0330 (objectifs page et component)
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
<<<<<<< HEAD
        detail: { 
            show: true,
            formatter: '{value} %',
            color: 'inherit',
            offsetCenter: [0, '-15%'], fontSize: 18 
        },
=======
        detail:{show:false}
          
>>>>>>> 89e0330 (objectifs page et component)
    }

    const myserie2:GaugeSeriesOption={
        ...myserie,
        progress: {
            show: true,
            width: 5
        },
        axisLine:{show:false},
        itemStyle:{color:palette[2]},
<<<<<<< HEAD
        data:[value_trajectoire],z:99,
        detail:{show:false}
=======
        data:[value_trajectoire],z:99
>>>>>>> 89e0330 (objectifs page et component)
    }
    const option:EChartsOption = {
        series:[myserie,myserie2],
    }

    return(
        <ReactECharts
<<<<<<< HEAD
        option={option} style={{ height: "100px"}}/>
=======
        option={option} style={{ height: "200px"}}/>
>>>>>>> 89e0330 (objectifs page et component)
    )
}
