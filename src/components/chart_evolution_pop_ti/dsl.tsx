import React, { CSSProperties } from "react";
import ReactECharts from 'echarts-for-react';
import { EChartsOption, LineSeriesOption } from "echarts";

import { useBlockConfig, useDataset } from "@geo2france/api-dashboard/dsl";

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
    dataset: string
    title?: string;
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

export const ChartEvolutionPopTi: React.FC<ChartEvolutionPopTiProps> = ({dataset:dataset_id, title, style, year} )  => {
    const threshold_proj = 2023 ; // Année après laquelle démarre la projection

    const dataset = useDataset(dataset_id)
    const data:DataProps[] | undefined = dataset?.data as DataProps[] | undefined;

   useBlockConfig({
      dataExport: data,
      title
    });

    const serie: LineSeriesOption = {
      name: "Population en TI",
      data: data?.filter((e) => e.annee <= threshold_proj)
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
        data: data?.filter((e) => e.annee >= threshold_proj)
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
      <>
        <ReactECharts option={option} style={style} />
        <p style={{marginLeft:16}}>La région contribue à l'<b>objectif national</b> de <b>25 millions d'habitants couverts en 2025</b>.</p>
      </>
    )
}