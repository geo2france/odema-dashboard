import React, { CSSProperties, useState } from "react";
import { Typography } from 'antd';
import { ChartSankeyDestinationDMA } from "../chart_sankey_destination";

import alasql from "alasql";
import { useSearchParamsState, DashboardElement, NextPrevSelect, SimpleRecord, DashboardPage, useApi } from "@geo2france/api-dashboard";
import { ChartEvolutionDechet } from "../chart_evolution_dechet";
import { geo2franceProvider } from "../../App";
import { ChartEvolutionPopTi } from "../chart_evolution_pop_ti";
import { ChartEvolutionObjectifs } from "../chart_evolution_objectif/ChartEvolutionObjectif";
import { ChartTauxValo } from "../chart_taux_valo/ChartTauxValo";
import { ChartDmaStockage } from "../chart_dma_stockage/ChartDmaStockage";
import { MapTI } from "../map_ti/mapTi";

const {Text} = Typography;
const [maxYear, minYear, defaultYear] = [2023,2009,2021]

const attribution_odema_ademe = [
              {
                name: "Ademe (Sinoe)",
                url: "https://www.sinoe.org/",
              },
              {
                name: "Odema",
                url: "https://odema-hautsdefrance.org/",
              },
            ]

export const DmaComponent: React.FC = () => {
    const [year, setYear] = useSearchParamsState('year',defaultYear.toString())
    const [focus, setFocus] = useState<string | undefined>(undefined) 

    const chartStyle:CSSProperties = {height:'350px'}

    const {data:data_g2f, isFetching} = useApi({ 
        resource:"odema:destination_dma_region",
        dataProvider:geo2franceProvider,
        pagination:{
            mode:"off"
        }
    })
   
    const datasankey = (data_g2f?.data && alasql(`
        SELECT [libel_dechet] as L_TYP_REG_DECHET, [libel_traitement] as L_TYP_REG_SERVICE, sum(tonnage) as TONNAGE_DMA_sum
        FROM ?
        GROUP BY [libel_dechet], [libel_traitement]
    `, [data_g2f.data.filter((e:any) => e.annee == Number(year))])) as SimpleRecord[];

    const data_performance = (data_g2f?.data && alasql(`
      SELECT
        [annee],
        CASE WHEN [source_collecte] = 'DECHETERIE' THEN 'Déchèterie'
             WHEN [source_collecte] = 'COLLECTE' AND [libel_dechet] = 'Ordures ménagères résiduelles' THEN 'Collecte OMR'
             ELSE 'Collecte séparées' END as [TYP_COLLECTE],
        SUM([tonnage]) as [tonnage],
        SUM([kg_par_habitant]) as [ratio]
      FROM ?
      GROUP BY  
        [annee],  
        CASE WHEN [source_collecte] = 'DECHETERIE' THEN 'Déchèterie'
             WHEN [source_collecte] = 'COLLECTE' AND [libel_dechet] = 'Ordures ménagères résiduelles' THEN 'Collecte OMR'
             ELSE 'Collecte séparées' END
      `,[data_g2f.data]) ) as SimpleRecord[]


      const {data:data_ti, isFetching:isFetching_ti} = useApi({
      resource:"odema:population_tarification_ti_region",
      dataProvider:geo2franceProvider,
      pagination:{ mode: "off" }
  });


    const data_typedechet_destination = (data_g2f?.data && alasql(
        `SELECT [annee] as [ANNEE], [libel_dechet] as L_TYP_REG_DECHET, [libel_traitement] as L_TYP_REG_SERVICE, sum(tonnage) as TONNAGE, sum([kg_par_habitant]) as RATIO
        FROM ?
        GROUP BY [annee], [libel_dechet], [libel_traitement]
        `, [ data_g2f.data ])) as SimpleRecord[]// Ajoute la population departementale et régionale
 

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
            attributions={attribution_odema_ademe}
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
            attributions={attribution_odema_ademe}
          >
            {data_typedechet_destination && (
              <ChartEvolutionDechet
                data={data_typedechet_destination.map((e: SimpleRecord) => ({
                  tonnage: e.TONNAGE,
                  annee: e.ANNEE,
                  type: e.L_TYP_REG_DECHET,
                  ratio: e.RATIO
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
            isFetching={isFetching }
            attributions={attribution_odema_ademe}
          >
          
            {data_performance && (
              <ChartEvolutionDechet
                style={chartStyle}
                data={data_performance.map((e: SimpleRecord) => ({
                  tonnage: e.tonnage,
                  annee: e.annee,
                  type: e.TYP_COLLECTE,
                  ratio: e.ratio
                }))}
              />
            )}
        </DashboardElement>


        <DashboardElement
            isFetching={isFetching}
            description= {<Text type="secondary">L'objectif régional est d'arriver à une production de <b>564 kg/hab en 2025</b> et{' '}
            <b>541 kg/hab en 2030</b>.</Text> }
            title={`Production de DMA par habitant et objectif régional`} section="Prévention"
            attributions={ attribution_odema_ademe } >
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
            attributions={ attribution_odema_ademe }
          >
            {data_typedechet_destination && (
              <ChartEvolutionDechet
                data={data_typedechet_destination.map((e: SimpleRecord) => ({
                  tonnage: e.TONNAGE,
                  annee: e.ANNEE,
                  type: e.C_TYP_REG_SERVICE === '02F' ? 'Stockage' : e.L_TYP_REG_SERVICE, // Stockage inertes -> Stockage
                  ratio: e.RATIO
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
            attributions={ attribution_odema_ademe }
          >
            {data_typedechet_destination && (
              <ChartTauxValo
                data={data_typedechet_destination.map((e: SimpleRecord) => ({
                  tonnage: e.TONNAGE,
                  annee: e.ANNEE,
                  type: e.L_TYP_REG_SERVICE
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
            attributions={ attribution_odema_ademe }
          >
            {data_typedechet_destination && (
              <ChartDmaStockage
                data={data_typedechet_destination.map((e: SimpleRecord) => ({
                  tonnage: e.TONNAGE,
                  annee: e.ANNEE,
                  type: e.L_TYP_REG_SERVICE
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
