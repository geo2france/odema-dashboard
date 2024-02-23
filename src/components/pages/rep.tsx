import { IResourceComponentsProps, useList } from "@refinedev/core";
import { Row, Col, Card, Alert } from "antd";
import { useSearchParamsState } from "../../utils";
import { ChartPieRepCollecte } from "../chart_pie_rep_collecte";
import { LoadingComponent } from "../loading_container";

export const RepPage: React.FC<IResourceComponentsProps> = () => {
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

    const collecte_pchim = useList(
        {
            resource: "rep-pchim-tonnages-collectes-2021/lines",
            dataProviderName: "ademe_opendata",
            pagination: {
                pageSize: 150,
            },
            filters: [
                {
                    field: "Code_Dept",
                    operator: "in",
                    value: ['59','62','80','02','60']
                },
                {
                    field: "Année_des_données",
                    operator: "eq",
                    value: year
                },

            ]
        }
    )

    const collecte_tlc = useList(
        {
            resource: "rep-tlc-tonnages-collectes-en-2021/lines",
            dataProviderName: "ademe_opendata",
            pagination: {
                pageSize: 150,
            },
            filters: [
                {
                    field: "Code_Dept",
                    operator: "in",
                    value: ['59','62','80','02','60']
                },
                {
                    field: "Année_des_données",
                    operator: "eq",
                    value: year
                },

            ]
        }
    )


    return(
        <>

            <Row gutter={[16, 16]}>
                <Col span={24}>
                    <Alert
                        message="En cours de construction"
                        description="Document de travail en cours d'élaboration"
                        type="warning"
                        showIcon
                    />
                </Col>
                <Col xl={24/2} xs={24}>
                    <Card>
                        d3e
                        <LoadingComponent isLoading={collecte_d3e.isFetching}>
                            {collecte_d3e.data ? <ChartPieRepCollecte filiere='d3e' data={collecte_d3e.data.data} /> : <b>...</b>}
                        </LoadingComponent>
                    </Card>
                </Col>
                <Col xl={24/2} xs={24}>
                    <Card>
                        pchim
                        <LoadingComponent isLoading={collecte_pchim.isFetching}>
                            {collecte_pchim.data ? <ChartPieRepCollecte filiere='pchim' data={collecte_pchim.data.data} /> : <b>...</b>}
                        </LoadingComponent>
                    </Card>
                </Col>
                <Col xl={24/2} xs={24}>
                    <Card>
                        tlc
                        <LoadingComponent isLoading={collecte_tlc.isFetching}>
                            {collecte_tlc.data ? <ChartPieRepCollecte filiere='tlc' data={collecte_tlc.data.data} /> : <b>...</b>}
                        </LoadingComponent>
                    </Card>
                </Col>
            </Row>
        </>
    )
}

