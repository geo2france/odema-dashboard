import { ChartComparison, useDataset } from "@geo2france/api-dashboard/dsl"
import { rri_agg } from "./rri"
import { BaseChartProps, SimpleRecord } from "@geo2france/api-dashboard"
import { Typography } from "antd";
import { from, op } from "arquero";

const { Text } = Typography

function between(value: number, a: number, b: number): boolean {
  return value >= Math.min(a, b) && value <= Math.max(a, b);
}

interface TargetPieProps extends BaseChartProps{
    goalValue?: number 
    balanceValue?: number
    categoryKey?: string
    unit?:string
}
const TargetPie:React.FC<TargetPieProps> = ({dataset:dataset_in, goalValue, balanceValue, unit}) => {
    const dataset = useDataset(dataset_in)
    const decrease = goalValue && balanceValue && goalValue < balanceValue
    const agg_data = dataset?.data && rri_agg({data: dataset?.data})

    const chart_data = agg_data?.map((row) => ({
        ...row,
        objectif: decrease && row.valeur <= goalValue ? 'Atteint' :
                                    !decrease && row.valeur >= (goalValue || NaN) ? 'Atteint':
                                    between(row.valeur, goalValue || NaN, balanceValue || NaN) ? 'Dans les temps':
                                    'En retard',
        count: 1
    }))

    const summary = chart_data && from(chart_data).groupby('objectif').rollup({ct:op.count()}).objects() as SimpleRecord[]
    const n_reached = summary?.find((row) => row.objectif == 'Atteint')?.ct

    return ( <div>
            <Text style={{padding:8}}>Objectif atteint par {n_reached} territoires sur {chart_data?.length}</Text>
            <ChartComparison 
                title={`Objectif : ${goalValue} ${unit}`}
                chartType="donut"
                dataset={chart_data}
                nameKey="objectif"
                valueKey="count"
                option={{  graphic: {
                    elements: [
                    {
                        type: 'text',
                        left: 'center',
                        top: 'middle',
                        style: {
                        text: `${goalValue}`,
                        fontSize: 24,
                        fontWeight: 'bold'
                        }
                    }
                    ]
                },}}
            /></div>)
}

export default TargetPie