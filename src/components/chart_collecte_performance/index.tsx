import React, { useContext } from "react";
import ReactECharts from 'echarts-for-react';  // or var ReactECharts = require('echarts-for-react');
import { BaseRecord } from "@refinedev/core";
import type {EChartsOption, BarSeriesOption} from "echarts"
import { dataGroupBy } from "../../utils";

interface ChartCollectePerformanceProps {
    data: any[] | BaseRecord[]; 
  }

export const ChartCollectePerformance: React.FC<ChartCollectePerformanceProps> = ( {data} ) => {

    const data_dep = dataGroupBy(data, ['N_DEPT', 'L_TYP_REG_DECHET'], ['TONNAGE_T', 'VA_POPANNEE', 'RATIO_KG_HAB'], ['sum','sum', 'sum']);

    const dechets_types = [... new Set(data_dep.map((e) => e.L_TYP_REG_DECHET ))]
    const deps = [... new Set(data_dep.map((e) => e.N_DEPT ))]

    const data_reg:any[] = dataGroupBy(data, ['L_REGION','L_TYP_REG_DECHET'], ['TONNAGE_T', 'VA_POPANNEE'], ['sum','sum']).map((e) => ({...e, RATIO_KG_HAB:(e.TONNAGE_T_sum*1000) / e.VA_POPANNEE_sum } ) );
    const regs = [... new Set(data_reg.map((e) => e.L_REGION ))]

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

    const myseries:BarSeriesOption[] = dechets_types.map((e:string) => ( {
        type: 'bar', 
        stack:'total', 
        name:e, 
        itemStyle : {
            color:mapCategorieProps(e).color,
        },
        emphasis: {
            focus: 'series'
        },
        tooltip: {
            valueFormatter : (value) => ` ${(Number(value)).toFixed(1)} kg/hab`
        },
        data:
            [
             ...[data_reg.find((dr) => dr.L_TYP_REG_DECHET === e)?.RATIO_KG_HAB], //Push region
             ...[null], //Empty series between deps and reg
             ...deps.map((d) => (data_dep.find((dd) => dd.L_TYP_REG_DECHET === e && dd.N_DEPT === d) ?? { RATIO_KG_HAB_sum: 0 }).RATIO_KG_HAB_sum), //DEP Data, 0 if undefined
            ]
        }
    ))

    const option:EChartsOption = {
        series:myseries,
        xAxis: {
            type: 'value',
            axisLabel:{
                formatter:(l) => `${l} kg/hab`
            }
        },
        legend: {},
        tooltip: {
            trigger: 'axis',
            axisPointer: {
              // Use axis to trigger tooltip
              type: 'shadow' // 'shadow' as default; can also be 'line' or 'shadow'
            }
        },
        yAxis: {
            type: 'category',
            data: [...regs, '', ...deps],
            axisLabel:{rotate:45}
        },
    }

    return(
        <ReactECharts
        option={option} style={{ height: "450px", marginTop:"0px"}}/>
    )
}