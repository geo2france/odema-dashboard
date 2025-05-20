import { Card, Col, Descriptions, DescriptionsProps, FloatButton, Modal, Row, Select, Typography } from "antd"
import { ChartSankeyDestinationDMA } from "../chart_sankey_destination"
import { FilePdfOutlined, InfoCircleOutlined } from "@ant-design/icons"
import alasql from "alasql"
import { BsRecycle } from "react-icons/bs";
import { useMemo, useState } from "react"
import { FaPeopleGroup, FaHouseFlag , FaTrashCan } from "react-icons/fa6";
import { TbReportMoney } from "react-icons/tb";
import { DashboardElement, NextPrevSelect, KeyFigure, useSearchParamsState, FlipCard, SimpleRecord, DashboardPage, useApi } from "api-dashboard"
import { ChartEvolutionDechet } from "../chart_evolution_dechet"
import { grey } from '@ant-design/colors';
import { geo2franceProvider } from "../../App"
import { ChartCoutEpci, ChartCoutEpciDescription } from "../chart_cout_epci/ChartCoutEpci";
import { CompetenceBadge } from "../competence_badge/CompetenceBadge";
import ChartePieCollecte from "../chart_pie_collecte/ChartPieCollecte";

const { Link } = Typography;
const [maxYear, minYear, defaultYear] = [2023,2009,2023]

