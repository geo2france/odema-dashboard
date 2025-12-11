import { CSSProperties,  useState } from "react";

import { Button, Segmented } from "antd";
import { FaPercent } from "react-icons/fa";
import { ChartYearSerie, useBlockConfig } from "@geo2france/api-dashboard/dsl";
import { EChartsOption } from "echarts";
import { Icon } from "@iconify/react";

export interface ChartEvolutionTypeDechetProps {
    dataset: string;
    title?:string;
    yearKey:string;
    categoryKey: string;
    /** Quantité en kg/hab */
    ratioKey: string;
    /** Quantié en tonne */
    tonnageKey?:string;
    style? : CSSProperties;
    year? : number;
    showObjectives?:boolean;
    normalize?:boolean;
    showNormalizeButton?:boolean;
    population?:number
  }

export const ChartEvolutionDechet: React.FC<ChartEvolutionTypeDechetProps> = ({dataset:dataset_id, year, title, tonnageKey, categoryKey, ratioKey, yearKey, normalize=false, showNormalizeButton=true} )  => {
    
    const [normalizeState, setNormalizeState] = useState(normalize)

    const tooltipFormatter = (e:any) => `
        ${e.seriesName} <br>
        ${e.marker}
        ${e.data[0]} :
        <b>${normalizeState ? 
            (e.value[3])?.toLocaleString(undefined, {maximumFractionDigits: 1})+' %' :
            e.value[1]?.toLocaleString(undefined, {maximumFractionDigits: 0})+' kg/hab' 
        } 
        </b> 
        (${ (normalizeState) ? 
            e.value[1]?.toLocaleString(undefined, {maximumFractionDigits: 0})+' kg/hab - ' + e.value[2]?.toLocaleString(undefined, {maximumFractionDigits: 0})+' T':
            (e.value[2])?.toLocaleString(undefined, {maximumFractionDigits: 0})+' T'
        })`


    const options:EChartsOption = {
        yAxis:{name: normalizeState ? "%" : "Kg/hab"},
        tooltip:{trigger:"item", formatter:tooltipFormatter}
    }
    return (
        <>
        {showNormalizeButton && 
              <Segmented
                value={normalizeState}
                style={{position:'absolute', right:16, top:32+16, zIndex:1}}
                options={[
                    { value: true, icon: <Icon icon="gravity-ui:chart-area-stacked-normalized" /> },
                    { value: false, label: <Icon icon="gravity-ui:chart-area-stacked" /> },
                ]}
                onChange={setNormalizeState} 
                />
        }
        <ChartYearSerie 
            title={title}
            dataset={dataset_id} 
            valueKey={ratioKey} 
            secondaryValueKey={tonnageKey} 
            {...{categoryKey, yearKey}} 
            yearMark={ year } 
            options={ options } 
            normalize={normalizeState}
            type="area"/>
        </>
    )
}