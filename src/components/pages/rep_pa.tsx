import { IResourceComponentsProps, useList } from "@refinedev/core"
import { useSearchParamsState } from "../../utils"
import { Row, Col, Alert, Card } from "antd"
import { Attribution } from "../attributions"
import { ChartPieRepCollecte } from "../chart_pie_rep_collecte"
import { LoadingComponent } from "../loading_container"
import { RepTopbar } from "../rep_topbar"
import { useState } from "react"
import { ChartEvolutionRepCollecte } from "../chart_evolution_rep_collecte"

export const RepPaPage: React.FC<IResourceComponentsProps> = () => {
    const [year, setYear] = useSearchParamsState('year','2021')
    const [focus, setFocus] = useState<string | undefined>(undefined)

    const [cregion, _setcregion] = useSearchParamsState('region','32')
    const collecte_pa = useList(
        {
            resource: "rep-pa-tonnages-collectes-en-2018/lines",
            dataProviderName: "ademe_opendata",
            pagination: {
                pageSize: 500,
            },
            filters: [
                {
                    field: "Code_Région",
                    operator: "eq",
                    value: cregion
                },
                /*{
                    field: "Année_des_données",
                    operator: "eq",
                    value: year
                },*/

            ]
        }
    )

    return (<>

                <Row gutter={[16, 16]}>
                <Col span={24}><RepTopbar year={Number(year)} onChangeYear={setYear}/></Col>

                <Col xl={24/2} xs={24}>
                    <Card title={`Tonnages collectés en ${year}`}>
                        <LoadingComponent isLoading={collecte_pa.isFetching}>
                            {collecte_pa.data ? <ChartPieRepCollecte filiere='pa' data={collecte_pa.data.data} year={Number(year)} focus_item={focus} onFocus={setFocus}/> : <b>...</b>}
                            <Attribution data={[{ name: 'Ademe', url: 'https://data.ademe.fr/datasets/rep-pa-tonnages-collectes-en-2018' }]}></Attribution>
                        </LoadingComponent>
                    </Card>
                </Col>

                <Col xl={24/2} xs={24}>
                    <Card title="Evolution des tonnages collectés">
                        <LoadingComponent isLoading={collecte_pa.isFetching}>
                            {collecte_pa.data ? <ChartEvolutionRepCollecte filiere='pa' data={collecte_pa.data.data} year={Number(year)} focus_item={focus} onFocus={setFocus}/> : <b>...</b>}
                            <Attribution data={[{ name: 'Ademe', url: 'https://data.ademe.fr/datasets/rep-deee-tonnages-collectes-en-2018' }]}></Attribution>
                        </LoadingComponent>
                    </Card>
                </Col>

                </Row>
    </>)
}