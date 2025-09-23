import React, { CSSProperties, useState } from "react";
import { Typography } from 'antd';
import { ChartSankeyDestinationDMA } from "../chart_sankey_destination";
import { ChartCollectePerformance } from "../chart_collecte_performance";
import { ChartRaceBareDMA } from "../chart_racebar_dma";

import alasql from "alasql";
import { useSearchParamsState, DashboardElement, NextPrevSelect, SimpleRecord, DashboardPage, useApi } from "@geo2france/api-dashboard";
import { ChartEvolutionDechet } from "../chart_evolution_dechet";
import { ademe_opendataProvider, geo2franceProvider } from "../../App";
import { ChartEvolutionPopTi } from "../chart_evolution_pop_ti";
import { ChartEvolutionObjectifs } from "../chart_evolution_objectif/ChartEvolutionObjectif";
import { ChartTauxValo } from "../chart_taux_valo/ChartTauxValo";
import { ChartDmaStockage } from "../chart_dma_stockage/ChartDmaStockage";
import { MapTI } from "../map_ti/mapTi";

const {Text} = Typography;
const [maxYear, minYear, defaultYear] = [2023,2009,2021]


export const DmaComponent: React.FC = () => {
    const [year, setYear] = useSearchParamsState('year',defaultYear.toString())
    const [cregion, _setcregion] = useSearchParamsState('region','32')
    const [focus, setFocus] = useState<string | undefined>(undefined) 

    const chartStyle:CSSProperties = {height:'350px'}

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
                }
            ]
    })

    const {data:data_g2f} = useApi({ 
        resource:"odema:destination_dma_region",
        dataProvider:geo2franceProvider,
        pagination:{
            mode:"off"
        }
    })
   
    const datasankey = (data?.data && alasql(`
        SELECT L_TYP_REG_DECHET, L_TYP_REG_SERVICE, sum(TONNAGE_DMA) as TONNAGE_DMA_sum
        FROM ?
        GROUP BY L_TYP_REG_DECHET, L_TYP_REG_SERVICE
    `, [data.data.filter((e:any) => e.ANNEE == Number(year))])) as SimpleRecord[]


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

    const {data:data_ti, isFetching:isFetching_ti} = useApi({
      resource:"odema:population_tarification_ti_region",
      dataProvider:geo2franceProvider,
      pagination:{ mode: "off" }
  });

    const pop_region = data_chiffre_cle?.data && alasql(`
        SELECT [Annee] as [annee], SUM([VA_POPANNEE]) AS [population]
        FROM ?
        WHERE [C_REGION]='${cregion}'
        GROUP BY [Annee]
    `, [data_chiffre_cle.data])

    const data_typedechet_destination = (data_chiffre_cle?.data && data?.data && pop_region && alasql(
        `SELECT d.*, dc.[VA_POPANNEE], p.[population] AS [VA_POPANNEE_REG]
        FROM ? d
        JOIN ? dc ON dc.[Annee] = d.[ANNEE] AND dc.[C_DEPT]=d.[C_DEPT]
        JOIN ? p ON p.[annee] = d.[ANNEE] AND d.[C_REGION] = '${cregion}'
        `, [ data?.data, data_chiffre_cle?.data, pop_region])) as SimpleRecord[]// Ajoute la population departementale et régionale
 

    const data_tonnage_dma = data_g2f?.data && alasql(
      `SELECT [annee], SUM([kg_par_habitant]) as [ratio], sum([tonnage]) as [tonnage] FROM ? GROUP BY [annee] ORDER BY [annee]`
    ,[data_g2f?.data ]) as SimpleRecord[]
    

    return (
      <DashboardPage
        control={
              <NextPrevSelect
                onChange={(e: any) => (e ? setYear(e) : undefined)}
                reverse={true}
                value={year}
                options={
                  Array.from( { length: maxYear - minYear + 1 }, (_, i) => minYear + i ) //Séquence de minYear à maxYear
                  .filter((num) => num % 2 !== 0) //Seulement les années impaires. A partir de 2025, il est prévu que les enquêtes deviennent annuelles
                  .reverse()
                  .map((i) => ({ label: i, value: i }))}
              />
        }
      
        sections={['Panorama', 'Prévention', 'Valorisation', 'Stockage']}
      >

          <DashboardElement
            isFetching={isFetching}
            title={`Types et destination des déchets en ${year}`} section="Panorama"
            attributions={[
              {
                name: "Ademe",
                url: "https://data.ademe.fr/datasets/sinoe-(r)-destination-des-dma-collectes-par-type-de-traitement",
              },
            ]}
          >
            {datasankey && (
              <ChartSankeyDestinationDMA
                style={chartStyle}
                onFocus={(e: any) => setFocus(e?.name)}
                focus_item={focus}
                data={datasankey.map((i: SimpleRecord) => ({
                  value: Math.max(i.TONNAGE_DMA_sum, 1),
                  source: i.L_TYP_REG_DECHET,
                  target: i.L_TYP_REG_SERVICE === 'Stockage pour inertes' ? 'Stockage' : i.L_TYP_REG_SERVICE,
                }))}
              />
            )}
          </DashboardElement>

          <DashboardElement
            isFetching={isFetching}
            title={`Type de déchets collectés`} section="Panorama"
            attributions={[
              {
                name: "Ademe",
                url: "https://data.ademe.fr/datasets/sinoe-(r)-destination-des-dma-collectes-par-type-de-traitement",
              },
            ]}
          >
            {data_typedechet_destination && (
              <ChartEvolutionDechet
                data={data_typedechet_destination.map((e: SimpleRecord) => ({
                  tonnage: e.TONNAGE_DMA,
                  annee: e.ANNEE,
                  type: e.L_TYP_REG_DECHET,
                  population: e.VA_POPANNEE_REG,
                }))}
                onFocus={(e: any) => setFocus(e?.seriesName)}
                focus_item={focus}
                year={Number(year)}
                showObjectives={false}
              />
            )}
        </DashboardElement>

        <DashboardElement
            title="Performances de collecte" section="Panorama"
            isFetching={isFetching_chiffre_cle && isFetching_performance}
            attributions={[
              {
                name: "Ademe",
                url: "https://data.ademe.fr/datasets/sinoe-(r)-repartition-des-tonnages-de-dma-collectes-par-type-de-collecte",
              },
            ]}
          >
          
            {data_performance && data_chiffre_cle && (
              <ChartCollectePerformance
                style={chartStyle}
                data={data_performance.data}
                data_territoire={data_chiffre_cle.data.filter(
                  (e: any) => e.Annee == year
                )}
              />
            )}
        </DashboardElement>

        <DashboardElement
            title="Ratio régionaux" section="Panorama"
            isFetching={isFetching_chiffre_cle && isFetching_performance}
            attributions={[
              {
                name: "Ademe",
                url: "https://data.ademe.fr/datasets/sinoe-indicateurs-chiffres-cles-dma-hors-gravats-2009-2017",
              },
            ]}
          >
            {data_chiffre_cle && (
              <ChartRaceBareDMA
                style={chartStyle}
                data={data_chiffre_cle.data.filter(
                  (e: any) => e.Annee == year
                )}
                highlight_region={cregion}
              />
            )}
        </DashboardElement>

        <DashboardElement
            isFetching={isFetching}
            description= {<Text type="secondary">L'objectif régional est d'arriver à une production de <b>564 kg/hab en 2025</b> et{' '}
            <b>541 kg/hab en 2030</b>.</Text> }
            title={`Production de DMA par habitant et objectif régional`} section="Prévention"
            attributions={[
              {
                name: "Ademe (Sinoe)",
                url: "https://www.sinoe.org/",
              },
              {
                name: "Odema",
                url: "https://odema-hautsdefrance.org/",
              },
            ]}>
          {data_tonnage_dma && <ChartEvolutionObjectifs 
                data={data_tonnage_dma.map((e: SimpleRecord) => ({
                  annee: e.annee,
                  ratio: e.ratio,
                  tonnage: e.tonnage,
                }))}
                dataObjectifs={[{annee:2009, ratio:620}, {annee:2025, ratio:558}, {annee:2030, ratio:527}]}
                year={Number(year)}
              /> }
          </DashboardElement>

        <DashboardElement
            title="Tarification incitative sur la collecte des OMR"
            description="Tarification incitative : mode de tarification qui comprend une part incitative sur les OMR.
            Cette part peut concerner le volume de déchets et/ou le nombre de levées."
            isFetching={isFetching_ti}  section="Prévention"
            attributions={[
              {
                name: "Odema",
                url: "https://www.geo2france.fr/datahub/dataset/891b801c-6196-42bc-99fd-e84663eaaa2f",
              },
            ]}
          >
            {data_ti && (
              <ChartEvolutionPopTi
                style={chartStyle}
                data={data_ti.data}
                year={Number(year)}
              />
            )}
             <p style={{marginLeft:16}}>La région contribue à l'<b>objectif national</b> de <b>25 millions d'habitants couverts en 2025</b>.</p>
        </DashboardElement>

        <DashboardElement
        title = "Territoires en tarification incitative sur la collecte des OMR" section="Prévention">
          <MapTI></MapTI>
        </DashboardElement>

          <DashboardElement
            isFetching={isFetching}
            title={`Destination des déchets`} section="Valorisation"
            attributions={[
              {
                name: "Ademe",
                url: "https://data.ademe.fr/datasets/sinoe-(r)-destination-des-dma-collectes-par-type-de-traitement",
              },
            ]}
          >
            {data_typedechet_destination && (
              <ChartEvolutionDechet
                data={data_typedechet_destination.map((e: SimpleRecord) => ({
                  tonnage: e.TONNAGE_DMA,
                  annee: e.ANNEE,
                  type: e.C_TYP_REG_SERVICE === '02F' ? 'Stockage' : e.L_TYP_REG_SERVICE, // Stockage inertes -> Stockage
                  population: e.VA_POPANNEE_REG,
                }))}
                onFocus={(e: any) => setFocus(e?.seriesName)}
                focus_item={focus}
                year={Number(year)}
                normalize
              />
            )}
          </DashboardElement>

          <DashboardElement
            isFetching={isFetching}
            title={`Taux de valorisation matière des DMA`} section="Valorisation"
            description= {undefined}
            attributions={[
              {
                name: "Ademe",
                url: "https://data.ademe.fr/datasets/sinoe-(r)-destination-des-dma-collectes-par-type-de-traitement",
              },
            ]}
          >
            {data_typedechet_destination && (
              <ChartTauxValo
                data={data_typedechet_destination.map((e: SimpleRecord) => ({
                  tonnage: e.TONNAGE_DMA,
                  annee: e.ANNEE,
                  type: e.L_TYP_REG_SERVICE,
                  population: e.VA_POPANNEE_REG,
                }))}
                onFocus={(e: any) => setFocus(e?.seriesName)}
                focus_item={focus}
                year={Number(year)}
                showObjectives
              />
            )}
          </DashboardElement>

          <DashboardElement
            isFetching={isFetching}
            title={`Part de DMA admis en stockage`} section="Stockage"
            description= {"Objectif : Limiter à 10% des DMA admis en installations de stockage d’ici à 2035"}
            attributions={[
              {
                name: "Ademe",
                url: "https://data.ademe.fr/datasets/sinoe-(r)-destination-des-dma-collectes-par-type-de-traitement",
              },
            ]}
          >
            {data_typedechet_destination && (
              <ChartDmaStockage
                data={data_typedechet_destination.map((e: SimpleRecord) => ({
                  tonnage: e.TONNAGE_DMA,
                  annee: e.ANNEE,
                  type: e.L_TYP_REG_SERVICE,
                  population: e.VA_POPANNEE_REG,
                }))}
                onFocus={(e: any) => setFocus(e?.seriesName)}
                focus_item={focus}
                year={Number(year)}
                showObjectives
              />
            )}
          </DashboardElement>

      </DashboardPage>

    );
};
