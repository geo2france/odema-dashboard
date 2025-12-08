import { NextPrevSelect, SimpleRecord } from "@geo2france/api-dashboard"
import { Control, Dashboard, Dataset, Section, Transform, useControl } from "@geo2france/api-dashboard/dsl"
import { ChartSankeyDestinationDMA } from "../chart_sankey_destination/dsl"

export const PageDma: React.FC = () => {
    const [maxYear, minYear, defaultYear] = [2023,2009,2021]

    return (
        <Dashboard debug>
            <Dataset
                id="destination_dma_region_sankey" 
                type="wfs"
                url="https://www.geo2france.fr/geoserver/odema/ows"
                resource="odema:destination_dma_region"    
            >
                <Transform>{`SELECT [libel_dechet] as L_TYP_REG_DECHET, [libel_traitement] as L_TYP_REG_SERVICE, sum(tonnage) as TONNAGE_DMA_sum
                    FROM ?
                    WHERE [annee]= ${useControl("annee")}
                    GROUP BY [libel_dechet], [libel_traitement]`}</Transform>
                {/* A simplifier */} <Transform>
                    {data => data.map((i: SimpleRecord) => ({
                                  value: Math.max(i.TONNAGE_DMA_sum, 1),
                                  source: i.L_TYP_REG_DECHET,
                                  target: i.L_TYP_REG_SERVICE === 'Stockage pour inertes' ? 'Stockage' : i.L_TYP_REG_SERVICE,}))}
                </Transform>
            </Dataset>


            <Control>
            <NextPrevSelect
                name="annee"
                reverse={true}
                defaultValue={defaultYear}
                options={
                  Array.from( { length: maxYear - minYear + 1 }, (_, i) => minYear + i ) //Séquence de minYear à maxYear
                  .filter((num) => num % 2 !== 0) //Seulement les années impaires. A partir de 2025, il est prévu que les enquêtes deviennent annuelles
                  .reverse()
                  .map((i) => ({ label: i, value: i }))}
              />

            </Control>
            <Section title={"Panorama"}>
                <ChartSankeyDestinationDMA title={`Types et destination des déchets en ${useControl("annee")}`} dataset="destination_dma_region_sankey" />
            </Section>

            <Section title={"Prévention"}>
                <div>hello</div>
            </Section>
        </Dashboard>
    )
}
