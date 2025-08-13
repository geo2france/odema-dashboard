import React, { CSSProperties, useMemo, useRef } from "react";
import ReactECharts from 'echarts-for-react';  // or var ReactECharts = require('echarts-for-react');
import {SimpleRecord, useChartData, useDashboardElement} from "@geo2france/api-dashboard"
import type {EChartsOption, PieSeriesOption} from "echarts"
import alasql from "alasql";
import { chartBusinessProps } from "../../utils";

export interface ChartCollectePerformanceProps {
    data: any[] | SimpleRecord[]; // Spécifier les champs au niveau de la ressource
    data_territoire: any[] | SimpleRecord[]; // Le endpoint précédent ne fournie pas la POPANNEE
    c_region?:string
    style? : CSSProperties
  }

export const ChartCollectePerformance: React.FC<ChartCollectePerformanceProps> = ( {data, data_territoire, c_region='32', style} ) => {
    const chartRef = useRef<any>()
    useDashboardElement({chartRef})

    const data_pie = useMemo(() => alasql(`SELECT TYP_COLLECTE, (sum(TONNAGE_T_HG) / sum(data_territoire.VA_POPANNEE))*1000 AS RATIO_KG_HAB 
                        FROM ? data 
                        JOIN ? as data_territoire ON data_territoire.N_DEPT = data.N_DEPT AND data_territoire.Annee = data.ANNEE
                        WHERE C_REGION='${c_region}'
                        GROUP BY TYP_COLLECTE`, [data, data_territoire]),
        [data, data_territoire, c_region]               
    ) as SimpleRecord[]

    useChartData({data:data_pie, dependencies:[data_pie]})

    const myserie:PieSeriesOption = {
        type : 'pie',
        data : data_pie.map((e:SimpleRecord) => ({name: e.TYP_COLLECTE, value: e.RATIO_KG_HAB, itemStyle:{color:chartBusinessProps(e.TYP_COLLECTE).color}})),
        radius: ['40%', '70%'],
        avoidLabelOverlap: false,
        itemStyle: {
          borderRadius: 5,
          borderColor: '#fff',
          borderWidth: 2
        },
        label: {
            show: true,
            formatter: (params) => (`${Math.round(Number(params.percent))}%`)        
        },
        tooltip:{
            show:true,
            valueFormatter: (value) => (`${Math.round(Number(value))} kg/hab` )
        }
    }


    const option:EChartsOption = {
        series:[myserie],
        grid:{
            left:'95px',
        },
        legend: {top:'top', show:true},
        tooltip: {
            trigger: 'item'
        },
        graphic: [{
            type: 'text',
            left: 'center',
            top: 'center',
            style: {
                text: `${Math.round(data_pie.reduce((acc:number, obj:SimpleRecord) => acc + obj.RATIO_KG_HAB, 0))} kg/hab`,
                fill: '#666',
                fontSize: 16,
                fontWeight: 'bold'
            }
        }]
    }

    return(
        <ReactECharts
        option={option} ref={chartRef} style={style}/>
    )
}