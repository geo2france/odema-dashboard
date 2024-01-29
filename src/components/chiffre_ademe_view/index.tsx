import React, { useState } from "react";
import { BaseRecord, IResourceComponentsProps, useList } from "@refinedev/core";
import { Card, Col, Typography, Select, Row } from 'antd';
const { Text, Link } = Typography;
import { ChartSankeyDestinationDMA } from "../chart_sankey_destination";
import { ChartCollectePerformance } from "../chart_collecte_performance";
import { ChartRaceBareDMA } from "../chart_racebar_dma";
import alasql from "alasql";

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
   
    const datasankey = data?.data ? alasql(`
        SELECT L_TYP_REG_DECHET, L_TYP_REG_SERVICE, sum(TONNAGE_DMA) as TONNAGE_DMA_sum
        FROM ?
        GROUP BY L_TYP_REG_DECHET, L_TYP_REG_SERVICE
    `, [data.data]) : undefined

    const {data:data_performance} = useList({
        resource:"collecte-dma",
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

    const {data:data_chiffre_cle} = useList({
        resource:"chiffres-cles-dma",
        pagination: {
            pageSize: 250,
        },
        filters:[
            {
                field:"ANNEE",
                operator:"eq",
                value:year
            },
        ]
    })

    return (
        <>
        <Row gutter={[16,16]}>
            <Col span={24}>
            <Card>
                Année : <Select onChange={(e) => e ? setYear(e) : undefined } defaultValue={year} 
                    options={ Array.from({ length: 2021 - 2009 + 1 }, (_, i) => 2009 + i).filter(num => num % 2 !== 0).reverse().map((i) => ({label:i, value:i}) ) }
                />
                </Card>
            </Col>

            <Col xxl={24/2} md={24}>
                <Card title="Destination des déchets">
                    {datasankey ? (<ChartSankeyDestinationDMA data={datasankey.map((i:BaseRecord) => ({value:Math.max(i.TONNAGE_DMA_sum,1), source:i.L_TYP_REG_DECHET, target:i.L_TYP_REG_SERVICE}))}/> )
                    : <span>Chargement..</span>}
                    <Text type="secondary">Source : <Link href="https://data.ademe.fr/datasets/sinoe-(r)-destination-des-oma-collectes-par-type-de-traitement">Ademe</Link></Text> 
                </Card>
            </Col>
            <Col xxl={24/2} md={24}>
                <Card title="Performances de collecte">
                    {data_performance && data_chiffre_cle ? (<ChartCollectePerformance data={data_performance.data} data_territoire={data_chiffre_cle.data}/> )
                    : <span>Chargement..</span>}
                    <Text type="secondary">Source : <Link href="https://data.ademe.fr/datasets/performances-collecte-oma-par-type-dechet-par-dept">Ademe</Link></Text> 
                </Card>
            </Col>
            <Col xxl={24/2} md={24}>
                <Card title="Ratio régionaux">
                    {data_chiffre_cle? <ChartRaceBareDMA data={data_chiffre_cle.data} highlight_region={cregion}/> : <span>Chargement</span>}
                    <Text type="secondary">Source : <Link href="https://data.ademe.fr/datasets/sinoe-indicateurs-chiffres-cles-dma-avec-gravats-2009-2017">Ademe</Link></Text> 
                </Card>
            </Col>
        </Row>

      </>
      );
};
