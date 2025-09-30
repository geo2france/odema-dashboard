import { DashboardElement, DashboardPage, useApi } from "@geo2france/api-dashboard"
import { MapEPCIDMA } from "../map_epci_dma/mapEpciDma"
import { geo2franceProvider } from "../../App"
import { Dashboard, Dataset, Filter, Join, Transform } from "@geo2france/api-dashboard/dsl"
import { ChartTiRatio } from "../chart_ti_ratio/chart_ti_ratio"



export const DmaPageEPCIHome: React.FC = () => {

    const dma_indic = useApi({
        dataProvider:geo2franceProvider,
        resource: "odema:destination_dma_epci_harmonise",
        pagination:{
            mode:"off"
        }
    })

    return  (
     <Dashboard debug>

        <Dataset
          id="epci"
          type="wfs"
          url="https://www.geo2france.fr/geoserver/odema/ows"
          resource="odema:territoire_epci"
        >
            <Filter field="annee">2023</Filter>
            <Filter field="population_collecte" operator="gt">0</Filter>
        </Dataset>

        <Dataset
          id="epci_tonnage"
          type="wfs"
          url="https://www.geo2france.fr/geoserver/odema/ows"
          resource="odema:destination_dma_epci_harmonise"
        >
            <Filter field="annee">2023</Filter>
            <Filter field="type_dechet">{"Ordures ménagères résiduelles"}</Filter>
        </Dataset>

        <Dataset
          id="epci_ti"
          type="wfs"
          url="https://www.geo2france.fr/geoserver/odema/ows"
          resource="odema:population_tarification_ti_epci"
        >
            <Filter field="annee">2023</Filter>
             {/*<Join dataset="epci" joinKey={["epci_siren","siren"]} />*/}
           <Join dataset="epci_tonnage" joinKey={["epci_siren", "siren_epci"]}></Join> 
            <Transform>{(data) => data.map((r) => ({
                siren:r.epci_siren, 
                name:r.epci_nom,
                 tarification:r.type_tarification,
                 ratio: r.ratio_hab_pap}))}</Transform>
           <Transform>Select [siren], [name], [tarification], sum([ratio]) as ratio FROM ? GROUP BY [siren], [name], [tarification]</Transform>
        </Dataset>
        
        <ChartTiRatio dataset="epci_ti" />
            <MapEPCIDMA data={dma_indic.data?.data}/>
    </Dashboard>
    )

    

}
