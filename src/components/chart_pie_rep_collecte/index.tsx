import { BaseRecord } from "@refinedev/core";
import { EChartsOption, PieSeriesOption } from "echarts";
import ReactECharts from 'echarts-for-react'; 
import { chartBusinessProps } from "../../utils";
import { useRef } from "react";
import { useChartAction, useChartEvents } from "../../utils/usecharthighlight";

export interface ChartPieRepCollecteProps {
    data: any[] | BaseRecord[];
    filiere: 'd3e' | 'pa' | 'pchim' | 'tlc' | 'mnu' | 'disp_med' | 'pu' | 'vhu';
    c_region?: string;
    year?: number;
    onFocus?:any;
    focus_item?:string;
}

//Attend data de type {annee, name, value}
export const ChartPieRepCollecte: React.FC<ChartPieRepCollecteProps> = ({data, filiere, year, onFocus=(() => (undefined)), focus_item, c_region='32'} )  => {
    const data_pie = data.filter((e) => e.annee == year).map((e) => ({name:e.name, value:e.value}));
    const chartRef = useRef<any>()

    useChartEvents({chartRef:chartRef, onFocus:onFocus})
    useChartAction({chartRef:chartRef, item:focus_item, highlight_key:'name'})

    const total = data_pie.reduce(
        (accum:number, current:BaseRecord) => accum + current.value,
        0
      );

    const myserie:PieSeriesOption = {
        type : 'pie',
        data : data_pie.map((e:BaseRecord) => (
            {...e, 
                name:chartBusinessProps(e.name).label, 
                itemStyle:{color:chartBusinessProps(e.name).color}}
        )),
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
            valueFormatter: (value) => (`${Math.round(Number(value)).toLocaleString()} t` )
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
        option={option} ref={chartRef} style={{ height: "450px"}}/>
    )
}
