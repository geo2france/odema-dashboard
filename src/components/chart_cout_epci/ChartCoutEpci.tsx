import { Radio } from 'antd';
import { BarSeriesOption, EChartsOption} from 'echarts';
import ReactECharts from 'echarts-for-react';
import { useChartData } from 'g2f-dashboard';
import { CSSProperties, useRef, useState } from 'react';

interface CoutEpciRecord {
    annee:number
    cout_aide_hab:number
    cout_aide_t:number
    cout_complet_hab:number
    cout_complet_t:number
    cout_technique_hab:number
    cout_technique_t:number
    cout_partage_hab:number
    cout_partage_t:number
}

interface ChartCoutEpciProps {
    data: CoutEpciRecord[]
    style?:CSSProperties
}

export const ChartCoutEpci: React.FC<ChartCoutEpciProps> = ({data, style} )  => {
    const chartRef = useRef<any>();
    const [unit, setUnit] = useState<string>('hab')
    const chartData = data.map((e:CoutEpciRecord) => [String(e.annee), e.cout_aide_hab])
    useChartData({data:chartData, dependencies:[data]})

    console.log(chartData)

    const suffix = unit === 'hab' ? '_hab' : '_t';

    const mapSeries = [
        {key: 'cout_complet', name:'Coût complet' },
        {key: 'cout_technique', name:'Coût technique' },
        {key: 'cout_partage', name:'Coût partagé' },
        {key: 'cout_aide', name:'Coût aidé' },
    ]

    type CoutEpciKeys = 
            | 'cout_aide_hab'
            | 'cout_aide_t'
            | 'cout_complet_hab'
            | 'cout_complet_t'
            | 'cout_technique_hab'
            | 'cout_technique_t'
            | 'cout_partage_hab'
            | 'cout_partage_t'; 

    type OptionDataValue = string | number | Date;

    const series:BarSeriesOption[] = mapSeries.map((s) =>
        ({
            type:'bar',
            label:{show:true, 
                formatter:(p) => {
                const data = p.data as OptionDataValue[]; 
                return data[unit === 'hab' ? 1 : 2].toLocaleString(undefined, {maximumFractionDigits:0}) + '€' }
            }, // Entier sur le label
            data:data.map((e:CoutEpciRecord) => [String(e.annee), e[s.key+'_hab' as CoutEpciKeys], e[s.key+'_t' as CoutEpciKeys]]),
            name: s.name,
            encode: { y: unit === 'hab' ? 1 : 2},
            tooltip: {
                show: true,
                valueFormatter: (v) => v?.toLocaleString()+' € / ' + unit 
            }
        })
    )


    const option:EChartsOption = {
        series:series,
        tooltip:{show:true},
        legend:{show:true, bottom:0},
        xAxis: [{
            type: 'time',
            minInterval:365 * 24 * 60 * 60 * 1000,
        }],
        yAxis: [{
            type:'value',
            name: `€ / ${unit}`
        }]
    };

    return (
        <>
            <Radio.Group block options={[{label:"€ / habitant", value:"hab"},{label:"€ / tonne", value:"t"}]} 
                    onChange={(e) => setUnit(e.target.value)}
                    defaultValue="hab" 
                    value={unit}
                    optionType="button" 
                    buttonStyle="solid"/>
        <ReactECharts option={option} ref={chartRef} style={style} />
        </>

    )

}
