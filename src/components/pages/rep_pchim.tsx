import { useSearchParamsState, Attribution, LoadingContainer, useApi, SimpleRecord } from "api-dashboard"
import { Row, Col, Card } from "antd"
import { ChartPieRepCollecte } from "../chart_pie_rep_collecte"
import { RepTopbar } from "../rep_topbar"
import { useState } from "react"
import { DechetsDiffusSpecifiques, EnginsPyrotechniques, Extincteurs } from "../../utils/picto"
import alasql from "alasql"
import { ademe_opendataProvider } from "../../App"

export const RepPchimPage: React.FC = () => {
    const [year, setYear] = useSearchParamsState('year','2021')
    const [focus, setFocus] = useState<string | undefined>(undefined)

    //const [_cregion, _setcregion] = useSearchParamsState('region','32')
    const collecte_pchim = useApi(
        {
            resource: "rep-pchim-tonnages-collectes-2021/lines",
            dataProvider: ademe_opendataProvider,
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

    const data_standardized = collecte_pchim?.data ? (alasql(`SELECT [Année_des_données] AS annee, [equip_declare], sum([Somme_de_masse]) AS tonnage
    FROM ? d
    GROUP BY [Année_des_données], [equip_declare]
    `, [collecte_pchim.data.data]) as SimpleRecord[]).map((e:SimpleRecord) => ({annee:e.annee, name: e.equip_declare, value: e.tonnage} )) 
    :undefined

    const data_standardized_origine = collecte_pchim?.data ? (alasql(`SELECT [Année_des_données] AS annee, COALESCE([origine],'AUTR') as origine, sum([Somme_de_masse]) AS tonnage
    FROM ? d
    GROUP BY [Année_des_données], COALESCE([origine],'AUTR')
    `, [collecte_pchim.data.data])as SimpleRecord[] ).map((e:SimpleRecord) => ({annee:e.annee, name: e.origine, value: e.tonnage} )) 
    :undefined

    return (<>

              <Row gutter={[16, 16]}>
                <Col span={20}>
                     <RepTopbar year={Number(year)} onChangeYear={setYear} />
                </Col>
                <Col span={4}>
                    <Card style={{ height: '100%',   textAlign: 'center' }}>
                        <DechetsDiffusSpecifiques style={{maxHeight: '100px'}} />
                        <Extincteurs style={{maxHeight: '100px'}} />
                        <EnginsPyrotechniques style={{maxHeight: '100px'}} />
                    </Card>            
                </Col>
                <Col xl={24/2} xs={24}>
                    <Card title={`Tonnages collectés en ${year}`}>
                        <LoadingContainer isFetching={collecte_pchim.isFetching}>
                            {data_standardized ? <ChartPieRepCollecte filiere='pchim' data={data_standardized} year={Number(year)} focus_item={focus} onFocus={(e:any) => setFocus(e?.name)}/> : <b>...</b>}
                            <Attribution data={[{ name: 'Ademe', url: 'https://data.ademe.fr/datasets/rep-pchim-tonnages-collectes-2021' }]}></Attribution>
                        </LoadingContainer>
                    </Card>
                </Col>

                <Col xl={24/2} xs={24}>
                    <Card title="Evolution des tonnages collectés">
                        <LoadingContainer isFetching={collecte_pchim.isFetching}>
                            <small>Pas de données disponibles avant 2021</small> <br/>
                            <Attribution data={[{ name: 'Ademe', url: 'https://data.ademe.fr/datasets/rep-pchim-tonnages-collectes-2021' }]}></Attribution>
                        </LoadingContainer>
                    </Card>
                </Col>

                <Col xl={24/2} xs={24}>
                    <Card title={`Tonnages collectés par origine en ${year}`}>
                        <LoadingContainer isFetching={collecte_pchim.isFetching}>
                            {data_standardized_origine ? <ChartPieRepCollecte filiere='pchim' data={data_standardized_origine} year={Number(year)}  focus_item={focus} onFocus={(e:any) => setFocus(e?.name)}/> : <b>...</b>}
                            <Attribution data={[{ name: 'Ademe', url: 'https://data.ademe.fr/datasets/rep-pchim-tonnages-collectes-2021' }]}></Attribution>
                        </LoadingContainer>
                    </Card>
                </Col>
             </Row>
    </>)
}