import { BaseRecord } from "@refinedev/core";
import alasql from "alasql";
import { EChartsOption, PieSeriesOption } from "echarts";
import ReactECharts from 'echarts-for-react'; 

interface ChartPieRepCollecteProps {
    data: any[] | BaseRecord[];
    filiere:string;
    c_region?:string;
    annee?:number
  }


export const ChartPieRepCollecte: React.FC<ChartPieRepCollecteProps> = ({data, filiere, annee, c_region='32'} )  => {
    let data_pie = []
    if (filiere == 'd3e'){ //Les données des différentes fillière REP ne sont pas diffusée de manière homogène
        data_pie = alasql(`SELECT [Code_région], d.Flux, sum([Total]) AS tonnage
        FROM ? d
        GROUP BY [Code_région], d.Flux
        `, [data]).map((e:BaseRecord) => ({name: e.Flux, value: e.tonnage} ))
    }else if (filiere == 'pa'){
        data_pie = alasql(`
        SELECT d.[Code_Région], 'Collectivités' AS type, sum(d.[Collectivités]) AS tonnage
        FROM ? d
        GROUP BY d.[Code_Région]
        UNION ALL CORRESPONDING
        SELECT d2.[Code_Région], 'Distribution' AS type, sum(d2.[Distribution]) AS tonnage
        FROM ? d2
        GROUP BY d2.[Code_Région]
        UNION ALL CORRESPONDING
        SELECT d3.[Code_Région], 'Autre' AS type, sum(d3.[Autre]) AS tonnage
        FROM ? d3
        GROUP BY d3.[Code_Région]
        `, [data,data,data]).map((e:BaseRecord) => ({name: e.type, value: e.tonnage} ))
        console.log(data)
        console.log(data_pie)

    }else if (filiere == 'pchim'){
        data_pie = alasql(`SELECT [equip_declare], sum([Somme_de_masse]) AS tonnage
        FROM ? d
        GROUP BY [equip_declare]
        `, [data]).map((e:BaseRecord) => ({name: e.equip_declare, value: e.tonnage} ))
    }else if (filiere == 'tlc'){
        data_pie = alasql(`SELECT [origine], sum([tonnage]) AS tonnage
        FROM ? d
        GROUP BY [origine]
        `, [data]).map((e:BaseRecord) => ({name: e.origine, value: e.tonnage} ))
    }else if (filiere == 'mnu'){
        data_pie = alasql(`SELECT [Code_Région], sum([tonnage]) AS tonnage
        FROM ? d
        GROUP BY [Code_Région]
        `, [data]).map((e:BaseRecord) => ({name: 'MNU', value: e.tonnage} ))
    }else if (filiere == 'disp_med'){
        data_pie = alasql(`SELECT [origine], sum([tonnage]) AS tonnage
        FROM ? d
        GROUP BY [origine]
        `, [data]).map((e:BaseRecord) => ({name: e.origine, value: e.tonnage} ))
    }

    const myserie:PieSeriesOption = {
        type : 'pie',
        data : data_pie,
        radius: ['40%', '70%'],
        avoidLabelOverlap: false,
        itemStyle: {
          borderRadius: 10,
          borderColor: '#fff',
          borderWidth: 2
        },
        label: {
            show: true,
            formatter: (params) => (`${Math.round(Number(params.value))} t`)        
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
        }
    }


    return(
        <ReactECharts
        option={option} style={{ height: "450px"}}/>
    )
}
