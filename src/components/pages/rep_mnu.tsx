import { BaseRecord, IResourceComponentsProps, useList } from "@refinedev/core"
import { useSearchParamsState } from "../../g2f-dashboard/utils/useSearchParamsState"
import { Row, Col, Card } from "antd"
import { Attribution } from "../../g2f-dashboard/components/attributions"
import { LoadingComponent } from "../../g2f-dashboard/components/loading_container"
import { RepTopbar } from "../rep_topbar"
import { ChartEvolutionRepCollecte } from "../chart_evolution_rep_collecte"
import { useState } from "react"
import { Medicaments } from "../../utils/picto"
import alasql from "alasql"

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

    const data_standardized = collecte?.data ? alasql(`SELECT [Code_Région], [Année_des_données] AS annee, sum([tonnage]) AS tonnage
    FROM ? d
    GROUP BY [Code_Région], [Année_des_données]
    `, [collecte.data.data]).map((e:BaseRecord) => ({annee:e.annee, name: 'MNU', value: e.tonnage} )) 
    :undefined

    return (<>

        <Row gutter={[16, 16]}>
            <Col span={20}>
                <RepTopbar year={Number(year)} onChangeYear={setYear} />
            </Col>
            <Col span={4}>
                <Card style={{ height: '100%',   textAlign: 'center' }}>
                    <Medicaments style={{maxHeight: '100px'}} />
                </Card>            
            </Col>

            <Col xl={24 / 2} xs={24}>
                <Card title={`Tonnages collectés en ${year}`}>

                    <LoadingComponent isFetching={collecte.isFetching}>
                        {collecte.data ? <b>{data_standardized.filter((e:BaseRecord) => (e.annee == Number(year)))[0]?.value}</b> : <b>...</b>}
                        <br /><small> Seul le tonnage 2021 est disponible. Type de déchet unique.</small><br />
                        <Attribution data={[{ name: 'Ademe', url: 'https://data.ademe.fr/datasets/rep-mnu-tonnages-collectes-en-2021' }]}></Attribution>
                    </LoadingComponent>
                </Card>
            </Col>

            <Col xl={24 / 2} xs={24}>
                <Card title="Evolution des tonnages collectés">
                    <LoadingComponent isFetching={collecte.isFetching}>
                        <small>Pas de données disponibles avant 2021</small> <br/>
                        {collecte.data ? <ChartEvolutionRepCollecte filiere={filiere} data={data_standardized} year={Number(year)} focus_item={focus} onFocus={(e:any) => setFocus(e?.seriesName)}/> : <b>...</b>}
                        <Attribution data={[{ name: 'Ademe', url: 'https://data.ademe.fr/datasets/rep-deee-tonnages-collectes-en-2018' }]}></Attribution>
                    </LoadingComponent>
                </Card>
            </Col>
        </Row>
    </>)
}