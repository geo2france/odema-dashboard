import React, { CSSProperties, useRef } from "react";
import ReactECharts from 'echarts-for-react';
import { EChartsOption } from "echarts";
import alasql from "alasql";
import { SimpleRecord, useDashboardElement } from "g2f-dashboard";

export interface ChartRaceBareDMAProps {
    data: any[] | SimpleRecord[];
    highlight_region : string;
    style? : CSSProperties
  }

export const ChartRaceBareDMA: React.FC<ChartRaceBareDMAProps> = ( {data, highlight_region, style} ) => {  
    const chartRef = useRef<any>()
    useDashboardElement({chartRef})

    const chart_data = alasql(`
        SELECT d.[C_REGION], d.[L_REGION], SUM(d.[TONNAGE__DMA]) as TONNAGE_DMA, SUM(d.[VA_POPANNEE]) AS VA_POPANNEE
        FROM ? d
        GROUP BY d.[L_REGION], d.[C_REGION]
        ORDER BY SUM(d.[TONNAGE__DMA]) / SUM(d.[VA_POPANNEE])
    `,[data])

    const option:EChartsOption = {
        yAxis: {
            type: 'category',
            data: chart_data.map((e:SimpleRecord) => e['L_REGION'])
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
                data:chart_data.map((e:SimpleRecord) => ({
                  value : (e['TONNAGE_DMA']/e['VA_POPANNEE'])*1e3,
                  itemStyle: {
                    color: e['C_REGION'] == highlight_region ? '#a90000' : undefined
                  }
                }))
            }
        ]
    }
    return (
        <ReactECharts option={option} ref={chartRef} style={style} />
    )
}