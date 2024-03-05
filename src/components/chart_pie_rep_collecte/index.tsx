import { BaseRecord } from "@refinedev/core";
import { EChartsOption, PieSeriesOption } from "echarts";
import ReactECharts from 'echarts-for-react'; 
import { RepDataCollecteProcess, RepDefinition } from "../../utils";

export interface ChartPieRepCollecteProps {
    data: any[] | BaseRecord[];
    filiere: 'd3e' | 'pa' | 'pchim' | 'tlc' | 'mnu' | 'disp_med' | 'pu' | 'vhu';
    c_region?: string;
    year?: number
}


export const ChartPieRepCollecte: React.FC<ChartPieRepCollecteProps> = ({data, filiere, year, c_region='32'} )  => {
    const data_pie = RepDataCollecteProcess(filiere, data).filter((e) => e.annee == year).map((e) => ({name:e.categorie, value:e.tonnage}));

    const total = data_pie.reduce(
        (accum:number, current:BaseRecord) => accum + current.value,
        0
      );

    const myserie:PieSeriesOption = {
        type : 'pie',
        data : data_pie.map((e:BaseRecord) => ({...e, name:RepDefinition(e.name).label})),
        radius: ['40%', '70%'],
        avoidLabelOverlap: false,
        itemStyle: {
          borderRadius: 10,
          borderColor: '#fff',
          borderWidth: 2
        },
        label: {
            show: true,
            formatter: (params) => (`${Math.round(Number(params.percent))} %`)        
        },
        tooltip:{
            show:true,
            valueFormatter: (value) => (`${Math.round(Number(value))} t` )
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
                text: `${total.toLocaleString(undefined, {maximumFractionDigits: 1})} t`,
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
