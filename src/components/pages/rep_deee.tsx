import { useSearchParamsState, LoadingContainer, Attribution, SimpleRecord, useApi } from "api-dashboard"
import { Row, Col, Card } from "antd"
import { ChartPieRepCollecte } from "../chart_pie_rep_collecte"
import { RepTopbar } from "../rep_topbar"
import { ChartEvolutionRepCollecte } from "../chart_evolution_rep_collecte"
import { useState } from "react"
import { AppareilsElectriques, GrosElectromenagers, PetitsAppareilsElectriques } from "../../utils/picto"
import alasql from "alasql"

import { ademe_opendataProvider } from "../../App"


export const RepDeeePage: React.FC = () => {
    const [year, setYear] = useSearchParamsState('year','2021')
    const [focus, setFocus] = useState<string | undefined>(undefined)

    const [cregion, _setcregion] = useSearchParamsState('region','32')
    const collecte_d3e = useApi(
        {
            resource: "rep-deee-tonnages-collectes-en-2018/lines",
            dataProvider: ademe_opendataProvider,
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

    const data_standardized = collecte_d3e?.data &&
        (alasql(`SELECT [Code_région], [Année_des_données] AS annee, d.Flux, sum([Total]) AS tonnage
            FROM ? d
            GROUP BY [Code_région], [Année_des_données], d.Flux
            `, [collecte_d3e.data.data]) as SimpleRecord[])
            .map((e:SimpleRecord) => ({annee:e.annee, name: e.Flux, value: e.tonnage} )) 
        

    const data_standardized_origine = collecte_d3e?.data && //Tonnage par origine de collecte
        (alasql(`SELECT [Code_région], [Année_des_données] AS annee, d.[Origine], sum([Total]) AS tonnage
            FROM ? d
            GROUP BY [Code_région], [Année_des_données], d.[Origine]
            `, [collecte_d3e.data.data]) as SimpleRecord[])
            .map((e:SimpleRecord) => ({annee:e.annee, name: e.Origine, value: e.tonnage} )) 
        

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
                        <LoadingContainer isFetching={collecte_d3e.isFetching}>
                            {data_standardized ? <ChartPieRepCollecte filiere='d3e' data={data_standardized} year={Number(year)} focus_item={focus} onFocus={(e:any) => setFocus(e?.name)}/> : <b>...</b>}
                            <Attribution data={[{ name: 'Ademe', url: 'https://data.ademe.fr/datasets/rep-deee-tonnages-collectes-en-2018' }]}></Attribution>
                        </LoadingContainer>
                    </Card>
                </Col>

                <Col xl={24/2} xs={24}>
                    <Card title="Evolution des tonnages collectés">
                        <LoadingContainer isFetching={collecte_d3e.isFetching}>
                            {data_standardized ? <ChartEvolutionRepCollecte filiere='d3e' data={data_standardized} year={Number(year)} focus_item={focus} onFocus={(e:any) => setFocus(e?.seriesName)}/> : <b>...</b>}
                            <Attribution data={[{ name: 'Ademe', url: 'https://data.ademe.fr/datasets/rep-deee-tonnages-collectes-en-2018' }]}></Attribution>
                        </LoadingContainer>
                    </Card>
                </Col>

                <Col xl={24/2} xs={24}>
                    <Card title={`Tonnages collectés par origine en ${year}`}>
                        <LoadingContainer isFetching={collecte_d3e.isFetching}>
                            {data_standardized_origine ? <ChartPieRepCollecte filiere='d3e' data={data_standardized_origine} year={Number(year)} focus_item={focus} onFocus={(e:any) => setFocus(e?.name)}/> : <b>...</b>}
                            <Attribution data={[{ name: 'Ademe', url: 'https://data.ademe.fr/datasets/rep-deee-tonnages-collectes-en-2018' }]}></Attribution>
                        </LoadingContainer>
                    </Card>
                </Col>
                </Row>
    </>)
}