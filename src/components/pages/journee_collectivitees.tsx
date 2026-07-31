import { BaseChartProps, PageProps, SimpleRecord } from "@geo2france/api-dashboard"
import { ChartComparison, ChartEcharts, Control, Dashboard, Dataset, Filter, Join, Palette, Select, Transform, useControl, useDataset, usePalette } from "@geo2france/api-dashboard/dsl"
import { EChartsOption, MarkAreaComponentOption, SeriesOption } from "echarts"
import { rri_get_cols, rri_agg } from "../indicateur/rri";
import { useMemo } from "react";

function between(value: number, a: number, b: number): boolean {
  return value >= Math.min(a, b) && value <= Math.max(a, b);
}

const indicateurs = [
    {
        name:"Part de DMA orienté vers recyclage et réutilisation (L541-1 4°bis)",
        layername:"odema:rri_indic_epci_dma_recyclage_reutilisation",
        goalValue: 65,
        balanceValue:54 //2024
        },
    {
        name:"Part de déchets DNNI orienté vers valorisation matière (L541-1 4°)",
        layername:"odema:rri_indic_epci_dma_dndni_valo",
        goalValue: 65,
        balanceValue:64.999 //2024
    },
    {
        name:"Réduction de la production par habitant",
        layername:'odema:rri_indic_epci_ratiodma_pr_2017',
        goalValue: 85,
        balanceValue:90,
        decrease:true
    },
    {
        name:"Réduction de la part de DMA enfouie",
        layername:'odema:rri_indic_epci_dma_part_enfouie',
        goalValue: 10,
        balanceValue:16.6,
        decrease:true
    }

]

interface RacebarEpciProps extends BaseChartProps {
    goalValue: number 
    balanceValue: number
    categoryKey?: string
}
const RacebarEpci:React.FC<RacebarEpciProps> = ({goalValue, balanceValue, categoryKey}) => {

    const dataset = useDataset('indic')
    const data = dataset?.data

    const decrease = goalValue < balanceValue

    const categories = categoryKey ? [...new Set(data?.slice(1).map(d => d[categoryKey]))] : ['indicateur'] ;
    const colors = usePalette({nColors: categories.length})

    // Aggréation tout axe confondu : permet de classer les territoires par valeur d'indicateur
    const data_agg = useMemo(
        () => data && rri_agg({ data })?.toSorted((a,b) => (a.valeur ?? 0)- (b.valeur ?? 0))/*.slice(1)*/,
        [data]);

    // Aggrégation selon l'axe choisi
    const data_agg_axe = useMemo(
        () => data && categoryKey && rri_agg({ data:data, axis:[categoryKey] })?.toSorted((a,b) => a.valeur - b.valeur)/*.slice(1)*/,
        [data, categoryKey]) || [];
    
    console.log(data)
    // Libel des territoires par ordre de valeur agrégés tous axes (indicateurs complet)
    const lib_territories = [...new Set(data_agg?.map(d => d['libelle_epci']))]

    const series:SeriesOption[] = categories.map((category) => ( {
                type:"bar",
                name: category?.toString(),
                data: data_agg_axe?.
                    filter( r => categoryKey ? r[categoryKey] == category : true)
                    .map((row) => [row.valeur, row.libelle_epci]).sort( (a,b) => b[0] - a[0] ),
                stack: "total"
               /* markLine:{
                    symbol: "none",
                    silent: false,
                    label: {
                        formatter: balanceValue?.toString(),
                        position: "insideEndTop"
                    },
                    lineStyle: {
                        color: "#9e9e9e",
                        type: "dashed",
                        width: 1
                    },
                    data: [ { xAxis: balanceValue } ]
                },*/

            }))


    const option: EChartsOption = {
      tooltip: {show:true},
      xAxis: { type: "value",  },
      yAxis: { type: "category" , 
            data: lib_territories,
            axisLabel: { 
                fontSize: 10 ,
                height: 12,
                color: (value )=> data?.find( r => r.libelle_epci == value)?.valeur > 50 ? 'green' : 'undefined',
                interval: 0,
                formatter : (label) => label?.replace('Communauté', 'C')?.replace(' de communes','C')?.replace(" d'agglomération", 'A')
            } },
      grid:{
        top:16
      },
      legend:{show:false},
      series: series,
    };
    return <ChartEcharts option={option} style={{height: 1000}}  replaceMerge= {['xAxis', 'series']} />
}

