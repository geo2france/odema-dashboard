import { BaseRecord, IResourceComponentsProps, useList } from "@refinedev/core"
import { useSearchParamsState } from "../../utils"
import { Row, Col, Card } from "antd"
import { Attribution } from "../attributions"
import { ChartPieRepCollecte } from "../chart_pie_rep_collecte"
import { LoadingComponent } from "../loading_container"
import { RepTopbar } from "../rep_topbar"
import { ChartEvolutionRepCollecte } from "../chart_evolution_rep_collecte"
import { useState } from "react"
import { AppareilsElectriques, GrosElectromenagers, PetitsAppareilsElectriques } from "../../utils/picto"
import alasql from "alasql"

export const RepDeeePage: React.FC<IResourceComponentsProps> = () => {
    const [year, setYear] = useSearchParamsState('year','2021')
    const [focus, setFocus] = useState<string | undefined>(undefined)

    const [cregion, _setcregion] = useSearchParamsState('region','32')
    const collecte_d3e = useList(
        {
            resource: "rep-deee-tonnages-collectes-en-2018/lines",
            dataProviderName: "ademe_opendata",
            pagination: {
                pageSize: 500,
            },
            filters: [
                {
                    field: "Code_région",
                    operator: "eq",
                    value: cregion
                }
            ]
        }
    )

    const data_standardized = collecte_d3e?.data ? 
        alasql(`SELECT [Code_région], [Année_des_données] AS annee, d.Flux, sum([Total]) AS tonnage
            FROM ? d
            GROUP BY [Code_région], [Année_des_données], d.Flux
            `, [collecte_d3e.data.data])
            .map((e:BaseRecord) => ({annee:e.annee, name: e.Flux, value: e.tonnage} )) 
        : undefined

    const data_standardized_origine = collecte_d3e?.data ? //Tonnage par origine de collecte
        alasql(`SELECT [Code_région], [Année_des_données] AS annee, d.[Origine], sum([Total]) AS tonnage
            FROM ? d
            GROUP BY [Code_région], [Année_des_données], d.[Origine]
            `, [collecte_d3e.data.data])
            .map((e:BaseRecord) => ({annee:e.annee, name: e.Origine, value: e.tonnage} )) 
        : undefined

    return (<>

                <Row gutter={[16, 16]}>
                    <Col span={20}>
                        <RepTopbar year={Number(year)} onChangeYear={setYear} />
                    </Col>
                    <Col span={4}>
                        <Card style={{ height: '100%',   textAlign: 'center' }}>
                            <AppareilsElectriques style={{ maxHeight: '100px' }} />
                            <GrosElectromenagers style={{ maxHeight: '100px' }} />
                            <PetitsAppareilsElectriques style={{ maxHeight: '100px' }} />
                        </Card>
                    </Col>
                <Col xl={24/2} xs={24}>
                    <Card title={`Tonnages collectés par flux en ${year}`}>
                        <LoadingComponent isLoading={collecte_d3e.isFetching}>
                            {collecte_d3e.data ? <ChartPieRepCollecte filiere='d3e' data={data_standardized} year={Number(year)} focus_item={focus} onFocus={(e:any) => setFocus(e?.name)}/> : <b>...</b>}
                            <Attribution data={[{ name: 'Ademe', url: 'https://data.ademe.fr/datasets/rep-deee-tonnages-collectes-en-2018' }]}></Attribution>
                        </LoadingComponent>
                    </Card>
                </Col>

                <Col xl={24/2} xs={24}>
                    <Card title="Evolution des tonnages collectés">
                        <LoadingComponent isLoading={collecte_d3e.isFetching}>
                            {collecte_d3e.data ? <ChartEvolutionRepCollecte filiere='d3e' data={data_standardized} year={Number(year)} focus_item={focus} onFocus={(e:any) => setFocus(e?.seriesName)}/> : <b>...</b>}
                            <Attribution data={[{ name: 'Ademe', url: 'https://data.ademe.fr/datasets/rep-deee-tonnages-collectes-en-2018' }]}></Attribution>
                        </LoadingComponent>
                    </Card>
                </Col>

                <Col xl={24/2} xs={24}>
                    <Card title={`Tonnages collectés par origine en ${year}`}>
                        <LoadingComponent isLoading={collecte_d3e.isFetching}>
                            {collecte_d3e.data ? <ChartPieRepCollecte filiere='d3e' data={data_standardized_origine} year={Number(year)} focus_item={focus} onFocus={(e:any) => setFocus(e?.name)}/> : <b>...</b>}
                            <Attribution data={[{ name: 'Ademe', url: 'https://data.ademe.fr/datasets/rep-deee-tonnages-collectes-en-2018' }]}></Attribution>
                        </LoadingComponent>
                    </Card>
                </Col>
                </Row>
    </>)
}