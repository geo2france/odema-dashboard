import { BaseRecord, IResourceComponentsProps, useList } from "@refinedev/core"
import { useSearchParamsState } from "../../utils"
import { Row, Col, Card } from "antd"
import { Attribution } from "../attributions"
import { ChartPieRepCollecte } from "../chart_pie_rep_collecte"
import { LoadingComponent } from "../loading_container"
import { RepTopbar } from "../rep_topbar"
import { useState } from "react"
import { ChartEvolutionRepCollecte } from "../chart_evolution_rep_collecte"
import { PilesEtBatteries } from "../../utils/picto"
import alasql from "alasql"

export const RepPaPage: React.FC<IResourceComponentsProps> = () => {
    const [year, setYear] = useSearchParamsState('year','2021')
    const [focus, setFocus] = useState<string | undefined>(undefined)
    const [cregion, _setcregion] = useSearchParamsState('region','32')

    const filiere = 'pa'

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
                }
            ]
        }
    )

    const data_standardized = collecte_pa?.data ? alasql(`
    SELECT d.[Code_Région], d.[Année_des_données] AS annee, 'Collectivités' AS type, sum(d.[Collectivités]) AS tonnage
    FROM ? d
    GROUP BY d.[Code_Région], d.[Année_des_données]
    UNION ALL CORRESPONDING
    SELECT d2.[Code_Région], d2.[Année_des_données] AS annee, 'Distribution' AS type, sum(d2.[Distribution]) AS tonnage
    FROM ? d2
    GROUP BY d2.[Code_Région], d2.[Année_des_données]
    UNION ALL CORRESPONDING
    SELECT d3.[Code_Région], d3.[Année_des_données] AS annee,  'Autre' AS type, sum(d3.[Autre]) AS tonnage
    FROM ? d3
    GROUP BY d3.[Code_Région], d3.[Année_des_données]
    `, [collecte_pa.data.data,collecte_pa.data.data,collecte_pa.data.data]).map((e:BaseRecord) => ({annee:e.annee, name: e.type, value: e.tonnage} )) : undefined

    return (<>

            <Row gutter={[16, 16]}>
                <Col span={20}>
                     <RepTopbar year={Number(year)} onChangeYear={setYear} />
                </Col>
                <Col span={4}>
                    <Card style={{ height: '100%',   textAlign: 'center' }}>
                        <PilesEtBatteries style={{maxHeight: '100px'}} />
                    </Card>            
                </Col>
                
                <Col xl={24/2} xs={24}>
                    <Card title={`Tonnages collectés par origine en ${year}`}>
                        <LoadingComponent isLoading={collecte_pa.isFetching}>
                            {collecte_pa.data ? <ChartPieRepCollecte filiere={filiere} data={data_standardized} year={Number(year)} focus_item={focus} onFocus={setFocus}/> : <b>...</b>}
                            <Attribution data={[{ name: 'Ademe', url: 'https://data.ademe.fr/datasets/rep-pa-tonnages-collectes-en-2018' }]}></Attribution>
                        </LoadingComponent>
                    </Card>
                </Col>

                <Col xl={24/2} xs={24}>
                    <Card title="Evolution des tonnages collectés">
                        <LoadingComponent isLoading={collecte_pa.isFetching}>
                            {collecte_pa.data ? <ChartEvolutionRepCollecte filiere={filiere} data={data_standardized} year={Number(year)} focus_item={focus} onFocus={setFocus}/> : <b>...</b>}
                            <Attribution data={[{ name: 'Ademe', url: 'https://data.ademe.fr/datasets/rep-deee-tonnages-collectes-en-2018' }]}></Attribution>
                        </LoadingComponent>
                    </Card>
                </Col>

                </Row>
    </>)
}