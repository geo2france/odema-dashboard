import { CSSProperties,  useState } from "react";

import { Segmented } from "antd";
import { ChartYearSerie } from "@geo2france/api-dashboard/dsl";
import { EChartsOption, SeriesOption } from "echarts";
import { Icon } from "@iconify/react";
import { chartBusinessProps } from "../../utils";

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

    /* Hiérachie métier */
    const seriesSorter = (a:SeriesOption, b:SeriesOption) => (chartBusinessProps(String(a.name)).sort || 0) - (chartBusinessProps(String(b.name)).sort || 0)

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
            seriesSort={ seriesSorter }
            type="area"/>
        </>
    )
}