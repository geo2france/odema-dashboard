import React, { CSSProperties, useRef } from "react";
import ReactECharts from 'echarts-for-react';
import { EChartsOption, LineSeriesOption } from "echarts";

import { useChartData, useDashboardElement } from "g2f-dashboard";
import { useChartActionHightlight, useChartEvents } from "g2f-dashboard";

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

export const ChartEvolutionPopTi: React.FC<ChartEvolutionPopTiProps> = ({data, onFocus, focus_item, style, year} )  => {
    const chartRef = useRef<any>()
    const threshold_proj = 2023 ; // Année après laquelle démarre la projection

    useChartEvents({chartRef:chartRef, onFocus:onFocus}) // Optionnel, récupérer des évenements (click ou focus) vers le parents
    useChartActionHightlight({chartRef:chartRef, target:{seriesName:focus_item}}) // Optionnel, pour déclencher des Hightlight sur le graphique
    useDashboardElement({chartRef})  // Nécessaire pour DashboardElement

    const data_objectif = [
        [2015, 0.041],
        [2025, 0.3],
        [2029, 0.3]
    ]

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
      name: "Part de la population en TI",
      data: data.filter((e) => e.annee <= threshold_proj).map((e) => ({ 
        value:[e.annee.toString(), Math.round( (e.pop_ti / e.pop_totale) * 100 *10)/10]
            } )),
      type: "line",
      color:"#d1956a",
      emphasis: { focus: "none" },
    };

    const serie_proj: LineSeriesOption = {
        name: "Part de la population en TI (Projection)",
        data: data.filter((e) => e.annee >= threshold_proj).map((e) => ({ 
          value:[e.annee.toString(), Math.round( (e.pop_ti / e.pop_totale) * 100 *10)/10],
          symbol: e.annee == threshold_proj ? 'none' : undefined
          } )),
        type: "line",
        color:"#d1956a",
        emphasis: { focus: "none" },
        lineStyle:{
            type:"dotted"
        }
      };

      const serie_obj: LineSeriesOption = {
        name: "Objectif régional",
        data: data_objectif.map((e) => ({ 
          value:[e[0].toString(), e[1] * 100],
          } )),
        type: "line",
        color:"#91cc75",
        emphasis: { focus: "none" },
        lineStyle:{
            type:"dashed",
        }
      };

    const option:EChartsOption = {
        series:[serie, serie_proj, serie_obj],
        legend : {
            show:true,
            bottom:"0px"
        },
        tooltip:{
            show:true,
            trigger: 'axis',
            valueFormatter: (value) => ( `${value} %` )
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
                /*data:categories.map((annee:number) => ({
                    value:annee,
                    textStyle: {
                        fontWeight: annee == year ? 700 : undefined,
                        fontSize: annee == year ? 14 : undefined
                    }
                })),*/
            }],
        yAxis: [
            {
                type: 'value',
                name:'Part de la population en TI (%)',
                nameLocation: 'middle',
                nameGap: 50,
                axisLabel : {
                    formatter: '{value} %'
                  },
            }
        ]

    }
    return (
        <ReactECharts option={option} ref={chartRef} style={style} />
    )
}