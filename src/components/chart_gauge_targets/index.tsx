import { GaugeSeriesOption } from 'echarts';
import ReactECharts, { EChartsOption } from 'echarts-for-react'; 
import { geekblue as palette, red, gold, green, lime, orange} from '@ant-design/colors';
import { useContext } from 'react';
import { pageContext } from '../pages/objectifs';

export interface IChartGaugeTargetProps {
    value:number,
    value_trajectoire:number
}

export const ChartGaugeTarget: React.FC<IChartGaugeTargetProps> = ( {value, value_trajectoire} ) => {
    const context = useContext(pageContext)

    const color = ((progress:number) => {
        if (progress <= 30) {
           return red[3];
       } else if (progress <= 50) {
           return orange[3];
       } else if (progress <= 70) {
           return gold[3];
       } else if (progress <= 90) {
           return lime[3];
        } else if (progress > 90) {
            return green[3];
       } else {
           return 'grey';
       }
   })(value)

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
        axisLabel:{show:true, color: '#464646', // Objectif intermédiaire ?
            fontSize: 10,
            distance: -30,
            rotate: 'tangential',
            formatter: (v) => {{if(v===75 || v===20){return `2023 \n 75%`} return ``}}    
        },
        splitNumber:100,
        splitLine: {show:false},
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
            width: context.remaningTime ? 5 : 0
        },
        axisLine:{show:false},
        axisLabel:{show:false},
        itemStyle:{color:palette[2]},
        data:[value_trajectoire],z:99,
        detail:{show:false}
    }

    const myserie3:GaugeSeriesOption={
        ...myserie,
        progress: {
            show:false
        },
        pointer: {
            show: true,
            showAbove:false,
            offsetCenter:[0,-50],
            icon:"rect",
            width:1,
            itemStyle:{
                color:"black"
            },
        }, 
        detail: { 
            show: true,
            formatter: '{value} %',
            color: 'red',
            offsetCenter: [0, '-15%'], fontSize: 18 
        },
        data:[75],

    }
    const option:EChartsOption = {
        series:[myserie],
    }

    return(
        <ReactECharts
        option={option} style={{ height: "100px"}}/>
    )
}
