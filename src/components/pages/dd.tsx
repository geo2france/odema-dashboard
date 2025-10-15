import {  NextPrevSelect } from "@geo2france/api-dashboard"
import { ChartDdModeTraitement } from "../chart_dd_mode_traitement/ChartDdModeTraitement"
import { Alert } from "antd"
import { Dashboard, Dataset, Filter, Control, useControl } from "@geo2france/api-dashboard/dsl";

const [maxYear, minYear, defaultYear] = [2024,2022,2024]


export const DdPage: React.FC = () => {


    return     (  
    <>
        <Alert message="Page en cours de construction, chiffres non validés" type="warning" />
        <Dashboard debug>
            <Dataset
                id="dd_produit_hdf"
                type="wfs"
                url="https://www.geo2france.fr/geoserver/odema/ows"
                resource="odema:dd_mode_de_traitement_produit_hdf">
                <Filter field="annee">{useControl("annee")}</Filter>
            </Dataset>

            <Dataset
                id="dd_traite_hdf"
                type="wfs"
                url="https://www.geo2france.fr/geoserver/odema/ows"
                resource="odema:dd_mode_de_traitement_hdf">
                <Filter field="annee">{useControl("annee")}</Filter>
            </Dataset>

            <Control>
                <NextPrevSelect 
                    name="annee"
                    reverse
                    defaultValue={defaultYear}
                    options={
                            Array.from( { length: maxYear - minYear + 1 }, (_, i) => minYear + i ) //Séquence de minYear à maxYear
                            .reverse()
                            .map((i) => ({ label: i, value: i }))}/>
            </Control>

            <ChartDdModeTraitement dataset="dd_produit_hdf" />
            <ChartDdModeTraitement dataset="dd_traite_hdf"/>

        </Dashboard>
    </>
    )
    


}
