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
    
    const traitement_cat = (item:string) => {
        switch(item){
            case "Incinération avec récupération d'énergie":
                return {categorie : "Valorisation énergétique"}
            case "Stockage":
            case "Incinération sans récupération d'énergie":
                return {categorie : "Elimination"}
            case "Valorisation matière":
            case "Valorisation organique":
                return {categorie : "Recyclage"}
            case "Non précisé":
                return {categorie : "Inconnu"}
        }
    }

    const data_sunburst = alasql(`
        SELECT 
            d.categorie as name, 
            d.categorie as label, 
            SUM(d.TONNAGE_DMA) as val,
            ARRAY(@{"name":d.L_TYP_REG_SERVICE,"value":d.TONNAGE_DMA, "label":''}) as children
        FROM ? d
        GROUP BY d.categorie, d.categorie, d.categorie
    `, [data_pie.map((e:BaseRecord) => ({categorie:traitement_cat(e.L_TYP_REG_SERVICE)?.categorie, ...e}))] ).map((e) => ({...e, value: e.val, children: e.name === 'Recyclage' ? e.children : []}))

    console.log(data_sunburst)

    const myserie:SunburstSeriesOption = {
        type : 'sunburst',
        data : data_sunburst,
        radius: ['50%', '100%'],
        itemStyle: {
          borderRadius: 10,
          borderColor: '#fff',
          borderWidth: 2
        },
        label: {
            show: true, rotate: 'tangential',
           formatter: (params) => {
                const ancestor = params.treePathInfo[0]
                return    `${params.name} - ${Math.round((Number(params.value) / Number(ancestor.value))*100)} %`
           }      
        },
        tooltip:{
            show:true,
            valueFormatter: (value) => (`${Math.round(Number(value))} T` )
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