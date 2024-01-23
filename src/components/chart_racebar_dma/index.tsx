import React from "react";
import ReactECharts from 'echarts-for-react';
import { dataGroupBy } from '../../utils';
import { BaseRecord } from '@refinedev/core';
import { EChartsOption } from "echarts";

interface ChartRaceBareDMAProps {
    data: any[] | BaseRecord[]; 
    highlight_region : number;
  }

export const ChartRaceBareDMA: React.FC<ChartRaceBareDMAProps> = ( {data, highlight_region} ) => {

    const chart_data = dataGroupBy(data,['L_REGION','C_REGION'], ['TONNAGE_DMA','VA_POPANNEE'], ['sum','sum']).sort((a,b) => a.TONNAGE_DMA_sum/a.VA_POPANNEE_sum - b.TONNAGE_DMA_sum/b.VA_POPANNEE_sum)

    const option:EChartsOption = {
        yAxis: {
            type: 'category',
            data: chart_data.map((e) => e['L_REGION'])
        },
        xAxis: {
            type: 'value',
            interval:200,
            axisLabel:{
                formatter: '{value} kg/hab',
            }
        },
        grid:{
            left:'180px',
            top:'20px'
        },
        tooltip:{
            show:true,
            valueFormatter : (value) => ` ${(Number(value)).toFixed(1)} kg/hab`
        },
        series: [
            {
                type:'bar',
                showBackground: true,
                emphasis:{
                    focus:'self'
                },
                data:chart_data.map((e) => ({
                  value : (e['TONNAGE_DMA_sum']/e['VA_POPANNEE_sum'])*1e3,
                  itemStyle: {
                    color: e['C_REGION'] == highlight_region ? '#a90000' : undefined
                  }
                }))
            }
        ]
    }
    return (
        <ReactECharts option={option} style={{ height: "450px"}} />
    )
}