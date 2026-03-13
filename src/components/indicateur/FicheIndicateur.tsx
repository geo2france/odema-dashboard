import { aggregator, SimpleRecord } from "@geo2france/api-dashboard"
import { ChartEcharts, useDataset } from "@geo2france/api-dashboard/dsl"
import { Icon } from "@iconify/react"
import { Avatar, Card, Divider, Flex, Progress, Tooltip, Typography, theme} from "antd"
import { EChartsOption } from "echarts"
import chroma from "chroma-js";
import { QuestionCircleOutlined } from "@ant-design/icons"

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

    /** Nombre décimales affichés */
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
GoalDirection, 
showChart=true,
digits,
dateKey = 'date_mesure',
valueKey = 'valeur'
}) => {
    const { token } = useToken()

    const DATE_KEY = dateKey
    const VALUE_KEY = valueKey
    const color = color_input ?? "#000"

    const goal_dataset = useDataset(goalDataset)
    //Time sorting
    const goal_data = goal_dataset?.data?.sort( (a,b) => new Date(String(a[DATE_KEY])).getTime() - new Date(String(b[DATE_KEY])).getTime() )

    const tooltip =  help && <Tooltip title={help}><QuestionCircleOutlined /></Tooltip>

    const dataset = useDataset(dataset_id)
    const data = dataset?.data
                ?.sort((a,b) => new Date(String(a[DATE_KEY])).getTime() - new Date(String(b[DATE_KEY])).getTime() ) //Dans l'ordre chrono
                ?.filter( row => row[VALUE_KEY] != null) // Filter null et undef

    // Detect goal direction from goal dataset (first vs last)
    const goal_direction:GoalDirection = GoalDirection ?? 
                           Math.abs(Number(goal_data?.at(0)?.[VALUE_KEY])) < Math.abs(Number(goal_data?.at(-1)?.[VALUE_KEY])) ? 'at_least' : 'at_most'

    // Last date if not set
    const ANNEE = year ? Number(year) : aggregator({data:data, dataKey:DATE_KEY, aggregate:'max'}).value

    const current_data = data?.filter( row => new Date(String(row[DATE_KEY])).getFullYear() === ANNEE )

    const current_value = Number(aggregator({data:current_data, dataKey:VALUE_KEY, aggregate:'sum'}).value)
    const max_value = Number(aggregator({data:data, dataKey:VALUE_KEY, aggregate:'max'}).value) // Attention, faussé si présence Axe (indicateur)
    const min_value = Number(aggregator({data:data, dataKey:VALUE_KEY, aggregate:'min'}).value)

    const last_goal = goal_data?.at(-1)

    const start_value = Number(goal_data?.at(0)?.[VALUE_KEY])
    const goal_value = Number(last_goal?.[VALUE_KEY])
    const goal_year = last_goal?.[DATE_KEY] ? new Date(String(last_goal?.[DATE_KEY])).getFullYear() : undefined // Ou NaN ?

    // Calcule de la progression vers l'objectif
    const percent = goal_direction === "at_least" ?
        (current_value - start_value) / (goal_value - start_value)
        :(start_value - current_value) / (start_value - goal_value)

    const [axisMin, axisMax] = [ Math.min(min_value , goal_value), Math.max(max_value , goal_value) ]
    const axisOffset = (axisMax - axisMin) * 0.05;

    const option:EChartsOption = { // Minigraph
        xAxis:{
            show: false,
            type:"time",
            max: String( Math.max(ANNEE ?? -Infinity,goal_year ?? -Infinity )) 
        },
        yAxis:{
            show: false,
            type:"value",
            min: axisMin - axisOffset,
            max: axisMax + axisOffset
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
                data: goal_data?.map( row => [String(row[DATE_KEY]), row[VALUE_KEY]]),
                symbol: 'none'
            },
            {
                name:"Indicateur",
                type: 'line',
                connectNulls: true,
                data: data?.map( row => [String(row[DATE_KEY]), row[VALUE_KEY]]),
                lineStyle:{opacity:0},
                areaStyle:{
                    origin:'start',
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
    <Card 
        title={title}
        extra={tooltip}
        style={{
            borderLeft: `4px solid ${color}`,
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
        <Card.Grid style={{width:"100%", boxShadow:'none', padding:10}} hoverable={false}>
            <Flex align="center" justify="space-between" style={{width:"100%"}}>
                <Flex vertical style={{width:showChart ?"50%":"100%", height:"100%"}} align="center" justify="space-evenly">
                    <Flex justify="center" align="center" style={{width:"100%"}} gap={4}>
                        <Icon icon="mdi:calendar" color={token.colorTextSecondary} />
                        <Text >{ ANNEE }</Text>
                    </Flex>
                    <div>
                        { icon &&<Avatar
                            size={32}
                            icon={<Icon icon={icon}/>}
                            style={{ backgroundColor: color, verticalAlign:'middle', margin:'0 8px'  }}
                        /> }
                        <span>
                            <Text strong style={{fontSize:"180%", paddingRight:4}}>
                                { current_value.toLocaleString(undefined, {maximumFractionDigits:digits}) }
                            </Text> 
                            <Text>{unit}</Text>
                        </span>
                    </div>
                </Flex>
                { showChart && 
                <div
                    style={{
                        width:"50%", 
                        //aspectRatio: "3 / 2",
                        height:"100%",
                        borderRadius: 2, 
                        overflow: 'hidden',
                        margin:-10
                        }}
                    >
                    <ChartEcharts style={{
                        width:"100%", 
                        height:"100%"
                        }} option={option} />
                </div> }
            </Flex>
        </Card.Grid>
           
        {last_goal && 
        <Card.Grid style={{width:"100%", boxShadow:'none', borderTop:"var(--ant-line-width) var(--ant-line-type) var(--ant-color-border-secondary)", padding:10}} hoverable={false}>
            <Flex style={{width:"100%"}} align="center" justify="space-around">

                <span>
                    <Icon icon="octicon:goal-16" fontSize={14} color={token.colorTextSecondary} /> 
                    <Text type="secondary" italic> <strong>{goal_value} {unit}</strong> en {goal_year}</Text>
                </span>
                <GoalProgressBar percent={percent} />


            </Flex> 
        </Card.Grid> }


            
    </Card>
    )
}

interface GoalProgressBarProps {
    percent: number
}
const GoalProgressBar:React.FC<GoalProgressBarProps> = ({percent}) => {
    const { token } = useToken()

    return (
      <Flex  justify="center" align="center">
        <Progress
          type="line"
          steps={6}
          percent={Math.round(percent * 100)}
          strokeColor={[
            token.colorError,
            token.colorWarning,
            token.colorSuccess,
          ].flatMap((c) => [c, c])}
          showInfo={false}
        />
        <Icon
          icon="lets-icons:check-fill"
          color={
            percent >= 0.99
              ? token.colorSuccess
              : token.colorBgContainerDisabled
          }
          width={28}
          style={{ verticalAlign: "middle" }}
        />
      </Flex>
    );}