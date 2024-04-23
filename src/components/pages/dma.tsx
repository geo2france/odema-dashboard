import React, { CSSProperties, useState } from "react";
import { BaseRecord, IResourceComponentsProps, useList } from "@refinedev/core";
import { Card, Col, Select, Row } from 'antd';
import { ChartSankeyDestinationDMA } from "../chart_sankey_destination";
import { ChartCollectePerformance } from "../chart_collecte_performance";
import { ChartRaceBareDMA } from "../chart_racebar_dma";
import { LoadingComponent } from "../loading_container";

import alasql from "alasql";
import ChartPieTypeTraitement from "../chart_pie_type_traitement";
import { useSearchParamsState } from "../../utils";
import { Attribution } from "../attributions";
import { DashboardElement } from "../dashboard_element";


export const DmaComponent: React.FC<IResourceComponentsProps> = () => {
    const [year, setYear] = useSearchParamsState('year','2021')

    const [cregion, _setcregion] = useSearchParamsState('region','32')

    const [focus, setFocus] = useState<string | undefined>(undefined) 

    const chartStyle:CSSProperties = {height:'350px'}
    //const cregion = 32

    const {data, isFetching} = useList({
            resource:"sinoe-(r)-destination-des-dma-collectes-par-type-de-traitement/lines",
            dataProviderName:"ademe_opendata",
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

    const {data:data_performance, isFetching: isFetching_performance} = useList({
        resource:"sinoe-(r)-repartition-des-tonnages-de-dma-collectes-par-type-de-collecte/lines",
        dataProviderName:"ademe_opendata",
        pagination: {
            pageSize: 600,
        },
        filters:[
            {
                field:"ANNEE",
                operator:"eq",
                value:year
            },
        ]
    });

    const {data:data_chiffre_cle, isFetching:isFetching_chiffre_cle} = useList({
        resource:"sinoe-indicateurs-chiffres-cles-dma-hors-gravats-2009-2017/lines",
        dataProviderName:"ademe_opendata",
        pagination: {
            pageSize: 250,
        },
        filters:[
            {
                field:"Annee",
                operator:"eq",
                value:year
            },
        ]
    })


    return (
        <>
        <Row gutter={[16,16]}>
            <Col span={24}>
            <Card style={{padding:12}}>
                Année : <Select onChange={(e) => e ? setYear(e) : undefined } defaultValue={year} value={year}
                    options={ Array.from({ length: 2021 - 2009 + 1 }, (_, i) => 2009 + i).filter(num => num % 2 !== 0).reverse().map((i) => ({label:i, value:i}) ) }
                />     
                </Card>
            </Col>

            <Col xl={24/2} xs={24}>
                    <DashboardElement isFetching={isFetching} title="Destination des déchets" attributions={[{ name: 'Ademe', url: 'https://data.ademe.fr/datasets/sinoe-(r)-destination-des-dma-collectes-par-type-de-traitement' }]}>
                        {datasankey && <ChartSankeyDestinationDMA style={chartStyle} onFocus={(e:any) => setFocus(e?.name)} focus_item={focus} data={datasankey.map((i:BaseRecord) => ({value:Math.max(i.TONNAGE_DMA_sum,1), source:i.L_TYP_REG_DECHET, target:i.L_TYP_REG_SERVICE}))}/> }
                    </DashboardElement>
            </Col>
            <Col xl={24/2} xs={24}>
                <DashboardElement title="Types de traitement" isFetching={isFetching_chiffre_cle && isFetching} attributions={[{ name: 'Ademe', url: 'https://data.ademe.fr/datasets/sinoe-(r)-destination-des-dma-collectes-par-type-de-traitement' }]}>
                        {data && data_chiffre_cle && (<ChartPieTypeTraitement style={chartStyle} onFocus={(e:any) => setFocus(e?.name)} focus_item={focus} data={data.data} c_region={cregion} data_territoire={data_chiffre_cle.data}/> )}
                </DashboardElement>
            </Col>
            <Col xl={24/2} xs={24}>
                <DashboardElement title="Performances de collecte" isFetching={isFetching_chiffre_cle && isFetching_performance} attributions={[{ name: 'Ademe', url: 'https://data.ademe.fr/datasets/sinoe-(r)-repartition-des-tonnages-de-dma-collectes-par-type-de-collecte' }]}>
                        {data_performance && data_chiffre_cle && <ChartCollectePerformance style={chartStyle} data={data_performance.data} data_territoire={data_chiffre_cle.data}/> }
                </DashboardElement>
            </Col>
            <Col xl={24/2} xs={24}>
                <DashboardElement title="Ratio régionaux" isFetching={isFetching_chiffre_cle && isFetching_performance} attributions={[{ name: 'Ademe', url: 'https://data.ademe.fr/datasets/sinoe-indicateurs-chiffres-cles-dma-hors-gravats-2009-2017' }]}>
                        {data_performance && data_chiffre_cle && <ChartRaceBareDMA style={chartStyle} data={data_performance.data} data_territoire={data_chiffre_cle.data} highlight_region={cregion}/>}
                </DashboardElement>
            </Col>
        </Row>

      </>
      );
};
