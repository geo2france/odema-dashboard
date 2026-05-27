import { Card, Descriptions, DescriptionsProps } from "antd"
import { ChartSankeyDestinationDMA } from "../chart_sankey_destination"
import { FaPeopleGroup, FaHouseFlag } from "react-icons/fa6";
import { PageProps, SimpleRecord } from "@geo2france/api-dashboard"
import { ChartEvolutionDechet } from "../chart_evolution_dechet"
import { ChartCoutEpci } from "../chart_cout_epci/ChartCoutEpci";
import { Control, Dashboard, Dataset, Filter, useControl, Select, useDataset, StatisticsCollection, Statistics, Transform, Producer, Palette, Section} from "@geo2france/api-dashboard/dsl";
import { DMA_colors_labels } from "./dma";
import { ChartRPQS } from "../chart_rpqs/rpqs";
import { ChartGisementDechet } from "../chart_gisement_dechet/ChartGisementDechet";

const [maxYear, minYear, defaultYear] = [2023,2009,2023]

export const DmaPageEPCI: React.FC<PageProps> = () => {
    const siren_epci = useControl('siren_epci')
    const current_epci = useDataset('data_territoire')?.data?.find(r => r.siren == siren_epci) // Info sur l'EPCI sélectionné

    //EPCI exerçant les compétence (lui-même ou syndicat)
    const siren_delegation = [
        ...extractSirens( current_epci?.epci_collecte ),
        ...extractSirens( current_epci?.epci_traitement), 
        ...extractSirens( current_epci?.epci_dechetterie )]


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
        }
    ]

    return (<Dashboard debug>
      <Palette labels={ DMA_colors_labels } />
      
      <Control>
          <Select
                name="annee" label="Année"
                arrows
                reverse={true}
                defaultValue={String(defaultYear)}
                options={
                  Array.from( { length: maxYear - minYear + 1 }, (_, i) => minYear + i ) //Séquence de minYear à maxYear
                  .filter((num) => num % 2 !== 0) //Seulement les années impaires. A partir de 2025, il est prévu que les enquêtes deviennent annuelles
                  .reverse()
                  .map((i) => ({ label: String(i), value: String(i) }))}
              />
          <Select 
            name="siren_epci" label="Territoire"
            showSearch
            dataset="data_territoire"
            valueField="siren" labelField="name_select" 
            style={{minWidth: 300}}
            />

      </Control>

      <Dataset
          id="data_territoire" 
          type="wfs"
          url="https://www.geo2france.fr/geoserver/odema/ows"
          resource="odema:territoire_epci"
          meta={{
            properties:["annee", "name", "name_short", "siren", "population", "nb_communes", 
                "population_collecte", "population_traitement", "population_dechetterie",
                "epci_traitement", "epci_collecte", "epci_dechetterie"]
          }}  
      >
        <Filter field="annee">{useControl("annee")}</Filter> 
        <Transform>{ (data:SimpleRecord[]) => 
            data.map( row => ({name_select: abbreviateEPCIname(`${row.name} - ${row.name_short}`) ,...row}) ) 
            .sort( (a,b) => a.name_select > b.name_select ? 1 : -1)
            }
            </Transform>
     </Dataset>

      <Dataset
          id="data_traitement" 
          type="wfs"
          url="https://www.geo2france.fr/geoserver/odema/ows"
          resource="odema:destination_dma_epci_harmonise_V2"
      >
        <Filter field="epci_siren">{useControl("siren_epci")}</Filter>
        <Transform>{ (data:SimpleRecord[]) => data.map((row) => ({
            ...row,
            lib_dechet_1:row.lib_dechet.split(' > ')[0],
            lib_dechet_2:row.lib_dechet.split(' > ')[1],
            lib_dechet_3:row.lib_dechet.split(' > ')[2]
        }))}</Transform>
     </Dataset>

    <Dataset
          id="indicateur_territoire" 
          type="wfs"
          url="https://www.geo2france.fr/geoserver/odema/ows"
          resource="odema:destination_dma_epci_harmonise_V2"
      >
        <Filter field="epci_siren">{useControl("siren_epci")}</Filter>
        <Filter field="annee">{useControl("annee")}</Filter>
        <Transform>SELECT 
                    [annee],
                    SUM([tonnage]) as tonnage,
                    MAX([population]) as population,
                    1000 * SUM([tonnage]) / MAX([population]) as ratio_dma,
                    100*SUM(CASE WHEN [lib_traitement_agregat_collecte] ilike 'Valorisation%' THEN [tonnage] END) / SUM([tonnage]) as part_valo
                  FROM ? 
                  GROUP BY [annee]
                  ORDER BY [annee]
        </Transform>
    </Dataset>

    <Dataset
          id="current_trash_composition" 
          type="wfs"
          url="https://www.geo2france.fr/geoserver/odema/ows"
          resource="odema:destination_dma_epci_harmonise_V2"
      >
        <Filter field="epci_siren">{useControl("siren_epci")}</Filter>
        <Filter field="annee">{useControl("annee")}</Filter>
        <Transform>
            SELECT [lib_dechet_agregat_dma] as type_dechet, sum(ratio_hab_pap) as ratio
            FROM ?
            GROUP BY [lib_dechet_agregat_dma]
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
        resource="odema:destination_dma_epci_harmonise_V2"    
    >
        <Filter field="epci_siren">{useControl("siren_epci")}</Filter>
        <Transform>{`SELECT lib_dechet AS type_dechet, lib_traitement_agregat_collecte AS traitement_destination, sum(tonnage) as tonnage
            FROM ?
            WHERE [annee]= ${useControl("annee")}
            GROUP BY [lib_dechet], [lib_traitement_agregat_collecte]`}</Transform>
        {/* A simplifier */} 
        <Transform>
            {data => data.map((i: SimpleRecord) => ({
                          value: Math.max(i.tonnage, 1),
                          source: i.type_dechet.split(' > ')[0],
                          target: i.traitement_destination === 'Stockage pour inertes' ? 'Stockage' : i.traitement_destination,}))}
        </Transform>
        <Transform>
            SELECT 
                [source], [target], SUM([value]) as [value]
            FROM ? 
            GROUP BY [source], [target]
        </Transform>
        <Producer url="https://sinoe.org">Ademe (Sinoe)</Producer>
        <Producer url="https://odema-hautsdefrance.org/">Odema</Producer>
    </Dataset>

    <Dataset
          id="rpqs" 
          type="wfs"
          url="https://www.geo2france.fr/geoserver/odema/ows"
          resource="odema:rpqs"
      >
        <Filter field="annee_exercice">{useControl("annee")}</Filter>
        <Transform>{ (data:SimpleRecord[]) => data.filter(row => siren_delegation.includes(row.code_epci) ) }</Transform>
     </Dataset>

    <Section title="Panorama">
        <Card styles={{header:{padding: 5,paddingLeft: 15, fontSize: 14, minHeight: 35}, body:{height:"100%", padding:0} }} title="Territoire">
        <Descriptions
                items={territoire_descritpion_item}
                style={{ marginTop: 5, padding:8 }}
            />
        </Card>

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

        {/*<ChartTrashbin dataset="current_trash_composition" /> */}
        <ChartGisementDechet title="Gisement collecté" dataset="data_traitement" />
        <ChartRPQS dataset="rpqs" year={Number(useControl('annee'))} />

    </Section>
    <Section title="Traitement">
      <ChartEvolutionDechet  dataset="data_traitement" title="Type de déchets collectés"
                         yearKey="annee" categoryKey="lib_dechet_1" ratioKey="ratio_hab"
                         tonnageKey="tonnage"
                         year={Number(useControl('annee'))}
                        />

      <ChartEvolutionDechet  dataset="data_traitement" title="Filières de destination"
                         yearKey="annee" categoryKey="lib_traitement_agregat_collecte" ratioKey="ratio_hab"
                         tonnageKey="tonnage"
                         year={Number(useControl('annee'))}
                        />
    </Section>
    <Section title="Coûts">
      <ChartCoutEpci dataset="couts_epci"/>
    </Section>

    </Dashboard>
    );
}


