import { DashboardElement, DashboardPage, NextPrevSelect, useApi, useSearchParamsState,  } from "@geo2france/api-dashboard"
import { ChartDdModeTraitement } from "../chart_dd_mode_traitement/ChartDdModeTraitement"
import { Alert } from "antd"
import { geo2franceProvider } from "../../App"

const [maxYear, minYear, defaultYear] = [2024,2022,2024]


export const DdPage: React.FC = () => {
    const [year, setYear] = useSearchParamsState('year',defaultYear.toString())

    const dd_produit_hdf = useApi({
        dataProvider:geo2franceProvider,
        resource:'odema:dd_mode_de_traitement_produit_hdf',
        pagination:{mode:'off'},
        filters:[{
            field:'annee',
            operator:'eq',
            value:year
        }]
    })

    const dd_traite_hdf = useApi({
        dataProvider:geo2franceProvider,
        resource:'odema:dd_mode_de_traitement_hdf',
        pagination:{mode:'off'},
        filters:[{
            field:'annee',
            operator:'eq',
            value:year
        }]
    })

    return     (  
    <>
        <Alert message="Page en cours de construction, chiffres non validés" type="warning" />
        <DashboardPage
                control={
                    <NextPrevSelect
                      onChange={(e: any) => (e ? setYear(e) : undefined)}
                      reverse={true}
                      value={year}
                      options={
                        Array.from( { length: maxYear - minYear + 1 }, (_, i) => minYear + i ) //Séquence de minYear à maxYear
                        .reverse()
                        .map((i) => ({ label: i, value: i }))}
                    />
              }
        >
            <DashboardElement 
                isFetching={dd_traite_hdf.isFetching}
                title={`Mode de traitement des DD traités en Région en ${year}`}
                attributions={[{name: "Trackdéchets", url:"https://trackdechets.beta.gouv.fr/"}, {name: "Odema"}]}>
               <ChartDdModeTraitement data={dd_traite_hdf.data?.data} />
            </DashboardElement>
            <DashboardElement 
                title={`Mode de traitement des DD produits en Région en ${year}`}
                isFetching={dd_produit_hdf.isFetching}
                >
                <ChartDdModeTraitement data={dd_produit_hdf.data?.data} />
            </DashboardElement>
        </DashboardPage>
    </>
    )
    


}
