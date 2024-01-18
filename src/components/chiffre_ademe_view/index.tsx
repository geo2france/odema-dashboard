import React from "react";
import { IResourceComponentsProps, BaseRecord, useList, useMany, useOne } from "@refinedev/core";
import { List, TagField, useTable } from "@refinedev/antd";
import { Card, Col, Row } from 'antd';
import { Table } from "antd";
import _ from "lodash";
import { ChartSankeyDestinationDMA } from "../pie_test";
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
                }
            ]
    })
   
    const mydata2 = data?.data ? dataGroupBy(data.data, ['L_TYP_REG_DECHET','L_TYP_REG_SERVICE'], 'TONNAGE_T', 'sum') : undefined;

    return (
        <>
        <Row>
            <Col xxl={24/2} md={24}>
                <Card title="Destination des DMA">
                    {mydata2 ? (<ChartSankeyDestinationDMA data={mydata2.map((i) => ({value:Math.max(i.TONNAGE_T_sum,1), source:i.L_TYP_REG_DECHET, target:i.L_TYP_REG_SERVICE}))}/> ) 
                    : <span>Chargement..</span>}   
                </Card>
            </Col>
        </Row>

      </>
      );
};
