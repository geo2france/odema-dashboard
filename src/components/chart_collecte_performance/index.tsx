import React, { useContext } from "react";
import ReactECharts from 'echarts-for-react';  // or var ReactECharts = require('echarts-for-react');
import { BaseRecord } from "@refinedev/core";
import type {EChartsOption, BarSeriesOption} from "echarts"
import alasql from "alasql";

interface ChartCollectePerformanceProps {
    data: any[] | BaseRecord[]; // Spécifier les champs au niveau de la ressource
    data_territoire: any[] | BaseRecord[];
  }

export const ChartCollectePerformance: React.FC<ChartCollectePerformanceProps> = ( {data, data_territoire} ) => {

    const data_dep = alasql(`
            SELECT data.*, data_territoire.VA_POPANNEE, (data.TONNAGE_T_HG/data_territoire.VA_POPANNEE)*1000 as RATIO_KG_HAB
            FROM ? as data
            JOIN ? as data_territoire ON data_territoire.N_DEPT = data.N_DEPT`, [data, data_territoire]);

    const dechets_types = alasql(`SELECT DISTINCT TYP_COLLECTE FROM ?`, [data]);

    const deps = alasql(`SELECT DISTINCT N_DEPT FROM ?`, [data]);

    const data_reg = alasql(`
        SELECT L_REGION, TYP_COLLECTE, (sum(TONNAGE_T_HG) / sum(VA_POPANNEE))*1000 as RATIO_KG_HAB
        FROM ? data
        GROUP BY L_REGION, TYP_COLLECTE`,[data_dep]);

    const regs = alasql(`SELECT DISTINCT L_REGION FROM ? `,[data]);

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
            case "Collecte OMR":
                return {color:'#919191',sort:1}
            case "Emballages et papier":
            case "Emballages, journaux-magazines":
            case "Matériaux recyclables":
            case "Collecte séparées":
                return {color:'#FEFA54',sort:2}
            case "Encombrants":
            case "Déchèterie":
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

    const myseries:BarSeriesOption[] = dechets_types.map((e:BaseRecord) => ( {
        type: 'bar', 
        stack:'total', 
        name:e.TYP_COLLECTE,
        itemStyle : {
            color:mapCategorieProps(e.TYP_COLLECTE).color,
        },
        emphasis: {
            focus: 'series'
        },
        tooltip: {
            valueFormatter : (value:string) => `${(Number(value)).toFixed(1)} kg/hab`
        },
        label: {
            show: true,
            formatter : (p:any) => (p.value >= 10 ? `${p.value.toFixed(1).toString()}` : ''),
        },
        data:
            [
             ...[data_reg.find((dr:BaseRecord) => dr.TYP_COLLECTE === e.TYP_COLLECTE)?.RATIO_KG_HAB], //Push region
             ...[null], //Empty series between deps and reg
             ...deps.map((d:BaseRecord) => (data_dep.find((dd:BaseRecord) => dd.TYP_COLLECTE === e.TYP_COLLECTE && dd.N_DEPT === d.N_DEPT) ?? { RATIO_KG_HAB: 0 }).RATIO_KG_HAB), //DEP Data, 0 if undefined
            ]
        }
    ))

    const option:EChartsOption = {
        series:myseries,
        xAxis: {
            type: 'value',
            axisLabel:{
                formatter:'{value} kg/hab'
            }
        },
        grid:{
            left:'95px',
        },
        legend: {top:'top', show:true},
        tooltip: {
            trigger: 'axis',
            axisPointer: {
              // Use axis to trigger tooltip
              type: 'shadow' // 'shadow' as default; can also be 'line' or 'shadow'
            }
        },
        yAxis: {
            type: 'category',
            data: [...regs.map((e:BaseRecord) => e.L_REGION), '', ...deps.map((e:BaseRecord) => e.N_DEPT)],
            axisLabel:{rotate:45}
        },
    }

    return(
        <ReactECharts
        option={option} style={{ height: "450px"}}/>
    )
}