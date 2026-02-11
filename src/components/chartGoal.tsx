import { ChartEcharts, useBlockConfig, useDataset } from "@geo2france/api-dashboard/dsl"
import { Icon } from "@iconify/react"
import { Flex, Tag, Typography } from "antd"
import { EChartsOption } from "echarts"

const { Text } = Typography;

interface ChartGoalProps {
    /** Identifiant du jeu de données */
    dataset:string

    title?:string

    /** Nom de la colonne qui contient les valeurs */
    dataKey:string 

    /** Nom de la colonne qui contient l'année */
    yearKey:string

    /** Valeur de l'objectif */
    target:number

    /** Date d'échéance de l'objectif*/
    dueDate?:number

    /**  Date de départ de l'objectif*/
    startDate?:number

    /** Unité */
    unit?:string
    
}


/*const TargetDetails:React.FC = ({value, target, unit}) => {

  return (
    <>
    
    </>
  )
}*/

export const ChartGoal:React.FC<ChartGoalProps> = ({dataset: dataset_id, dataKey, yearKey, title, dueDate, startDate, target, unit }) =>{

    const dataset = useDataset(dataset_id)

    useBlockConfig({title: title, dataExport:dataset?.data})

    const row = dataset?.data?.slice(-1)[0]
    const value = row?.[dataKey] ; // Dernière valeur du dataset. Caster en Number ?
    const annee = row?.[yearKey] ; // Dernière valeur du dataset. Caster en Number ?

    const ref_row = startDate ? dataset?.data?.find( e => e[yearKey] == startDate) : dataset?.data?.[0] // Année indiqué ou premiere ligne du dataset
    const [refValue, refYear] = [ ref_row?.[dataKey], ref_row?.[yearKey] ]

    //const percent = ( value / Number(target) ) 

    const enable_trajectoiry = !!(startDate && dueDate && target)
    const dueValue =  enable_trajectoiry ? (refValue + (target - refValue)) * (annee - refYear) / (dueDate - refYear) : undefined;

  const detailsFormatter = ({value, unit, target }: {
    value: number;
    unit?: string;
    target?: number;
  }) => {

    if ( target && (value > target) ){ //Gérer aussi les cas ou on doit être inférieur
      return (<div>
      <p> <Tag style={{ fontSize: "large" }} bordered={false} icon={<Icon icon='el:ok-sign' />} color="success"> Atteint</Tag>  </p>
      <p><Text type="secondary">{value.toLocaleString(undefined, { maximumFractionDigits: 2 })} {unit} / { target } { unit }</Text></p>
      </div>)
    }
    return `${value.toLocaleString(undefined, { maximumFractionDigits: 2 })} ${unit ?? ""}`;
  };

    /** Parmètre communes aux séries (en général pour masquer les éléments) */
    const commonGaugeOptions = {
      startAngle: 180,
      endAngle: 0,
      axisTick: { show: false },
      splitLine: { show: false },
      axisLabel: { show: false },
      pointer: { show: false },
      center:['50%','75%'],
      radius:"100px"
    };

    const option: EChartsOption = {
      xAxis: { show: false },
      yAxis: { show: false },
      series: [
        {
          type: "gauge",
          ...commonGaugeOptions,
          progress: {
            show: true,
            width: enable_trajectoiry ? 30 : 35,
          },
          max: target,
          min: 0,
          data: [{ value: value }],
          itemStyle: {
            color: value >= target ? "#52c41a" : "orange",
          },
          axisLine: { lineStyle: { width: 35 } },
          detail:{
            show:false,
          }
        },

        {
          type: "gauge",
          name: "Trajectoire",
          silent: !enable_trajectoiry,
          ...commonGaugeOptions,
          itemStyle: {
            color: dueValue && (dueValue > value) ? "#f5222d" : "#52c41a"
          },
          progress: {
            show: true,
            width: 5,
          },
          data: [{ value: dueValue }], // Nécessite de calculer les trajectoires (avec target et due_date/start_date)
          axisLine: { show: false },
          radius: "62%",
          detail: { show: false },
        },
      ],
    };


    return <>
        <p><blockquote> Objectif : <b>65&nbsp;%</b> en 2025 de valorisation matière des déchets non dangereux non inertes.</blockquote></p>
    <Flex align="center" justify="space-evenly">
        <div>
          <Text style={{ fontSize: '1.8rem', fontWeight: 600 }}>{ `${value.toLocaleString(undefined, { maximumFractionDigits: 2 })}\u00A0${unit ?? ""}` }</Text>
          <Text style={{ display: "block" }} type="secondary">de valorisation matière en 2022</Text>
        </div>
        <ChartEcharts option={option} style={{width: '50%', maxHeight:'200px'}}/>
        <div>  { detailsFormatter({value:value, unit, target}) } </div>
    </Flex>
     {/*   <Progress 
            type="circle" percent={ 100*percent } 
            format={(percent) => `${percent?.toLocaleString(undefined, {maximumFractionDigits:0})} ${unit}`  } />
        <div>Objectif : <b>{target?.toLocaleString()}</b> {unit}</div> */}
    </> 

}