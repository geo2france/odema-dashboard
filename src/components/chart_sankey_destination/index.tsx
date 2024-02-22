import React, { useContext, useEffect, useRef } from "react";
import ReactECharts from 'echarts-for-react';  // or var ReactECharts = require('echarts-for-react');
import { BaseRecord } from "@refinedev/core";
import { DMAmapCategorieProps, wrappe } from "../../utils";

interface ChartSankeyDestinationDMAProps {
    data: any[] | BaseRecord[]; 
    onFocus?:any;
    focus_item?:string;
  }

export const ChartSankeyDestinationDMA: React.FC<ChartSankeyDestinationDMAProps> = ( {data, onFocus, focus_item} ) => {
    const chartRef = useRef<any>()

    const links = data;
   
    const data_echart = [... new Set([
        ...data.map((d) => (d.source) ), 
        ...data.map((d) => (d.target) ) 
    ] ) ].map((e) => ({
        name:e,
        itemStyle: {
            color: DMAmapCategorieProps(e).color,},
        label:{formatter:(x:any) => wrappe(x.name,20)}
        }
        )).sort((a,b) => DMAmapCategorieProps(a.name).sort - DMAmapCategorieProps(b.name).sort   )

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


    useEffect(() => {
        const mychart = chartRef.current.getEchartsInstance()
        mychart.on('mouseover', (e:any) => onFocus(e.name));
        mychart.on('mouseout', (e:any) => onFocus(null));
    },[])

    if(focus_item && chartRef.current) {
        const mychart = chartRef.current.getEchartsInstance()
        mychart.dispatchAction({type: 'downplay'})
        mychart.dispatchAction({type: 'highlight', name:focus_item})
    }


    return(
        <ReactECharts
        option={option} ref={chartRef} style={{ height: "450px", marginTop:"0px"}}/>
    )
}

