import alasql from "alasql";
import { BarSeriesOption, EChartsOption, LineSeriesOption } from "echarts";
import ReactECharts from 'echarts-for-react'; 
import { CSSProperties, useMemo, useRef } from "react";
import { useChartData, useDashboardElement, useChartEvents, SimpleRecord } from "api-dashboard";
import { ChartTerritoriesProps } from "../../utils/nomenclature";

export interface IChartRaceBarISDND {
    data : SimpleRecord[],
    year : number,
    aiot? : string,
    onClick : any,
    style? : CSSProperties
}

export const ChartRaceBarISDND: React.FC<IChartRaceBarISDND> = ({ data, onClick, aiot, year=2021, style }) => {
    const chartRef = useRef<any>();

    useChartEvents({chartRef:chartRef, onClick:onClick})
    useDashboardElement({chartRef})

    const DEPARTEMENTS = ['59','62','80','60','02']

    const prettyInstalName = (name:string) => name.replace('ISDND','').trim()


    const data_chart = useMemo( () => alasql(`
        SELECT [departement], [name] as nom, [aiot] , tonnage, [capacite]
        FROM ?
        WHERE annee=${year} AND tonnage > 0
        ORDER BY tonnage ASC
    `,[data]) as SimpleRecord[], [data,year]
    )

    useChartData({data:data_chart, dependencies:[data_chart]})

    const myserie:BarSeriesOption={
        type:'bar',
        name:'ISDND',
        animation:false,
        tooltip:{
            valueFormatter: (value) => (`${Math.round(Number(value)).toLocaleString()} t` )
        },
        encode:{
            x:1,
            y:0
        },
        data:data_chart.map((e:SimpleRecord) => 
           [prettyInstalName(e.nom), e.tonnage , e.aiot, '\u200B' +e.departement ] // '\u200B'  => avoid echarts parse DEP as int
)

    }

    const serieCapacite:LineSeriesOption={
        type:'line',
        name:'Capacite',symbol:'roundRect', symbolSize:5,
        tooltip:{
            valueFormatter: (value) => (`${Math.round(Number(value)).toLocaleString()} t` )
        },
        lineStyle:{opacity:0},
        itemStyle:{color:'#D44F4A'},
        data:data_chart.map((e:SimpleRecord) => 
            [prettyInstalName(e.nom), e.capacite ]
        ),
        encode:{
            x:1,
            y:0
        },
    }


    const option: EChartsOption ={
        series:[myserie, serieCapacite],
        legend: {
            show:false
        },
        tooltip: {
            trigger: 'item'
        },
        yAxis: [{
            type: 'category',
            axisLabel: {
                interval: 0,
                fontSize: 10,
                formatter : (v:string) => { // Mettre en gras l'AIOT de l'installation sélectionné, retrouvée via le nom
                    const current_aiot = data_chart.find((r) => prettyInstalName(r.nom) === v)?.aiot
                    return current_aiot === aiot ? '{bold|' + v + '}' : v
                },
                rich: {
                    bold: {
                        fontWeight: 'bold',
                    }
                    }
                },
            }],
        xAxis: [
            {
                type: 'value',
                axisLabel:{formatter: (value:number) => `${(value/1e3).toLocaleString()} kt`}
            }
        ],
        grid:{
            left:'150px',
            top:'20px'
        },
        visualMap:{
            seriesIndex:0,
            type:"piecewise",
            categories:DEPARTEMENTS.map((d) => '\u200B' +d), // '\u200B'  => avoid echarts parse DEP as int
            inRange: {
                color:DEPARTEMENTS.map((d) => ChartTerritoriesProps(d)?.color)
            },
            orient:'horizontal',
            right:'center',
            itemWidth: 20,
            itemHeight: 20,
            itemGap: 15,
            textGap: 8,
            text: ['', 'Département '],
            showLabel:true
        },
    }

    return (
            <ReactECharts
            option={option} ref={chartRef} style={style} />
    )
}
