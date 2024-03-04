import { BaseRecord } from "@refinedev/core";
import alasql from "alasql";
import { EChartsOption, PieSeriesOption } from "echarts";
import ReactECharts from 'echarts-for-react'; 
import { RepDefinition } from "../../utils";

export interface ChartPieRepCollecteProps {
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
    }else if (filiere == 'pu'){
        data_pie = alasql(`
        SELECT d.[Code_Région], 'Cyclomoteurs_et_véhicules_légers' AS type, sum(d.[Cyclomoteurs_et_véhicules_légers]) AS tonnage
        FROM ? d
        GROUP BY d.[Code_Région]
        UNION ALL CORRESPONDING
        SELECT d2.[Code_Région], 'Poids_lourd' AS type, sum(d2.[Poids_lourd]) AS tonnage
        FROM ? d2
        GROUP BY d2.[Code_Région]
        UNION ALL CORRESPONDING
        SELECT d3.[Code_Région], 'Avions_-_Hélicoptères' AS type, sum(d3.[Avions_-_Hélicoptères]) AS tonnage
        FROM ? d3
        GROUP BY d3.[Code_Région]
        UNION ALL CORRESPONDING
        SELECT d4.[Code_Région], 'Agraire_-_Génie_civil_1_et_agraire_-_Génie_civil_2' AS type, sum(d4.[Agraire_-_Génie_civil_1_et_agraire_-_Génie_civil_2]) AS tonnage
        FROM ? d4
        GROUP BY d4.[Code_Région]
        `, [data,data,data,data]).map((e:BaseRecord) => ({name: e.type, value: e.tonnage} ))
    }else if (filiere == 'vhu'){
        const data2 = data.map((e) => ({...e,
            'Compagnies_et_mutuelles_d_assurances':e["Compagnies_et_mutuelles_d'assurances"],
            'Garages_indépendants_et_autres_professionnels_de_l_entretien':e["Garages_indépendants_et_autres_professionnels_de_l'entretien"],
        })) // Fix name with quote...
        data_pie = alasql(`
        SELECT d.[Code_Région], "Particuliers" AS type, sum(d.[Particuliers]::NUMBER) AS tonnage
        FROM ? d
        GROUP BY d.[Code_Région]
        UNION ALL CORRESPONDING
        SELECT d2.[Code_Région], "Compagnies_et_mutuelles_d'assurances" AS type, sum(d2.[Compagnies_et_mutuelles_d_assurances]::NUMBER) AS tonnage
        FROM ? d2
        GROUP BY d2.[Code_Région]
        UNION ALL CORRESPONDING
        SELECT d3.[Code_Région], 'Autres' AS type, sum(d3.[Autres]::NUMBER) AS tonnage
        FROM ? d3
        GROUP BY d3.[Code_Région]
        UNION ALL CORRESPONDING
        SELECT d4.[Code_Région], 'Concessionnaires_et_professionnels_des_réseaux_des_constructeurs' AS type, sum(d4.[Concessionnaires_et_professionnels_des_réseaux_des_constructeurs]::NUMBER) AS tonnage
        FROM ? d4
        GROUP BY d4.[Code_Région]
        UNION ALL CORRESPONDING
        SELECT d5.[Code_Région], 'Fourrières' AS type, sum(d5.[Fourrières]::NUMBER) AS tonnage
        FROM ? d5
        GROUP BY d5.[Code_Région]
        UNION ALL CORRESPONDING
        SELECT d6.[Code_Région], "Garages_indépendants_et_autres_professionnels_de_l'entretien" AS type, sum(d6.[Garages_indépendants_et_autres_professionnels_de_l_entretien]::NUMBER) AS tonnage
        FROM ? d6
        GROUP BY d6.[Code_Région]
        `, [data2,data2,data2,data2,data2,data2]).map((e:BaseRecord) => ({name: e.type, value: e.tonnage} ))
    }

    const total = data_pie.reduce(
        (accum:number, current:BaseRecord) => accum + current.value,
        0
      );

    const myserie:PieSeriesOption = {
        type : 'pie',
        data : data_pie.map((e:BaseRecord) => ({...e, name:RepDefinition(e.name).label})),
        radius: ['40%', '70%'],
        avoidLabelOverlap: false,
        itemStyle: {
          borderRadius: 10,
          borderColor: '#fff',
          borderWidth: 2
        },
        label: {
            show: true,
            formatter: (params) => (`${Math.round(Number(params.percent))} %`)        
        },
        tooltip:{
            show:true,
            valueFormatter: (value) => (`${Math.round(Number(value))} t` )
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
                text: `${total.toLocaleString(undefined, {maximumFractionDigits: 1})} t`,
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
