import { Card, Col, Descriptions, DescriptionsProps, FloatButton, Modal, Row, Typography } from "antd"
import { ChartSankeyDestinationDMA } from "../chart_sankey_destination/dsl"
import { FilePdfOutlined, InfoCircleOutlined } from "@ant-design/icons"
import alasql from "alasql"
import { BsRecycle } from "react-icons/bs";
import { useMemo, useState } from "react"
import { FaPeopleGroup, FaHouseFlag , FaTrashCan } from "react-icons/fa6";
import { TbReportMoney } from "react-icons/tb";
import { DashboardElement, NextPrevSelect, KeyFigure, useSearchParamsState, FlipCard, SimpleRecord, DashboardPage, useApi } from "@geo2france/api-dashboard"
import { ChartEvolutionDechet } from "../chart_evolution_dechet/dsl"
import { grey } from '@ant-design/colors';
import { geo2franceProvider } from "../../App"
import { ChartCoutEpci, ChartCoutEpciDescription } from "../chart_cout_epci/ChartCoutEpci_dsl";
import { CompetenceBadge, CompetencesExercees } from "../competence_badge/CompetenceBadge";
import { Control, Dashboard, Dataset, Filter, useControl, Select, useDataset, StatisticsCollection, Statistics, Transform, Producer, Palette} from "@geo2france/api-dashboard/dsl";
import { chartBusinessProps } from "../../utils";
import { DMA_colors_labels } from "./dma_dsl";
import { ChartRPQS } from "../chart_rpqs/rpqs";

const [maxYear, minYear, defaultYear] = [2023,2009,2023]

