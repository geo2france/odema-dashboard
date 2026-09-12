import { aggregator, datasetInput, SimpleRecord } from "@geo2france/api-dashboard"
import { ChartEcharts, useDataset } from "@geo2france/api-dashboard/dsl"
import { Icon } from "@iconify/react"
import { Avatar, Card, Flex, Segmented, Tooltip, Typography, theme} from "antd"
import { EChartsOption } from "echarts"
import { QuestionCircleOutlined } from "@ant-design/icons"
import { DataPoint, interpolate } from "../../utils"
import { useState } from "react"
import GoalBulletChart from "./GoalBulletChart"

const { Text } = Typography
const { useToken } = theme

type GoalDirection = "at_least" | "at_most"

interface FicheIndicateurProps {
    /** Nom de l'indicateur */
    title: string 

    /** Valeurs de l'indicateur */
    dataset: string | SimpleRecord[]

    /** Objectifs de valeurs */
    goalDataset?: string | SimpleRecord[]

    /** Année à afficher (dernière année si null) */
    year?: string | number

    /** Unité de l'indicateur */
    unit?: string

    /** Nombre maximale de décimales à afficher 
     * Défaut = automatique, une décimale pour les valeurs < 100 */
    digits?: number

    /** Couleur de la carte */
    color? : string

    /** Icone  */
    icon?: string

    /** Direction des objectifs à atteindre (automatique si non indiqué) 
     * Indique si l'objectif est un minimum `'at_least'` ou un maxium `'at_most'`*/
    GoalDirection?: GoalDirection

    /** Texte à afficher dans la tooltip d'aide */
    help?: string

    /** Afficher le graphique (defaut : `true`) */
    showChart?: boolean

    /** Nom de la colonne contenant la date (défaut : `date_mesure`) */
    dateKey?: string

    /** Nom de la colonne contenant la valeur numérique (défaut : `valeur`) */
    valueKey?: string
}

/** Composant permettant d'afficher de manière synthétique un indicateur et son objectif (optionnel)
 * Valeur de l'indicateur, année, évolution vs trajectoire, complétion de l'objectif
 */
