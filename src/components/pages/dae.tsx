import { Alert } from "antd"
import { ChartPie, Dashboard, Dataset, Section, Palette, Producer, Statistics, StatisticsCollection, Transform, Control, useControl, Filter, Join, useDataset } from "@geo2france/api-dashboard/dsl";
import { from } from "arquero";
import { NextPrevSelect, SimpleRecord } from "@geo2france/api-dashboard";
import { Link } from "react-router-dom";
import { Icon } from '@iconify/react';
import { ChartFluxInterreg } from "../chart_flux_interreg/ChartFluxInterreg";
import { ChartGoal } from "../chartGoal";


const fold = (data:SimpleRecord[]) => {
    if (!data || data.length === 0) return [];
    const keys = Object?.keys(data?.[0])
    const keys2 = keys?.filter(e => e!=='annee')
    return from(data).fold(keys2, {as :['indicateur', 'valeur']})?.objects() 
}

const noFractionDigits = (p:any) => p.value.toLocaleString(undefined, { maximumFractionDigits: 0 })


const libels = {
    'B1B3' : 'Valorisation matière',
    'B3': 'Valorisation organique',
    'B5': 'Valorisation énergétique',
    'C2' : 'Enfouissement'
}
//const annee = 2022
export const DaePage: React.FC = () => {

    const annee = useControl("annee")
    console.log(useDataset("indicateur_dae"))
    return     (  
    <>
    <Alert message="Page en cours de construction, chiffres non validés" type="warning" />
    <Dashboard debug>
            <Palette steps={['#0070c0','#00a055','#ce6300']} 
                labels={{
                    'Valorisation énergétique':'#ce6300',
                    'Valorisation organique':'#00a055',
                    'Valorisation matière':'#cfe45cff',
                    'Enfouissement':'#a00000ff'

                }}
                />

            <Control>
                <NextPrevSelect name="annee" options={[2022]} defaultValue={2022}/>
            </Control>
            <Dataset
                id="indicateur_dae"
                type="file"
                url="data"
                resource="dae.json">
                <Producer url="https://odema-hautsdefrance.org/">Odema</Producer>
                <Transform>{data => data.filter((row:SimpleRecord)  => row.annee == annee )}</Transform>
                <Transform>{data => data.map((r:SimpleRecord)  => ({
                    ...r,
                    'valo_matiere_ycOrga':r.B1 + r.B3,
                    'B8t3_pct':r.B8t3*100,
                    'pct_valo':100*((r.B1 + r.B3) / r.A2t3 )
                }))}</Transform>
            </Dataset>

            <Dataset
                id="mode_traitement"
                type="file"
                url="data"
                resource="dae.json">
                <Producer url="https://odema-hautsdefrance.org/">Odema</Producer>
                <Transform>{ (data:SimpleRecord[]) => data.filter(row  => row.annee == annee )}</Transform>
                <Transform>{ (data:SimpleRecord[]) => data.map(r  => ({...r, B1B3 : r.B1+r.B3}))}</Transform>
                <Transform>{ fold }</Transform>
                <Transform>{ (data:SimpleRecord[])  => data.filter( r => r.annee = annee).filter( r => 
                    ['B5','B1B3','C2'].includes(r.indicateur))
                    .map(r => ({ 
                        ...r, 
                        lib_indicateur:libels[r.indicateur  as keyof typeof libels] || r.indicateur}))
                 }</Transform>
            </Dataset>

            <Dataset
                id="dae_flux_region"
                type="file"
                url="data"
                resource="dae_flux_region.json">
                <Producer>Odema</Producer>
                <Transform>{ (data:SimpleRecord[]) => data.sort((a,b) => b.import - a.import) }</Transform> {/** Trier par ordre d'import */}
                <Transform>{ (data:SimpleRecord[]) => data.sort((a,_b) => {
                    const first=['Ile de France', 'Normandie', 'Grand Est']
                    if (first.includes(a.region)) return -1
                    return 0
                })}</Transform>
            </Dataset>

            <Dataset
                id="dae_flux_pays"
                type="file"
                url="data"
                resource="dae_flux_pays.json">
                <Producer>Odema</Producer>
                <Transform>{ (data:SimpleRecord[]) => data.map(r => ({
                    pays_flag: `${r.pays} ${r.drapeau}`,
                    ...r
                }))}</Transform>
                <Transform>{ (data:SimpleRecord[]) => data.sort((a,b) => b.import - a.import) }</Transform> {/** Trier par ordre d'import */}

            </Dataset>

            <Dataset
                id="federec_traitement_matiere"
                type="file"
                url="data"
                resource="federec_traitement_matiere.json">
                <Producer url="https://odema-hautsdefrance.org/">Odema</Producer>
                <Producer url="https://federrec.com/">FEDERREC</Producer>

            </Dataset>

           <Dataset
                id="isdnd_enfouissement_total"
                type="wfs"
                url="https://www.geo2france.fr/geoserver/ows/odema"
                resource="odema:isdnd_tonnage"
            >
                <Filter field="annee">{annee}</Filter>
                <Transform>{ (data:SimpleRecord[]) => data.filter(row => ['59','80','62','02','60'].includes(row.departement))}</Transform>
                <Transform>SELECT annee, sum(tonnage) as enfouissement_total FROM ? GROUP BY annee</Transform>
                <Join dataset="indicateur_dae" joinKey="annee" />
            </Dataset>

        <Section title="Introduction">
            <StatisticsCollection title="Intro" columns={2}>
                <Statistics 
                    dataset="indicateur_dae"
                    dataKey="A2t3" title="Production de DAE" 
                    valueFormatter={ noFractionDigits }
                    color="#0070C0" icon="streamline:warehouse-1-solid" unit="t"/>
                <Statistics 
                        dataset="indicateur_dae"
                        dataKey="valo_matiere_ycOrga" title="Valorisation matière"
                        valueFormatter={ (p) => p.value.toLocaleString(undefined, { maximumFractionDigits: 0 }) }
                        annotation={(param) => `dont ${param.row?.['B3'].toLocaleString(undefined, { maximumFractionDigits: 0 })} t de valorisation organique`}
                        color="#cfe45cff" icon="ph:recycle-bold" unit="t"/>
                <Statistics 
                    dataset="indicateur_dae" 
                    dataKey="B5" title="Valorisation énergétique" 
                    valueFormatter={ noFractionDigits }
                    color="#ce6300" icon="mingcute:fire-fill" unit="t"/>

                <Statistics 
                        dataset="indicateur_dae"
                        dataKey="C2" title="Enfouissement"
                        valueFormatter={ (p) => p.value.toLocaleString(undefined, { maximumFractionDigits: 0 }) }
                        color="#a00000ff" icon="material-symbols:front-loader-outline" unit="t"/>

            </StatisticsCollection>

            <ChartPie title={`Modes de traitement en ${annee}`} dataset="mode_traitement" 
                dataKey="valeur" nameKey="lib_indicateur"
                donut
            />
        </Section>
        <Section title="Valorisation" icon="ph:recycle-bold">

            <StatisticsCollection title={`Valorisation en ${annee}`} columns={2}>

                <Statistics 
                        dataset="indicateur_dae"
                        dataKey="B1" title="Valorisation matière inorganique"
                        valueFormatter={ (p) => p.value.toLocaleString(undefined, { maximumFractionDigits: 0 }) }
                        color="#cfe45cff" icon="ph:recycle-bold" unit="t"/>


                <Statistics 
                        dataset="indicateur_dae"
                        dataKey="B3" title="Valorisation organique"
                        valueFormatter={ (p) => p.value.toLocaleString(undefined, { maximumFractionDigits: 0 }) }
                        color="#00a055" icon="mdi:plant-outline" unit="t"/>

                <Statistics 
                        dataset="indicateur_dae"
                        dataKey="B5" title="DAE valorisés en énergie"
                        valueFormatter={ (p) => p.value.toLocaleString(undefined, { maximumFractionDigits: 0 }) }
                        annotation={(param) => `dont ${param.row?.['C1'].toLocaleString(undefined, { maximumFractionDigits: 0 })} t sans valorisation énergétique`}
                        color="#ce6300" icon="mingcute:fire-fill" unit="t"/>
            </StatisticsCollection>

            <ChartGoal title="Atteinte de l'objectif du SRADDET" dataset="indicateur_dae" dataKey="B8t3_pct" yearKey="annee" target={65} unit="%" />

            <ChartPie
                title="Gistement de valorisation matière (hors organique)"
                dataset="federec_traitement_matiere"
                dataKey="quantite"
                nameKey="categorie"
                unit="t"
                donut
            />
            <div>Carto méthaniseur et pf de compostage</div>

        </Section>
        <Section title="Enfouissement" icon="material-symbols:front-loader-outline">
            <StatisticsCollection title={`Enfouissement en ${annee}`} columns={2}>

                <Statistics 
                        dataset="isdnd_enfouissement_total"
                        dataKey="C2" title="Enfouissement"
                        valueFormatter={ (p) => p.value.toLocaleString(undefined, { maximumFractionDigits: 0 }) }
                        annotation={p => `${p.row?.enfouissement_total.toLocaleString()} t enfouies en région (DAE et autres)`}
                        color="#a00000ff" icon="material-symbols:front-loader-outline" unit="t"/>

                    <Statistics 
                        dataset="indicateur_dae"
                        dataKey="C4_residuelle" title="Capacité résiduelle"
                        color="grey" icon="fluent:resize-28-filled" unit="t"/>

                <div><Link to="/isdnd"> En savoir plus sur les ISDND en région <Icon icon="mdi:about" width={25}/></Link></div>
            </StatisticsCollection>
            
            <div>(Caractérisation des déchets en ISDND)</div>
        </Section>
        <Section title="Import / Export" icon="mdi:exchange">

            <StatisticsCollection title={`Import / Export en ${annee}`} columns={2}>
                <Statistics 
                        dataset="indicateur_dae"
                        dataKey="D1" title="Import"
                        valueFormatter={ (p) => p.value.toLocaleString(undefined, { maximumFractionDigits: 0 }) }
                        annotation="dont 54 741 t hors France"
                        color="#ce6300" icon="bitcoin-icons:receive-filled" unit="t"/>

                <Statistics 
                        dataset="indicateur_dae"
                        dataKey="D2" title="Export"
                        valueFormatter={ (p) => p.value.toLocaleString(undefined, { maximumFractionDigits: 0 }) }
                        color="#0070c0" icon="bitcoin-icons:send-filled" unit="t"
                        annotation="dont 320 632 t hors France"/>
            </StatisticsCollection>

            <ChartFluxInterreg
                    title="Import/export de DAE vers/depuis les Hauts-de-France - Régions"
                    dataset="dae_flux_region" 
                    locationKey="region" 
                    importKey="import" 
                    exportKey="export" />

            <ChartFluxInterreg
                    title="Import/export de DAE vers/depuis les Hauts-de-France - Pays"
                    dataset="dae_flux_pays" 
                    locationKey="pays_flag" 
                    importKey="import" 
                    exportKey="export" />

        </Section>

    </Dashboard>


    </>
    )
    


}