export const DmaPageEPCI: React.FC = () => {
    const [siren_epci, setSiren_epci] = useSearchParamsState('siren','200067999')
    const [year, setYear] = useSearchParamsState('year',defaultYear.toString())
    const [focus, setFocus] = useState<string | undefined>(undefined)
    const [isModalOpen, setIsModalOpen] = useState(false);

    const {data:data_traitement, isFetching:data_traitement_isFecthing} =  useApi({ 
        resource:"odema:destination_dma_epci_harmonise",
        dataProvider:geo2franceProvider,
        pagination:{
            mode:"off"
        },
        filters:[
            {
                field:"siren_epci",
                operator:"eq",
                value:siren_epci
            }
        ]
    })

    const {data:data_ti} = useApi({
        resource:"odema:population_tarification_ti_epci",
        dataProvider:geo2franceProvider,
        pagination:{ mode: "off" },
        filters:[
            {
                field:"annee",
                value:year,
                operator:"eq"
            },
            {
                field:"epci_siren",
                operator:"eq",
                value:siren_epci
            }
        ]
    });

    const {data:data_cout} = useApi({
      resource:"odema:couts_epci",
      dataProvider:geo2franceProvider,
      pagination:{ mode: "off" },
      filters:[
          {
              field:"epci_siren",
              operator:"eq",
              value:siren_epci
          }
      ]
  });

    const {data:data_rpqs} =  useApi({ 
        resource:"odema:rqps ",
        dataProvider:geo2franceProvider,
        pagination:{
            mode:"off"
        },
        filters:[
            {
                field:"code_epci",
                operator:"eq",
                value:siren_epci
            }
        ]
    });

    const {data:data_ecpci_collecte} = useApi({
        resource:"odema:territoires_collecte ",
        dataProvider:geo2franceProvider,
        pagination:{
            mode:"off"
        },
        meta:{
            properties:["epci_siren", "epci_nom", "population", "nombre_communes", "population_epci", "c_acteur_sinoe"]
        }
    })

    const {data:data_ecpci_traitement} = useApi({
      resource:"odema:territoires_traitement ",
      dataProvider:geo2franceProvider,
      pagination:{
          mode:"off"
      },
      meta:{
          properties:["epci_siren", "epci_nom", "population", "nombre_communes", "population_epci", "c_acteur_sinoe"]
      }
  })

  const {data:data_ecpci_dechetterie} = useApi({
    resource:"odema:territoires_dechetterie",
    dataProvider:geo2franceProvider,
    pagination:{
        mode:"off"
    },
    meta:{
        properties:["epci_siren", "epci_nom", "population","nombre_communes", "population_epci", "c_acteur_sinoe"]
    }
})

  

   const territories = useMemo( () => data_ecpci_collecte?.data && data_ecpci_traitement?.data && data_ecpci_dechetterie?.data && alasql(`
    SELECT epci_siren, epci_nom,MAX(population) AS [population],MAX([nombre_communes]) AS [nombre_communes],c_acteur_sinoe, ARRAY([competence]) as [competence]
    FROM (
        SELECT epci_siren, epci_nom,population,nombre_communes,c_acteur_sinoe, 'collecte' AS [competence]
        FROM ?
        UNION
          SELECT epci_siren, epci_nom,population,nombre_communes,c_acteur_sinoe, 'traitement' AS [competence]
        FROM ?
        UNION
          SELECT epci_siren, epci_nom,population,nombre_communes,c_acteur_sinoe, 'dechetterie' AS [competence]
        FROM ?
        )
    GROUP BY epci_siren, epci_nom,c_acteur_sinoe `, [data_ecpci_collecte?.data, data_ecpci_traitement?.data, data_ecpci_dechetterie?.data]),
        [data_ecpci_collecte?.data, data_ecpci_traitement?.data, data_ecpci_dechetterie?.data]
   ) as SimpleRecord[];

   const options_territories = territories?.map((t:any) => ({label: t.epci_nom, value: t.epci_siren}))
    
  

    const indicateurs_cles = data_traitement?.data && alasql<SimpleRecord[]>(`
      SELECT 
        [annee],
        [traitement_destination], 
        SUM([tonnage]) as tonnage,
        MAX([population]) as population
      FROM ? 
      GROUP BY [annee], [traitement_destination]
    `,[data_traitement?.data])// chiffres clés pour les cards
  


    const current_indicateurs_cles = indicateurs_cles?.filter((e) => e.annee == year )

    const dma_total = current_indicateurs_cles?.reduce((sum, val) => sum + val.tonnage, 0)
    const pop = current_indicateurs_cles && current_indicateurs_cles[0] &&  current_indicateurs_cles[0].population
    const part_valo_matiere = dma_total && 100 * (current_indicateurs_cles?.find((e) => e.traitement_destination ==  "Valorisation organique")?.tonnage 
                              + current_indicateurs_cles?.find((e) => e.traitement_destination ==  "Valorisation matière")?.tonnage ) 
                              / dma_total


    const current_epci = territories?.find((e:any) => (e.epci_siren == siren_epci) ) 

    const territoire_descritpion_item : DescriptionsProps['items'] = [
        {
            key:'name',
            label:'Nom',
            children:current_epci?.epci_nom
        },
        {
            key:'siret',
            label:'SIREN',
            children:siren_epci
        },
        {
            key:'population',
            label:'Pop.',
            children:<> {pop?.toLocaleString()} &nbsp;<FaPeopleGroup /></>
        },
        {
            key:'nb_communes',
            label:'Communes',
            children:<> {current_epci?.nombre_communes && (current_epci?.nombre_communes).toLocaleString()} &nbsp;<FaHouseFlag /></>
        },
        {
          key:'competences',
          label:'Compétences',
          children: <CompetenceBadge competences={current_epci?.competence} />
        }
    ]

    const key_figures:any[] = [
        {id:"valo_dma", 
        name:"Taux de valorisation des DMA",
        description:"Part des DMA orientés vers les filières de valorisation matière ou organique.",
        value:part_valo_matiere || NaN,
        sub_value:"Obj. régional : 65 %",
        digits:1,
        icon: <BsRecycle />,
        unit:'%'},
        {id:"prod_dma", 
        name:"Production de DMA",
        description:"Production globale annuelle de DMA.",
        value: ( (dma_total || NaN) / pop) * 1e3,
        sub_value:"Obj. régional : 553 kg/hab",
        icon: <FaTrashCan />,
        unit:'kg/hab'},
        {
            id:"pop_ti",
            name:"Part de la population en TI",
            description: "Par de la population pour laquelle la taxe ou redevance d'enlèvement des déchets ménagers comprend une part incitative, c'est à dire dépendante de la masse de déchets produite et/ou du nombre de levées",
            value: data_ti?.data[0]?.part_pop_ti*100,
            sub_value:"Obj. régional : 30 %",
            icon:<TbReportMoney />,
            unit:"%"
        }
    ]

    const indicateur_type_dechet = useMemo(() => 
      data_traitement?.data.flatMap((e) => ({
        annee: e.annee,
        type: e.type_dechet,
        population: e.population,
        tonnage: e.tonnage,
      })) , [data_traitement]);
    

    const indicateurs_destination_dechet = useMemo(() => 
      data_traitement?.data.map((e) => ({
        annee: e.annee,
        type: e.traitement_destination === 'Stockage pour inertes' ? 'Stockage' : e.traitement_destination,
        population: e.population,
        tonnage: e.tonnage,
      })), [data_traitement]);

    return (<>
      <FloatButton 
        style={{'top':5, 'right':28, 'height':40}}
        icon={<InfoCircleOutlined />}
        type='primary'
        shape='square'
        onClick={() => setIsModalOpen(true)}
        />

      <Modal
        title="Tableau de bord EPCI"
        closable={{ 'aria-label': 'Custom Close Button' }}
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        style={{width:undefined}}
        footer={null}
      >
        <p>Les tonnages présentés ici sont issus de l'enquête collecte de de <Link href="https://www.sinoe.org/" target="_blank">Sinoe</Link>,
        mais distribués sur des périmètres différents au prorata de la population. Il peut donc s'agir de tonnages estimés.</p>
        <p>Retrouvez ici le <Link href="https://www.geo2france.fr/portal/download-document/d46bc35bac12000f2c2fa4b794a36194" target="_blank">détail de la méthode</Link> utilisée.</p>
      </Modal>

      <DashboardPage
        control={
            [
                <NextPrevSelect key="A"
                      onChange={(e: any) => (e ? setYear(e) : undefined)}
                      reverse={true}
                      value={year}
                      options={
                        Array.from( { length: maxYear - minYear + 1 }, (_, i) => minYear + i ) //Séquence de minYear à maxYear
                        .filter((num) => num % 2 !== 0) //Seulement les années impaires. A partir de 2025, il est prévu que les enquêtes deviennent annuelles
                        .reverse()
                        .map((i) => ({ label: i, value: i }))}
                    />,
                <Select key="B"
                      className='select-fixed' 
                      value={siren_epci}
                      showSearch
                      optionFilterProp="label"
                      onSelect={setSiren_epci}
                      options={options_territories}
                      style={{ maxWidth:"100%" }}
                />
            ]
          }
      >

      <DashboardElement title="Territoire" section="Panorama" toolbox={false}>
          <Descriptions
            items={territoire_descritpion_item}
            style={{ marginTop: 5 }}
          />
        </DashboardElement>

        <DashboardElement
        virtual
        title="Chiffre clés"
        section="Panorama">
          <Row>{key_figures.map((f, idx) => (
            <Col xl={24/3} md={24/3} xs={24} key={idx}>
              <KeyFigure
                value={f.value}
                unit={f.unit}
                digits={f.digits || 0}
                name={f.name}
                icon={f.icon}
                sub_value={f.sub_value}
                description={f.description}
              />
            </Col>
          ))}</Row>
        </DashboardElement>

          <DashboardElement
            section="Panorama"
            isFetching={data_traitement_isFecthing}
            title={`Destination des DMA par type de déchet en ${year}`}
            attributions={[
              {
                name: "Odema",
                url: "https://www.geo2france.fr/datahub/dataset/c60bd751-b4e3-4eb0-bbf0-d2252d705105",
              },
            ]}
          >
            {data_traitement && (
              <ChartSankeyDestinationDMA
                data={data_traitement?.data
                  .filter((d: any) => d.annee == year)
                  .map((i: SimpleRecord) => ({
                    value: Math.max(i.tonnage, 1),
                    source: i.type_dechet,
                    target: i.traitement_destination === 'Stockage pour inertes' ? 'Stockage' : i.traitement_destination,
                  }))}
                onFocus={(e: any) => setFocus(e?.name)}
                focus_item={focus}
              />
            )}
          </DashboardElement>

          <DashboardElement
            isFetching={data_traitement_isFecthing}
            title={`Type de déchets collectés`}
            section="Panorama"
            attributions={[
              {
                name: "Odema",
                url: "https://www.geo2france.fr/datahub/dataset/c60bd751-b4e3-4eb0-bbf0-d2252d705105",
              },
            ]}
          >
            {indicateur_type_dechet && (
              <ChartEvolutionDechet
                data = {indicateur_type_dechet}
                onFocus={(e: any) => setFocus(e?.seriesName)}
                focus_item={focus}
                year={Number(year)}
              />
            )}
          </DashboardElement>

          <DashboardElement 
              title={`Répartition des modes de collecte en ${year}`}
              isFetching={data_traitement_isFecthing}
              section="Panorama" 
              attributions={[
                {
                  name: "Odema",
                  url: "https://www.geo2france.fr/datahub/dataset/c60bd751-b4e3-4eb0-bbf0-d2252d705105",
                },
              ]}>
            {data_traitement && <ChartePieCollecte data={data_traitement?.data?.filter((e) => Number(e.annee) == Number(year))} /> }
          </DashboardElement>

          <DashboardElement
            isFetching={data_traitement_isFecthing}
            title={`Destination des déchets`}
            section="Traitement"
            attributions={[
              {
                name: "Odema",
                url: "https://www.geo2france.fr/datahub/dataset/c60bd751-b4e3-4eb0-bbf0-d2252d705105",
              },
            ]}
          >
            {indicateurs_destination_dechet && (
              <ChartEvolutionDechet
                data={indicateurs_destination_dechet}
                onFocus={(e: any) => setFocus(e?.seriesName)}
                focus_item={focus}
                year={Number(year)}
              />
            )}
          </DashboardElement>

          <DashboardElement 
            title="Coûts de gestion des déchets"
            section="Coûts"
            description={ChartCoutEpciDescription}
            attributions={[
              {
                name: "Ademe",
                url: "https://www.sinoe.org/",
              },
            ]}
            >{data_cout && 
              <ChartCoutEpci data={data_cout?.data}/> }
          </DashboardElement>
          
          <DashboardElement
            title="Rapports RPQS"
            section="Panorama"
            virtual>
            <FlipCard
              information={
                <div style={{ padding: 5 }}>
                  <p>
                    L'article{" "}
                    <a href="https://www.legifrance.gouv.fr/codes/article_lc/LEGIARTI000031840555/2021-09-21">
                      L2224-1
                    </a>{" "}
                    du Code général des collectivités territoriales impose aux
                    collectivités ayant la compétence collecte ou traitement de
                    déchets de publier annuellement un RPQS de gestion et
                    prévention des déchets.
                  </p>
                  <p>
                    <strong>Un travail de centralisation</strong> par l'Odema est
                    en cours. Si vous avez en votre possession des documents
                    identifiés comme manquants, merci de bien vouloir nous les
                    transmettre.
                  </p>
                </div>
              }
              title={<span style={{ marginLeft: 5 }}>Bilans RPQS</span>}
            >
              {data_rpqs?.data &&
              data_rpqs?.data?.filter((e: any) => e.url).length > 0 ? (
                data_rpqs?.data
                  .sort((a: any, b: any) => b.annee_exercice - a.annee_exercice)
                  .map((d: any) => (
                    <Card.Grid
                      key={d.annee_exercice}
                      hoverable={d.url}
                      style={{ width: "20%", paddingTop: 5, textAlign: "center" }}
                    >
                      {d.url ? (
                        <a href={d.url}>
                          <FilePdfOutlined style={{ fontSize: 25 }} />{" "}
                        </a>
                      ) : (
                        <FilePdfOutlined
                          style={{ color: grey[1], fontSize: 25 }}
                        />
                      )}
                      <br />
                      {d.annee_exercice == year ? (
                        <strong>{d.annee_exercice}</strong>
                      ) : d.url ? (
                        <span>{d.annee_exercice}</span>
                      ) : (
                        <span style={{ color: grey[1] }}>{d.annee_exercice}</span>
                      )}
                    </Card.Grid>
                  ))
              ) : (
                <small style={{ margin: 5 }}>
                  🙁 Aucun rapport n'est disponible.
                </small>
              )}
            </FlipCard>
          </DashboardElement>
      </DashboardPage>
    </>
    );
}