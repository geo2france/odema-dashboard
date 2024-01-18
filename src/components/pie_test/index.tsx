import React, { useContext } from "react";
import ReactECharts from 'echarts-for-react';  // or var ReactECharts = require('echarts-for-react');
import { BaseRecord } from "@refinedev/core";

interface ChartSankeyDestinationDMAProps {
    data: any[] | BaseRecord[]; 
  }

export const ChartSankeyDestinationDMA: React.FC<ChartSankeyDestinationDMAProps> = ( {data} ) => {

    const links = data;

    const mapCategorieProps = (item:string) => {
        switch(item){
            case "Stockage":
            case "Stockage pour inertes":
            case "Incinération sans récupération d'énergie":
                return {color:"#ED1C24", sort:1}
            case "Incinération avec récupération d'énergie":
                return {color:'#FFB800', sort:2}
            case "Valorisation matière":
            case "Valorisation organique":
                return {color:'#ABCB54', sort:3}
            case "Biodéchets":
            case "Déchets verts et biodéchets":
                return {color:'#7A4443', sort:4}
            case "Verre":
                return {color:'#008F29', sort:3}
            case "Ordures ménagères résiduelles":
                return {color:'#919191',sort:1}
            case "Emballages et papier":
            case "Matériaux recyclables":
                return {color:'#FEFA54',sort:2}
            case "Encombrants":
            case "Déchets dangereux (y.c. DEEE)":
            case "Collectes séparées hors gravats":
                return {color:'#FF8001',sort:5}
            case "Non précisé":
            case "Autres":
                return {color:'#5D5D5D', sort:5}
            default :
                return {color:'#0f0', sort:99}
        }
    }

    
    const data_echart = [... new Set([
        ...data.map((d) => (d.source) ), 
        ...data.map((d) => (d.target) ) 
    ] ) ].map((e) => ({name:e,  itemStyle: {
        color: mapCategorieProps(e).color,}})).sort((a,b) => mapCategorieProps(a.name).sort - mapCategorieProps(b.name).sort   )

    console.log(links)

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
        option={option} style={{ height: "450px", marginTop:"0px"}}/>
    )
}

