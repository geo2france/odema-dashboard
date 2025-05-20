import { useRef } from 'react';
import ReactECharts from 'echarts-for-react'; 
import { SimpleRecord, useDashboardElement } from 'api-dashboard';
import { EChartsOption } from 'echarts';
import alasql from 'alasql';
import { chartBusinessProps } from '../../utils';

interface ChartePieCollecteProps {
    data:SimpleRecord[]
}

const ChartePieCollecte : React.FC<ChartePieCollecteProps> = ({data}) => {
    const chartRef = useRef<any>();

    useDashboardElement({chartRef});

    const data_agg = alasql(`SELECT 
            SUM([ratio_hab_dechetterie]) as [Déchèterie],
            SUM(CASE WHEN [type_dechet] = 'Ordures ménagères résiduelles' THEN [ratio_hab_pap] ELSE 0 END) as [Collecte OMR],
            SUM(CASE WHEN [type_dechet] != 'Ordures ménagères résiduelles' THEN [ratio_hab_pap] ELSE 0 END) as [Collecte séparées]
        FROM ?`, [data]) as SimpleRecord[]

    const chart_data = data_agg?.length > 0 ? Object.entries(data_agg[0]).map(([key, value]) => ({
        name: key,
        value: value as number,
        itemStyle: {
            color: chartBusinessProps(key).color
        }
      })) : []

    const total = data?.reduce((sum, item) => sum + item.ratio_hab , 0);

    const option: EChartsOption = {
      legend: {top:'top', show:true},
      tooltip: {
        trigger: 'item'
      },
      graphic: [{
        type: 'text',
        left: 'center',
        top: 'center',
        style: {
            text: `${Math.round(total)} kg/hab`,
            fill: '#666',
            fontSize: 16,
            fontWeight: 'bold'
        }
      }],
      series: [{ 
        type: "pie",
         data: chart_data ,
         radius: ['40%', '70%'],
         avoidLabelOverlap: false,
         itemStyle: {
           borderRadius: 5,
           borderColor: '#fff',
           borderWidth: 2
         },
         label: {
             show: true,
             formatter: (params) => (`${Math.round(Number(params.percent))}%`)        
         },
         tooltip:{
             show:true,
             valueFormatter: (value) => (`${Math.round(Number(value))} kg/hab` )
         }
        }],
      
    };

    return (
        <ReactECharts
            option={option} ref={chartRef} />
    )
}

export default ChartePieCollecte