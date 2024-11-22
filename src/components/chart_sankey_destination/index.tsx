import React, { CSSProperties, useRef } from "react";
import ReactECharts from 'echarts-for-react';  // or var ReactECharts = require('echarts-for-react');
import { chartBusinessProps, wrappe } from "../../utils";
import { useDashboardElement, useChartActionHightlight, useChartEvents, SimpleRecord } from "g2f-dashboard";
import { useChartData } from "g2f-dashboard/src/components/DashboardElement/hooks";

export interface ChartSankeyDestinationDMAProps {
    data: any[] | SimpleRecord[]; 
    onFocus?:any;
    focus_item?:string;
    style? : CSSProperties;
  }

export const ChartSankeyDestinationDMA: React.FC<ChartSankeyDestinationDMAProps> = ( {data, onFocus, focus_item, style} ) => {
    const chartRef = useRef<any>()

    useChartEvents({chartRef:chartRef, onFocus:onFocus})
    useChartActionHightlight({chartRef:chartRef, target:{name:focus_item}})
    useDashboardElement({chartRef})
    useChartData({data:data, dependencies:[data]}) //Renommer les champs


    const links = data.filter((e) => e.target !== `Incinération sans récupération d'énergie`); // Pas assez de tonnage
    const data_echart = [... new Set([
        ...links.map((d) => (d.source) ), 
        ...links.map((d) => (d.target) ) 
    ] ) ].map((e) => ({
        name:e,
        itemStyle: {
            color: chartBusinessProps(e).color,},
        label:{formatter:(x:any) => wrappe(x.name,20)}
        }
        )).sort((a,b) => (chartBusinessProps(b.name).sort || 0) - (chartBusinessProps(a.name).sort || 0)   )
    const option = {
        tooltip: {
            trigger: 'item',
            triggerOn: 'mousemove',
            valueFormatter: (v:number) => `${Math.floor(v).toLocaleString()} T`
        },
        series: 
        {
            name: 'Access From',
            type: 'sankey',
            itemStyle:{
                borderRadius:2,
            },
            layoutIterations: 0,
            emphasis: {
                itemStyle: {
                    focus: 'adjacency'
                }
            },
            lineStyle: {
                color: 'gradient',
                curveness: 0.5
            },
            data: data_echart,
            links,
        },
    };

    return(
        <ReactECharts
        option={option} ref={chartRef} style={{ ...style, marginTop:"0px"}}/>
    )
}

