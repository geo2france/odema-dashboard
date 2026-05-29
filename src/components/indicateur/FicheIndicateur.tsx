import { aggregator, SimpleRecord } from "@geo2france/api-dashboard"
import { ChartEcharts, useDataset } from "@geo2france/api-dashboard/dsl"
import { Icon } from "@iconify/react"
import { Avatar, Card, Flex, Progress, Tooltip, Typography, theme} from "antd"
import { EChartsOption } from "echarts"
import chroma from "chroma-js";
import { QuestionCircleOutlined } from "@ant-design/icons"
import { DataPoint, interpolate } from "../../utils"
import { CSSProperties } from "react"

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
GoalDirection, 
showChart=false,
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

    const goal_data_mapped = goal_data?.map( e => [e?.[DATE_KEY], e?.[VALUE_KEY]])
    const goal_data_interpolated = goal_data_mapped && interpolate(goal_data_mapped as DataPoint[])

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

    // Valeur idéal pour l'année N (trajectoire)
    const trajectory_value = goal_data_interpolated?.find(e => e[0] == ANNEE)?.[1] || NaN


    // Règle spéciale pour les indicateurs en % et sans objectif quanti (a valider en atelier)
    const [axisMin, axisMax] = 
        !goal_value && unit=='%' ? [0,100] 
        : [ Math.min(min_value , goal_value), Math.max(max_value , goal_value) ]

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
                
                <Flex vertical style={{width:showChart ? "50%":"100%", height:"100%"}} align="center" justify="space-evenly">

                    <Flex align="center" gap={4} style={{height:"100%"}}>
                        <Icon icon="octicon:goal-16" fontSize={18} color={token.colorText} /> 
                        <Text style={{fontSize:"120%"}}> Objectif : <strong>{goal_value} {unit}</strong> en {goal_year}</Text>
                    </Flex>
                    {/* DEVNOTE : pour la barre de progression, une "grosse barre" avec les valeurs a l'intérieur : 
                    https://miro.medium.com/v2/resize:fit:640/format:webp/0*WK9StP5f-JJ9nS4B. 
                    "bullet chart" */}

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
              {/*<TrajectoryDeviationCursor currentValue={current_value} balanceValue={trajectory_value}
               startValue={start_value} 
                orientation="vertical" style={{marginRight:10}} unit={unit}/> */}

               { showChart && 
                <div
                    style={{
                        width:"50%", height:"100%",
                        marginTop:-4, marginRight:-4 }}
                    >
                    <ChartEcharts style={{ width:"100%", height:"100%" }} option={option} />
                </div> }

            </Flex>
           
                <GoalBulletChart 
                    goalValue={goal_value} value={current_value} startValue={start_value} balanceValue={trajectory_value} 
                    unit={unit} goalDate={goal_year} onTrackTolerance={5}
                    />

        </Flex>
    </Card>
    )
}

interface GoalProgressBarProps {
    percent: number
    goalValue?: number
    goalYear?: number
    currentValue: number
    unit?: string
}
const GoalProgressBar:React.FC<GoalProgressBarProps> = ({percent, goalValue, goalYear, unit, currentValue}) => {
    const { token } = useToken()

    return (
      <Flex  justify="center" align="center">
        <Progress
          type="line"
          style={{width:80}}
          //steps={6}
          percent={Math.round(percent * 100)}
          /*strokeColor={[
            token.colorError,
            token.colorWarning,
            token.colorSuccess,
          ].flatMap((c) => [c, c])}*/
          showInfo={false}
          percentPosition={{ align: 'center', type: "outer" }}
          format={ _p => currentValue.toLocaleString(undefined, {maximumFractionDigits:0}) + unit }
        />
        <Text type="secondary" italic> <strong>{goalValue} {unit}</strong></Text>
        <Icon
          icon="octicon:goal-16"
          color={
            percent >= 0.96
              ? token.colorSuccess
              : token.colorBgContainerDisabled
          }
          width={28}
          style={{ verticalAlign: "middle" }}
        />
      </Flex>
    );}



interface TrajectoryDeviationCursorProps {
    /** Valeur d'équilibre (= trajectoire). Defaut = 50 */
    balanceValue?: number

    /** Valeur de l'indicateur */
    currentValue: number

    /** Valeur de référence (defaut = 0) */
    startValue?: number

