import { Card, Col, Descriptions, DescriptionsProps, Form, Row, Select } from "antd"
import { ChartSankeyDestinationDMA } from "../chart_sankey_destination"
import { FilePdfOutlined } from "@ant-design/icons"
import alasql from "alasql"
import { BsRecycle } from "react-icons/bs";
import { useMemo, useState } from "react"
import { FaPeopleGroup, FaHouseFlag , FaTrashCan } from "react-icons/fa6";
import { TbReportMoney } from "react-icons/tb";
import { DashboardElement, NextPrevSelect, KeyFigure, useSearchParamsState, FlipCard, SimpleRecord, DashboardLayout } from "g2f-dashboard"
import { ChartEvolutionDechet } from "../chart_evolution_dechet"
import { grey } from '@ant-design/colors';
import { useApi } from "g2f-dashboard"
import { ademe_opendataProvider, geo2franceProvider } from "../../App"
import { ChartCoutEpci, ChartCoutEpciDescription } from "../chart_cout_epci/ChartCoutEpci";
import { ChartCoutEpciCompare } from "../chart_cout_epci_compare/ChartCoutEpciCompare";


const [maxYear, minYear, defaultYear] = [2023,2009,2021]

export const DmaPageEPCI: React.FC = () => {
    const [siren_epci, setSiren_epci] = useSearchParamsState('siren','200067999')
    const [year, setYear] = useSearchParamsState('year',defaultYear.toString())
    const [focus, setFocus] = useState<string | undefined>(undefined)


    const {data:data_traitement, isFetching:data_traitement_isFecthing} =  useApi({ 
        resource:"odema:destination_dma_epci ",
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

    const {data:data_cout, isFetching:data_cout_isfectching} = useApi({
      resource:"odema:couts_epci",
      dataProvider:geo2franceProvider,
      pagination:{ mode: "off" },
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
            properties:["epci_siren", "epci_nom","population","nombre_communes","c_acteur_sinoe"]
        }
    })

    const {data:data_ecpci_traitement} = useApi({
      resource:"odema:territoires_traitement ",
      dataProvider:geo2franceProvider,
      pagination:{
          mode:"off"
      },
      meta:{
          properties:["epci_siren", "epci_nom","population","nombre_communes","c_acteur_sinoe"]
      }
  })

   const options_territories = useMemo( () => data_ecpci_collecte?.data && data_ecpci_traitement?.data && alasql(`
        SELECT [epci_nom] AS [label], [epci_siren] AS [value]
        FROM ?
        UNION
          SELECT [epci_nom] AS [label], [epci_siren] AS [value]
        FROM ?`, [data_ecpci_collecte?.data, data_ecpci_traitement?.data]),
        [data_ecpci_collecte?.data, data_ecpci_traitement?.data]
   )

   const current_epci = data_ecpci_collecte?.data.find((e:any) => (e.epci_siren == siren_epci) ) || data_ecpci_traitement?.data.find((e:any) => (e.epci_siren == siren_epci) )

   const indicateurs = useApi({
    resource:"sinoe59-indic-synth-acteur/lines",
    dataProvider:ademe_opendataProvider,
    pagination: {
      pageSize: 2000,
    },
    filters:[
      {field:"c_acteur",
        operator:"eq",
        value:current_epci?.c_acteur_sinoe
      }
    ]
  })


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
            children:<> {current_epci?.population && (current_epci?.population).toLocaleString()} &nbsp;<FaPeopleGroup /></>
        },
        {
            key:'nb_communes',
            label:'Communes',
            children:<> {current_epci?.nombre_communes && (current_epci?.nombre_communes).toLocaleString()} &nbsp;<FaHouseFlag /></>
        },
    ]

    const indicateur_curent_year = indicateurs?.data?.data.find((e) => e.annee == year);

    const key_figures:any[] = [
        {id:"valo_dma", 
        name:"Taux de valorisation des DMA",
        description:"Part des DMA orientés vers les filières de valorisation matière ou organique (hors déblais et gravats).",
        value:((indicateur_curent_year?.tonnage_valo_org + indicateur_curent_year?.tonnage_valo_mat) / indicateur_curent_year?.tonnage_dma)*100,
        sub_value:"Obj. régional : 65 %",
        digits:1,
        icon: <BsRecycle />,
        unit:'%'},
        {id:"prod_dma", 
        name:"Production de DMA",
        description:"Production globale annuelle de DMA (hors déblais et gravats).",
        value: (indicateur_curent_year?.tonnage_dma  / indicateur_curent_year?.pop_dma) * 1e3,
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


    const indicateur_type_dechet = useMemo(() => indicateurs?.data?.data.flatMap(({ annee,pop_dma, ...cols }) =>
        Object.entries(cols)
        .filter(([key]) => ['tonnage_omr','tonnage_enc','tonnage_dang','tonnage_ejm','tonnage_bio', 'tonnage_verre','tonnage_autre', 'tonnage_dechet_dg'].includes(key))
        .map(([key, value]) => ({
          annee:Number(annee),
          type: String(key),
          tonnage:Number(value),
          population:Number(pop_dma)
        }))
      ), [indicateurs.data?.data]
    )
    
    const indicateurs_destination_dechet = useMemo( () => indicateurs?.data?.data.flatMap(({ annee,pop_dma, ...cols }) =>
      Object.entries(cols)
      .filter(([key]) => ['tonnage_valo_mat_dg','tonnage_valo_enr_dg','tonnage_inc_dg','tonnage_stock_dg','tonnage_valo_org_dg', 'tonnage_stock_inerte_dg', 'tonnage_np_dg'].includes(key))
      .map(([key, value]) => ({
        annee:Number(annee),
        type: String(key === 'tonnage_stock_inerte_dg' ? 'tonnage_stock_dg' : key ), // Stockage inerte -> stockage
        tonnage:Number(value),
        population:Number(pop_dma)
      }))
    ), [indicateurs.data?.data]
  )

    return (
      <DashboardLayout
        control={
            <Form layout="inline">
                <Form.Item label="Année">
                    <NextPrevSelect
                      onChange={(e: any) => (e ? setYear(e) : undefined)}
                      reverse={true}
                      value={year}
                      options={
                        Array.from( { length: maxYear - minYear + 1 }, (_, i) => minYear + i ) //Séquence de minYear à maxYear
                        .filter((num) => num % 2 !== 0) //Seulement les années impaires. A partir de 2025, il est prévu que les enquêtes deviennent annuelles
                        .reverse()
                        .map((i) => ({ label: i, value: i }))}
                    />
                </Form.Item>
                <Form.Item label="EPCI">
                    <Select
                      value={siren_epci}
                      showSearch
                      optionFilterProp="label"
                      onSelect={setSiren_epci}
                      options={options_territories}
                      style={{ width: 450 }}
                    />
                </Form.Item>
              </Form>
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
                name: "Ademe",
                url: "https://data.ademe.fr/datasets/sinoe-(r)-destination-des-dma-collectes-par-type-de-traitement",
              },
            ]}
          >
            {data_traitement && (
              <ChartSankeyDestinationDMA
                data={data_traitement?.data
                  .filter((d: any) => d.annee == year)
                  .map((i: SimpleRecord) => ({
                    value: Math.max(i.tonnage_dma, 1),
                    source: i.l_typ_reg_dechet,
                    target: i.l_typ_reg_service === 'Stockage pour inertes' ? 'Stockage' : i.l_typ_reg_service,
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
                name: "Ademe",
                url: "https://data.ademe.fr/datasets/sinoe-(r)-destination-des-dma-collectes-par-type-de-traitement",
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
            isFetching={data_traitement_isFecthing}
            title={`Destination des déchets`}
            section="Traitement"
            attributions={[
              {
                name: "Ademe",
                url: "https://data.ademe.fr/datasets/sinoe-(r)-destination-des-dma-collectes-par-type-de-traitement",
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
              <ChartCoutEpci data={data_cout?.data.filter((e:SimpleRecord) => e.epci_siren == siren_epci)}/> }
          </DashboardElement>

          <DashboardElement 
            title="Coûts de gestion des déchets - comparatif"
            isFetching={data_cout_isfectching}
            section="Coûts"
            description={"TODO : expliquer la lecture des boxplot"}
            attributions={[
              {
                name: "Ademe",
                url: "https://www.sinoe.org/",
              },
            ]}
            >{data_cout && 
              <ChartCoutEpciCompare data={data_cout?.data} siren={siren_epci}/> }
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
      </DashboardLayout>
    );
}