import React, { CSSProperties } from "react";
import ReactECharts from 'echarts-for-react';
import { BaseRecord } from '@refinedev/core';
import { EChartsOption } from "echarts";
import alasql from "alasql";

export interface ChartRaceBareDMAProps {
    data: any[] | BaseRecord[];
    data_territoire: any[] | BaseRecord[];
    highlight_region : string;
    style? : CSSProperties
  }

export const ChartRaceBareDMA: React.FC<ChartRaceBareDMAProps> = ( {data, data_territoire, highlight_region, style} ) => {  
    const chart_data = alasql(`
                        SELECT a.L_REGION, a.C_REGION,  sum(a.TONNAGE_DMA) as TONNAGE_DMA, sum(a.VA_POPANNEE) AS VA_POPANNEE
                        FROM (
                            SELECT L_REGION, C_REGION, N_DEPT, sum(TONNAGE_T_HG) as TONNAGE_DMA, max(data_territoire.VA_POPANNEE) as VA_POPANNEE
                            FROM ? data
                            JOIN ? as data_territoire ON data_territoire.N_DEPT = data.N_DEPT AND data_territoire.Annee = data.ANNEE
                            GROUP BY L_REGION, C_REGION, N_DEPT) as a
                        GROUP BY a.L_REGION, a.C_REGION
                        ORDER BY sum(a.TONNAGE_DMA) / sum(a.VA_POPANNEE)
                        `, [data, data_territoire]) //Reprendre avec les données à jours de l'ADEME "chiffre clés hors gravat"
           
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
                  value : (e['TONNAGE_DMA']/e['VA_POPANNEE'])*1e3,
                  itemStyle: {
                    color: e['C_REGION'] == highlight_region ? '#a90000' : undefined
                  }
                }))
            }
        ]
    }
    return (
        <ReactECharts option={option} style={ style } />
    )
}