    orientation?: 'vertical'|'horizontal'

    unit?:string

    style?:CSSProperties
}

/** Ce composant permet de visualiser l'écart à la TRAJECTOIRE (!= objectif).
 * C'est à dire qu'il montre le retard (ou avance) de l'EPCI par rapport à la trajectoire linéaire permettant d'atteindre l'objectif
 */
const TrajectoryDeviationCursor:React.FC<TrajectoryDeviationCursorProps> = ({currentValue, balanceValue=50, startValue=0, 
    orientation='horizontal', unit, style}:TrajectoryDeviationCursorProps) => {
    const cursorColor = "#1f1f1f"
    const width = 12
    const height = 100
    const vertical = orientation == 'vertical'

    const progression_reelle = (currentValue - startValue) 
    const progression_theorique = (balanceValue - startValue) 

    const percent = ((progression_reelle - progression_theorique ) / progression_theorique   )*100 // Ecart 

     return (
    <Flex vertical={orientation == 'vertical'} justify="center" align="center" style={style} >
        <Icon icon="mdi:rabbit" color="grey" />

        <div
        style={{
            width: vertical ? width : height,
            height : vertical ? height : width,
            display: "flex",
            justifyContent: "center",
        }}
        >
            <div
                style={{
                position: "relative",
                width: vertical ? width : '100%',
                height: vertical ? '100%' : width,
                borderRadius: 2,
                background: `linear-gradient(
                    ${vertical ? 'to top' : 'to right'},
                #d87b76 0%,
                #fdecbe 45%,
                #68967c 50%,
                #68967c 100%
                        )`
                }}
            >
                {/* Ligne centrale (trajectoire) */}
                <Tooltip title={`Trajectoire : ${balanceValue.toLocaleString(undefined,{maximumFractionDigits:1})}`}>
                    <div
                    style={{
                        position: "absolute",
                        bottom: "50%" ,
                        right: vertical ? 0 : "50%",
                        width: width,
                        height: 2  ,
                        background: "#27ff27",
                        transform: `translateY(50%) ${vertical ? '' : 'translateX(50%) rotate(90deg)'}`
                    }}
                    />
                </Tooltip>
               
                <Tooltip title={`${(currentValue - balanceValue).toLocaleString(undefined, {maximumFractionDigits:1, signDisplay:"always"} )} ${unit}`}>
                {/* Curseur */}
                    <div
                    style={{
                        position: "absolute",
                        right: vertical ? "-50%" : `${ Math.max(Math.min(50 + percent, 100),0) }%` ,
                        bottom: vertical ? `${ Math.max(Math.min(50 + percent, 100),0) }%` : '50%', // Clamp value 0-100
                        transform: `translateY(50%)${vertical ? '' : 'translateX(50%) rotate(90deg)'}`,
                        display: "flex",
                        alignItems: "center",
                        transition: "bottom 0.3s ease"
                    }}
                    >
                        {/* flèche gauche */}
                        <div
                            style={{
                            width: 0,
                            height: 0,
                            borderTop: "4px solid transparent",
                            borderBottom: "4px solid transparent",
                            borderLeft: `6px solid ${cursorColor}`,
                            }}
                        />
                        {/* barre centrale */}
                        <div
                            style={{
                            width: width,
                            height: 2 ,
                            background: cursorColor,
                            }}
                        />
                        {/* flèche droite */}
                        <div
                            style={{
                            width: 0,
                            height: 0,
                            borderTop: "4px solid transparent",
                            borderBottom: "4px solid transparent",
                            borderRight: `6px solid ${cursorColor}`
                            }}
                        />
                    </div>
                </Tooltip>

            </div>


        </div>

    <Icon icon="mdi:turtle" color="grey" />
  </Flex>
  );
}



interface GoalBulletChartProps {
    startValue:number

    goalValue:number

    goalDate?: number | string

    value: number

    balanceValue: number //TODO a calculer automatiquement ?

    unit?: string

    behindColor?: string

    aheadColor?: string

    onTrackColor?: string

    /** Plage de la zone onTrack (par défaut : ± 5%) */
    onTrackTolerance?: number
}

