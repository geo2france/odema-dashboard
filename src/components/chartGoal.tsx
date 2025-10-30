import { useBlockConfig, useDataset } from "@geo2france/api-dashboard/dsl"
import { Progress } from "antd"


interface ChartGoalProps {
    /** Identifiant du jeu de données */
    dataset:string

    title?:string

    /** Nom de la colonne qui contient les valeurs */
    dataKey:string 

    /** Colonne contenanant la valeur de l'objectif */
    target:number | string

    /** Unité */
    unit?:string
    
}

export const ChartGoal:React.FC<ChartGoalProps> = ({dataset: dataset_id, dataKey, title, target, unit }) =>{

    const dataset = useDataset(dataset_id)

    useBlockConfig({title: title, dataExport:dataset?.data})

    const row = dataset?.data?.slice(-1)[0]
    const value = row?.[dataKey] ; // Dernière valeur du dataset. Caster en Number ?
 
    const percent = ( value / Number(target) ) 

    return <>
        <Progress type="circle" percent={ 100*percent } 
            format={(percent) => `${percent?.toLocaleString(undefined, {maximumFractionDigits:0})} ${unit}`  } />
        <div>Objectif : <b>{target.toLocaleString()}</b> {unit}</div>
    </>

}