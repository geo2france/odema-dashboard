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
        case "Autre":
        case "AUTR":
        case "AUT":
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
        case "COL":
        case "COLL":
        case "Collectivités":
        case "Collectivité":
            return { label: "Collectivité", color:"#60c0dd" }
        case "DIS":
        case "DIST":
        case "Distribution":
        case "Distributeur":     
            return { label: "Distributeur", color:"#d7504b" }
        case "ESS":
            return { label: "Acteur de l'éco. sociale et solidaire", color:"#9bca63"}
        default :
            return {color:undefined, sort:undefined, label:item}
    }
}

export const ChartTerritoriesProps = (item:string) => {
    switch(item){
        case "02":
        case "Aine":
            return { code: '02', color: '#038B4F', libel: "Aisne" }
        case "80":
        case "Somme":
            return { code: '80', color: '#a90000', libel: "Somme" }
        case "60":
        case "Oise":
            return { code: '60', color: "#C2CB00", libel: "Oise" }
        case "Nord":
        case "59":
            return { code: '59', color: "#25409A", libel: "Nord" }
        case "Pas-de-Calais":
        case "62":
            return { code: '62', color: "#38A13F", libel: "Pas-de-Calais" }
    }
}