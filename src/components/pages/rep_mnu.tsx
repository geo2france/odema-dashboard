import { IResourceComponentsProps, useList } from "@refinedev/core"
import { RepDataCollecteProcess, useSearchParamsState } from "../../utils"
import { Row, Col, Card } from "antd"
import { Attribution } from "../attributions"
import { ChartPieRepCollecte } from "../chart_pie_rep_collecte"
import { LoadingComponent } from "../loading_container"
import { RepTopbar } from "../rep_topbar"
import { ChartEvolutionRepCollecte } from "../chart_evolution_rep_collecte"
import { useState } from "react"

export const RepMnuPage: React.FC<IResourceComponentsProps> = () => {
    const [year, setYear] = useSearchParamsState('year','2021')
    const [focus, setFocus] = useState<string | undefined>(undefined)
    const [cregion, _setcregion] = useSearchParamsState('region','32')

    const filiere = 'mnu'

    const collecte = useList(
        {
            resource: "rep-mnu-tonnages-collectes-en-2021/lines",
            dataProviderName: "ademe_opendata",
            pagination: {
                pageSize: 500,
            },
            filters: [
                {
                    field: "Code_Région",
                    operator: "eq",
                    value: cregion
                }
            ]
        }
    )

    return (<>

                <Row gutter={[16, 16]}>
                <Col span={24}><RepTopbar year={Number(year)} onChangeYear={setYear} /></Col>

                <Col xl={24/2} xs={24}>
                    <Card title={`Tonnages collectés en ${year}`}>
                        <LoadingComponent isLoading={collecte.isFetching}>
                            {collecte.data ? <b>{RepDataCollecteProcess(filiere, collecte.data.data).filter((e) => (e.annee == Number(year)))[0]?.tonnage}</b> : <b>...</b>}
                            <br/><small> Seul le tonnage 2021 est disponible. Type de déchet unique.</small><br/>
                            <Attribution data={[{ name: 'Ademe', url: 'https://data.ademe.fr/datasets/rep-mnu-tonnages-collectes-en-2021' }]}></Attribution>
                        </LoadingComponent>
                    </Card>
                </Col>

                <Col xl={24/2} xs={24}>
                    <Card title="Evolution des tonnages collectés">
                        <LoadingComponent isLoading={collecte.isFetching}>
                            {collecte.data ? <ChartEvolutionRepCollecte filiere={filiere} data={collecte.data.data} year={Number(year)} focus_item={focus} onFocus={setFocus}/> : <b>...</b>}
                            <Attribution data={[{ name: 'Ademe', url: 'https://data.ademe.fr/datasets/rep-deee-tonnages-collectes-en-2018' }]}></Attribution>
                        </LoadingComponent>
                    </Card>
                </Col>
                </Row>
    </>)
}