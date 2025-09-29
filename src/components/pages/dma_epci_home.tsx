import { DashboardElement, DashboardPage, useApi } from "@geo2france/api-dashboard"
import { MapEPCIDMA } from "../map_epci_dma/mapEpciDma"
import { geo2franceProvider } from "../../App"



export const DmaPageEPCIHome: React.FC = () => {

    const dma_indic = useApi({
        dataProvider:geo2franceProvider,
        resource: "odema:destination_dma_epci_harmonise",
        pagination:{
            mode:"off"
        }
    })

    console.log(dma_indic.data)

    return       <DashboardPage>
        <DashboardElement title="EPCI">
            <p>hello</p>
        </DashboardElement>
        <DashboardElement title="EPCI">
            <MapEPCIDMA data={dma_indic.data?.data}/>
        </DashboardElement>
    </DashboardPage>

    


}
