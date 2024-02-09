import React, { useContext } from "react";
import ReactECharts from 'echarts-for-react';  // or var ReactECharts = require('echarts-for-react');
import { BaseRecord } from "@refinedev/core";
import type {EChartsOption, BarSeriesOption, PieSeriesOption} from "echarts"
import alasql from "alasql";

interface ChartCollectePerformanceProps {
    data: any[] | BaseRecord[]; // Spécifier les champs au niveau de la ressource
    data_territoire: any[] | BaseRecord[]; // Le endpoint précédent ne fournie pas la POPANNEE
    c_region?:string
  }

export const ChartCollectePerformance: React.FC<ChartCollectePerformanceProps> = ( {data, data_territoire, c_region='32'} ) => {

    const data_pie = alasql(`SELECT TYP_COLLECTE, (sum(TONNAGE_T_HG) / sum(data_territoire.VA_POPANNEE))*1000 AS RATIO_KG_HAB 
                        FROM ? data 
                        JOIN ? as data_territoire ON data_territoire.N_DEPT = data.N_DEPT AND data_territoire.ANNEE = data.ANNEE
                        WHERE C_REGION='${c_region}'
                        GROUP BY TYP_COLLECTE`, [data, data_territoire])

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

    const myserie:PieSeriesOption = {
        type : 'pie',
        data : data_pie.map((e:BaseRecord) => ({name: e.TYP_COLLECTE, value: e.RATIO_KG_HAB, itemStyle:{color:mapCategorieProps(e.TYP_COLLECTE).color}})),
        radius: ['40%', '70%'],
        avoidLabelOverlap: false,
        itemStyle: {
          borderRadius: 10,
          borderColor: '#fff',
          borderWidth: 2
        },
        label: {
            show: true,
            formatter: (params) => (`${Math.round(Number(params.percent))}%`)        
        },
        tooltip:{
            show:true,
            valueFormatter: (value) => (`${Math.round(Number(value))} kg/hab` )
        }
    }


    const option:EChartsOption = {
        series:[myserie],
        grid:{
            left:'95px',
        },
        legend: {top:'top', show:true},
        tooltip: {
            trigger: 'item'
        },
        graphic: [{
            type: 'text',
            left: 'center',
            top: 'center',
            style: {
                text: `${Math.round(data_pie.reduce((acc:number, obj:BaseRecord) => acc + obj.RATIO_KG_HAB, 0))} kg/hab`,
                fill: '#666',
                fontSize: 16,
                fontWeight: 'bold'
            }
        }]
    }

    return(
        <ReactECharts
        option={option} style={{ height: "450px"}}/>
    )
}