interface SingleAxisProps extends BaseChartProps{
    goalValue: number 
    balanceValue: number
    categoryKey?: string
}
const SingleAxis:React.FC<SingleAxisProps> = ({goalValue, balanceValue, categoryKey}) => {

    const dataset = useDataset('indic')
    const data = dataset?.data
    const decrease = goalValue < balanceValue

    const categoryIsDimension = categoryKey && data && rri_get_cols(data).attributeCols.includes(categoryKey)
    //console.log('cols', data&& getColumns(data))
    const categories = 
        categoryIsDimension ? 
        [...new Set(data?.slice(1).map(d => d[categoryKey]))] : ['indicateur'] ;

    const colors = usePalette({nColors:categories.length}) 

    //Si la categoryKey retourne des valeurs différentes pour un même geocode, on ne la représente pas sur ce graphique.
    const series:SeriesOption[] = categories.map((category) => ( {
                type:"scatter",
                name: category?.toString(),
                data: data?.
                    filter( r => categoryIsDimension ? r[categoryKey] == category : true)
                    .map((row) => [row.valeur, 1,  row.population, row.libelle_epci]).sort( (a,b) => b[2] - a[2] ),
                symbolSize: (val) => Math.max(2,Math.sqrt(val[2]) / 20),
               /* markLine:{
                    symbol: "none",
                    silent: false,
                    label: {
                        formatter: balanceValue?.toString(),
                        position: "insideEndTop"
                    },
                    lineStyle: {
                        color: "#9e9e9e",
                        type: "dashed",
                        width: 1
                    },
                    data: [ { xAxis: balanceValue } ]
                },*/

            }))

    const  markArea:MarkAreaComponentOption = {
            silent: true,
            data: [
                [
                    {
                        xAxis: goalValue,
                        itemStyle: {
                            color: "rgba(145, 204, 117, 0.36)",
                        },
                    },
                    {
                        xAxis: decrease ? 0:100,
                    },
                ],
                [
                    {
                        xAxis: balanceValue,
                        itemStyle: {
                            color: "rgba(0, 132, 255, 0.15)", 
                        },
                    },
                    {
                        xAxis: goalValue,
                    },
                ],
            ],
        }

    const option:EChartsOption = {
        legend:{
            show: true,
            data: categories.map(String),
            type:'scroll',
        },
        yAxis:{
            type: "category"
        },
        color:colors,
        xAxis:{
            type: "value",
            //interval: 10
        },
        tooltip: {
            show:true,
            trigger:"item",
            //@ts-ignore
            formatter: (val) => `${val.data[3]} - ${val.data[0]} %`
        },
        series: [ 
        ...series,
        { // Fake serie with background
            name: 'background-fake-serie',
            markArea: markArea ,
            type:'scatter',
        }
            ]
    }
    return <ChartEcharts option={option}  replaceMerge= {['xAxis', 'series']} />
}






export const PageJourneeCollec:React.FC<PageProps> = () => {
    const layername = useControl("indicateur")
    const annee = useControl('annee')
    const variable =  useControl('variable')

    const current_indic = indicateurs.find( i => i.layername == layername)

    //const dataset=useDataset('indic')

    const goalValue = current_indic?.goalValue || NaN ;
    const balanceValue = current_indic?.balanceValue || NaN ;
    const decrease = goalValue < balanceValue ;

    //console.log( 'dataset', RriAgg({data:dataset?.data, axis:['type_valo_matiere']}) )

    return (
        <Dashboard columns={2} debug>
            <Palette steps={['#264653','#2a9d8f', '#e9c46a','#f4a261','#e76f51']} labels={{'Atteint':'rgb(115, 185, 144)', 'Dans les temps':'rgb(133, 171, 252)', 'En retard':'#cecece'}}/>
            <Dataset 
                id="territoires"
                resource="odema:epci_latest"
                url="https://www.geo2france.fr/geoserver/odema/ows"
                type="wfs"
            >
                <Transform>{(data:SimpleRecord[]) => data.map( row =>
                        ( {...row,   
                               competence_collecte: row.population_collecte > 0 ? 'Exercée' : 'Déléguée',
                               competence_traitement: row.population_traitement > 0 ? 'Exercée' : 'Déléguée',
                        } )
                ) }</Transform>
            </Dataset>

            <Dataset 
                type="wfs"
                id="indic"
                url="https://www.geo2france.fr/geoserver/odema/ows"
                resource={useControl('indicateur') || ''}
            >
                <Filter field="date_mesure">{`${annee}-01-01`}</Filter>
                <Transform>{(data:SimpleRecord[] )=> 
                    data.map( row =>({
                        ...row, 
                        count:1,
                        valeur: current_indic?.layername=='rri_indic_epci_ratiodma_pr_2017' ? -1*row.valeur+100 : row.valeur,
                        objectif: decrease && row.valeur <= goalValue ? 'Atteint' :
                                    !decrease && row.valeur >= goalValue ? 'Atteint':
                                    between(row.valeur, goalValue, balanceValue) ? 'Dans les temps':
                                    'En retard',
                        }) )
                    }
                </Transform>
                <Join dataset="territoires" joinKey={['geocode_epci','siren']}/>
            </Dataset>

            <Control>
                <Select name="indicateur" options={indicateurs.map( i => i.layername)}/>
                <Select name="annee" arrows options={['2023','2024']} defaultValue={'2024'}/>
                <Select name="variable" options={['competence_collecte','competence_traitement','typologie_ademe','tarification', 'type_valo_matiere']} />
            </Control>
            
          {/*  <ChartComparison 
                title={`Objectif : ${current_indic?.name}`}
                size={0.75}
                chartType="donut"
                dataset="indic"
                nameKey="objectif"
                valueKey="count"
                option={{  graphic: {
                    elements: [
                    {
                        type: 'text',
                        left: 'center',
                        top: 'middle',
                        style: {
                        text: `${current_indic?.goalValue}`,
                        fontSize: 24,
                        fontWeight: 'bold'
                        }
                    }
                    ]
                },}}
            /> */}

            <SingleAxis size={1.25} goalValue={current_indic?.goalValue || NaN} balanceValue={current_indic?.balanceValue || NaN} categoryKey={variable} />
            <RacebarEpci size={2} goalValue={current_indic?.goalValue || NaN} balanceValue={current_indic?.balanceValue || NaN} categoryKey={variable} />
        </Dashboard>
    )
}