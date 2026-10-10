import { BaseChartProps, useApplyEchartsHighlight, useSetHighlight } from "@geo2france/api-dashboard"
import { ChartEcharts, useDataset, usePalette } from "@geo2france/api-dashboard/dsl"
import { EChartsOption, MarkAreaComponentOption, SeriesOption } from "echarts"
import { useMemo, useRef } from "react"
import { rri_agg } from "./rri"
import EChartsReact from "echarts-for-react"

interface RacebarEpciProps extends BaseChartProps {
    goalValue: number 
    balanceValue: number
    categoryKey?: string
    unit?: string
}
const RacebarEpci:React.FC<RacebarEpciProps> = ({dataset:dataset_in, goalValue, balanceValue, categoryKey, unit}) => {

    const chartRef = useRef<EChartsReact>(null);


    const dataset = useDataset(dataset_in)
    const data = dataset?.data

    const decrease = goalValue < balanceValue

    const setHighlight = useSetHighlight()
    useApplyEchartsHighlight({chartRef:chartRef})


    const categryKeyIsInCols = categoryKey && data && (data?.length || 0) > 0 && Object.hasOwn(data[0], categoryKey);

    const categories = categoryKey && categryKeyIsInCols ? [...new Set(data?.map(d => d[categoryKey]))] : ['indicateur'] ;

    const colors = usePalette({nColors: categories.length})

    // Aggréation tout axe confondu : permet de classer les territoires par valeur d'indicateur
    const data_agg = useMemo(
        () => data && rri_agg({ data })?.toSorted((a,b) => (a.valeur ?? 0)- (b.valeur ?? 0)),
        [data]);

    // Aggrégation selon l'axe choisi
    const data_agg_axe = useMemo(
        () => data && categryKeyIsInCols ? rri_agg({ data:data, axis:[categoryKey] })?.toSorted((a,b) => a.valeur - b.valeur) : data_agg,
        [data, data_agg, categoryKey, categryKeyIsInCols]) || [] ;
    
    // Libel des territoires par ordre de valeur agrégés tous axes (indicateurs complet)
    const lib_territories = [...new Set(data_agg?.map(d => d['libelle_epci']))]



    const series:SeriesOption[] = categories.map((category, index) => ( {
                type:"bar",
                name: category?.toString(),
                id: category?.toString(),
                color:colors?.[index],
                data: data_agg_axe?.
                    filter( r => categoryKey && categryKeyIsInCols ? r[categoryKey] == category : true)
                    .map((row) => [row.valeur, row.libelle_epci, row.geocode_epci]).sort( (a,b) => b[0] - a[0] ),
                encode: {
                    itemName:2,
                    itemId:2
                },
                stack: "total",
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
        blur: {
            itemStyle:{
                opacity:1
            }
        },
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

    const option: EChartsOption = {
      tooltip: {show:true, trigger:'axis'},
      animation: true,
      emphasis: {
        focus:"self",
      },
      xAxis: { type: "value",  name: unit },
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
        legend:{
            show: true,
            data: categories.map(String),
            type:'scroll',
        },
      series: [
        ...series,
            { // Fake serie with background
            name: 'background-fake-serie',
            silent: true,
            stack: 'total',
            markArea: markArea ,
            type:'bar',
            }
      ],
    };

    const hoverTimeout = useRef<ReturnType<typeof setTimeout>>();

    const onHover = (e: any) => {
        if (e.componentType !== 'series') return;

        clearTimeout(hoverTimeout.current);

        hoverTimeout.current = setTimeout(() => {
            setHighlight({
            property: 'geocode_epci',
            value: e.name,
            });
        }, 150);
    };

    const onOut = () => {
        clearTimeout(hoverTimeout.current);

        setHighlight({
            property: 'geocode_epci',
            value: null,
        });
    };


    return <ChartEcharts ref={chartRef} option={option} style={{height: 1000}} replaceMerge= {['xAxis', 'series']} onEvents={{mouseover:onHover, mouseOut:onOut}} />
}

export default RacebarEpci