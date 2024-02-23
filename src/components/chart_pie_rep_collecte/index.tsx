import { BaseRecord } from "@refinedev/core";
import alasql from "alasql";
import { EChartsOption, PieSeriesOption } from "echarts";
import ReactECharts from 'echarts-for-react'; 

interface ChartPieRepCollecteProps {
    data: any[] | BaseRecord[];
    filiere:string;
    c_region?:string;
    annee?:number
  }


export const ChartPieRepCollecte: React.FC<ChartPieRepCollecteProps> = ({data, filiere, annee, c_region='32'} )  => {
    let data_pie = []
    //console.log(data)
    if (filiere == 'd3e'){
        data_pie = alasql(`SELECT [Code_région], d.Flux, sum([Total]) AS tonnage
        FROM ? d
        GROUP BY [Code_région], d.Flux
        `, [data]).map((e:BaseRecord) => ({name: e.Flux, value: e.tonnage} ))
    }else if (filiere == 'pchim'){
        data_pie = alasql(`SELECT [equip_declare], sum([Somme_de_masse]) AS tonnage
        FROM ? d
        GROUP BY [equip_declare]
        `, [data]).map((e:BaseRecord) => ({name: e.equip_declare, value: e.tonnage} ))
    }else if (filiere == 'tlc'){
        data_pie = alasql(`SELECT [origine], sum([tonnage]) AS tonnage
        FROM ? d
        GROUP BY [origine]
        `, [data]).map((e:BaseRecord) => ({name: e.origine, value: e.tonnage} ))
    }

    const myserie:PieSeriesOption = {
        type : 'pie',
        data : data_pie,
        radius: ['40%', '70%'],
        avoidLabelOverlap: false,
        itemStyle: {
          borderRadius: 10,
          borderColor: '#fff',
          borderWidth: 2
        },
        label: {
            show: true,
            formatter: (params) => (`${Math.round(Number(params.value))} t`)        
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
        }
    }


    return(
        <ReactECharts
        option={option} style={{ height: "450px"}}/>
    )
}
