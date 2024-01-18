import React from "react";
import { IResourceComponentsProps, useList } from "@refinedev/core";
import { Card, Col, Row } from 'antd';
import { ChartSankeyDestinationDMA } from "../chart_sankey_destination";
import { dataGroupBy } from "../../utils";

export const AdemeView: React.FC<IResourceComponentsProps> = () => {

    const {data} = useList({
            resource:"destination-oma",
            pagination: {
                pageSize: 150,
            },
            filters:[
                {
                    field:"C_REGION",
                    operator:"eq",
                    value:32
                },
                {
                    field:"ANNEE",
                    operator:"eq",
                    value:2021
                },
                {
                    field:"L_TYP_REG_DECHET",
                    operator:"ne",
                    value:'Déblais et gravats'
                },
                {
                    field:"L_TYP_REG_SERVICE",
                    operator:"ne",
                    value:"Incinération sans récupération d'énergie"
                },
                {
                    field:"L_TYP_REG_SERVICE",
                    operator:"ne",
                    value:'Stockage pour inertes'
                }
            ]
    })
   
    const mydata2 = data?.data ? dataGroupBy(data.data, ['L_TYP_REG_DECHET','L_TYP_REG_SERVICE'], 'TONNAGE_DMA', 'sum') : undefined;

    return (
        <>
        <Row>
            <Col xxl={24/2} md={24}>
                <Card title="Destination des DMA">
                    {mydata2 ? (<ChartSankeyDestinationDMA data={mydata2.map((i) => ({value:Math.max(i.TONNAGE_DMA_sum,1), source:i.L_TYP_REG_DECHET, target:i.L_TYP_REG_SERVICE}))}/> ) 
                    : <span>Chargement..</span>}   
                </Card>
            </Col>
        </Row>

      </>
      );
};