export const DmaPageEPCI_dsl: React.FC = () => {
    //console.log('poeutte',useDataset('data_territoire'))
    const siren_epci = useControl('siren_epci')
    const current_epci = useDataset('data_territoire')?.data?.find(r => r.siren == siren_epci) // Info sur l'EPCI sélectionné
   // console.log(current_epci)

    const competences:CompetencesExercees={
      'collecte':current_epci?.population_collecte / current_epci?.population,
      'traitement':current_epci?.population_traitement / current_epci?.population,
      'dechetterie':current_epci?.population_dechetterie / current_epci?.population,
    } //Exercice total (1), partiel ( 0 < X < 1) ou sans compétence (0)

    const territoire_descritpion_item : DescriptionsProps['items'] = [
        {
            key:'name',
            label:'Nom',
            children:current_epci?.name
        },
        {
            key:'siret',
            label:'SIREN',
            children:siren_epci
        },
        {
            key:'population',
            label:'Pop.',
            children:<> {current_epci?.population?.toLocaleString()} &nbsp;<FaPeopleGroup /></>
        },
        {
            key:'nb_communes',
            label:'Communes',
            children:<> {current_epci?.nb_communes.toLocaleString()} &nbsp;<FaHouseFlag /></>
        },
        {
          key:'competences',
          label:'Compétences',
          children:<CompetenceBadge competences={competences} />
        }
    ]

    return (<Dashboard debug>
      <Palette steps={['red','green','blue']} labels={ DMA_colors_labels } />
      
      <Control>
          <NextPrevSelect
                name="annee"
                reverse={true}
                defaultValue={defaultYear}
                options={
                  Array.from( { length: maxYear - minYear + 1 }, (_, i) => minYear + i ) //Séquence de minYear à maxYear
                  .filter((num) => num % 2 !== 0) //Seulement les années impaires. A partir de 2025, il est prévu que les enquêtes deviennent annuelles
                  .reverse()
                  .map((i) => ({ label: i, value: i }))}
              />
          <Select 
            name="siren_epci"
            showSearch
            dataset="data_territoire"
            valueField="siren" labelField="name" />

      </Control>

      <Dataset
          id="data_territoire" 
          type="wfs"
          url="https://www.geo2france.fr/geoserver/odema/ows"
          resource="odema:territoire_epci"
          meta={{
            properties:["annee", "name", "name_short", "siren", "population", "nb_communes", "population_collecte", "population_traitement", "population_dechetterie"]
          }}  
      >
        <Filter field="annee">{useControl("annee")}</Filter>   
     </Dataset>

      <Dataset
          id="data_traitement" 
          type="wfs"
          url="https://www.geo2france.fr/geoserver/odema/ows"
          resource="odema:destination_dma_epci_harmonise"
      >
        <Filter field="siren_epci">{useControl("siren_epci")}</Filter>
     </Dataset>

    <Dataset
          id="indicateur_territoire" 
          type="wfs"
          url="https://www.geo2france.fr/geoserver/odema/ows"
          resource="odema:destination_dma_epci_harmonise"
      >
        <Filter field="siren_epci">{useControl("siren_epci")}</Filter>
        <Transform>SELECT 
                    [annee],
                    SUM([tonnage]) as tonnage,
                    MAX([population]) as population,
                    1000 * SUM([tonnage]) / MAX([population]) as ratio_dma,
                    100*SUM(CASE WHEN traitement_destination ilike 'Valorisation%' THEN tonnage END) / SUM([tonnage]) as part_valo
                  FROM ? 
                  GROUP BY [annee]
                  ORDER BY [annee]
        </Transform>
    </Dataset>

    <Dataset
          id="tarification_ti" 
          type="wfs"
          url="https://www.geo2france.fr/geoserver/odema/ows"
          resource="odema:population_tarification_ti_epci"
      >
        <Filter field="epci_siren">{useControl("siren_epci")}</Filter>
        <Transform>SELECT * FROM ? order by annee</Transform>
     </Dataset>


    <Dataset
          id="couts_epci" 
          type="wfs"
          url="https://www.geo2france.fr/geoserver/odema/ows"
          resource="odema:couts_epci"
      >
        <Filter field="epci_siren">{useControl("siren_epci")}</Filter>
        <Transform>SELECT * FROM ? order by annee</Transform>
     </Dataset>

    <Dataset
        id="destination_dma_sankey" 
        type="wfs"
        url="https://www.geo2france.fr/geoserver/odema/ows"
        resource="odema:destination_dma_epci_harmonise"    
    >
        <Filter field="siren_epci">{useControl("siren_epci")}</Filter>
        <Transform>{`SELECT type_dechet, traitement_destination, sum(tonnage) as tonnage
            FROM ?
            WHERE [annee]= ${useControl("annee")}
            GROUP BY [type_dechet], [traitement_destination]`}</Transform>
        {/* A simplifier */} 
        <Transform>
            {data => data.map((i: SimpleRecord) => ({
                          value: Math.max(i.tonnage, 1),
                          source: i.type_dechet,
                          target: i.traitement_destination === 'Stockage pour inertes' ? 'Stockage' : i.traitement_destination,}))}
        </Transform>
        <Producer url="https://sinoe.org">Ademe (Sinoe)</Producer>
        <Producer url="https://odema-hautsdefrance.org/">Odema</Producer>
    </Dataset>

      <Dataset
          id="rpqs" 
          type="wfs"
          url="https://www.geo2france.fr/geoserver/odema/ows"
          resource="odema:rqps"
      >
        <Filter field="code_epci">{useControl("siren_epci")}</Filter>
     </Dataset>


    <DashboardElement title="Territoire">
      <Descriptions
            items={territoire_descritpion_item}
            style={{ marginTop: 5, padding:8 }}
        />
    </DashboardElement>

    <StatisticsCollection title="Indicateurs">

      <Statistics title="Taux de valorisation" unit="%" dataset="indicateur_territoire" dataKey="part_valo" icon="fa7-solid:recycle" 
      valueFormatter={(p) => p.value.toLocaleString(undefined, {maximumFractionDigits:1})} color={"#f7e11cff"}
      annotation=""/>
      
      <Statistics title="Production de DMA" unit="kg/hab" dataset="indicateur_territoire" dataKey="ratio_dma" icon="famicons:trash" 
      valueFormatter={(p) => p.value.toLocaleString(undefined, {maximumFractionDigits:0})}
      invertColor annotation=""/>
      
      <Statistics title="Part de la population en TI" unit="%" dataset="tarification_ti" dataKey="part_pop_ti" icon="tabler:report-money" 
      valueFormatter={(p) => (p.value*100).toLocaleString(undefined, {maximumFractionDigits:0})}
      annotation="" color="#bd4cbdff"/>
      
    </StatisticsCollection>

    <ChartSankeyDestinationDMA 
        title={`Types et destination des déchets en ${useControl("annee")}`} 
        dataset="destination_dma_sankey" />


      <ChartEvolutionDechet  dataset="data_traitement" title="Type de déchets collectés"
                         yearKey="annee" categoryKey="type_dechet" ratioKey="ratio_hab"
                         tonnageKey="tonnage"
                         year={Number(useControl('annee'))}
                        />

      <ChartEvolutionDechet  dataset="data_traitement" title="Type de déchets collectés"
                         yearKey="annee" categoryKey="traitement_destination" ratioKey="ratio_hab"
                         tonnageKey="tonnage"
                         year={Number(useControl('annee'))}
                        />

      <ChartRPQS dataset="rpqs" year={Number(useControl('annee'))} />

      <ChartCoutEpci dataset="couts_epci"/>

    </Dashboard>
    );
}