import { useControl, useDataset, useDatasets } from "api-dashboard/dsl"
import EChartsReact from "echarts-for-react"
import { BarSeriesOption, EChartsOption, LineSeriesOption, SeriesOption } from "echarts";
import { SimpleRecord } from "api-dashboard";
import { interpolate } from "../../utils";

interface ITrajectoireProps {
    dataset_id:string | string[]
    dataset_obj_id:string 
    valueKey:string
    yearKey?:string
    objectifYearKey?:string
    objectifValueKey?:string
    unit?:string
    title:string
    color?:string
    target?: 'below' | 'above'
}

export const ChartTrajectoire: React.FC<ITrajectoireProps> = ({
  dataset_id,
  dataset_obj_id,
  valueKey,
  yearKey = "annee",
  objectifValueKey:objectifValueKey_in,
  objectifYearKey:objectifYearKey_in,
  color = "rgba(189, 217, 71, 1)",
  unit,
  title,
  target
}) => {
  const datasets_id = Array.isArray(dataset_id) ? dataset_id : [dataset_id];
  const objectifValueKey = objectifValueKey_in || valueKey ;
  const objectifYearKey = objectifYearKey_in || yearKey ;

  const series: SeriesOption[] = [];

  //const colors = usePalette({nColors:2})

  const data_obj = useDataset(dataset_obj_id);

  const area_opacity:Number = 0.1


  const serie_obj: LineSeriesOption = {
    type: "line",
    name: "Objectif régional SRADDET",
    data:
      data_obj?.data &&
      interpolate(
        data_obj?.data?.map((e: SimpleRecord) => [e[objectifYearKey], e[objectifValueKey]])
      ).map((e) => [e[0].toString(), e[1]]),
    lineStyle: {
      type: "dashed",
      width: 2,
    },
    areaStyle:{
      color: `rgba(255,0,0,${area_opacity})`,
      origin: target === 'below' ? 'end' : 'start'
    },
    symbolSize: (value) =>
      data_obj?.data?.map((e) => e[objectifYearKey].toString()).includes(value[0]) ? 4 : 0,
    color: "#91cc75",
    tooltip: {
      show: true,
      trigger: "axis",
      valueFormatter: (value) =>
        `${Number(value).toLocaleString(undefined, {
          maximumFractionDigits: 1,
        })} ${unit}`,
    },
  };

  const serie_obj2: LineSeriesOption = {
    ...serie_obj,
    name: "Objectif régional SRADDET",
    lineStyle: { opacity: 0 },
    itemStyle: { opacity: 0 },
    showSymbol: false,
    areaStyle: {
      color: `rgba(0,255,0,${area_opacity})`,
      origin: target === "above" ? "end" : "start",
    },
    tooltip:{show:false}
  };

  useDatasets(datasets_id)?.map((data, idx) => {
    const serie_territorie: BarSeriesOption = {
      name: idx === 0 ? "Région" : `EPCI_${useControl('select_epci')}`,
      type: "bar",
      data: data?.data?.map((row: SimpleRecord) => [
        String(row[yearKey]),
        row[valueKey],
      ]),
      //barWidth:idx === 0 ? "50%" : "100%",
      //barGap:idx === 0 ? 0 : undefined,
      color: idx === 0 ? "#dbdbdb" : color,
      //showBackground: idx !== 0 ,
      backgroundStyle: {
        color: "rgba(180, 180, 180, 0.1)",
      },
      tooltip: {
        show: true,
        trigger: "axis",
        valueFormatter: (value) =>
          `${Number(value).toLocaleString(undefined, {
            maximumFractionDigits: 1,
          })} ${unit}`,
      },
    };

    series.push(serie_territorie);
  });

  const option: EChartsOption = {
    series: [...series, serie_obj, serie_obj2],
    legend: {
      show: true,
      bottom: 0,
    },
    tooltip: {
      trigger: "axis",
    },
    xAxis: [
      {
        type: "time",
      },
    ],
    yAxis: [
      {
        type: "value",
        max: unit ==='%' ? 100 : undefined,
        axisLabel: {
          formatter: (value: any) =>
            `${Number(value).toLocaleString(undefined, {
              maximumFractionDigits: 1,
            })}`,
        },
        name: wrapAxisLabel(`${title} (${unit})`),
      },
    ],
  };
  return <EChartsReact option={option} />;
};




function wrapAxisLabel(name: string, maxLineLength = 10): string {
    const words = name.split(" ");
    const lines: string[] = [];
    let currentLine = "";
  
    for (const word of words) {
      if ((currentLine + word).length > maxLineLength) {
        lines.push(currentLine.trim());
        currentLine = word + " ";
      } else {
        currentLine += word + " ";
      }
    }
  
    if (currentLine) {
      lines.push(currentLine.trim());
    }
  
    return lines.join("\n");
  }