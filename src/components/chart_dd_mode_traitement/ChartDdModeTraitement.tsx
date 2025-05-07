import { SimpleRecord } from 'api-dashboard';
import ReactECharts from 'echarts-for-react';
import { useRef } from 'react';


interface ChartDdModeTraitementProps {
    year: number
    data: SimpleRecord[]
}

export const ChartDdModeTraitement: React.FC<ChartDdModeTraitementProps> = ({year, data} )  => {

    console.log(data)
    const current_year_data = data.filter((e) => (e.annee == year))

    const chartRef = useRef<any>();
    const option = {
        tooltip: {
            trigger: 'item',
            formatter: (p:any) => `<b>${p.value.toLocaleString()} t</b> (${p.percent.toLocaleString()} %)`
        },
        series:[{
            type:'pie',
            data: current_year_data?.map((e:SimpleRecord) => (
                { name:`${e.hierachie} - ${e.detail}`, 
                value:e.quantite,
                itemStyle:{
                    color: e.hierachie?.startsWith('valorisation') ? '#8ba365' : '#b3494b'
                   }
            }  ) ),
            radius: ['40%', '70%'],
            padAngle: 2,
            itemStyle: {
                borderRadius: 4
              },
        }],
        graphic: [{
            type: 'text',
            left: 'center',
            top: 'center',
            style: {
                text: `${current_year_data?.reduce((acc, obj) => acc + obj.quantite, 0).toLocaleString()} t`,
                fill: '#666',
                fontSize: 16,
                fontWeight: 'bold'
            }
        }]
    }

    return (
        <ReactECharts option={option} ref={chartRef} />
    )
}
