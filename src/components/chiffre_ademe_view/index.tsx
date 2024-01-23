import React, { useState } from "react";
import { IResourceComponentsProps, useList } from "@refinedev/core";
import { Card, Col, DatePicker, Select, Row } from 'antd';
import { ChartSankeyDestinationDMA } from "../chart_sankey_destination";
import { dataGroupBy } from "../../utils";
import dayjs from "dayjs";
import { ChartCollectePerformance } from "../chart_collecte_performance";

export const AdemeView: React.FC<IResourceComponentsProps> = () => {
    const [year, setYear] = useState<number>(2021);

    const cregion = 32

    const {data} = useList({
            resource:"destination-oma",
            pagination: {
                pageSize: 150,
            },
            filters:[
                {
                    field:"C_REGION",
                    operator:"eq",
                    value:cregion
                },
                {
                    field:"ANNEE",
                    operator:"eq",
                    value:year
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
   
    const datasankey = data?.data ? dataGroupBy(data.data, ['L_TYP_REG_DECHET','L_TYP_REG_SERVICE'], ['TONNAGE_DMA'], ['sum']) : undefined;

    const {data:data_performance} = useList({
        resource:"performance-oma",
        pagination: {
            pageSize: 150,
        },
        filters:[
            {
                field:"C_REGION",
                operator:"eq",
                value:cregion
            },
            {
                field:"ANNEE",
                operator:"eq",
                value:year
            },
        ]
    });

    return (
        <>
        <Select onChange={(e) => e ? setYear(e) : undefined } defaultValue={year} 
            options={ Array.from({ length: 2021 - 2009 + 1 }, (_, i) => 2009 + i).filter(num => num % 2 !== 0).reverse().map((i) => ({label:i, value:i}) ) }
        />
        <Row>
            <Col xxl={24/2} md={24}>
                <Card title="Destination des DMA">
                    {datasankey ? (<ChartSankeyDestinationDMA data={datasankey.map((i) => ({value:Math.max(i.TONNAGE_DMA_sum,1), source:i.L_TYP_REG_DECHET, target:i.L_TYP_REG_SERVICE}))}/> ) 
                    : <span>Chargement..</span>}   
                </Card>
            </Col>
            <Col xxl={24/2} md={24}>
                <Card title="Performances de collecte (hors déchetteries)">
                    {data_performance ? (<ChartCollectePerformance data={data_performance.data}/> ) 
                    : <span>Chargement..</span>}   
                </Card>
            </Col>
        </Row>

      </>
      );
};
