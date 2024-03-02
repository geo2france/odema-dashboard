import { IResourceComponentsProps, useList } from "@refinedev/core"
import { useSearchParamsState } from "../../utils"
import { Row, Col, Alert, Card } from "antd"
import { Attribution } from "../attributions"
import { ChartPieRepCollecte } from "../chart_pie_rep_collecte"
import { LoadingComponent } from "../loading_container"
import { RepTopbar } from "../rep_topbar"

export const RepDeeePage: React.FC<IResourceComponentsProps> = () => {
    const [year, setYear] = useSearchParamsState('year','2021')

    const [cregion, _setcregion] = useSearchParamsState('region','32')
    const collecte_d3e = useList(
        {
            resource: "rep-deee-tonnages-collectes-en-2018/lines",
            dataProviderName: "ademe_opendata",
            pagination: {
                pageSize: 150,
            },
            filters: [
                {
                    field: "Code_région",
                    operator: "eq",
                    value: cregion
                },
                {
                    field: "Année_des_données",
                    operator: "eq",
                    value: year
                },

            ]
        }
    )

    return (<>

                <Row gutter={[16, 16]}>
                <Col span={24}><RepTopbar/></Col>

                <Col xl={24/2} xs={24}>
                    <Card>
                        d3e
                        <LoadingComponent isLoading={collecte_d3e.isFetching}>
                            {collecte_d3e.data ? <ChartPieRepCollecte filiere='d3e' data={collecte_d3e.data.data} /> : <b>...</b>}
                            <Attribution data={[{ name: 'Ademe', url: 'https://data.ademe.fr/datasets/rep-deee-tonnages-collectes-en-2018' }]}></Attribution>
                        </LoadingComponent>
                    </Card>
                </Col>
                </Row>
    </>)
}