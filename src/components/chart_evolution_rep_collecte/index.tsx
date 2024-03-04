import { BaseRecord } from "@refinedev/core"
import { RepDataCollecteProcess } from "../../utils"
import { BarSeriesOption, EChartsOption } from "echarts";
import ReactECharts from 'echarts-for-react'; 
import alasql from "alasql";

export interface ChartEvolutionRepCollecteProps{
    data:BaseRecord[],
    filiere: 'd3e' | 'pa' | 'pchim' | 'tlc' | 'mnu' | 'disp_med' | 'pu' | 'vhu';
}
export const ChartEvolutionRepCollecte: React.FC<ChartEvolutionRepCollecteProps> = ({data, filiere} )  => {

    const data_chart = RepDataCollecteProcess(filiere, data).map((e) => ({serie_name:e.categorie, value:e.tonnage, category:e.annee })).sort((a,b) => a.category - b.category)

    const axie_category = [...new Set(data_chart.map(item => item.category))]; 
    console.log(data_chart);
    //console.log(axie_category)

    const myseries:BarSeriesOption[] = alasql(`
    SELECT d.[serie_name] AS name, ARRAY(d.[value]) AS data
    FROM ? d
    GROUP BY d.[serie_name]
    `, [data_chart]).map((e) => ({...e, type:'bar', stack:'stack1'}))

    console.log(myseries)

    const option:EChartsOption = {
        series:myseries,
        xAxis: [
            {
              type: 'category',
              data: axie_category
            }
          ],
        yAxis: [
            {
              type: 'value'
            }
          ],
    }
    return(<ReactECharts
        option={option} style={{ height: "450px"}}/>)   
}