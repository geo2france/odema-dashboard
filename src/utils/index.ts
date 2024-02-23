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