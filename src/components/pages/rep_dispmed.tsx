import { BaseRecord, IResourceComponentsProps, useList } from "@refinedev/core"
import { useSearchParamsState } from "../../utils"
import { Row, Col, Card } from "antd"
import { Attribution } from "../attributions"
import { ChartPieRepCollecte } from "../chart_pie_rep_collecte"
import { LoadingComponent } from "../loading_container"
import { RepTopbar } from "../rep_topbar"
import { useState } from "react"
import { ChartEvolutionRepCollecte } from "../chart_evolution_rep_collecte"
import { Dasri } from "../../utils/picto"
import alasql from "alasql"

export const RepDispmedPage: React.FC<IResourceComponentsProps> = () => {
    const [year, setYear] = useSearchParamsState('year','2021')
    const [focus, setFocus] = useState<string | undefined>(undefined)
    const [_cregion, _setcregion] = useSearchParamsState('region','32')

    const filiere = 'disp_med'

    const collecte = useList(
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
                }
            ]
        }
    )

    const data_standardized = collecte?.data ? alasql(`SELECT [Année_des_données] AS annee, [origine], sum([tonnage]) AS tonnage
    FROM ? d
    GROUP BY [origine], [Année_des_données] 
    `, [collecte.data.data]).map((e:BaseRecord) => ({annee:e.annee, name: e.origine, value: e.tonnage} )) 
    :undefined

    return (<>

                <Row gutter={[16, 16]}>
                <Col span={20}>
                     <RepTopbar year={Number(year)} onChangeYear={setYear} />
                </Col>
                <Col span={4}>
                    <Card style={{ height: '100%',   textAlign: 'center' }}>
                        <Dasri style={{maxHeight: '100px'}} />
                    </Card>            
                </Col>

                <Col xl={24/2} xs={24}>
                    <Card title={`Tonnages collectés en ${year}`}>
                        <LoadingComponent isLoading={collecte.isFetching}>
                            {collecte.data ? <ChartPieRepCollecte filiere={filiere} data={data_standardized} year={Number(year)} focus_item={focus} onFocus={setFocus}/> : <b>...</b>}
                            <Attribution data={[{ name: 'Ademe', url: 'https://data.ademe.fr/datasets/rep-disp-med-tonnages-collectes-en-2021' }]}></Attribution>
                        </LoadingComponent>
                    </Card>
                </Col>

                <Col xl={24/2} xs={24}>
                    <Card title="Evolution des tonnages collectés">
                        <LoadingComponent isLoading={collecte.isFetching}>
                            <small>Pas de données disponibles avant 2021</small> <br/>
                            {collecte.data ? <ChartEvolutionRepCollecte filiere={filiere} data={data_standardized} year={Number(year)} focus_item={focus} onFocus={setFocus}/> : <b>...</b>}
                            <Attribution data={[{ name: 'Ademe', url: 'https://data.ademe.fr/datasets/rep-disp-med-tonnages-collectes-en-2021' }]}></Attribution>
                        </LoadingComponent>
                    </Card>
                </Col>

                </Row>
    </>)
}