import { ChartEcharts, useBlockConfig, useControl, useDataset } from "@geo2france/api-dashboard/dsl"
import { toForest } from "./utils"
import { EChartsOption } from "echarts"
import EChartsReact from "echarts-for-react"
import { chartBusinessProps } from "../../utils"

interface ChartGisementDechetProps {
    dataset?:string
    title?:string
}
export const ChartGisementDechet:React.FC<ChartGisementDechetProps> = ({dataset:dataset_id, title}) => {
    const dataset = useDataset(dataset_id)

    const data = dataset?.data?.filter( (r) => r.annee == useControl('annee'))

    const dataChart = data && toForest( data?.map( (row) => ({ 
        l1: row.lib_dechet_1,
        l2: row.lib_dechet_2,
        l3: row.lib_dechet_3,
        value: row.tonnage,
        ...row
    })) )
    .map( (r) => // Ajout d'une couleur métier pour les catégories 1 (ORM, recyclable, etc..)
    ({ ...r, 
        itemStyle: { 
            color:chartBusinessProps(r.name).color
    }})
    )

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
        tooltip: {show:true},
        xAxis: {show:false} ,yAxis: {show:false},
        series:[
            {
                top: 16,
                bottom: 16,
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

    return <ChartEcharts option={option} />

}




