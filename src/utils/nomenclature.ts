import { BaseRecord } from "@refinedev/core"
import alasql from "alasql"


export interface BaseRecordRepCollecte {
    categorie:string, 
    tonnage:any,
    annee:number
}

/**
 * Fonction permettant d'uniformiser les données REP fournis par l'Ademe, les formats de données de différentes filières étant hétérogènes.
 * @param filiere 
 * @param data 
 * @returns 
 */
export const RepDataCollecteProcess = (filiere: 'd3e' | 'pa' | 'pchim' | 'tlc' | 'mnu' | 'disp_med' | 'pu' | 'vhu', data:BaseRecord[]) => {
    //TODO : Reste a ajouter la gestion des années pour toutes les filières
    let data_pie:BaseRecordRepCollecte[] = []
    if (filiere == 'd3e'){ //Les données des différentes fillière REP ne sont pas diffusée de manière homogène
        data_pie = alasql(`SELECT [Code_région], [Année_des_données] AS annee, d.Flux, sum([Total]) AS tonnage
        FROM ? d
        GROUP BY [Code_région], [Année_des_données], d.Flux
        `, [data]).map((e:BaseRecord) => ({annee:e.annee, categorie: e.Flux, tonnage: e.tonnage} ))
    }else if (filiere == 'pa'){
        data_pie = alasql(`
        SELECT d.[Code_Région], d.[Année_des_données] AS annee, 'Collectivités' AS type, sum(d.[Collectivités]) AS tonnage
        FROM ? d
        GROUP BY d.[Code_Région], d.[Année_des_données]
        UNION ALL CORRESPONDING
        SELECT d2.[Code_Région], d2.[Année_des_données] AS annee, 'Distribution' AS type, sum(d2.[Distribution]) AS tonnage
        FROM ? d2
        GROUP BY d2.[Code_Région], d2.[Année_des_données]
        UNION ALL CORRESPONDING
        SELECT d3.[Code_Région], d3.[Année_des_données] AS annee,  'Autre' AS type, sum(d3.[Autre]) AS tonnage
        FROM ? d3
        GROUP BY d3.[Code_Région], d3.[Année_des_données]
        `, [data,data,data]).map((e:BaseRecord) => ({annee:e.annee, categorie: e.type, tonnage: e.tonnage} ))
    }else if (filiere == 'pchim'){
        data_pie = alasql(`SELECT [Année_des_données] AS annee, [equip_declare], sum([Somme_de_masse]) AS tonnage
        FROM ? d
        GROUP BY [Année_des_données], [equip_declare]
        `, [data]).map((e:BaseRecord) => ({annee:e.annee, categorie: e.equip_declare, tonnage: e.tonnage} ))
        console.log(data_pie)
    }else if (filiere == 'tlc'){
        data_pie = alasql(`SELECT [Année_des_données] AS annee, [origine], sum([tonnage]) AS tonnage
        FROM ? d
        GROUP BY [Année_des_données], [origine]
        `, [data]).map((e:BaseRecord) => ({annee: e.annee, categorie: e.origine, tonnage: e.tonnage} ))
        console.log(data_pie)
    }else if (filiere == 'mnu'){
        data_pie = alasql(`SELECT [Code_Région], [Année_des_données] AS annee, sum([tonnage]) AS tonnage
        FROM ? d
        GROUP BY [Code_Région], [Année_des_données]
        `, [data]).map((e:BaseRecord) => ({annee:e.annee, categorie: 'MNU', tonnage: e.tonnage} ))
    }else if (filiere == 'disp_med'){
        data_pie = alasql(`SELECT [Année_des_données] AS annee, [origine], sum([tonnage]) AS tonnage
        FROM ? d
        GROUP BY [origine], [Année_des_données] 
        `, [data]).map((e:BaseRecord) => ({annee:e.annee, categorie: e.origine, tonnage: e.tonnage} ))
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
        `, [data,data,data,data]).map((e:BaseRecord) => ({categorie: e.type, tonnage: e.tonnage} ))
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
        `, [data2,data2,data2,data2,data2,data2]).map((e:BaseRecord) => ({categorie: e.type, tonnage: e.tonnage} ))
    }

    return data_pie
}





/**
 * Propriétés viseuelles pour les types de déchets ou de traitement
 * @param item 
 * @returns Object with props label, color and sort
 */
export const chartBusinessProps = (item:string) : {label:string, color?:string, sort?:number} => {
    switch(item){
        case "Stockage":
        case "Stockage pour inertes":
        case "Incinération sans récupération d'énergie":
            return {color:"#ED1C24", sort:1, label:item}
        case "Incinération avec récupération d'énergie":
            return {color:'#FFB800', sort:2, label:item}
        case "Valorisation matière":
            return {color:'#ABCB54', sort:3, label:item}
        case "Valorisation organique":
            return {color:'#6C8033', sort:4, label:item}
        case "Biodéchets":
        case "Déchets verts et biodéchets":
        case "Déchets de produits alimentaires":
            return {color:'#7A4443', sort:4, label:item}
        case "Verre":
            return {color:'#008F29', sort:3, label:item}
        case "Ordures ménagères résiduelles":
        case "Collecte OMR":
            return {color:'#919191', sort:1, label:item}
        case "Emballages et papier":
        case "Emballages, journaux-magazines":
        case "Matériaux recyclables":
        case "Collecte séparées":
            return {color:'#FEFA54',sort:2, label:item}
        case "Encombrants":
        case "Déchèterie":
        case "Déchets dangereux (y.c. DEEE)":
        case "Collectes séparées hors gravats":
            return {color:'#FF8001',sort:5, label:item}
        case "Non précisé":
            return {color:'#5D5D5D', sort:5, label:item}
        case "Autres":
        case "AUTRES":
        case "AUTRE": 
            return {color:'#5D5D5D', sort:5, label:'Autres'}
        case "GEMF": //REP
            return { label: "GEM froid" }
        case "GEMHF":
            return { label: "GEM hors froid" }
        case "PAM":
            return { label: "Petits Appareils en Mélange" }
        case "ECRAN":
            return { label: "Ecrans" }
        case "LAMPE":
            return { label: "Lampes" }
        case "PV":
            return { label: "Panneaux photovoltaïques" }
        case "CAT_1":
        case "PYRO":
            return { label: "Produits pyrotechniques" }
        case "CAT_2":
        case "PAE":
            return { label: "Extincteurs et autres appareils à fonction extinctrice" }
        case "CAT3_10":
            return { label: "Produits chimiques usuels et ménagers" }
        case "BORNES_PUBLIQUES":
            return { label: "Borne située sur voie publique" }
        case "BORNES_PRIVEES":
            return { label: "Borne située sur voie privée" }
        case "ANTENNES_ASSO":
            return { label: "Antennes d'associations" }
        case "DECHETTERIES":
        case "DECHETERIE":
            return { label: "Déchetterie" }
        case "POINTS_PONCTUELS":
            return { label: "Opérations ponctuelles de collecte" }
        case "BOUTIQUES":
            return { label: "Collecte en magasin" }
        case "PHARMACIE":
            return { label: "Pharmacie" }
        case "LAB":
            return { label: "Laboratoire de biologie médicale" }
        case "PUI":
            return { label: "Pharmacie à usage intérieur" }
        default :
            return {color:'#0f0', sort:99, label:item}
    }
}

