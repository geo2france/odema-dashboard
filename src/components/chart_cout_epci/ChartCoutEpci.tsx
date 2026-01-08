import { Radio, Typography } from 'antd';
import { registerTheme, BarSeriesOption, EChartsOption} from 'echarts';
import ReactECharts from 'echarts-for-react';
import { useSearchParamsState } from "@geo2france/api-dashboard";
import { CSSProperties, ReactElement, useRef } from 'react';
import { GiPerson, GiSwapBag } from "react-icons/gi";
import { useBlockConfig, useDataset } from '@geo2france/api-dashboard/dsl';

const { Text, Link } = Typography;

registerTheme('odema', { // A remonter au niveau global pour utilisation dans d'autres graphiques
    "color": [
        "#8FB7DE",
        "#DE8F92",
        "#9FDE8F",
        "#F0D86E",
        "#AF8FDE",
        "#DE8FC4",
        ],
 })

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
    //data: CoutEpciRecord[]
    dataset: string
    style?:CSSProperties
}

export const ChartCoutEpci: React.FC<ChartCoutEpciProps> = ({ dataset:dataset_id, style} )  => {
    const chartRef = useRef<any>();
    const [unit, setUnit] = useSearchParamsState('cout_epci_unit','hab')

    const dataset = useDataset(dataset_id)
    const data = dataset?.data as CoutEpciRecord[]

    useBlockConfig({
        title:"Coût de gestion des déchets",
        dataExport: data
    })

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
            data:data?.map((e:CoutEpciRecord) => [String(e.annee), e[s.key+'_hab' as CoutEpciKeys], e[s.key+'_t' as CoutEpciKeys]]),
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
        textStyle:{ fontFamily:'"Ubuntu", sans-serif'},
        tooltip:{show:true},
        legend:{show:true, bottom:0},
        xAxis: [{
            type: 'time',
            minInterval:365 * 24 * 60 * 60 * 1000,
        }],
        yAxis: [{
            type:'value',
            name: `€ / ${unit === 'hab' ? 'habitant' : 'tonne'}`,
        }]
    };

    return (
        <>
            <Radio.Group block
                onChange={(e) => setUnit(e.target.value)}
                defaultValue="hab"
                value={unit}
                optionType="button"
                buttonStyle="solid"
                style={{marginTop:16, position:'absolute', right:16, top:32, zIndex: 1}}>

                <Radio.Button value="hab" style={{ display: "flex", justifyContent: "center" }}>
                    <span aria-label="euro par habitant" title="€ / habitant">
                        <GiPerson />
                    </span>
                </Radio.Button>
                <Radio.Button value="t" style={{ display: "flex", justifyContent: "center" }}>
                    <span aria-label="euro par tonne" title="€ / tonne">
                        <GiSwapBag />
                    </span>
                </Radio.Button>

            </Radio.Group>
            <ReactECharts option={option} ref={chartRef} style={style} theme={"odema"}/>
        </>

    )

}

export const ChartCoutEpciDescription:ReactElement = 
    <Text>
        <p><Text strong>Coût complet</Text> : totalité des charges hors TVA. Ce coût permet de rendre compte du niveau des charges liées au service rendu par les collectivités sans tenir compte par exemple des produits industriels qui peuvent fluctuer d’une année sur l’autre.</p>
        <p><Text strong>Coût technique</Text> : coût complet moins les produits à caractère industriel (ventes de matériaux, d'énergie…).</p>
        <p><Text strong>Coût partagé</Text> : coût technique moins les soutiens apportés par les éco-organismes (filières papiers/emballages, DEEE, déchets dangereux, etc.). La comparaison des coûts technique et partagé permet de mesurer l’impact des soutiens versés par les éco-organismes sur les coûts engagés par les collectivités.</p>
        <p><Text strong>Coût aidé</Text> : coût partagé moins les aides reçues.</p>
        <p><Text type="secondary">Source : <Link href='https://www.sinoe.org/indicateur/fiche-indicateur/id/61' target="_blank">Ademe</Link></Text> </p>
    </Text>