/** Bullet chart pour montrer la valeur actuelle de l'indicateur par rapport à l'objecitf.
 * A l'avenir, pourra supporter plusieurs échéances.
 * TODO : marquer la valeur avec label, afficher année + valeur target
 * Attention : traier les indicateurs "à l'envers" (DMA 620 -> 550 kg/hab) : l'origine doit être la valeur de 2011
 * voir aussi : https://www.patternfly.org/charts/bullet-chart/
 */
const GoalBulletChart: React.FC<GoalBulletChartProps> = (
    {startValue,
         goalValue, 
         value:currentValue,
         balanceValue, 
         unit,
         aheadColor='#a7c957',
         behindColor='#bc4749',
         onTrackColor='#e9c772',
         onTrackTolerance=5,
         goalDate,
    }:GoalBulletChartProps) => {

    if ([goalValue, currentValue, balanceValue, startValue].includes(NaN)) {
        return null
    }

    const currentPct = 100* (startValue - currentValue) / (startValue - goalValue) 
    const balancePct = 100* (startValue - balanceValue) / (startValue - goalValue) 

    const progressState = currentPct < balancePct - onTrackTolerance ? 'behind' :
                           currentPct > (balancePct + onTrackTolerance) ? 'ahead' :
                           'onTrack'

    const coef = (goalValue - startValue) / 100

    const options: EChartsOption = {
      grid: {
        height:60,
        bottom:70,
        backgroundColor: '#564'
      },
      xAxis: {
        type: "value",
        name: unit,
        nameLocation: "center",
        min: 0, // à dynamiser
        max: 110,
        splitNumber: 3,
        splitLine: { show: false },
        axisTick: { show: true },
        axisLine: { show: true },
        axisLabel: { show: true, 
            formatter : p => `${(startValue + coef*p).toLocaleString(undefined, {maximumFractionDigits:0})}` }, // Ajuster ici pour afficher les valeurs métier
      },
      yAxis: {
        type: "category",
        data: ["Indicateur"],
        axisTick: { show: false },
        axisLine: { show: true },
        axisLabel: { show: false },
      },
      tooltip: {
        show: true,
      },
      legend: {
        show: false
      },
      series: [
        {
          type: "bar",
          name: "retard",
          stack: "balance",
          data: [balancePct - onTrackTolerance ],
          barWidth: 40,
          itemStyle: { color:  progressState == 'behind' ?  behindColor : chroma(behindColor).alpha(0.7).hex() }, //TODO : couleur plus bright si elle contient la valeur
          silent: true,
        },
        {
          type: "bar",
          name: "normal",
          stack: "balance",
          data: [onTrackTolerance*2],
          barWidth: 40,
          itemStyle: { color: progressState == 'onTrack' ? onTrackColor : chroma(onTrackColor).alpha(0.7).hex() },
          silent: true,
        },
        {
          type: "bar",
          name: "avance",
          stack: "balance",
          data: [120], // overflow
          barWidth: 40,
          itemStyle: { color: progressState == 'ahead' ? aheadColor : chroma(aheadColor).alpha(0.7).hex()  },
          silent: true,
        },

        {
          type: "scatter",
          symbol: "rect",
          itemStyle: {
            color: p => p.dataIndex == 0 ? '#3335b6' : '#ffffff00'
           },
          silent: true,
          symbolSize: [30, 4],
          symbolOffset: [0, 5],
          symbolRotate: 90,
          z: 20,
          data: [100],
          label: {
            show: true,
            position: "top",
            formatter: goalDate?.toString() || '',
            color: "inherit"
          },
          tooltip: {
            valueFormatter: (val) => val + "%",
          },
        },
        // 📊 Valeur réelle
        {
          type: "bar",
          stack: "value",
          data: [currentPct],
          barWidth: 20,
          tooltip: {
            formatter: (_p) => `${currentValue.toLocaleString(undefined, {maximumFractionDigits:1})} ${unit ?? ''}`,
          },
          label: {
            show: true,
            formatter: (_p) => `${currentValue.toLocaleString(undefined, {maximumFractionDigits:1})} ${unit ?? ''}`,
          },
          barGap: "-75%",
          itemStyle: {
            color: "#2b2b2b",
            shadowColor: "rgba(0,0,0,0.35)",
            shadowBlur: 6,
            shadowOffsetY: 2
            },
          z: 10, // au-dessus
        },
      ],
    };


    return (
        <ChartEcharts option={options} style={{height:150}}/>
    )
}