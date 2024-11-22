import alasql from 'alasql';
import { registerTheme, BarSeriesOption, EChartsOption, ScatterSeriesOption, BoxplotSeriesOption} from 'echarts';
import ReactECharts from 'echarts-for-react';
import { SimpleRecord, useSearchParamsState } from 'g2f-dashboard';
import { useMemo, useRef } from 'react';


interface CoutEpciRecord {
    annee:number
    typologie:string
    epci_siren:string
    epci_nom_court?:string
    cout_aide_hab:number
    cout_aide_t:number
    cout_complet_hab:number
    cout_complet_t:number
    cout_technique_hab:number
    cout_technique_t:number
    cout_partage_hab:number
    cout_partage_t:number
}

interface ChartCoutEpciCompareProps {
    data:CoutEpciRecord[]
    siren:string
}

export const ChartCoutEpciCompare: React.FC<ChartCoutEpciCompareProps> = ({data, siren} )  => {
    const chartRef = useRef<any>();
    const [unit, _setUnit] = useSearchParamsState('cout_epci_unit','hab')
    const { epci_nom_court:epci_nom } = data.find((e) => e.epci_siren === siren ) || {}
    const data_avg = useMemo(() => alasql(`SELECT 
            [annee],
            MIN([cout_aide_hab]) as min, 
            QUART([cout_aide_hab]) as q1,
            QUART2([cout_aide_hab]) as q2,
            QUART3([cout_aide_hab]) as q3,
            MAX([cout_aide_hab]) as max
        FROM ?
        GROUP BY [annee]`, [data])
        , [data, siren])

    const current_epci_serie:ScatterSeriesOption = {
        type:'scatter',
        color:'#DE8F92',
        symbol:'diamond',
        name: epci_nom,
        data: data.filter((e:CoutEpciRecord) => e.epci_siren === siren).map((e:CoutEpciRecord) => [String(e.annee), e.cout_aide_hab])
    }

    const others_serie:BoxplotSeriesOption = {
        type:'boxplot',
        color:'#9FDE8F',
        name: "Autres EPCI",
        itemStyle: {borderWidth:2},
        data: data_avg.map((e:SimpleRecord) =>  [String(e.annee), e.min, e.q1, e.q2, e.q3, e.max])
    }
    const option:EChartsOption = {
        legend:{show:true},
        tooltip:{trigger:"axis"},
        series : [others_serie, current_epci_serie],
        xAxis: [{
            type: 'time',
            minInterval:365 * 24 * 60 * 60 * 1000,
            boundaryGap: ['10%', '10%'],
        }],
        yAxis: [{
            type:'value',
            name: `€ / ${unit === 'hab' ? 'habitant' : 'tonne'}`,
        }]
    }
    return (
        <>
            <ReactECharts option={option} ref={chartRef} />
        </>
    )
}