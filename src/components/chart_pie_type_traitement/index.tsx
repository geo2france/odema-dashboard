import { BaseRecord } from "@refinedev/core";
import alasql from "alasql";
import { EChartsOption, PieSeriesOption, SunburstSeriesOption } from "echarts";
import ReactECharts from 'echarts-for-react';  // or var ReactECharts = require('echarts-for-react');


interface ChartPieTypeTraitementProps {
    data: any[] | BaseRecord[]; // Spécifier les champs au niveau de la ressource
    data_territoire: any[] | BaseRecord[]; // Le endpoint précédent ne fournie pas la POPANNEE
    c_region?:string
  }

export const ChartPieTypeTraitement: React.FC<ChartPieTypeTraitementProps> = ( {data, data_territoire, c_region='32'} ) => {
    //TODO : Ajouter un onglet avec l'évolution des type de traitement par an (avec surbrillance de l'année en cours)
    const data_pie = alasql(`SELECT 
    t.C_REGION, t.ANNEE, t.L_TYP_REG_SERVICE, sum(t.TONNAGE_DMA) as TONNAGE_DMA, a.pop_region
    FROM (
        SELECT c.ANNEE, c.C_REGION, sum(c.VA_POPANNEE) as pop_region 
        FROM ? c 
        GROUP BY c.ANNEE, c.C_REGION
    ) as a
    JOIN ? t ON a.ANNEE = t.ANNEE AND t.C_REGION = a.C_REGION
    WHERE t.C_REGION = '32'
    GROUP BY t.C_REGION, t.ANNEE, t.L_TYP_REG_SERVICE, a.pop_region
    `, [data_territoire, data]).map((e:BaseRecord) => ({ratio_kg_hab:(e.TONNAGE_DMA*1000) / e.pop_region, ...e}))
    
    const mapCategorieProps = (item:string) => { // TODO : A factoriser avec les autres charts
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
        data : data_pie.map((e:BaseRecord) => ({name:e.L_TYP_REG_SERVICE, value:(e.TONNAGE_DMA*1000) / e.pop_region, itemStyle:{color:mapCategorieProps(e.L_TYP_REG_SERVICE).color}  })).sort((a:BaseRecord,b:BaseRecord) => mapCategorieProps(a.name).sort - mapCategorieProps(b.name).sort ),
        radius: ['40%', '70%'],
        startAngle:-90,
        clockwise:true,
        itemStyle: {
          borderRadius: 10,
          borderColor: '#fff',
          borderWidth: 2
        },
        label: {
            show: true,
            formatter: (params) => (`${Math.round(Number(params.value))} kg/hab`)        
        },
        tooltip:{
            show:true,
            valueFormatter: (value) => (`${Number(value).toFixed(2)} kg/hab` )
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
        }
    }

    return (
        <ReactECharts
        option={option} style={{ height: "450px"}}/>
    )
}