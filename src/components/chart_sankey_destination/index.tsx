import React, { CSSProperties, useRef } from "react";
import ReactECharts from 'echarts-for-react';  // or var ReactECharts = require('echarts-for-react');
import { BaseRecord } from "@refinedev/core";
import { chartBusinessProps, wrappe } from "../../utils";
import { useChartActionHightlight, useChartEvents } from "../../g2f-dashboard/utils/usecharthightlight";
import { useDashboardElement } from "../../g2f-dashboard/components/dashboard_element/hooks";

export interface ChartSankeyDestinationDMAProps {
    data: any[] | BaseRecord[]; 
    onFocus?:any;
    focus_item?:string;
    style? : CSSProperties;
  }

export const ChartSankeyDestinationDMA: React.FC<ChartSankeyDestinationDMAProps> = ( {data, onFocus, focus_item, style} ) => {
    const chartRef = useRef<any>()

    useChartEvents({chartRef:chartRef, onFocus:onFocus})
    useChartActionHightlight({chartRef:chartRef, target:{name:focus_item}})
    useDashboardElement({chartRef})

    const links = data;
   
    const data_echart = [... new Set([
        ...data.map((d) => (d.source) ), 
        ...data.map((d) => (d.target) ) 
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

