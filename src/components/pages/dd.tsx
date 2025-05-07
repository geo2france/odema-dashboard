import { DashboardElement, DashboardPage, useApi,  } from "api-dashboard"
import { ChartDdModeTraitement } from "../chart_dd_mode_traitement/ChartDdModeTraitement"
import { Alert } from "antd"
import { geo2franceProvider } from "../../App"



export const DdPage: React.FC = () => {


    const dd_produit_hdf = useApi({
        dataProvider:geo2franceProvider,
        resource:'odema:dd_mode_de_traitement_produit_hdf',
        pagination:{mode:'off'}
    })

    const dd_traite_hdf = useApi({
        dataProvider:geo2franceProvider,
        resource:'odema:dd_mode_de_traitement_hdf',
        pagination:{mode:'off'}
    })

    return     (  
    <>
        <Alert message="Page en cours de construction, chiffres non validés" type="warning" />
        <DashboardPage>
            <DashboardElement title="Mode de traitement des DD traités en Région, 2024"
            attributions={[{name: "Trackdéchets", url:"https://trackdechets.beta.gouv.fr/"}, {name: "Odema"}]}>
               { dd_traite_hdf.data && <ChartDdModeTraitement year={2024} data={dd_traite_hdf.data?.data} /> }
            </DashboardElement>
            <DashboardElement title="Mode de traitement des DD produits en Région, 2024">
                { dd_produit_hdf.data && <ChartDdModeTraitement year={2024} data={dd_produit_hdf.data?.data} /> }
            </DashboardElement>
        </DashboardPage>
    </>
    )
    


}
