import { Alert } from "antd"
import { ChartPie, Dashboard, Dataset, Palette, Producer, Statistics, StatisticsCollection, Transform } from "@geo2france/api-dashboard/dsl";
import { from } from "arquero";
import { SimpleRecord } from "@geo2france/api-dashboard";
import { Link } from "react-router-dom";
import { Icon } from '@iconify/react';


const fold = (data:SimpleRecord[]) => {
    const keys = Object.keys(data?.[0])
    const keys2 = keys.filter(e => e!=='annee')
    return from(data).fold(keys2, {as :['indicateur', 'valeur']}).objects() 
}

const libels = {
    'B1' : 'Valorisation matière',
    'B3': 'Valorisation organique',
    'B5': 'Valorisation énergétique'
}
const annee = 2022
export const DaePage: React.FC = () => {


    return     (  
    <>
        <Alert message="Page en cours de construction, chiffres non validés" type="warning" />
        <Dashboard debug>
            <Palette steps={['#0070c0','#00a055','#ce6300']}/>
            <Dataset
                id="indicateur_dae"
                type="file"
                url="/data/"
                resource="dae.json">
                <Producer url="https://odema-hautsdefrance.org/">Odema</Producer>
                <Transform>{data => data.map(r => ({
                    ...r,
                    'valo_matiere_ycOrga':r.B1 + r.B3
                }))}</Transform>
            </Dataset>

            <Dataset
                id="mode_traitement"
                type="file"
                url="/data/"
                resource="dae.json">
                <Producer url="https://odema-hautsdefrance.org/">Odema</Producer>
                <Transform>{ fold }</Transform>
                <Transform>{ data => data.filter( r => r.annee = annee).filter( r => 
                    ['B1', 'B3', 'B5'].includes(r.indicateur))
                    .map(r => ({ ...r, lib_indicateur:libels[r.indicateur  as keyof typeof libels]}))
                 }</Transform>
            </Dataset>

            <Dataset
                id="dae_flux_region"
                type="file"
                url="/data/"
                resource="dae_flux_region.json">
            
            </Dataset>


            <StatisticsCollection title="Intro">
                <Statistics 
                    dataset="indicateur_dae"
                    dataKey="A2t1" title="(A2t1) Production DAE" 
                    annotation="+X% depuis 2010"
                    color="#0070C0" icon="streamline:warehouse-1-solid" unit="t"/>
                <Statistics 
                    dataset="indicateur_dae" 
                    dataKey="B1" title="(B1) Valorisation" 
                    color="#00a05f" icon="ph:recycle-bold" unit="t"/>
                <Statistics 
                    dataset="indicateur_dae" 
                    dataKey="B5" title="(B5) Valorisation énergétique" 
                    color="#ce6300" icon="mingcute:fire-fill" unit="t"/>

            </StatisticsCollection>

            <ChartPie title="Modes de traitement" dataset="mode_traitement" 
                dataKey="valeur" nameKey="lib_indicateur"
                donut
            />

            <StatisticsCollection title="Valorisation matière">

                <Statistics 
                        dataset="indicateur_dae"
                        dataKey="valo_matiere_ycOrga" title="(B1 + B3) Valorisation matière"
                        valueFormatter={ (p) => p.value.toLocaleString(undefined, { maximumFractionDigits: 0 }) }
                        annotation={(param) => `dont ${param.row?.['B3'].toLocaleString(undefined, { maximumFractionDigits: 0 })} t de valorisation organique`}
                        color="#00a055" icon="ph:recycle-bold" unit="t"/>
            </StatisticsCollection>

            <div>Atteinte de l'objectif</div>
            <div>Carto méthaniseur et pf de compostage</div>
            <div>Recyclage par type de matière (non dispo)</div>


            <StatisticsCollection title="Valorisation énergétique">
                <Statistics 
                        dataset="indicateur_dae"
                        dataKey="B5" title="(B5) DAE valorisés en énergie"
                        valueFormatter={ (p) => p.value.toLocaleString(undefined, { maximumFractionDigits: 0 }) }
                        annotation={(param) => `dont ${param.row?.['C1'].toLocaleString(undefined, { maximumFractionDigits: 0 })} t sans valorisation énergétique`}
                        color="#ce6300" icon="mingcute:fire-fill" unit="t"/>
            </StatisticsCollection>


            <StatisticsCollection title="ISDND">

                <Statistics 
                        dataset="indicateur_dae"
                        dataKey="C2" title="(C2) Enfouissement"
                        valueFormatter={ (p) => p.value.toLocaleString(undefined, { maximumFractionDigits: 0 }) }
                        annotation={(_param) => `+X% par rapport à 2010`}
                        color="#a00000ff" icon="material-symbols:front-loader-outline" unit="t"/>

                <div><Link to="/isdnd"> En savoir plus sur les ISDND en région <Icon icon="mdi:about" width={25}/></Link></div>
            </StatisticsCollection>
               

            <StatisticsCollection title="Import / Export">
                <Statistics 
                        dataset="indicateur_dae"
                        dataKey="D1" title="(D1) Import"
                        valueFormatter={ (p) => p.value.toLocaleString(undefined, { maximumFractionDigits: 0 }) }
                        annotation={(_param) => `+X% par rapport à 2010`}
                        color="#8b8b8bff" icon="bitcoin-icons:receive-filled" unit="t"/>

                <Statistics 
                        dataset="indicateur_dae"
                        dataKey="D2" title="(D2) Export"
                        valueFormatter={ (p) => p.value.toLocaleString(undefined, { maximumFractionDigits: 0 }) }
                        annotation={(_param) => `+X% par rapport à 2010`}
                        color="#8b8b8bff" icon="bitcoin-icons:send-filled" unit="t"/>
            </StatisticsCollection>

            <div>Import / Export par région (double barre) </div>
            <div>Import / Export par pays (double barre) </div>

        </Dashboard>

    </>
    )
    


}
