import { useSearchParamsState, Attribution, LoadingContainer, useApi, SimpleRecord } from "api-dashboard"
import { Row, Col, Card } from "antd"
import { ChartPieRepCollecte } from "../chart_pie_rep_collecte"
import { RepTopbar } from "../rep_topbar"
import { useState } from "react"
import { Textiles } from "../../utils/picto"
import alasql from "alasql"
import { ademe_opendataProvider } from "../../App"

export const RepTlcPage: React.FC = () => {
    const [year, setYear] = useSearchParamsState('year','2021')
    const [focus, setFocus] = useState<string | undefined>(undefined)
    //const [cregion, _setcregion] = useSearchParamsState('region','32')

    const collecte = useApi(
        {
            resource: "rep-tlc-tonnages-collectes-en-2021/lines",
            dataProvider: ademe_opendataProvider,
            pagination: {
                pageSize: 150,
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

    const data_standardized = collecte?.data ? (alasql(`SELECT [Année_des_données] AS annee, [origine], sum([tonnage]) AS tonnage
    FROM ? d
    GROUP BY [Année_des_données], [origine]
    `, [collecte.data.data]) as SimpleRecord[]).map((e:SimpleRecord) => ({annee:e.annee, name: e.origine, value: e.tonnage} )) 
    :undefined


    return (<>

                <Row gutter={[16, 16]}>
                <Col span={20}>
                     <RepTopbar year={Number(year)} onChangeYear={setYear} />
                </Col>
                <Col span={4}>
                    <Card style={{ height: '100%',   textAlign: 'center' }}>
                        <Textiles style={{maxHeight: '100px'}} />
                    </Card>            
                </Col>

                <Col xl={24/2} xs={24}>
                    <Card title={`Tonnages collectés en ${year}`}>
                        <LoadingContainer isFetching={collecte.isFetching}>
                            {data_standardized ? <ChartPieRepCollecte filiere='tlc' data={data_standardized} year={Number(year)} focus_item={focus}  onFocus={(e:any) => setFocus(e?.name)}/> : <b>...</b>}
                            <Attribution data={[{ name: 'Ademe', url: 'https://data.ademe.fr/datasets/rep-tlc-tonnages-collectes-en-2021' }]}></Attribution>
                        </LoadingContainer>
                    </Card>
                </Col>

                <Col xl={24/2} xs={24}>
                    <Card title="Evolution des tonnages collectés">
                        <LoadingContainer isFetching={collecte.isFetching}>
                            <small>Pas de données disponibles avant 2021</small> <br/>
                            <Attribution data={[{ name: 'Ademe', url: 'https://data.ademe.fr/datasets/rep-tlc-tonnages-collectes-en-2021' }]}></Attribution>
                        </LoadingContainer>
                    </Card>
                </Col>
                </Row>
    </>)
}