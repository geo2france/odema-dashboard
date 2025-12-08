import React, { CSSProperties } from "react";
import { chartBusinessProps, wrappe } from "../../utils";
import { ChartEcharts, useBlockConfig, useDataset } from "@geo2france/api-dashboard/dsl";
import { EChartsOption } from "echarts";

export interface ChartSankeyDestinationDMAProps {
    dataset?: string; 
    title?: string;
    style? : CSSProperties;
  }

export const ChartSankeyDestinationDMA: React.FC<ChartSankeyDestinationDMAProps> = ( {dataset:dataset_id, style, title} ) => {

    const dataset = useDataset(dataset_id)
    const blur = dataset?.isFetching // A vérifier, le blur ne se déclanche pas lors du changement d'année. A gérer niveau <Block> ?

    const links = dataset?.data?.filter((e) => e.target !== `Incinération sans récupération d'énergie`); // Pas assez de tonnage


    const data_echart = links && [... new Set([
        ...links.map((d) => (d.source) ), 
        ...links.map((d) => (d.target) ) 
    ] ) ].map((e) => ({
        name:e,
        itemStyle: {
            color: chartBusinessProps(e).color,},
        label:{formatter:(x:any) => wrappe(x.name,20)}
        }
        )).sort((a,b) => (chartBusinessProps(b.name).sort || 0) - (chartBusinessProps(a.name).sort || 0)   )

    useBlockConfig({ dataExport: dataset?.data, title});

    const option:EChartsOption = {
        tooltip: {
            trigger: 'item',
            triggerOn: 'mousemove',
            valueFormatter: (v) => v ? `${Math.floor(Number(v)).toLocaleString()} T` : ''
        },
        xAxis:{show:false},yAxis:{show:false},
        series: 
        {
            name: 'Access From',
            type: 'sankey',
            itemStyle:{
                borderRadius:2,
            },
            layoutIterations: 0,
            emphasis:{
                itemStyle: {
                    borderColor: '#383838',
                    borderType: 'solid',
                    borderWidth: 2,
                  },
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
        <ChartEcharts
        option={option} style={{ ...style, filter: blur ? 'blur(4px)':undefined, marginTop:"0px"}}/>
    )
}

