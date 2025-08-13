import React, { CSSProperties, useRef } from "react";
import ReactECharts from 'echarts-for-react';
import { EChartsOption, LineSeriesOption } from "echarts";

import { useChartActionHightlight, useChartEvents, useChartData, useDashboardElement } from "@geo2france/api-dashboard";

/**
 * La structures des données attendues.
 */
interface DataProps { 
    annee:number
    pop_ti:number
    pop_totale:number
    [key: string]: any // Permettre les champs supplémentaires
}

export interface ChartEvolutionPopTiProps {
    data: DataProps[]
    onFocus?: (e:any) => void;
    focus_item?: string;
    style?: CSSProperties; // Style à appliquer au graphique ECharts
    year?: number
  }

/* Un formatter permettant de mettre en avant une année particulière
Ajouter une entrée rich dans axisLabel avec la clé "currentDate"
*/
const formatter_currentyear = (value:number, year?:number) => {
  const value_year:number = new Date(value).getFullYear()
  return value_year == year ? `{currentDate|${value_year} }` : value_year.toString()
}

const tooltipFormatter = (e:any) => `
${e.marker}
${e.seriesName} <br>
<b>${e.value[1].toLocaleString()} hab.</b> (${(Math.round(e.value[2]*1000)/10).toLocaleString()} %)`

export const ChartEvolutionPopTi: React.FC<ChartEvolutionPopTiProps> = ({data, onFocus, focus_item, style, year} )  => {
    const chartRef = useRef<any>()
    const threshold_proj = 2023 ; // Année après laquelle démarre la projection

    useChartEvents({chartRef:chartRef, onFocus:onFocus}) // Optionnel, récupérer des évenements (click ou focus) vers le parents
    useChartActionHightlight({chartRef:chartRef, target:{seriesName:focus_item}}) // Optionnel, pour déclencher des Hightlight sur le graphique
    useDashboardElement({chartRef})  // Nécessaire pour DashboardElement

    useChartData({
      data: data.map((e: any) => ({
        annee: e.annee,
        pop_totale: e.pop_totale,
        pop_ti: e.pop_ti,
        pop_tc: e.pop_tc,
        part_pop_ti: e.part_pop_ti,
      })),
    });

    const serie: LineSeriesOption = {
      name: "Population en TI",
      data: data.filter((e) => e.annee <= threshold_proj)
        .sort((a,b) => a.annee - b.annee)
        .map((e) => ({ 
          value:[e.annee.toString(), e.pop_ti, e.pop_ti/e.pop_totale]
              } )),
      type: "line",
      color:"#d1956a",
      emphasis: { focus: "none" },
    };

    const serie_proj: LineSeriesOption = {
        name: "Population en TI (Projection)",
        data: data.filter((e) => e.annee >= threshold_proj)
          .sort((a,b) => a.annee - b.annee)
          .map((e) => ({ 
            value:[e.annee.toString(), e.pop_ti, e.pop_ti/e.pop_totale],
            symbol: e.annee == threshold_proj ? 'none' : undefined
            } )),
        type: "line",
        color:"#d1956a",
        emphasis: { focus: "none" },
        lineStyle:{
            type:"dotted"
        }
      };


    const option:EChartsOption = {
        series:[serie, serie_proj],
        legend : {
            show:true,
            bottom:"0px"
        },
        tooltip:{
            show:true,
            formatter : tooltipFormatter
        },
        xAxis: [
            {
                type: 'time',
                axisLabel:{
                  formatter: (value:number) => formatter_currentyear(value, year),
                  rich: {
                    currentDate: {
                        fontWeight: 'bold'
                    }
                },
              }

            }],
        yAxis: [
            {
                type: 'value',
                name:'Population en TI',
                nameLocation: 'middle',
                nameGap: 50,
                axisLabel : {
                    formatter: (value:number) =>`${(value/1e6).toLocaleString()} M`
                  },
            }
        ]

    }
    return (
        <ReactECharts option={option} ref={chartRef} style={style} />
    )
}