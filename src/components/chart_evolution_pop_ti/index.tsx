import React, { CSSProperties, useRef } from "react";
import ReactECharts from 'echarts-for-react';
import { EChartsOption, LineSeriesOption } from "echarts";

import { useChartData, useDashboardElement } from "g2f-dashboard";
import { useChartActionHightlight, useChartEvents } from "g2f-dashboard";
import alasql from "alasql";

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

export const ChartEvolutionPopTi: React.FC<ChartEvolutionPopTiProps> = ({data, onFocus, focus_item, style, year} )  => {
    const chartRef = useRef<any>()
    const threshold_proj = 2023 ; // Année après laquelle démarre la projection

    useChartEvents({chartRef:chartRef, onFocus:onFocus}) // Optionnel, récupérer des évenements (click ou focus) vers le parents
    useChartActionHightlight({chartRef:chartRef, target:{seriesName:focus_item}}) // Optionnel, pour déclencher des Hightlight sur le graphique
    useDashboardElement({chartRef})  // Nécessaire pour DashboardElement

    const categories = alasql(`SELECT ARRAY(DISTINCT [annee]) as annees FROM ?`, [data])[0].annees.sort().map((e:number) => e.toString())

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
      emphasis: { focus: "none" },
    };

    const serie_proj: LineSeriesOption = {
        name: "Part de la population en TI (Projection)",
        data: data.filter((e) => e.annee >= threshold_proj).map((e) => ({ 
          value:[e.annee.toString(), Math.round( (e.pop_ti / e.pop_totale) * 100 *10)/10],
          symbol: e.annee == threshold_proj ? 'none' : undefined
          } )),
        type: "line",
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
        emphasis: { focus: "none" },
        lineStyle:{
            type:"dashed"
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
            valueFormatter: (value) => ( `${value} %` )
        },
        xAxis: [
            {
                type: 'category',
                data:categories.map((annee:number) => ({
                    value:annee,
                    textStyle: {
                        fontWeight: annee == year ? 700 : undefined,
                        fontSize: annee == year ? 14 : undefined
                    }
                })),
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