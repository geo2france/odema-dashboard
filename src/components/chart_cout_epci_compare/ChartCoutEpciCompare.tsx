/*
TODO : label avec le prix
higlight current year
*/

import alasql from 'alasql';
//import { Radio } from 'antd';
import { EChartsOption, ScatterSeriesOption, BoxplotSeriesOption} from 'echarts';
import ReactECharts from 'echarts-for-react';
import { SimpleRecord, useSearchParamsState } from 'g2f-dashboard';
import { useMemo, useRef, useState } from 'react';
//import { PiIntersectFill, PiUniteFill } from "react-icons/pi";

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
    annee:number
    data:CoutEpciRecord[]
    siren:string
}

export const ChartCoutEpciCompare: React.FC<ChartCoutEpciCompareProps> = ({data, siren,annee} )  => {
    const chartRef = useRef<any>();
    const [unit, _setUnit] = useSearchParamsState('cout_epci_unit','hab')
    const [compare, _setCompare] = useState<string>('all')
    console.log(data)
    const { epci_nom_court:epci_nom, typologie:epci_typo, cout_aide_hab:current_value} = data.find((e) => e.epci_siren === siren ) || {}
    const data_avg = useMemo(() => alasql(`SELECT 
            [annee],
            MIN([cout_aide_hab]) as min, 
            QUART([cout_aide_hab]) as q1,
            QUART2([cout_aide_hab]) as q2,
            QUART3([cout_aide_hab]) as q3,
            MAX([cout_aide_hab]) as [max],
            COUNT([cout_aide_hab]) as nb
        FROM ?
        ${compare === 'typo' ? `WHERE [typologie] = '${epci_typo}'`:''}
        GROUP BY [annee]`, [data])
        , [data, siren, compare])

    const current_epci_serie:ScatterSeriesOption = {
        type:'scatter',
        color:'#DE8F92',
        symbol:'diamond',
        name: epci_nom,
        data: data.filter((e:CoutEpciRecord) => e.epci_siren === siren).map((e:CoutEpciRecord) => [String(e.annee), e.cout_aide_hab]),
        label: {
            show:true,
            position:[12,5],
            formatter: (params:any) => `${(params.value[1]).toLocaleString()} €`,
            fontWeight:'bold',
        },
    }

    const tooltipFormater = (params:any) => {
        const x = params.reverse().map((s:any) => 
        {
            let str = s.marker + s.seriesName
            if (s.componentSubType === 'boxplot') {
                const content = `<ul style='list-style-type: none;'>
                <li>Mini : <b>${s.data[1]} €</b> </li>
                <li>Q1 : <b>${s.data[2]} €</b> </li>
                <li>Médiane : <b>${s.data[3]} €</b> </li>
                <li>Q3 : <b>${s.data[4]} €</b> </li>
                <li>Maxi : <b>${s.data[5]} €</b> </li>
                </ul>
                `
                return str + '<br/>' + content
            }else {
                return `${str} : <b>${s.data[1]} €</b>`
            }
        })
        return x.join('<br/>')
    }

    const others_serie:BoxplotSeriesOption = {
        type:'boxplot',
        color:'#9FDE8F',
        name: compare === 'typo' ? `Autres EPCI (${epci_typo})` : `Autres EPCI`,
        itemStyle: {borderWidth:2},
        data: data_avg.map((e:SimpleRecord) =>  [String(e.annee), e.min, e.q1, e.q2, e.q3, e.max])
    }

    const option:EChartsOption = {
        legend:{show:true, bottom:0},
        tooltip:{trigger:"axis", formatter:tooltipFormater},
        series : [others_serie, current_epci_serie],
        xAxis: [{
            type: 'time',
            minInterval:365 * 24 * 60 * 60 * 1000,
            boundaryGap: ['10%', '10%'],
        }],
        yAxis: [{
            type:'value',
            name: `€ / ${unit === 'hab' ? 'habitant' : 'tonne'}`,
            min:(value) => Math.round(value.min - 5)
        }]
    }

    const getTips = (current_value?:number, ref_values?:any) => {
        if (current_value===undefined || ref_values===undefined){
            return undefined
        }
        return (current_value >= ref_values.q3 ? '25% les plus chers ' :
        current_value >= ref_values.q2 ? '50% les plus chers' :
        current_value >= ref_values.q1 ? '50% les moins chers' :
        '25% les moins chers' ) + ` de la Région (sur ${ref_values.nb} territoires) avec un coût de ${current_value} €/habitant.`
    }
    const tips = getTips(current_value,data_avg.find((e:SimpleRecord) => e.annee == annee) )


    return (
        <>
            {// Désactivé car la typologie Ademe est trop fine, est restreint donc trop le nombre de territoire
            /*<Radio.Group block
                onChange={(e) => setCompare(e.target.value)}
                defaultValue="all"
                value={compare}
                optionType="button"
                buttonStyle="solid"
                style={{marginTop:16, position:'absolute', right:16, top:32, zIndex: 1}}>

                <Radio.Button value="all" style={{ display: "flex", justifyContent: "center" }}>
                    <span aria-label="all" title="Ensembles des EPCI">
                        <PiUniteFill/>
                    </span>
                </Radio.Button>
                <Radio.Button value="typo" style={{ display: "flex", justifyContent: "center" }}>
                    <span aria-label="typo" title="EPCI de même typologie">
                        <PiIntersectFill/>
                    </span>
                </Radio.Button>
            </Radio.Group> */}
            <ReactECharts option={option} ref={chartRef} />
           { tips && <span>💡 En <b>{annee}</b>, <i>{epci_nom}</i> fait partie des territoires les {tips} .</span> }
            
        </>
    )
}