import React from 'react';
import ReactECharts from 'echarts-for-react';
import { EChartsOption, LineSeriesOption } from 'echarts';
import { CSSProperties, useRef } from 'react';
import { BaseRecord } from '@refinedev/core';


interface IChartTargetEvolutionProps {
    data: any;
    style? : CSSProperties
}

export const ChartTargetEvolution: React.FC<IChartTargetEvolutionProps> = ( {data, style} ) => {  

    const line_data = data.map((e:BaseRecord) => ({value:[e.date, e.value]}))

    const target_data = [ [data[0].ref_date, data[0].ref_value], [data[0].due_date, data[0].target]]

    const chartRef = useRef<any>()

    const serie: LineSeriesOption = {
      type: "line",
      data:line_data,
      smooth:true
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
        },
      ],
    };

    return (
        <ReactECharts ref={chartRef} option={option} style={style} />
    );
}