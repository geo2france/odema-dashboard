import { BaseRecord, IResourceComponentsProps, useList } from "@refinedev/core";
import { Row, Col, Card, List } from "antd";
import { useSearchParamsState, LoadingComponent, Attribution } from "g2f-dashboard";
import { ChartPieRepCollecte } from "../chart_pie_rep_collecte";
import { RepTopbar } from "../rep_topbar";
import alasql from "alasql";

//TODO splitter cette page pour chaque filière (rep_mnu.tsx, rep_vhu.tsx...). Ici mettre un Tab pour chaque filière.

export const RepPage: React.FC<IResourceComponentsProps> = () => {
    const [year, setYear] = useSearchParamsState('year','2021')

    const [cregion, _setcregion] = useSearchParamsState('region','32')
    
    const collecte_pu = useList(
        {
            resource: "rep-pu-tonnages-collectes-en-2018/lines",
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

    const data_standardized_pu = collecte_pu?.data ? alasql(`
    SELECT d.[Code_Région], d.[Année_des_données] AS annee, 'Cyclomoteurs_et_véhicules_légers' AS type, sum(d.[Cyclomoteurs_et_véhicules_légers]) AS tonnage
    FROM ? d
    GROUP BY d.[Code_Région], d.[Année_des_données]
    UNION ALL CORRESPONDING
    SELECT d2.[Code_Région], d2.[Année_des_données] AS annee, 'Poids_lourd' AS type, sum(d2.[Poids_lourd]) AS tonnage
    FROM ? d2
    GROUP BY d2.[Code_Région], d2.[Année_des_données]
    UNION ALL CORRESPONDING
    SELECT d3.[Code_Région], d3.[Année_des_données] AS annee, 'Avions_-_Hélicoptères' AS type, sum(d3.[Avions_-_Hélicoptères]) AS tonnage
    FROM ? d3
    GROUP BY d3.[Code_Région], d3.[Année_des_données]
    UNION ALL CORRESPONDING
    SELECT d4.[Code_Région], d4.[Année_des_données] AS annee, 'Agraire_-_Génie_civil_1_et_agraire_-_Génie_civil_2' AS type, sum(d4.[Agraire_-_Génie_civil_1_et_agraire_-_Génie_civil_2]) AS tonnage
    FROM ? d4
    GROUP BY d4.[Code_Région], d4.[Année_des_données]
    `, [collecte_pu.data.data,collecte_pu.data.data,collecte_pu.data.data,collecte_pu.data.data])
    .map((e:BaseRecord) => ({annee:e.annee, name: e.type, value: e.tonnage} )) 
    :undefined

    const collecte_vhu = useList(
        {
            resource: "rep-vhu-tonnages-collectes-cvhu-en-2018/lines",
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
                    field: "Années",
                    operator: "eq",
                    value: year
                },

            ]
        }
    )

    const data_vhu2 = collecte_vhu.data?.data.map((e) => ({...e,
        'Compagnies_et_mutuelles_d_assurances':e["Compagnies_et_mutuelles_d'assurances"],
        'Garages_indépendants_et_autres_professionnels_de_l_entretien':e["Garages_indépendants_et_autres_professionnels_de_l'entretien"],
    })) // Fix name with quote...

    const data_standardized_vhu = data_vhu2 ? alasql(`
    SELECT d.[Code_Région], d.[Années] as annee, "Particuliers" AS type, sum(d.[Particuliers]::NUMBER) AS tonnage
    FROM ? d
    GROUP BY d.[Code_Région], d.[Années]
    UNION ALL CORRESPONDING
    SELECT d2.[Code_Région], d2.[Années] as annee, "Compagnies_et_mutuelles_d'assurances" AS type, sum(d2.[Compagnies_et_mutuelles_d_assurances]::NUMBER) AS tonnage
    FROM ? d2
    GROUP BY d2.[Code_Région], d2.[Années]
    UNION ALL CORRESPONDING
    SELECT d3.[Code_Région], d3.[Années] as annee, 'Autres' AS type, sum(d3.[Autres]::NUMBER) AS tonnage
    FROM ? d3
    GROUP BY d3.[Code_Région], d3.[Années]
    UNION ALL CORRESPONDING
    SELECT d4.[Code_Région], d4.[Années] as annee,  'Concessionnaires_et_professionnels_des_réseaux_des_constructeurs' AS type, sum(d4.[Concessionnaires_et_professionnels_des_réseaux_des_constructeurs]::NUMBER) AS tonnage
    FROM ? d4
    GROUP BY d4.[Code_Région], d4.[Années]
    UNION ALL CORRESPONDING
    SELECT d5.[Code_Région], d5.[Années] as annee, 'Fourrières' AS type, sum(d5.[Fourrières]::NUMBER) AS tonnage
    FROM ? d5
    GROUP BY d5.[Code_Région], d5.[Années]
    UNION ALL CORRESPONDING
    SELECT d6.[Code_Région], d6.[Années] as annee, "Garages_indépendants_et_autres_professionnels_de_l'entretien" AS type, sum(d6.[Garages_indépendants_et_autres_professionnels_de_l_entretien]::NUMBER) AS tonnage
    FROM ? d6
    GROUP BY d6.[Code_Région], d6.[Années]
    `, [data_vhu2,data_vhu2,data_vhu2,data_vhu2,data_vhu2,data_vhu2]).map((e:BaseRecord) => ({annee:e.annee, name: e.type, value: e.tonnage} )) 
    :undefined

    return(
        <>
            <Row gutter={[16, 16]}>
                <Col span={24}>
                    <RepTopbar year={Number(year)} onChangeYear={setYear}/>
                </Col>

                <Col xl={24/2} xs={24}>
                    <Card>
                        pu
                        <LoadingComponent isFetching={collecte_pu.isFetching}>
                            {collecte_pu.data ? <ChartPieRepCollecte filiere='pu' data={data_standardized_pu} year={Number(year)} /> : <b>...</b>}
                            <Attribution data={[{ name: 'Ademe', url: 'https://data.ademe.fr/datasets/rep-pu-tonnages-collectes-en-2018' }]}></Attribution>
                        </LoadingComponent>
                    </Card>
                </Col>
                <Col xl={24/2} xs={24}>
                    <Card>
                        vhu
                        <LoadingComponent isFetching={collecte_vhu.isFetching}>
                            {collecte_vhu.data ? <ChartPieRepCollecte filiere='vhu' data={data_standardized_vhu} year={Number(year)} /> : <b>...</b>}
                            <Attribution data={[{ name: 'Ademe', url: 'https://data.ademe.fr/datasets/rep-vhu-tonnages-collectes-cvhu-en-2018' }]}></Attribution>
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

