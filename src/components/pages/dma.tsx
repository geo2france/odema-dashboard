import React, { CSSProperties, useState } from "react";
import { BaseRecord, IResourceComponentsProps } from "@refinedev/core";
import { Card, Col, Row } from 'antd';
import { ChartSankeyDestinationDMA } from "../chart_sankey_destination";
import { ChartCollectePerformance } from "../chart_collecte_performance";
import { ChartRaceBareDMA } from "../chart_racebar_dma";

import alasql from "alasql";
import { useSearchParamsState, DashboardElement, NextPrevSelect } from "g2f-dashboard";
import { ChartEvolutionDechet } from "../chart_evolution_dechet";
import useApi from "../../utils/useApi";
import { ademe_opendataProvider } from "../../App";


export const DmaComponent: React.FC<IResourceComponentsProps> = () => {
    const [year, setYear] = useSearchParamsState('year','2021')
    const [cregion, _setcregion] = useSearchParamsState('region','32')
    const [focus, setFocus] = useState<string | undefined>(undefined) 

    const chartStyle:CSSProperties = {height:'350px'}
    //const cregion = 32

    const {data, isFetching} = useApi({
            resource:"sinoe-(r)-destination-des-dma-collectes-par-type-de-traitement/lines",
            dataProvider:ademe_opendataProvider,
            pagination: {
                pageSize: 2000,
            },
            filters:[
                {
                    field:"C_REGION",
                    operator:"eq",
                    value:cregion
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
    `, [data.data.filter((e) => e.ANNEE == Number(year))]) : undefined


    const {data:data_performance, isFetching: isFetching_performance} = useApi({
        resource:"sinoe-(r)-repartition-des-tonnages-de-dma-collectes-par-type-de-collecte/lines",
        dataProvider:ademe_opendataProvider,
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

    const {data:data_chiffre_cle, isFetching:isFetching_chiffre_cle} = useApi({
        resource:"sinoe-indicateurs-chiffres-cles-dma-hors-gravats-2009-2017/lines",
        dataProvider:ademe_opendataProvider,
        pagination: {
            pageSize: 5000,
        }
    })

    const pop_region = data_chiffre_cle?.data && alasql(`
        SELECT [Annee] as [annee], SUM([VA_POPANNEE]) AS [population]
        FROM ?
        WHERE [C_REGION]='${cregion}'
        GROUP BY [Annee]
    `, [data_chiffre_cle.data])

    const data_typedechet_destination = data_chiffre_cle?.data && data?.data && pop_region && alasql(
        `SELECT d.*, dc.[VA_POPANNEE], p.[population] AS [VA_POPANNEE_REG]
        FROM ? d
        JOIN ? dc ON dc.[Annee] = d.[ANNEE] AND dc.[C_DEPT]=d.[C_DEPT]
        JOIN ? p ON p.[annee] = d.[ANNEE] AND d.[C_REGION] = '${cregion}'
        `, [ data?.data, data_chiffre_cle?.data, pop_region]) // Ajoute la population departementale et régionale
 

    return (
        <>
        <Row gutter={[16,16]}>
            <Col span={24}>
                <Card style={{padding:12}}>
                Année : <NextPrevSelect reverse={true} onChange={(e) => e ? setYear(e.toString()) : undefined } defaultValue={year} value={year}
                    options={ Array.from({ length: 2021 - 2009 + 1 }, (_, i) => 2009 + i).filter(num => num % 2 !== 0).reverse().map((i) => ({label:i, value:i}) ) }
                />     
                </Card>
            </Col>

            <Col xl={12} xs={24}>
                    <DashboardElement isFetching={isFetching} title={`Types et destination des déchets en ${year}`} attributions={[{ name: 'Ademe', url: 'https://data.ademe.fr/datasets/sinoe-(r)-destination-des-dma-collectes-par-type-de-traitement' }]}>
                        {datasankey && <ChartSankeyDestinationDMA style={chartStyle} onFocus={(e:any) => setFocus(e?.name)} focus_item={focus} data={datasankey.map((i:BaseRecord) => ({value:Math.max(i.TONNAGE_DMA_sum,1), source:i.L_TYP_REG_DECHET, target:i.L_TYP_REG_SERVICE}))}/> }
                    </DashboardElement>
            </Col>

            <Col  xl={12} xs={24} > 
                <DashboardElement isFetching={isFetching} title={`Type de déchets collectés`}>{data_typedechet_destination &&  
                    <ChartEvolutionDechet 
                    data={ data_typedechet_destination.map((e:BaseRecord) => ({tonnage:e.TONNAGE_DMA, annee:e.ANNEE, type:e.L_TYP_REG_DECHET, population:e.VA_POPANNEE_REG })) }
                    onFocus={(e:any) => setFocus(e?.seriesName)} focus_item={focus}
                    year={Number(year)} 
                    />}
                </DashboardElement>
            </Col>

            <Col  xl={12} xs={24} > 
                <DashboardElement isFetching={isFetching} title={`Destination des déchets`}>{data_typedechet_destination &&  
                    <ChartEvolutionDechet 
                    data={ data_typedechet_destination.map((e:BaseRecord) => ({tonnage:e.TONNAGE_DMA, annee:e.ANNEE, type:e.L_TYP_REG_SERVICE, population:e.VA_POPANNEE_REG })) }
                    onFocus={(e:any) => setFocus(e?.seriesName)} focus_item={focus}
                    year={Number(year)} 
                    />}
                </DashboardElement>
            </Col>

            <Col xl={24/2} xs={24}>
                <DashboardElement title="Performances de collecte" isFetching={isFetching_chiffre_cle && isFetching_performance} attributions={[{ name: 'Ademe', url: 'https://data.ademe.fr/datasets/sinoe-(r)-repartition-des-tonnages-de-dma-collectes-par-type-de-collecte' }]}>
                        {data_performance && data_chiffre_cle && 
                        <ChartCollectePerformance 
                        style={chartStyle} 
                        data={data_performance.data} 
                        data_territoire={data_chiffre_cle.data.filter((e) => e.Annee == year)}/> }
                </DashboardElement>
            </Col>
            <Col xl={24/2} xs={24}>
                <DashboardElement title="Ratio régionaux" isFetching={isFetching_chiffre_cle && isFetching_performance} attributions={[{ name: 'Ademe', url: 'https://data.ademe.fr/datasets/sinoe-indicateurs-chiffres-cles-dma-hors-gravats-2009-2017' }]}>
                        {data_chiffre_cle && 
                        <ChartRaceBareDMA 
                            style={chartStyle} 
                            data={data_chiffre_cle.data.filter((e) => e.Annee == year)} 
                            highlight_region={cregion}/>}
                </DashboardElement>
            </Col>
        </Row>

      </>
      );
};
