import { ChartEcharts } from "@geo2france/api-dashboard/dsl"
import chroma from "chroma-js"
import { EChartsOption } from "echarts"

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
         aheadColor='#48b133',
         behindColor='#fd6b6b',
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
            formatter: () => `${currentValue.toLocaleString(undefined, {maximumFractionDigits:1})} ${unit ?? ''}`,
          },
          label: {
            show: true,
            formatter: () => `${currentValue.toLocaleString(undefined, {maximumFractionDigits:1})} ${unit ?? ''}`,
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

export default GoalBulletChart