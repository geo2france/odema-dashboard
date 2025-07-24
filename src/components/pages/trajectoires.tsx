import { Dashboard, Dataset, Filter, Transform, Debug, Select, Control, useControl, Producer} from "api-dashboard/dsl";
import { ChartTrajectoire } from "../chart_trajectoire/ChartTrajectoire";
import { from } from "arquero";

export const PageTrajectoire = () => (
    <Dashboard>
        <Debug />
        <Dataset
            id="dma_destination_region"
            resource="sinoe-(r)-destination-des-dma-collectes-par-type-de-traitement/lines"
            type="datafair"
            url="https://data.ademe.fr/data-fair/api/v1/datasets"
            pageSize={5000}
        >
            <Producer url="https://www.sinoe.org/">Ademe</Producer>
            <Filter field="L_REGION">Hauts-de-France</Filter>
            <Transform>SELECT [ANNEE] as annee,
                        SUM(CASE WHEN [L_TYP_REG_SERVICE] like 'Valorisation%' THEN [TONNAGE_DMA] END) as tonnage_valo_matiere ,
                        SUM(CASE WHEN [L_TYP_REG_SERVICE] = 'Incinération avec récupération d\'énergie' THEN [TONNAGE_DMA] END) as tonnage_valo_en ,
                        SUM(CASE WHEN [L_TYP_REG_SERVICE] like 'Stockage%' THEN [TONNAGE_DMA] END) as stockage ,
                        SUM([TONNAGE_DMA]) as tonnage_total
                        FROM ? GROUP BY [ANNEE]
            </Transform>
            <Transform>{(data) => 
                data.map(row => ({
                    ...row, 
                    tx_valo_matiere:(row.tonnage_valo_matiere / row.tonnage_total)*100,
                    tx_valo_en:(row.tonnage_valo_en / row.tonnage_total)*100,
                    tx_stockage:(row.stockage / row.tonnage_total)*100
                }
                ))}
            </Transform>
        </Dataset>

        <Dataset
            id="dma_chiffres_cles_region"
            resource="sinoe-indicateurs-chiffres-cles-dma-avec-gravats-2009-2017/lines"
            type="datafair"
            url="https://data.ademe.fr/data-fair/api/v1/datasets"
            pageSize={5000}
        >
            <Producer url="https://www.sinoe.org/">Ademe</Producer>
            <Filter field="C_REGION">32</Filter>
            <Transform>SELECT[Annee] as annee, (SUM([TONNAGE_DMA])/SUM([VA_POPANNEE]))*1000 as ratio_dma FROM ? GROUP BY [Annee]</Transform>
        </Dataset>

        <Dataset
            id="odema_ref_epci"
            type="wfs"
            url="https://www.geo2france.fr/geoserver/odema/wfs"
            resource="odema:territoire_epci"
            meta={{properties:['annee','name','name_short','siren','population','nb_communes']}}
        >
            
        </Dataset>


        {/* Données par EPCI */}
        <Dataset 
            id="dma_epci_harmonise_hierachie_traitement"
            type="wfs"
            url="https://www.geo2france.fr/geoserver/odema/wfs"
            resource="odema:destination_dma_epci_harmonise"
        >
            <Producer url="https://www.sinoe.org/">Ademe</Producer>
            <Producer url="https://www.geo2france.fr/datahub/dataset/c60bd751-b4e3-4eb0-bbf0-d2252d705105">Odema</Producer>
            <Filter field="siren_epci">{useControl('select_epci')}</Filter>
            <Transform>SELECT 
                [annee], 
                    SUM(CASE WHEN [traitement_destination] like 'Valorisation%' THEN [tonnage] END) as tonnage_valo_matiere ,
                    SUM(CASE WHEN [traitement_destination] = 'Incinération avec récupération d\'énergie' THEN [tonnage] END) as tonnage_valo_en ,
                    SUM(CASE WHEN [traitement_destination] like 'Stockage%' THEN [tonnage] END) as stockage ,
                    SUM(ratio_hab) as ratio_dma,
                    SUM([tonnage]) as tonnage_total
                FROM ? GROUP BY [annee]
            </Transform>
            <Transform>{(data) => 
                data.map(row => ({
                    ...row, 
                    tx_valo_matiere:(row.tonnage_valo_matiere / row.tonnage_total)*100,
                    tx_valo_en:(row.tonnage_valo_en / row.tonnage_total)*100,
                    tx_stockage:(row.stockage / row.tonnage_total)*100
                }
                ))}
            </Transform>
        </Dataset>

        {/* Le dataset est ici chargé depuis un fichier json simple. Ce n'est pas une bonne pratique, mais la lib le permet 😉 */}
        <Dataset 
            id="objectifs_tx_valo"
            type="file"
            url="/data"
            resource="objectf_trajectoire.json"
        >
           {/* <Transform>{(data) => data?.find((d) => d.name =='tx_valo_matiere')?.data }</Transform>   */}
           <Transform>{(data) => { // Il est nécessaire de changer la structure des données en entrée.
            const tables = data.map( serie => from(serie.data).rename({value: serie.name})) // Une table arquero par objectif + renomme value
            const merged = tables.reduce((a, b) => // Reconstruction d'une table unique avec jointure sur l'année
                a.join_full(b, 'annee')
              );
            return merged.objects()
            } }</Transform>   
        </Dataset>
        

        <Control>
            <Select name="select_epci" dataset="odema_ref_epci" labelField="name" valueField="siren" showSearch optionFilterProp="label" />
        </Control>


       <ChartTrajectoire
            dataset={["dma_destination_region","dma_epci_harmonise_hierachie_traitement"]}
            dataset_obj_id="objectifs_tx_valo"
            valueKey="tx_valo_matiere"
            unit="%"
            title="Valorisation matière"
            color='seagreen'
            target="above"
        />
                
       <ChartTrajectoire
            dataset={["dma_destination_region","dma_epci_harmonise_hierachie_traitement"]}
            dataset_obj_id="objectifs_tx_valo"
            valueKey="tx_valo_en"
            unit="%"
            title="Valorisation énergie"
            color='powderblue'
            target="above"

        />

        <ChartTrajectoire
            dataset={["dma_destination_region","dma_epci_harmonise_hierachie_traitement"]}
            dataset_obj_id="objectifs_tx_valo"
            valueKey="tx_stockage"
            unit="%"
            title="Stockage"
            color='lightcoral'
            target="below"

        />

        <ChartTrajectoire
            dataset={["dma_chiffres_cles_region","dma_epci_harmonise_hierachie_traitement"]}
            dataset_obj_id="objectifs_tx_valo"
            valueKey="ratio_dma"
            unit="kg/hab"
            title="DMA par habitant"
            color='rebeccapurple'
            target="below"

        />
    </Dashboard>
)