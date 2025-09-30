import { NextPrevSelect, useApi } from "@geo2france/api-dashboard"
import { MapEPCIDMA } from "../map_epci_dma/mapEpciDma"
import { geo2franceProvider } from "../../App"
import { Control, Dashboard, Dataset, Filter, Join, Transform, useControl } from "@geo2france/api-dashboard/dsl"
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
        <Control>
          <NextPrevSelect name="annee" options={Array.from({ length: (2023 - 2015) / 2 + 1 }, (_, i) => 2015 + i * 2).reverse()} defaultValue={2023} reverse />
        </Control>
        <Dataset
          id="epci_tonnage"
          type="wfs"
          url="https://www.geo2france.fr/geoserver/odema/ows"
          resource="odema:destination_dma_epci_harmonise"
        >
            <Filter field="annee">{useControl("annee")}</Filter>
        </Dataset>

        <Dataset
          id="epci_ti"
          type="wfs"
          url="https://www.geo2france.fr/geoserver/odema/ows"
          resource="odema:population_tarification_ti_epci"
        >
            <Filter field="annee">{useControl("annee")}</Filter>
           <Join dataset="epci_tonnage" joinKey={["epci_siren", "siren_epci"]}></Join> 
            <Transform>{(data) => data.map((r) => ({
                siren:r.epci_siren, 
                name:r.epci_nom,
                 tarification:r.type_tarification,
                 type_dechet:r.type_dechet,
                 ratio: r.ratio_hab_pap + r.ratio_hab_dechetterie}))}</Transform>
           <Transform>Select [siren], [name], [tarification], 
            sum(CASE WHEN [type_dechet]="Ordures ménagères résiduelles" THEN [ratio] END) as ratio_omr, 
            sum(CASE WHEN [type_dechet]!="Ordures ménagères résiduelles" THEN [ratio] END) as ratio_cs
             FROM ? GROUP BY [siren], [name], [tarification]</Transform>
        </Dataset>
        
        <ChartTiRatio dataset="epci_ti" dataKey="ratio_omr" color="grey" title="OMR collectées et type de tarification"/>
        <ChartTiRatio dataset="epci_ti" dataKey="ratio_cs" color="orange" title="Autres collectes et type de tarification"/>

        <MapEPCIDMA data={dma_indic.data?.data}/>
    </Dashboard>
    )

    

}
