import React, { useContext } from "react";
import ReactECharts from 'echarts-for-react';  // or var ReactECharts = require('echarts-for-react');
import { BaseRecord } from "@refinedev/core";
import type {EChartsOption, BarSeriesOption} from "echarts"

interface ChartCollectePerformanceProps {
    data: any[] | BaseRecord[]; 
  }

export const ChartCollectePerformance: React.FC<ChartCollectePerformanceProps> = ( {data} ) => {

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
            case "Déchets de produits alimentaires":
                return {color:'#7A4443', sort:4}
            case "Verre":
                return {color:'#008F29', sort:3}
            case "Ordures ménagères résiduelles":
                return {color:'#919191',sort:1}
            case "Emballages et papier":
            case "Emballages, journaux-magazines":
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
    console.log(data)
    const total = data.reduce((acc, cur) => acc + cur.TONNAGE_T_sum/cur.VA_POPANNEE_sum, 0)

    //console.log(total);

    const myseries:BarSeriesOption[] = data.map((e:BaseRecord) => ( {
        type: 'bar', 
        stack:'total', 
        name:e.L_TYP_REG_DECHET, 
        itemStyle : {
            color:mapCategorieProps(e.L_TYP_REG_DECHET).color
        },
        tooltip: {
            valueFormatter : (value:number) => ` ${(((value * total)/100)*1000).toFixed(1)} kg/hab`
        },
        data:[((e.TONNAGE_T_sum/e.VA_POPANNEE_sum)/total)*100]
    } ))

    const option:EChartsOption = {
        series:myseries,
        xAxis: {
            type: 'value'
        },
        tooltip: {
            trigger: 'axis',
            axisPointer: {
              // Use axis to trigger tooltip
              type: 'shadow' // 'shadow' as default; can also be 'line' or 'shadow'
            }
        },
        yAxis: {
        type: 'category',
        data: ['REG']
        },
    }

    return(
        <ReactECharts
        option={option} style={{ height: "450px", marginTop:"0px"}}/>
    )
}