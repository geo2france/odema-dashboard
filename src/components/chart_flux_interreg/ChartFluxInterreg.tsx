import { ChartEcharts, useBlockConfig, useDataset } from "@geo2france/api-dashboard/dsl"
import { Flex, Radio } from "antd"
import { BarSeriesOption, EChartsOption } from "echarts"
import { useState } from "react"
import { Icon } from "@iconify/react";

interface ChartFluxInterregProps {
    dataset?:string
}
export const ChartFluxInterreg:React.FC<ChartFluxInterregProps> = ({dataset:dataset_id}) => {
    type DisplayType = 'import_export' | 'other';
    const dataset = useDataset(dataset_id)
    const [typeDisplay, setTypeDisplay] = useState<DisplayType>('import_export');

    useBlockConfig({
        title: "Flux interrégionaux de déchets dangereux depuis et vers les Hauts-de-France - 2024",
        dataExport: dataset?.data
    })

    const series:BarSeriesOption[] = typeDisplay == 'import_export' ?
        [  {
            name: 'Export',
            type: 'bar',
            id:'e',
            stack: 'stack',
            color:'#FFB347',
            data: dataset?.data?.map((r) => [r.q_export*-1, r.nom_region])
            },
            {
            name: 'Import',
            id: 'i',
            color:"#7FDBFF",
            type: 'bar',
            stack: 'stack',
            data: dataset?.data?.map((r) => [r.q_import, r.nom_region])
            }]
        :
        [  {
            name: 'Solde (import - export)',
            id: 's',
            color:"grey",
            type: 'bar',
            data: dataset?.data?.map((r) => [r.q_import - r.q_export, r.nom_region])
            }]

    const option:EChartsOption = {
        xAxis: [
            {
            name: 'Flux de déchets (t)',
            type: 'value',
              axisLabel: {
                    formatter: (value: number) => Math.abs(value).toLocaleString()
                }
            }
        ],
        grid: {
            top: '0%',  
        },
        legend : {
            show:true
        },
        tooltip:{
            trigger:"axis"
        },
        yAxis: [
            {
            type: 'category',
            inverse: true,
            axisTick: {
                show: false
            },
            }],
        series: series
    }
    return (<>
        <Flex justify="flex-end" style={{marginBottom:'16px'}}>
         <Radio.Group
            optionType="button"
            buttonStyle="solid"
            value={typeDisplay}
            onChange={e => setTypeDisplay(e.target.value as DisplayType)} 
            options={[
                {
                value: 'import_export',
                label: <Icon icon="carbon:chart-population" />   ,
                },
                {
                value: 'solde',
                label:  <Icon icon="carbon:chart-bar" />   ,
                } ]}
    />
    </Flex>
        <ChartEcharts key={typeDisplay} option={option} /> {/*  key=.. fix temporaire sur api-dashboard pour forcer le rerender, faute d'accès à la props "notMerge"*/}
    </>
    )
}