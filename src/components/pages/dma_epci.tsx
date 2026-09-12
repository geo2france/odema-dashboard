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
import { FicheIndicateur } from "../indicateur/FicheIndicateur";

const [maxYear, minYear, defaultYear] = [2024,2017,2024]

export const DmaPageEPCI: React.FC<PageProps> = () => {
    const siren_epci = useControl('siren_epci')
    const current_epci = useDataset('data_territoire')?.data?.find(r => r.siren == siren_epci) // Info sur l'EPCI sélectionné
    const annee = useControl("annee")
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

    return (<Dashboard>
      <Palette labels={ DMA_colors_labels } />
      
      <Control>
          <Select
                name="annee" label="Année"
                arrows
                reverse={true}
                defaultValue={String(defaultYear)}
                options={
                  Array.from( { length: maxYear - minYear + 1 }, (_, i) => minYear + i ) //Séquence de minYear à maxYear
                  .filter((year) => year >= 2024 || year % 2 !== 0) //Seulement les années impaires avant 2024
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
          resource="odema:destination_dma_epci_harmonise"
      >
        <Filter field="epci_siren">{useControl("siren_epci")}</Filter>
        <Transform>{ (data:SimpleRecord[]) => data.map((row) => ({
            ...row,
            lib_dechet_1:row.lib_dechet.split(' > ')[0],
            lib_dechet_2:row.lib_dechet.split(' > ')[1],
            lib_dechet_3:row.lib_dechet.split(' > ')[2],
            lib_traitement_1:row.lib_traitement.split(' > ')[0],
            lib_traitement_2:row.lib_traitement.split(' > ')[0],
            lib_traitement_3:row.lib_traitement.split(' > ')[0],
        }))}</Transform>
     </Dataset>

    <Dataset
          id="indicateur_territoire" 
          type="wfs"
          url="https://www.geo2france.fr/geoserver/odema/ows"
          resource="odema:destination_dma_epci_harmonise"
      >
        <Filter field="epci_siren">{useControl("siren_epci")}</Filter>
        <Filter field="annee">{useControl("annee")}</Filter>
        <Transform>SELECT 
                    [annee],
                    SUM([tonnage]) as tonnage,
                    MAX([population]) as population,
                    1000 * SUM([tonnage]) / MAX([population]) as ratio_dma,
                    100*SUM(CASE WHEN [lib_traitement] ilike 'Valorisation%' 
                        AND [lib_traitement] not ilike 'Incin_ration%'
                         AND [lib_traitement] not ilike '%valorisation _nerg_tique%' 
                        THEN [tonnage] END) / SUM([tonnage]) as part_valo
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
        <Filter field="annee">{useControl("annee")}</Filter>
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
        <Filter field="epci_siren">{useControl("siren_epci")}</Filter>
        <Transform>{`SELECT lib_dechet AS type_dechet, lib_traitement AS traitement_destination, sum(tonnage) as tonnage
            FROM ?
            WHERE [annee]= ${useControl("annee")}
            GROUP BY [lib_dechet], [lib_traitement]`}</Transform>
        {/* A simplifier */} 
        <Transform>
            {data => data.map((i: SimpleRecord) => ({
                          value: Math.max(i.tonnage, 1),
                          source: i.type_dechet == 'Non précisé' ? 'Déch. non précisé' : i.type_dechet.split(' > ')[0], // Eviter bug avec "Non précisé" en source et target
                          target: i.traitement_destination?.split(' > ')[0]}))}
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

     <Dataset
        id="ind_ratio_dma_pr_2017"
        type="file"
        url="data/"
        resource="epci_ind_ratio_dma_pr_2017.json"
     >
        <Transform>{ (data:SimpleRecord[]) => data.filter(row => row.geocode_epci == siren_epci 
            && row.annee <= (annee || 9999)
            ) }</Transform>

     </Dataset>

    <Section title="Panorama">
        <Card styles={{header:{padding: 5,paddingLeft: 15, fontSize: 14, minHeight: 35}, body:{height:"100%", padding:0} }} title="Territoire">
        <Descriptions
                items={territoire_descritpion_item}
                style={{ marginTop: 5, padding:8 }}
            />
        </Card>

        <StatisticsCollection title="Indicateurs">
        <Statistics title="Taux de valorisation matière" unit="%" dataset="indicateur_territoire" dataKey="part_valo" icon="fa7-solid:recycle" 
        valueFormatter={(p) => p.value.toLocaleString(undefined, {maximumFractionDigits:1})} color={"#f7e11cff"}
        annotation="" help="Valorisation matières (y.c. organique)"/>
        
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
                         yearKey="annee" categoryKey="lib_traitement_1" ratioKey="ratio_hab"
                         tonnageKey="tonnage"
                         year={Number(useControl('annee'))}
                        />
    </Section>
    <Section title="Coûts">
      <ChartCoutEpci dataset="couts_epci"/>
    </Section>

    <Section title="Indicateur">
        <FicheIndicateur title="Réduire la production de DMA" dataset="ind_ratio_dma_pr_2017" valueKey="ratio_dma_pr_2017"
        dateKey="annee" //year={useControl("annee")}
        unit="kg/hab"
        goalDataset={[{annee:2017,ratio_dma_pr_2017:0},{annee:2030,ratio_dma_pr_2017:-15}]}
        />
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