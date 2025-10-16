import {  NextPrevSelect } from "@geo2france/api-dashboard"
import { ChartDdModeTraitement } from "../chart_dd_mode_traitement/ChartDdModeTraitement"
import { Alert } from "antd"
import { Dashboard, Dataset, Filter, Control, useControl, Producer } from "@geo2france/api-dashboard/dsl";
import { ChartFluxInterreg } from "../chart_flux_interreg/ChartFluxInterreg";

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
                <Producer url="https://trackdechets.beta.gouv.fr/">Trackdéchets</Producer>
                <Producer url="https://odema-hautsdefrance.org/">Odema</Producer>

            </Dataset>

            <Dataset
                id="dd_traite_hdf"
                type="wfs"
                url="https://www.geo2france.fr/geoserver/odema/ows"
                resource="odema:dd_mode_de_traitement_hdf">
                <Filter field="annee">{useControl("annee")}</Filter>
                <Producer url="https://trackdechets.beta.gouv.fr/">Trackdéchets</Producer>
                <Producer url="https://odema-hautsdefrance.org/">Odema</Producer>
            </Dataset>

            <Dataset
                id="dd_flux_interreg"
                type="wfs"
                url="https://www.geo2france.fr/geoserver/odema/ows"
                resource="odema:dd_flux_interreg"
            >
                <Filter field="annee">{useControl("annee")}</Filter>
                <Producer url="https://trackdechets.beta.gouv.fr/">Trackdéchets</Producer>
                <Producer url="https://odema-hautsdefrance.org/">Odema</Producer>
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

            <ChartDdModeTraitement dataset="dd_produit_hdf" title={`Mode de traitement des DD produits en Région en ${useControl("annee")}`} />
            <ChartDdModeTraitement dataset="dd_traite_hdf"  title={`Mode de traitement des DD traités en Région en ${useControl("annee")}`} />
            <ChartFluxInterreg 
                dataset="dd_flux_interreg"
                importKey="q_import" exportKey="q_export" locationKey="nom_region"
                title={`Flux de déchets dangereux depuis et vers les Hauts-de-France en ${useControl("annee")}`} />
        </Dashboard>
    </>
    )
    


}
