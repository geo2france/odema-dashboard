import React, { useState } from "react";
import { IResourceComponentsProps, useList } from "@refinedev/core";
import { Card, Col, Typography, Select, Row } from 'antd';
const { Text, Link } = Typography;
import { ChartSankeyDestinationDMA } from "../chart_sankey_destination";
import { dataGroupBy } from "../../utils";
import { ChartCollectePerformance } from "../chart_collecte_performance";
import { ChartRaceBareDMA } from "../chart_racebar_dma";

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
                <Card title="Destination des DMA">
                    {datasankey ? (<ChartSankeyDestinationDMA data={datasankey.map((i) => ({value:Math.max(i.TONNAGE_DMA_sum,1), source:i.L_TYP_REG_DECHET, target:i.L_TYP_REG_SERVICE}))}/> ) 
                    : <span>Chargement..</span>}
                    <Text type="secondary">Source : <Link href="https://data.ademe.fr/datasets/sinoe-(r)-destination-des-oma-collectes-par-type-de-traitement">Ademe</Link></Text> 
                </Card>
            </Col>
            <Col xxl={24/2} md={24}>
                <Card title="Performances de collecte OMA (hors déchetteries)">
                    {data_performance ? (<ChartCollectePerformance data={data_performance.data}/> ) 
                    : <span>Chargement..</span>}
                    <Text type="secondary">Source : <Link href="https://data.ademe.fr/datasets/performances-collecte-oma-par-type-dechet-par-dept">Ademe</Link></Text> 
                </Card>
            </Col>
            <Col xxl={24/2} md={24}>
                <Card title="Chiffres-clés DMA">
                    {data_chiffre_cle? <ChartRaceBareDMA data={data_chiffre_cle.data} highlight_region={cregion}/> : <span>Chargement</span>}
                    <Text type="secondary">Source : <Link href="https://data.ademe.fr/datasets/sinoe-indicateurs-chiffres-cles-dma-avec-gravats-2009-2017">Ademe</Link></Text> 
                </Card>
            </Col>
        </Row>

      </>
      );
};
