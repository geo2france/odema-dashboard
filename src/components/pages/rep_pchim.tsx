import { IResourceComponentsProps, useList } from "@refinedev/core"
import { useSearchParamsState } from "../../utils"
import { Row, Col, Card } from "antd"
import { Attribution } from "../attributions"
import { ChartPieRepCollecte } from "../chart_pie_rep_collecte"
import { LoadingComponent } from "../loading_container"
import { RepTopbar } from "../rep_topbar"
import { ChartEvolutionRepCollecte } from "../chart_evolution_rep_collecte"
import { useState } from "react"

export const RepPchimPage: React.FC<IResourceComponentsProps> = () => {
    const [year, setYear] = useSearchParamsState('year','2021')
    const [focus, setFocus] = useState<string | undefined>(undefined)

    const [cregion, _setcregion] = useSearchParamsState('region','32')
    const collecte_pchim = useList(
        {
            resource: "rep-pchim-tonnages-collectes-2021/lines",
            dataProviderName: "ademe_opendata",
            pagination: {
                pageSize: 500,
            },
            filters: [
                {
                    field: "Code_Dept",
                    operator: "in",
                    value: ['59','62','80','02','60']
                }

            ]
        }
    )

    return (<>

                <Row gutter={[16, 16]}>
                <Col span={24}><RepTopbar year={Number(year)} onChangeYear={setYear} /></Col>

                <Col xl={24/2} xs={24}>
                    <Card title={`Tonnages collectés en ${year}`}>
                        <LoadingComponent isLoading={collecte_pchim.isFetching}>
                            {collecte_pchim.data ? <ChartPieRepCollecte filiere='pchim' data={collecte_pchim.data.data} year={Number(year)} focus_item={focus} onFocus={setFocus}/> : <b>...</b>}
                            <Attribution data={[{ name: 'Ademe', url: 'https://data.ademe.fr/datasets/rep-pchim-tonnages-collectes-2021' }]}></Attribution>
                        </LoadingComponent>
                    </Card>
                </Col>

                <Col xl={24/2} xs={24}>
                    <Card title="Evolution des tonnages collectés">
                        <LoadingComponent isLoading={collecte_pchim.isFetching}>
                            <small>Pas de données disponibles avant 2021</small> <br/>
                            <Attribution data={[{ name: 'Ademe', url: 'https://data.ademe.fr/datasets/rep-pchim-tonnages-collectes-2021' }]}></Attribution>
                        </LoadingComponent>
                    </Card>
                </Col>
                </Row>
    </>)
}