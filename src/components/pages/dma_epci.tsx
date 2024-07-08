import { BaseRecord, useList } from "@refinedev/core"
import { useSearchParamsState } from "../../g2f-dashboard/utils/useSearchParamsState"
import { Card, Col, Descriptions, DescriptionsProps, Row, Select } from "antd"
import { ChartSankeyDestinationDMA } from "../chart_sankey_destination"
import { DashboardElement } from "../../g2f-dashboard/components/dashboard_element"
import { FilePdfOutlined, FrownOutlined } from "@ant-design/icons"
import alasql from "alasql"
import { KeyFigure } from "../../g2f-dashboard/components/key_figure"
import { BsRecycle } from "react-icons/bs";
import { ChartEvolutionTraitement } from "../chart_dma_evolution_type_traitement"
import { useState } from "react"
import { FaPeopleGroup, FaHouseFlag , FaTrashCan } from "react-icons/fa6";


export const DmaPageEPCI: React.FC = () => {
    const [siren_epci, setSiren_epci] = useSearchParamsState('siren','200067999')
    const [year, setYear] = useSearchParamsState('year','2021')
    const [focus, setFocus] = useState<string | undefined>(undefined)

    const {data:data_traitement, isFetching:data_traitement_isFecthing} =  useList({ 
        resource:"odema:destination_dma_epci ",
        dataProviderName:"geo2france",
        pagination:{
            mode:"off"
        },
        filters:[
            {
                field:"siren_epci",
                operator:"eq",
                value:siren_epci
            },
            {
                field:"l_typ_reg_dechet",
                operator:"ne",
                value:'Déblais et gravats'
            },
            {
                field:"l_typ_reg_service",
                operator:"ne",
                value:'Stockage pour inertes'
            }
        ]
    })

    const {data:data_rpqs} =  useList({ 
        resource:"odema:rqps ",
        dataProviderName:"geo2france",
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

    const {data:data_ecpci_collecte} = useList({
        resource:"odema:territoires_collecte ",
        dataProviderName:"geo2france",
        pagination:{
            mode:"off"
        },
        meta:{
            properties:["epci_siren", "epci_nom","population","nombre_communes"]
        }
    })

    const options_territories = data_ecpci_collecte?.data.map((e) => ({label:e.epci_nom, value:e.epci_siren}))

    const current_epci = data_ecpci_collecte?.data.find((e) => (e.epci_siren == siren_epci) )


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


    /* TODO : Prévoir un bloc de logique permettant de pré-traiter certaines données pour éviter de répéter 
    les mêmes requêtes dans différents composants dataviz */
    const tonnage_dma = data_traitement && alasql(`
    SELECT 
    [annee],
    SUM( [tonnage_dma] ) as tonnage
    FROM ?
    GROUP BY [annee]
     `,[data_traitement.data])

    const tonnage_valo = data_traitement && alasql(`
    SELECT 
    [annee],
    SUM( [tonnage_dma] ) as tonnage
    FROM ?
    WHERE [l_typ_reg_service] in ('Valorisation matière','Valorisation organique')
    GROUP BY [annee]
     `,[data_traitement.data])

    const key_figures:any[] = [
        {id:"valo_dma", 
        name:"Taux de valorisation des DMA",
        description:"Part des DMA orientés vers les filières de valorisation matière ou organique (hors déblais et gravats).",
        value:(tonnage_valo?.find((e:BaseRecord) => e.annee == year).tonnage / tonnage_dma?.find((e:BaseRecord) => e.annee == year).tonnage)*100,
        sub_value:"Obj. régional : 65 %",
        digits:1,
        icon: <BsRecycle />,
        unit:'%'},
        {id:"prod_dma", 
        name:"Production de DMA",
        description:"Production globale annuelle de DMA (hors déblais et gravats).",
        value: (tonnage_dma?.find((e:BaseRecord) => e.annee == year).tonnage  / current_epci?.population) * 1e3,
        sub_value:"Obj. régional : 553 kg/hab",
        icon: <FaTrashCan />,
        unit:'kg/hab'}
    ]
    return (
        <Row gutter={[16,16]}>
            <Col xs={24} xl={24/2}>
                <Card>
                    EPCI : {siren_epci}
                    <Select showSearch
                                    optionFilterProp="label"
                                    defaultValue={siren_epci} value={siren_epci}
                                    onSelect={setSiren_epci}
                                    options={options_territories}
                                    style={{width:'100%'}}/>
                    Année : <Select onChange={(e) => e ? setYear(e) : undefined } defaultValue={year} value={year}
                    options={ Array.from({ length: 2021 - 2009 + 1 }, (_, i) => 2009 + i).filter(num => num % 2 !== 0).reverse().map((i) => ({label:i, value:i}) ) }
                />     
                </Card>
            </Col>
            <Col xs={24} xl={24/2}>
                <Card style={{padding:5}}> 
                    <Descriptions title="Territoire" items={territoire_descritpion_item} />
                </Card>
            </Col>

            {
                key_figures.map((f,idx) =>
                  <Col xl={4} md={12} xs={24} key={idx}>
                    <KeyFigure value={(f.value)} unit={f.unit} digits={f.digits || 0} name={f.name} icon={f.icon} sub_value= {f.sub_value} description={f.description}/>
                  </Col>
                )
            }

            <Col span={24-6}>

            </Col>
            <Col span={12}> 
            <DashboardElement isFetching={data_traitement_isFecthing} title={`Destination des DMA par type de déchet en ${year}`}>{data_traitement &&  <ChartSankeyDestinationDMA 
                data={data_traitement?.data.filter((d) => d.annee == year).map((i:BaseRecord) => ({value:Math.max(i.tonnage_dma,1), source:i.l_typ_reg_dechet, target:i.l_typ_reg_service})) }
                onFocus={(e:any) => setFocus(e?.name)} focus_item={focus}
                />}
            </DashboardElement>
            </Col>
            <Col span={12}> 
            <DashboardElement isFetching={data_traitement_isFecthing} title={`Destination des DMA (hors gravats)`}>{data_traitement &&  
                <ChartEvolutionTraitement 
                data={data_traitement?.data }
                onFocus={(e:any) => setFocus(e?.seriesName)} focus_item={focus}
                year={Number(year)} />}
            </DashboardElement>
            </Col>
            <Col span={8}> 
                <Card title="Bilan RPQS">
                    <ul>
                    {data_rpqs?.data && data_rpqs?.data?.length > 0 ? data_rpqs?.data.sort((a,b) => b.annee_exercice - a.annee_exercice).map((d) => 
                        <li key={d.annee_exercice}>
                            {d.annee_exercice == year ? <strong>{d.annee_exercice}</strong> : d.annee_exercice}
                                {d.url ? <a href={d.url}><span> </span><FilePdfOutlined />  </a> :  <><span> </span><FrownOutlined /></>}
                        </li>
                    ) : <small>Aucun rapport disponible.</small> }
                    </ul>
                </Card>
            </Col>
        </Row>
    )
}