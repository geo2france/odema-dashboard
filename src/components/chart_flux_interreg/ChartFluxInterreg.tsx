import { ChartEcharts, useBlockConfig, useDataset } from "@geo2france/api-dashboard/dsl"
import { Flex, Radio } from "antd"
import { BarSeriesOption, EChartsOption } from "echarts"
import { useState } from "react"
import { Icon } from "@iconify/react";

interface ChartFluxInterregProps {
    dataset?:string
    title?:string
    locationKey:string
    importKey:string
    exportKey:string
}
export const ChartFluxInterreg:React.FC<ChartFluxInterregProps> = ({dataset:dataset_id, title, locationKey, importKey, exportKey}) => {
    type DisplayType = 'import_export' | 'other';
    const dataset = useDataset(dataset_id)
    const [typeDisplay, setTypeDisplay] = useState<DisplayType>('import_export');

    useBlockConfig({
        title: title,
        dataExport: dataset?.data
    })

    const series:BarSeriesOption[] = typeDisplay == 'import_export' ?
        [  {
            name: 'Export',
            type: 'bar',
            id:'e',
            stack: 'stack',
            color:'#FFB347',
            data: dataset?.data?.map((r) => [r?.[exportKey]*-1, r?.[locationKey]])
            },
            {
            name: 'Import',
            id: 'i',
            color:"#7FDBFF",
            type: 'bar',
            stack: 'stack',
            data: dataset?.data?.map((r) => [r?.[importKey], r?.[locationKey]])
            }]
        :
        [  {
            name: 'Solde (import - export)',
            id: 's',
            color:"grey",
            type: 'bar',
            data: dataset?.data?.map((r) => [r?.[importKey] - r?.[exportKey], r?.[locationKey]])
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