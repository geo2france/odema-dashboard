import { BaseRecord } from "@refinedev/core";
import alasql from "alasql";
import { useSearchParams } from "react-router-dom";


// IA Generated function
export const wrappe = (chaine: string, maxLength: number): string => {
    return chaine.split(' ').reduce((result: string[], word: string) => {
        const lastLine = result[result.length - 1];
        if (!lastLine || (lastLine.length + word.length + 1) > maxLength) {
            result.push(word);
        } else {
            result[result.length - 1] += ' ' + word;
        }
        return result;
    }, []).join('\n');
}


export const DMAmapCategorieProps = (item:string) => {
    switch(item){
        case "Stockage":
        case "Stockage pour inertes":
        case "Incinération sans récupération d'énergie":
            return {color:"#ED1C24", sort:1}
        case "Incinération avec récupération d'énergie":
            return {color:'#FFB800', sort:2}
        case "Valorisation matière":
            return {color:'#ABCB54', sort:3}
        case "Valorisation organique":
            return {color:'#6C8033', sort:4}
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


export const RepDefinition = (item: string) => {
    switch (item) {
        case "GEMF":
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
        case "AUTRES":
        case "AUTRE":
            return { label: "Autre" }
        default:
            return { label: item }
    }
}


/* From https://blog.logrocket.com/use-state-url-persist-state-usesearchparams/ */
export function useSearchParamsState(
    searchParamName: string,
    defaultValue: string
): readonly [
    searchParamsState: string,
    setSearchParamsState: (newState: string) => void
] {
    const [searchParams, setSearchParams] = useSearchParams();

    const acquiredSearchParam = searchParams.get(searchParamName);
    const searchParamsState = acquiredSearchParam ?? defaultValue;

    const setSearchParamsState = (newState: string) => {
        const next = Object.assign(
            {},
            [...searchParams.entries()].reduce(
                (o, [key, value]) => ({ ...o, [key]: value }),
                {}
            ),
            { [searchParamName]: newState }
        );
        setSearchParams(next);
    };
    return [searchParamsState, setSearchParamsState];
}

/**
 * Type destiné à être utilisé comme data dans les graphiques eCharts.
 */
export interface BaseRecordSerie {
    name:string, 
    value:any
}
/**
 * Fonction permettant d'uniformiser les données REP fournis par l'Ademe, les formats de données de différentes filières étant hétérogènes.
 * @param filiere 
 * @param data 
 * @returns 
 */
export const RepDataCollecteProcess = (filiere: 'd3e' | 'pa' | 'pchim' | 'tlc' | 'mnu' | 'disp_med' | 'pu' | 'vhu', data:BaseRecord[]) => {
    let data_pie:BaseRecordSerie[] = []
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

    return data_pie
}