export const FicheIndicateur:React.FC<FicheIndicateurProps> = ({
title, 
year, 
unit, 
color:color_input, 
icon,
dataset:dataset_id,
goalDataset, 
help,  
showChart:input_showChart=false,
digits,
dateKey = 'date_mesure',
valueKey = 'valeur'
}) => {
    const { token } = useToken()
    const [showChart, setShowChart] = useState(input_showChart)

    const DATE_KEY = dateKey
    const VALUE_KEY = valueKey
    const color = color_input ?? "#000"

    const tooltip =  help && <Tooltip title={help}><QuestionCircleOutlined /></Tooltip>


    const goal_dataset = useDataset(goalDataset)

    const dataset = useDataset(dataset_id)
    const data = dataset?.data
                ?.sort((a,b) => new Date(String(a[DATE_KEY])).getTime() - new Date(String(b[DATE_KEY])).getTime() ) //Dans l'ordre chrono
                ?.filter( row => row[VALUE_KEY] != null) // Filter null et undef

   
    // Last date if not set
    const ANNEE = year ? Number(year) : aggregator({data:data, dataKey:DATE_KEY, aggregate:'max'}).value

    // Calcul de la valeur idéale (trajectoire à l'année n)
    const goal_data = goal_dataset?.data?.sort( (a,b) => new Date(String(a[DATE_KEY])).getTime() - new Date(String(b[DATE_KEY])).getTime() )
    const goal_data_mapped = goal_data?.map( e => [e?.[DATE_KEY], e?.[VALUE_KEY]])
    const goal_data_interpolated = goal_data_mapped && interpolate(goal_data_mapped as DataPoint[])
    const trajectory_value = goal_data_interpolated?.find(e => e[0] == ANNEE)?.[1] || NaN


    const current_data = data?.filter( row => new Date(String(row[DATE_KEY])).getFullYear() === ANNEE )
    const current_value = Number(aggregator({data:current_data, dataKey:VALUE_KEY, aggregate:'sum'}).value)

    const last_goal = goal_data?.at(-1)
    const start_value = Number(goal_data?.at(0)?.[VALUE_KEY])
    const goal_value = Number(last_goal?.[VALUE_KEY])
    const goal_year = last_goal?.[DATE_KEY] ? new Date(String(last_goal?.[DATE_KEY])).getFullYear() : undefined // Ou NaN ?

    // Valeur idéal pour l'année N (trajectoire)
  
    return (
    <Card 
        title={title}
        extra={tooltip}
        style={{
            borderLeft: `4px solid ${color}`,
            //height:'100%',
        }}
        styles={{
            body: {
                padding: 0,
                //height:"80%"
            },
            header: {
                padding: "5px",
                paddingLeft: "15px",
                fontSize: 14,
                minHeight: 35,
            },
        }}
    >

        <Flex vertical justify="space-between" style={{width:"100%", height:"100%", padding:4}}>
            <Flex align="center" justify="space-between" style={{width:"100%", height:"100%"}}>
                
                <Flex vertical style={{width: "100%", height:"100%"}} align="center" justify="space-evenly">

                    <Flex align="center" gap={4} style={{height:"100%"}}>
                        <Icon icon="octicon:goal-16" fontSize={18} color={token.colorText} /> 
                        <Text style={{fontSize:"120%"}}> Objectif : <strong>{goal_value} {unit}</strong> en {goal_year}</Text>
                    </Flex>


                    <Flex align="center" justify="center" style={{marginBottom:8, width:"100%"}}>
                        { icon &&<Avatar
                            size={32}
                            icon={<Icon icon={icon}/>}
                            style={{ backgroundColor: color, verticalAlign:'middle', margin:'0 8px'  }}
                        /> }
                        <span>
                            <Text strong style={{fontSize:"180%", paddingRight:4}}>
                                { current_value.toLocaleString(undefined, {maximumFractionDigits:digits ?? (Math.abs(current_value) > 99 ? 0 : 1)}) }
                            </Text> 
                            <Text>{unit}</Text>
                            <Text type="secondary" style={{fontSize:"80%"}}> ({ ANNEE }) </Text>

                        </span>
                    </Flex>
                </Flex>
            </Flex>

               { showChart ? 
                <>
                    <IndicateurChart 
                        dataset={dataset_id} 
                        goalDataset={goalDataset} 
                        valueKey={valueKey} 
                        dateKey={dateKey}
                        color={color} unit={unit}></IndicateurChart>
                </>
                :

                <GoalBulletChart 
                    value={current_value} 
                    goalValue={goal_value} goalDate={goal_year}
                    startValue={start_value} balanceValue={trajectory_value} 
                    unit={unit} onTrackTolerance={0}
                    aheadColor={token.colorPrimary} behindColor="#e4e4e4"
                    />

            }

        </Flex>
        <Segmented value={showChart} onChange={setShowChart}
            options={[
                {value: false, icon:<Icon icon="carbon:progress-bar"/>},
                {value: true, icon:<Icon icon="mdi:chart-line"/>}
            ]}
        />
    </Card>
    )
}



interface IndicateurChartProps {
  dataset: datasetInput;
  goalDataset?: datasetInput;
  dateKey?: string;
  valueKey?: string;
  color?: string;
  unit?: string;
}

const  IndicateurChart:React.FC<IndicateurChartProps> = ({
    dataset:dataset_id, 
    goalDataset, 
    dateKey = 'date_mesure',
    valueKey = 'valeur', 
    color, 
    unit}) => {

    const dataset = useDataset(dataset_id)
    const data = dataset?.data

    const goalData = useDataset(goalDataset)?.data

    const option:EChartsOption = { 
        xAxis:{
            type:"time",
            //max: String( Math.max(ANNEE ?? -Infinity,goal_year ?? -Infinity )) 
        },
        yAxis:{
            type:"value",
            //min: (value) => Math.max(Math.round(value.min - Math.abs(value.min*0.2)), value.min),
            name:`${unit}`,

        },
        tooltip:{
            show:true,
            valueFormatter: (v) => `${v?.toLocaleString(undefined, {maximumFractionDigits:1})} ${unit}`
        },
        grid: {
            left: 0,
            right: 0,
            top: 0,
            bottom: 0,
            containLabel: false,
            show:true,
            backgroundColor:'#fafafa'
            },
        series:[
            {
                name:"Objectif",
                type: 'line',
                color:'#91cc75',
                lineStyle:{type:"dashed",width:2},
                data: goalData?.map( row => [String(row[dateKey]), row[valueKey]]),
            },
            {
                name:"Indicateur",
                type: 'line',
                color: color,
                connectNulls: true,
                data: data?.map( row => [String(row[dateKey]), row[valueKey]]),
            },
        ]
    }
    return <ChartEcharts option={option} style={{height: 150}} />
}