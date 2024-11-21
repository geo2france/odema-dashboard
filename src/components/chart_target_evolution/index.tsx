import React from 'react';
import ReactECharts from 'echarts-for-react';
import { EChartsOption, LineSeriesOption } from 'echarts';
import { CSSProperties, useRef } from 'react';
import alasql from 'alasql';
import { SimpleRecord } from 'g2f-dashboard';


interface IChartTargetEvolutionProps {
    data: any;
    current_year?:number;
    style? : CSSProperties
}

export const ChartTargetEvolution: React.FC<IChartTargetEvolutionProps> = ( {data, style, current_year} ) => {  

    const line_data = data.map((e:SimpleRecord) => ({value:[e.date, e.value]}))

    const target_data = [ [data[0].ref_date, data[0].ref_value], [data[0].due_date, data[0].target]]

    // Calcule min et max pour définir les bornes de l'axe Y
    const offset_coef = 0.1
    const MinMax = alasql(` SELECT 
      MIN(MIN([value], [ref_value], [target])) as min,
      MAX(MAX([value], [ref_value], [target])) as max
    FROM ?
    `, [data]).map((e:any) => ({...e, offset:(e.max - e.min)*offset_coef}))[0]

    
    const chartRef = useRef<any>();

    const serie: LineSeriesOption = {
      type: "line",
      data: line_data,
      smooth: true,
      markLine: {
        symbol:'none' ,
        lineStyle:{
          color:'grey',
        },
        data: [{ 
          name: "Current year", 
          xAxis: current_year?.toString(),
        }],
      },
    };

    const serie_target: LineSeriesOption = {
        type: "line",
        data:target_data,
        smooth:true
      };

    const option: EChartsOption = {
      series:[serie, serie_target],  
      xAxis: [
        {
          type: "time",
        },
      ],
      yAxis: [
        {
          type: "value",
          min:Math.ceil(MinMax.min - MinMax.offset)
        },
      ],
    };

    return (
        <ReactECharts ref={chartRef} option={option} style={style} />
    );
}