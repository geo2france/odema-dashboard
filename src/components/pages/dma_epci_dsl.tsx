import { Card, Col, Descriptions, DescriptionsProps, FloatButton, Modal, Row, Typography } from "antd"
import { ChartSankeyDestinationDMA } from "../chart_sankey_destination"
import { FilePdfOutlined, InfoCircleOutlined } from "@ant-design/icons"
import alasql from "alasql"
import { BsRecycle } from "react-icons/bs";
import { useMemo, useState } from "react"
import { FaPeopleGroup, FaHouseFlag , FaTrashCan } from "react-icons/fa6";
import { TbReportMoney } from "react-icons/tb";
import { DashboardElement, NextPrevSelect, KeyFigure, useSearchParamsState, FlipCard, SimpleRecord, DashboardPage, useApi } from "@geo2france/api-dashboard"
import { ChartEvolutionDechet } from "../chart_evolution_dechet"
import { grey } from '@ant-design/colors';
import { geo2franceProvider } from "../../App"
import { ChartCoutEpci, ChartCoutEpciDescription } from "../chart_cout_epci/ChartCoutEpci";
import { CompetenceBadge, CompetencesExercees } from "../competence_badge/CompetenceBadge";
import { Control, Dashboard, Dataset, Filter, useControl, Select} from "@geo2france/api-dashboard/dsl";

const [maxYear, minYear, defaultYear] = [2023,2009,2023]

export const DmaPageEPCI_dsl: React.FC = () => {
   


    return (<Dashboard debug>
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

     <div>{useControl("siren_epci")}</div>
    </Dashboard>
    );
}