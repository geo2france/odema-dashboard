import React from 'react'
import { ChartGaugeTarget } from '../chart_gauge_targets'
import { Col, Collapse, Descriptions, DescriptionsProps, Row } from 'antd';
import { ChartTargetEvolution } from '../chart_target_evolution';
import { BaseRecord } from '@refinedev/core';

export interface ITargetCardProps {
    objectif_name:string,
    unite?:string,
    date:string, //year ?
    due_date:string,
    ref_date:string,
    ref_value:number,
    target_value:number,
    data:BaseRecord[]
}

export const TargetCard: React.FC<ITargetCardProps> = ( {objectif_name, date, due_date, ref_date, ref_value, target_value, unite, data} ) => {
    const value = data.filter((e) => e.date.toString() == date)[0]?.value
    const percent:number = value && (ref_value - value) / (ref_value - target_value );
    const trajectoire_percent:number = 1 - (Number(due_date) - Number(date)) /  ( Number(due_date) - Number(ref_date) ) //Valeur théorique de la trajectoire
    
    //const trajectory_slope = target_value > ref_value ? 'asc' : 'desc'

    const descriptionItems:DescriptionsProps['items'] = [
        {
            key: 'ref_value',
            label: 'Référence', children: `${ref_value.toLocaleString()} (${ref_date})`
        },
        {
            key: 'value',
            label: 'Valeur', children: `${value && value.toLocaleString()} (${date})`
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
        
        <Col span={10} style={{textAlign:'center'}}>
            <ChartGaugeTarget value_trajectoire={trajectoire_percent*100} value={Math.round(percent * 100)} />   
    </Col>
    <Col span={14}>  
    <Descriptions layout="vertical" items={descriptionItems} />
    </Col>

        </Row>
        <Collapse items={[  {  key: '1',
    label: 'Evolution 📈',
    children: <ChartTargetEvolution data={data} current_year={Number(date)}/> }]} ghost defaultActiveKey={['1']}  />
    </div>
  )
}


