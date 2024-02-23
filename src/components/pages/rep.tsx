import { IResourceComponentsProps, useList } from "@refinedev/core";
import { Row, Col, Card, Alert, List } from "antd";
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

    const collecte_mnu = useList(
        {
            resource: "rep-mnu-tonnages-collectes-en-2021/lines",
            dataProviderName: "ademe_opendata",
            pagination: {
                pageSize: 150,
            },
            filters: [
                {
                    field: "Code_Région",
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

    const collecte_disp_med = useList(
        {
            resource: "rep-disp-med-tonnages-collectes-en-2021/lines",
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

    const collecte_pa = useList(
        {
            resource: "rep-pa-tonnages-collectes-en-2018/lines",
            dataProviderName: "ademe_opendata",
            pagination: {
                pageSize: 150,
            },
            filters: [
                {
                    field: "Code_Région",
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
                        pa
                        <LoadingComponent isLoading={collecte_pa.isFetching}>
                            {collecte_pa.data ? <ChartPieRepCollecte filiere='pa' data={collecte_pa.data.data} /> : <b>...</b>}
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
                <Col xl={24/2} xs={24}>
                    <Card>
                        tlc
                        <LoadingComponent isLoading={collecte_mnu.isFetching}>
                            {collecte_mnu.data ? <ChartPieRepCollecte filiere='mnu' data={collecte_mnu.data.data} /> : <b>...</b>}
                        </LoadingComponent>
                    </Card>
                </Col>
                <Col xl={24/2} xs={24}>
                    <Card>
                        tlc
                        <LoadingComponent isLoading={collecte_disp_med.isFetching}>
                            {collecte_disp_med.data ? <ChartPieRepCollecte filiere='disp_med' data={collecte_disp_med.data.data} /> : <b>...</b>}
                        </LoadingComponent>
                    </Card>
                </Col>
                <Col xl={24 / 2} xs={24}>
                    <Card>
                        <List
                            size="small"
                            header={<div><b>Autres données</b></div>}
                            bordered
                            dataSource={[
                                'Quantité mise sur le marché : niveau national seulemnet',
                                'DEA : données 2017-2020 seulement',
                                'VHU : Taux de recyclage et de valorisation (par département et par an) seulement'
                            ]}
                            renderItem={(item) => <List.Item>{item}</List.Item>}
                        />

                    </Card>
                </Col>





            </Row>
        </>
    )
}

