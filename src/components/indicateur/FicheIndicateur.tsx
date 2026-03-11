import { aggregator, SimpleRecord } from "@geo2france/api-dashboard"
import { ChartEcharts, useDataset } from "@geo2france/api-dashboard/dsl"
import { Icon } from "@iconify/react"
import { Avatar, Card, Flex, Progress, Switch, Tooltip, Typography, theme} from "antd"
import { EChartsOption } from "echarts"
import { useState } from "react"
import chroma from "chroma-js";
import { QuestionCircleOutlined } from "@ant-design/icons"

const { Text } = Typography
const { useToken } = theme

type GoalDirection = "at_least" | "at_most"

interface FicheIndicateurProps {
    nom: string 
    dataset: string | SimpleRecord[]
    year?: string | number
    unit?: string
    color? : string
    GoalDirection?: GoalDirection

       /** Texte à afficher dans le tooltip d'aide */
    help?: string
}

/** Composant permettant d'afficher de manière synthétique un indicateur et ses objectifs lié
 * Valeur de l'indicateur, année, évolution vs trajectoire, complétion de l'objectif
 */
export const FicheIndicateur:React.FC<FicheIndicateurProps> = ({nom, year, unit, color:color_input, dataset:dataset_id, help, GoalDirection="at_least"}) => {
    const { token } = useToken()
    const [showGoalChart, setShowGoalChart] = useState(false);

    const goal_direction = GoalDirection // TODO undef = détecter automatiquement à partir des données d'objectifs
    const DATE_KEY = 'date_mesure'
    const VALUE_KEY = 'valeur'
    const color = color_input ?? "#000"
    const ANNEE = year // TODO si undef, trouver la dernière année du dataset

    const tooltip =  help && <Tooltip title={help}><QuestionCircleOutlined /></Tooltip>


    const dataset = useDataset(dataset_id)

    const current_data = dataset?.data?.filter( row => new Date(row[DATE_KEY]).getFullYear() === ANNEE ) 

    const current_value = Number(aggregator({data:current_data, dataKey:VALUE_KEY, aggregate:'sum'}).value)
    const max_value = Number(aggregator({data:dataset?.data, dataKey:VALUE_KEY, aggregate:'max'}).value) // Attention, faussé si présence Axe (indicateur)
    const min_value = Number(aggregator({data:dataset?.data, dataKey:VALUE_KEY, aggregate:'min'}).value)


    const objectif_data = [
        {date_mesure: "2010-01-01T00:00:00", valeur: 600 },
        {date_mesure: "2025-01-01T00:00:00", valeur: 400 }, 
        {date_mesure: "2030-01-01T00:00:00", valeur: 300 } ]

    const last_goal = objectif_data.sort( (a,b) => new Date(a[DATE_KEY]).getTime() - new Date(b[DATE_KEY]).getTime())?.at(-1)

    const goal_value = Number(last_goal?.[VALUE_KEY])
    const goal_year = last_goal?.[DATE_KEY] ? new Date(last_goal?.[DATE_KEY]).getFullYear() : undefined // Ou NaN

    const percent = goal_direction === "at_least"
        ? current_value / goal_value
        : goal_value / current_value;

    const option:EChartsOption = { // Minigraph
        xAxis:{
            show: false,
            type:"time",
            max: showGoalChart === false ? String(ANNEE) : undefined
        },
        yAxis:{
            show: false,
            type:"value",
            min: min_value - min_value*0.1,
            max: max_value + max_value*0.1
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
                color:'grey',
                lineStyle:{type:"dashed",width:1},
                data: objectif_data?.map( row => [row[DATE_KEY], row[VALUE_KEY]]),
                symbol: 'none'
            },
            {
                name:"Indicateur",
                type: 'line',
                data: dataset?.data?.map( row => [row[DATE_KEY], row[VALUE_KEY]]),
                lineStyle:{opacity:0},
                areaStyle:{
                    color:{
                        x: 0,
                        y: 0,
                        x2: 0,
                        y2: 1,
                        type:"linear",
                        colorStops:[
                            {offset:0, color:color}, 
                            {offset:1, color:chroma(color).brighten(1).hex()}
                        ]
                    }
                },
                symbol:"none"
            },

        ]
    }
    return (
        <div>
            <Icon icon="octicon:goal-16" fontSize={20} /> Objectif <Switch defaultChecked onChange={setShowGoalChart} value={showGoalChart}/>
            <Card 
                title={nom}
                extra={tooltip}
                style={{
                    borderLeft: `4px solid ${color}`,
                    height:"100%"
                }}
                styles={{
                body: {
                    padding: 0,
                },
                header: {
                    padding: "5px",
                    paddingLeft: "15px",
                    fontSize: 14,
                    minHeight: 35,
                },
            }}
            >
                <Flex justify="space-between"  >
                        <Flex vertical align="center" justify="space-evenly" 
                              style={{width:"100%", textAlign:"center", paddingTop:4, paddingBottom:4}}>
                            <Flex align="center" gap={4}>
                                <Icon icon="mdi:calendar" color={token.colorTextSecondary} />
                                <Text >{ ANNEE }</Text>
                            </Flex>
                            <Flex align="center" justify="center" style={{width:"100%"}}>
                                <Avatar
                                    size={32}
                                    icon={<Icon icon="iconoir:test-tube-solid"/>}
                                    style={{ backgroundColor: color, verticalAlign:'middle', margin:8 }}
                                />
                                <span>
                                    <Text strong style={{fontSize:"180%", paddingRight:4}}>{ current_value.toLocaleString() }</Text> 
                                    <Text>{unit}</Text>
                                </span>
                            </Flex>
                                <span style={{width:"100%"}}><Progress 
                                    type="line" 
                                    percent={ Math.round(percent * 100) }
                                    strokeColor={ color }
                                    showInfo={ false } 
                                    style={ {width:"60%"} }/>
                                { percent >=1 && <Icon icon="lets-icons:check-fill" style={{ verticalAlign: "middle" }} /> }
                                </span>
                                <span>
                                    <Icon icon="octicon:goal-16" fontSize={16} color={token.colorTextSecondary} /> 
                                    <Text type="secondary" italic> <strong>{goal_value} {unit}</strong> en {goal_year}</Text></span>

                            </Flex>

                    <div
                        style={{
                            width:"80%", 
                            aspectRatio: "3 / 2",
                            height:undefined,
                            borderRadius: 2, 
                            overflow: 'hidden'
                            }}
                        >
                        <ChartEcharts style={{
                            width:"100%", 
                            height:"100%"
                            }} option={option} />
                    </div>
                </Flex>
            </Card>
        </div>
    )
}