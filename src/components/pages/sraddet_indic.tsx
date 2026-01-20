import { Control, Dashboard, Dataset, Filter, Select, Statistics, StatisticsCollection, useControl } from "@geo2france/api-dashboard/dsl"

export const PageSRADDET:React.FC = ({}) => {
    return (
        <Dashboard debug>
            <Control>
                <Select name="annee" options={["2023"]} />
            </Control>
            <Dataset
                id="indicateur_sraddet" 
                type="wfs"
                url="https://www.geo2france.fr/geoserver/odema/ows"
                resource="odema:indicateur_sraddet"
            >
                <Filter field="annee">{useControl('annee')}</Filter>   
            </Dataset>

            <Dataset
                id="pop_ti" 
                type="wfs"
                url="https://www.geo2france.fr/geoserver/odema/ows"
                resource=" 	odema:population_tarification_ti_region "
            >
                <Filter field="annee">{useControl('annee')}</Filter>   
            </Dataset>

            <div>Hello</div>
            <StatisticsCollection title="DMA">
                <Statistics dataset="indicateur_sraddet" dataKey="dma_pr_2011" unit="%" 
                icon="streamline-flex:bag-solid" color="grey"
                title="Réduction de DMA" annotation="Réduction de DMA depuis 2011 (par habitant). Objectif -15% en 2030"
                valueFormatter={(p) => p.value.toLocaleString(undefined, {maximumFractionDigits:1})}/>

                <Statistics dataset="indicateur_sraddet" dataKey="part_valo" unit="%" 
                icon="fa6-solid:recycle" color="#f0ca33"
                title="Valorisation de DMA" annotation="Part de DMA valorisée (matière ou organique). Objectif 60% en 20230"
                valueFormatter={(p) => p.value.toLocaleString(undefined, {maximumFractionDigits:1})}/>

                <Statistics dataset="pop_ti" dataKey="part_pop_ti" unit="%" 
                icon="tabler:report-money" color="#bd4cbdff"
                title="Population en TI" annotation="Population couverte par une tarification incitative sur les OMR"
                valueFormatter={(p) => (p.value*100).toLocaleString(undefined, {maximumFractionDigits:1})}/>
            </StatisticsCollection>


            <StatisticsCollection title="ISDND">
                <Statistics dataset="indicateur_sraddet" dataKey="tonnage_isdnd_pr_tonnage_2010" unit="%" 
                icon="material-symbols:front-loader" color="#d04e49"
                title="Enfouissement" annotation={`Quantité enfouie ${useControl('annee')} vs quantité enfouie en 2010.`}
                valueFormatter={(p) => p.value.toLocaleString(undefined, {maximumFractionDigits:1})}/>

                <Statistics dataset="indicateur_sraddet" dataKey="capacite_isdnd_pr_tonnage_2010" unit="%" 
                icon="material-symbols:front-loader" color="#d04e49"
                title="Enfouissement" annotation={`Capacité ${useControl('annee')} vs quantité enfouie en 2010.`}
                valueFormatter={(p) => p.value.toLocaleString(undefined, {maximumFractionDigits:1})}/>
            </StatisticsCollection>

        </Dashboard>
    )
}