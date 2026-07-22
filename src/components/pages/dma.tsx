import { NextPrevSelect, PageProps, SimpleRecord } from "@geo2france/api-dashboard"
import { Control, Dashboard, Dataset, Palette, Producer, Section, Transform, useControl } from "@geo2france/api-dashboard/dsl"
import { ChartSankeyDestinationDMA } from "../chart_sankey_destination"
import { chartBusinessProps } from "../../utils"
import { ChartEvolutionObjectifs } from "../chart_evolution_objectif/ChartEvolutionObjectif"
import { ChartEvolutionPopTi } from "../chart_evolution_pop_ti"
import { MapTI } from "../map_ti/mapTi"
import { ChartEvolutionDechet } from "../chart_evolution_dechet"
import { ChartTauxValo } from "../chart_taux_valo/ChartTauxValo"
import { ChartDmaStockage } from "../chart_dma_stockage/ChartDmaStockage"

export const DMA_colors_labels = {
                'Ordures ménagères résiduelles':chartBusinessProps('Ordures ménagères résiduelles').color ?? 'white' ,
                'OMR':chartBusinessProps('OMR').color ?? 'white' ,
                'Encombrants':chartBusinessProps('Encombrants').color ?? 'white',
                'Matériaux recyclables':chartBusinessProps('Matériaux recyclables').color ?? 'white',
                'Recyclables':chartBusinessProps('Recyclables').color ?? 'white',
                'Déblais et gravats':chartBusinessProps('Déblais et gravats').color ?? 'white',
                'Gravats':chartBusinessProps('Gravats').color ?? 'white',
                'Déchets verts et biodéchets':chartBusinessProps("Déchets verts et biodéchets").color ?? 'white',
                'Biodéchets':chartBusinessProps("Biodéchets").color ?? 'white',
                'Déchets dangereux (y.c. DEEE)':chartBusinessProps("Déchets dangereux (y.c. DEEE)").color ?? 'white',
                'Dangereux':chartBusinessProps("Dangereux").color ?? 'white',
                'Autres':chartBusinessProps('Autres').color ?? 'white',
                'Non précisé':chartBusinessProps('Autres').color ?? 'white',
                'Déchèterie':chartBusinessProps('Déchèterie').color ?? 'white',
                'Collecte séparée':chartBusinessProps('Matériaux recyclables').color ?? 'white',
                'Collecte OMR':chartBusinessProps('Ordures ménagères résiduelles').color ?? 'white',
                'Incinération sans récupération d\'énergie':
                    chartBusinessProps('Incinération sans récupération d\'énergie').color ?? 'white',
                'Incinération sans valorisation':
                    chartBusinessProps('Incinération sans valorisation').color ?? 'white',
                'Incinération avec récupération d\'énergie':
                    chartBusinessProps('Incinération avec récupération d\'énergie').color ?? 'white',
                'Valorisation énergétique':
                    chartBusinessProps('Valorisation énergétique').color ?? 'white',
                'Stockage':
                    chartBusinessProps('Stockage').color ?? 'white',
                'Stockage pour inertes':
                    chartBusinessProps('Stockage pour inertes').color ?? 'white',
                'Valorisation matière':
                    chartBusinessProps('Valorisation matière').color ?? 'white',
                'Valorisation matière inorganique':
                    chartBusinessProps('Valorisation matière inorganique').color ?? 'white',
                'Valorisation organique':
                    chartBusinessProps('Valorisation organique').color ?? 'white',
                'Valorisation matière organique':
                    chartBusinessProps('Valorisation matière organique').color ?? 'white',
            }

