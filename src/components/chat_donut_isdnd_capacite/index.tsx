import React, { CSSProperties, useRef } from 'react';
import ReactECharts from 'echarts-for-react';
import { EChartsOption, TreemapSeriesOption } from 'echarts';
import alasql from 'alasql';
import { ChartTerritoriesProps } from '../../utils/nomenclature';
import { useChartData, useDashboardElement, useChartEvents, SimpleRecord } from 'api-dashboard';

export interface IChartDonutIsdndCapacitePros {
    data: SimpleRecord[];
    year: Number;
    onClick?: Function;
    aiot? : string;
    style? : CSSProperties
}

export const ChartDonutIsdndCapacite: React.FC<IChartDonutIsdndCapacitePros> = ( {data, year, onClick = () => {}, aiot, style} ) => {  
    const chartRef = useRef<any>();

    useChartEvents({chartRef:chartRef, onClick:onClick})
    useDashboardElement({chartRef})


    const dataPie = alasql(`
    SELECT [departement] as name, ARRAY(@{name:d.name, aiot: d.aiot, [value]:d.capacite}) as [children]
    FROM ? d
    WHERE [annee] = ${year}
    GROUP BY [departement]
    `, [data])

    useChartData({data:data.filter((e) => e.annee == year) , dependencies:[year]})

    const serie:TreemapSeriesOption = {
        type:'treemap',
        data:dataPie.map((e:any) => ({
            ...e, 
            children:e.children.map((c:any) => ({...c, label:{fontWeight:c.aiot == aiot ? 'bold' : 'normal'}})),
            itemStyle:{color:ChartTerritoriesProps(e.name)?.color}
        })),
        width:'100%', height:'100%',
        roam:false, nodeClick:false, breadcrumb:{show:false}
    }
    const option:EChartsOption = {
        series:[serie],
    };

    return (
        <ReactECharts  ref={chartRef} option={option} style={style} />
    );
}