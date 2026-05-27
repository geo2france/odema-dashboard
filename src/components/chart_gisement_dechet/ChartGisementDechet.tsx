import { ChartEcharts, useBlockConfig, useControl, useDataset } from "@geo2france/api-dashboard/dsl"
import { toForest } from "./utils"
import { EChartsOption } from "echarts"
import { chartBusinessProps } from "../../utils"
import { useMemo, useState } from "react"
import { TopLevelFormatterParams } from "echarts/types/dist/shared"
import { Segmented } from "antd"

interface ChartGisementDechetProps {
    dataset?:string
    title?:string
}
export const ChartGisementDechet:React.FC<ChartGisementDechetProps> = ({dataset:dataset_id, title}) => {

    const [source, setSource] = useState<'dechetterie' | 'collecte' | 'both'>('both')


    const dataset = useDataset(dataset_id)
    const annee = useControl('annee')  

    const data = useMemo(
        () => dataset?.data?.filter((r) => r.annee == annee),
        [dataset, annee]  
    )
    const dataChart = data && toForest( data?.map( (row) => ({ 
        l1: row.lib_dechet_1,
        l2: row.lib_dechet_2,
        l3: row.lib_dechet_3,
        value: source == 'dechetterie' ? [row.tonnage_dechetterie, row.ratio_hab_dechetterie] : 
               source == 'collecte' ? [row.tonnage_pap, row.ratio_hab_pap] :
               [row.tonnage, row.ratio_hab],
        ...row
    })) )
    .map( (r) => // Ajout d'une couleur métier pour les catégories 1 (ORM, recyclable, etc..)
    ({ ...r, 
        itemStyle: { 
            color:chartBusinessProps(r.name).color
    }})
    )

    console.log(data, dataChart)


    useBlockConfig({
        title: title,
        dataExport: data
    })


  const levels =  [
        {
            "itemStyle": {
            "gapWidth": 1,
            "borderColorSaturation": 0.6

            }
        },
        {
            "colorSaturation": [0.45, 0.6],
            "itemStyle": {
            "borderWidth": 0,
            "borderColor": "#fff",
            "gapWidth": 1
            },
            "upperLabel": {
            "show": false,
            "height": 30
            }
        },
    ];

    const option:EChartsOption = {
        legend: {show: true},
        tooltip:{
            formatter: (e:TopLevelFormatterParams) => {
                if (Array.isArray(e)) return '';
                const values = (e.data as { value: number[] }).value;
                return `${e.name} :<br/> 
                            <b>${values[0].toLocaleString(undefined, {maximumFractionDigits:0})} t </b> <br/> 
                            <i>${values[1].toLocaleString(undefined, {maximumFractionDigits:1})} kg/hab</i>`;
                },
        },
        xAxis: {show:false} ,yAxis: {show:false},
        series:[
            {
                top: 16*3,
                bottom: 8,
                left: 16,
                right: 16,
                type:"treemap",
                breadcrumb: {show: false},
                data: dataChart,
                roam:true,
                leafDepth: 2,
                levels: levels,

            }
        ]
    }

    return <div>
              <Segmented
                value={source}
                style={{position:'absolute', right:16, top:8, zIndex:1}}
                options={[
                    { value: 'collecte', label: 'Collecte' },
                    { value: 'dechetterie', label: 'Décheterie' },
                    { value: 'both', label: 'Tout' },
                ]}
                onChange={setSource} 
                />
              <ChartEcharts option={option} />

        </div>
}




