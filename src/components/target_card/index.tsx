import React from 'react'
import { ChartGaugeTarget } from '../chart_gauge_targets'
import { Col, Collapse, Descriptions, DescriptionsProps, Row, Tag } from 'antd';
import { ChartTargetEvolution } from '../chart_target_evolution';
import { SimpleRecord } from 'api-dashboard';

export interface ITargetCardProps {
    objectif_name:string,
    value:number,
    unite?:string,
    date:string, //year ?
    due_date:string,
    ref_date:string,
    ref_value:number,
    target_value:number,
    data:SimpleRecord[]
}

export const TargetCard: React.FC<ITargetCardProps> = ( {objectif_name, value, date, due_date, ref_date, ref_value, target_value, unite, data} ) => {
    const percent:number = (ref_value - value) / (ref_value - target_value );
    const trajectoire_percent:number = 1 - (Number(due_date) - Number(date)) /  ( Number(due_date) - Number(ref_date) ) //Valeur théorique de la trajectoire
    
    const getState = (percent:number, trajectoire_percent:number) => {
        if (percent >= 1.1) {
            return(<Tag color="success"> Dépassé</Tag>)
        }
        else if (percent >= 1) {
            return(<Tag color="success"> Atteint</Tag>)
        }
        else if (percent < -0.1) {
            return(<Tag color="error"> Critique</Tag>)
        }
        else if (Math.abs(trajectoire_percent - percent) < 0.05 ) {
            return(<Tag color="processing"> Sur la trajectoire </Tag>)
        }
        else if (trajectoire_percent - percent > 0.05 ) {
            return(<Tag color="warning"> En retard </Tag>)
        }
        else if (trajectoire_percent - percent < -0.05 ) {
            return(<Tag color="processing"> En avance </Tag>)
        }
    }

    const state = getState(percent, trajectoire_percent)
    //const trajectory_slope = target_value > ref_value ? 'asc' : 'desc'

    const descriptionItems:DescriptionsProps['items'] = [
        {
            key: 'ref_value',
            label: 'Référence', children: `${ref_value.toLocaleString()} (${ref_date})`
        },
        {
            key: 'value',
            label: 'Valeur', children: `${value.toLocaleString()} (${date})`
        },
        {
            key: 'target',
            label: 'Cible', children: `${target_value.toLocaleString()} (${due_date})`
        }
    ]

    return (
    <div style={{padding:8}}>
        <small>{objectif_name}</small>

        <Row>
        
        <Col span={10} style={{textAlign:'center'}}><ChartGaugeTarget value_trajectoire={trajectoire_percent*100} value={Math.round(percent * 100)} />   {state}
    </Col>
    <Col span={14}>  
    <Descriptions layout="vertical" items={descriptionItems} />
    </Col>

        </Row>
        <Collapse items={[  {  key: '1',
    label: 'Evolution 📈',
    children: <ChartTargetEvolution data={data}/> }]} ghost defaultActiveKey={['1']}  />
    </div>
  )
}


