import React, { useContext } from "react";
import ReactECharts from 'echarts-for-react';  // or var ReactECharts = require('echarts-for-react');
import { BaseRecord } from "@refinedev/core";
import type {EChartsOption, BarSeriesOption, PieSeriesOption} from "echarts"
import alasql from "alasql";
import { DMAmapCategorieProps } from "../../utils";

interface ChartCollectePerformanceProps {
    data: any[] | BaseRecord[]; // Spécifier les champs au niveau de la ressource
    data_territoire: any[] | BaseRecord[]; // Le endpoint précédent ne fournie pas la POPANNEE
    c_region?:string
  }

export const ChartCollectePerformance: React.FC<ChartCollectePerformanceProps> = ( {data, data_territoire, c_region='32'} ) => {

    const data_pie = alasql(`SELECT TYP_COLLECTE, (sum(TONNAGE_T_HG) / sum(data_territoire.VA_POPANNEE))*1000 AS RATIO_KG_HAB 
                        FROM ? data 
                        JOIN ? as data_territoire ON data_territoire.N_DEPT = data.N_DEPT AND data_territoire.Annee = data.ANNEE
                        WHERE C_REGION='${c_region}'
                        GROUP BY TYP_COLLECTE`, [data, data_territoire])



    const myserie:PieSeriesOption = {
        type : 'pie',
        data : data_pie.map((e:BaseRecord) => ({name: e.TYP_COLLECTE, value: e.RATIO_KG_HAB, itemStyle:{color:DMAmapCategorieProps(e.TYP_COLLECTE).color}})),
        radius: ['40%', '70%'],
        avoidLabelOverlap: false,
        itemStyle: {
          borderRadius: 10,
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
                text: `${Math.round(data_pie.reduce((acc:number, obj:BaseRecord) => acc + obj.RATIO_KG_HAB, 0))} kg/hab`,
                fill: '#666',
                fontSize: 16,
                fontWeight: 'bold'
            }
        }]
    }

    return(
        <ReactECharts
        option={option} style={{ height: "450px"}}/>
    )
}