export const PageDma: React.FC<PageProps> = () => {
    const [maxYear, minYear, defaultYear] = [2024,2009,2024]

    return (
        <Dashboard>
            <Palette  labels={ DMA_colors_labels } />
            <Dataset
                id="destination_dma_region_sankey" 
                type="wfs"
                url="https://www.geo2france.fr/geoserver/odema/ows"
                resource="odema:destination_dma_region"    
            >
                <Transform>{`SELECT [libel_dechet] as L_TYP_REG_DECHET, [libel_traitement] as L_TYP_REG_SERVICE, sum(tonnage) as TONNAGE_DMA_sum
                    FROM ?
                    WHERE [annee]= ${useControl("annee")}
                    GROUP BY [libel_dechet], [libel_traitement]`}</Transform>
                {/* A simplifier */} <Transform>
                    {data => data.map((i: SimpleRecord) => ({
                                  value: Math.max(i.TONNAGE_DMA_sum, 1),
                                  source: i.L_TYP_REG_DECHET,
                                  target: i.L_TYP_REG_SERVICE === 'Stockage pour inertes' ? 'Stockage' : i.L_TYP_REG_SERVICE,}))}
                </Transform>
                <Producer url="https://sinoe.org">Ademe (Sinoe)</Producer>
                <Producer url="https://odema-hautsdefrance.org/">Odema</Producer>
            </Dataset>

            <Dataset
                id="destination_dma_region" 
                type="wfs"
                url="https://www.geo2france.fr/geoserver/odema/ows"
                resource="odema:destination_dma_region"    
            >
               <Transform>{data => data.map((r:SimpleRecord) =>({
                    ...r,
                    SOURCE_TYP : r.source_collecte == 'DECHETERIE' ? 'Déchèterie' : 
                                  r.source_collecte == 'COLLECTE' && r.libel_dechet == 'Ordures ménagères résiduelles' ? 'Collecte OMR':
                                  'Collecte séparée'
               }))}</Transform>

                <Producer url="https://sinoe.org">Ademe (Sinoe)</Producer>
                <Producer url="https://odema-hautsdefrance.org/">Odema</Producer>
            </Dataset>

            <Dataset
                id="tonnage_dma" 
                type="wfs"
                url="https://www.geo2france.fr/geoserver/odema/ows"
                resource="odema:destination_dma_region"    
            >
               <Transform>SELECT [annee], SUM([kg_par_habitant]) as [ratio], sum([tonnage]) as [tonnage] FROM ? GROUP BY [annee] ORDER BY [annee]</Transform>
                <Producer url="https://sinoe.org">Ademe (Sinoe)</Producer>
                <Producer url="https://odema-hautsdefrance.org/">Odema</Producer>
            </Dataset>

            <Dataset
                id="population_tarification_ti_region" 
                type="wfs"
                url="https://www.geo2france.fr/geoserver/odema/ows"
                resource="odema:population_tarification_ti_region"    
            >
                <Producer url="https://odema-hautsdefrance.org/">Odema</Producer>
            </Dataset>

            <Dataset
                id="tarification_om" 
                type="wfs"
                url="https://www.geo2france.fr/geoserver/odema/ows"
                resource="odema:tarification_om"
                meta={{srsname:'EPSG:4326'}}
            >
                <Producer url="https://odema-hautsdefrance.org/">Odema</Producer>
            </Dataset>

            <Control>
            <NextPrevSelect
                name="annee"
                reverse={true}
                defaultValue={String(defaultYear)}
                options={
                  Array.from( { length: maxYear - minYear + 1 }, (_, i) => minYear + i ) //Séquence de minYear à maxYear
                  .filter((year) => year >= 2024 || year % 2 !== 0)  //Seulement les années impaires avant 2024
                  .reverse()
                  .map((i) => ({ label: String(i), value: String(i) }))}
              />

            </Control>
            <Section title={"Panorama"}>
                <ChartSankeyDestinationDMA 
                    title={`Types et destination des déchets en ${useControl("annee")}`} 
                    dataset="destination_dma_region_sankey" />

                <ChartEvolutionDechet  dataset="destination_dma_region" title="Type de déchets collectés"
                 yearKey="annee" categoryKey="libel_dechet" ratioKey="kg_par_habitant"
                 tonnageKey="tonnage"
                 year={Number(useControl('annee'))}
                />

                <ChartEvolutionDechet  dataset="destination_dma_region" title="Sources de collectes"
                 yearKey="annee" categoryKey="SOURCE_TYP" ratioKey="kg_par_habitant"
                 tonnageKey="tonnage"
                 year={Number(useControl('annee'))}
                />

            </Section>

            <Section title={"Prévention"}>
                <ChartEvolutionObjectifs dataset="tonnage_dma" 
                title="Production de DMA par habitant et objectif régional"
                dataObjectifs={[{annee:2009, ratio:620}, {annee:2025, ratio:558}, {annee:2030, ratio:527}]}
                year={Number(useControl('annee')) || 2023}
                />

                <ChartEvolutionPopTi dataset="population_tarification_ti_region"
                title="Tarification incitative sur la collecte des OMR" year={Number(useControl('annee'))}/>
                
                <MapTI dataset="tarification_om" title="Territoires en tarification incitative sur la collecte des OMR"/>
            </Section>

            <Section title="Valorisation">

                <ChartEvolutionDechet  dataset="destination_dma_region" title="Destination des déchets"
                 yearKey="annee" categoryKey="libel_traitement" ratioKey="kg_par_habitant"
                 tonnageKey="tonnage"
                 year={Number(useControl('annee'))}
                />
                {/* devnote : Hiérachie des modes non respectée, Prévu dans le dev de api-dashboard  https://github.com/geo2france/api-dashboard/issues/151 */}
            
                <ChartTauxValo dataset="destination_dma_region" title={`Taux de valorisation matière des DMA`} showObjectives/>
            </Section>

            <Section title="Stockage">
                <ChartDmaStockage dataset="destination_dma_region" title={`Part de DMA admis en stockage`} showObjectives/>
            </Section>
        </Dashboard>
    )
}