/**
 * Transforme (abrège) certains noms d’EPCI en remplaçant des libellés longs
 * par leur forme courte (ex: "communauté de communes" → "CC").
 *
 * Les règles de transformation sont définies directement dans la fonction
 * et peuvent être enrichies facilement.
 *
 * @remarks Cette fonction a été générée avec l’aide d’une IA.
 */
const abbreviateEPCIname = (input: string): string =>
  Object.entries({
    "communauté de communes": "CC",
    "communauté d'agglomération": "CA",
    "communauté urbaine": "CU",
  }).reduce((result, [key, value]) => {
    const regex = new RegExp(`\\b${key}\\b`, "gi");
    return result.replace(regex, value);
  }, input);


  /**
 * Extrait tous les numéros SIREN (9 chiffres) présents entre crochets `[...]`
 * dans une chaîne de caractères.
 *
 * Exemple :
 * "Nom organisme [123456789] ; Autre [987654321]"
 * => ["123456789", "987654321"]
 *
 * Si aucun SIREN n'est trouvé, retourne un tableau vide.
 *
 * @param input - Chaîne contenant potentiellement des SIREN entre crochets
 * @returns Liste des SIREN extraits (tableau vide si aucun trouvé)
 *
 * @remarks
 * Fonction générée par IA.
 */
const extractSirens = (input: string): string[] =>
  Array.from(input?.matchAll(/\[(\d{9})\]/g) ?? [], m => m[1]);