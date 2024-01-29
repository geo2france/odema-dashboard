import React from "react";
import ReactECharts from 'echarts-for-react';
import { BaseRecord } from '@refinedev/core';
import { EChartsOption } from "echarts";
import alasql from "alasql";

interface ChartRaceBareDMAProps {
    data: any[] | BaseRecord[]; 
    highlight_region : number;
  }

export const ChartRaceBareDMA: React.FC<ChartRaceBareDMAProps> = ( {data, highlight_region} ) => {

    const chart_data = alasql(`SELECT L_REGION, C_REGION, sum(TONNAGE_DMA) as TONNAGE_DMA_sum, SUM(VA_POPANNEE) as VA_POPANNEE_sum
                        FROM ?
                        GROUP BY L_REGION, C_REGION
                        ORDER BY sum(TONNAGE_DMA)/SUM(VA_POPANNEE)`, [data])

    const option:EChartsOption = {
        yAxis: {
            type: 'category',
            data: chart_data.map((e:BaseRecord) => e['L_REGION'])
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
                data:chart_data.map((e:BaseRecord) => ({
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