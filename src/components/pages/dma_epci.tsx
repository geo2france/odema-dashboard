import { BaseRecord, useList } from "@refinedev/core"
import { useSearchParamsState } from "../../g2f-dashboard/utils/useSearchParamsState"
import { Card, Col, Row, Select } from "antd"
import { ChartSankeyDestinationDMA } from "../chart_sankey_destination"
import { DashboardElement } from "../../g2f-dashboard/components/dashboard_element"
import { FilePdfOutlined } from "@ant-design/icons"

export const DmaPageEPCI: React.FC = () => {
    const [siren_epci, setSiren_epci] = useSearchParamsState('siren','200067999')
    const [year, setYear] = useSearchParamsState('year','2021')

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
                field:"annee",
                operator:"eq",
                value:year
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

    console.log(data_rpqs?.data)

    const {data:data_ecpci_collecte} = useList({
        resource:"odema:territoires_collecte ",
        dataProviderName:"geo2france",
        pagination:{
            mode:"off"
        },
        meta:{
            properties:["epci_siren", "epci_nom"]
        }
    })


    return (
        <Row gutter={[16,16]}>
            <Col span={24}>
                <Card>
                    EPCI : {siren_epci}
                    <Select showSearch
                                    optionFilterProp="label"
                                    defaultValue={siren_epci} value={siren_epci}
                                    onSelect={setSiren_epci}
                                    options={data_ecpci_collecte?.data.map((e) => ({label:e.epci_nom, value:e.epci_siren}))}
                                    style={{width:'100%'}}/>
                    Année : <Select onChange={(e) => e ? setYear(e) : undefined } defaultValue={year} value={year}
                    options={ Array.from({ length: 2021 - 2009 + 1 }, (_, i) => 2009 + i).filter(num => num % 2 !== 0).reverse().map((i) => ({label:i, value:i}) ) }
                />     
                </Card>
            </Col>
            <Col span={12}> 
            <DashboardElement isFetching={data_traitement_isFecthing} title="Destination des DMA (hors gravats)">{data_traitement &&  <ChartSankeyDestinationDMA 
                data={data_traitement?.data.map((i:BaseRecord) => ({value:Math.max(i.tonnage_dma,1), source:i.l_typ_reg_dechet, target:i.l_typ_reg_service})) } />}
            </DashboardElement>
            </Col>
            <Col span={8}> 
                <Card title="Bilan RPQS">
                    <ul>
                    {data_rpqs?.data && data_rpqs?.data?.length > 0 ? data_rpqs?.data.sort((a,b) => b.annee_exercice - a.annee_exercice).map((d) => 
                        <li key={d.annee_exercice}>
                            {d.annee_exercice == year ? <strong>{d.annee_exercice}</strong> : d.annee_exercice}<a href={d.url}><FilePdfOutlined />  </a>
                        </li>
                    ) : <small>Aucun rapport disponible.</small> }
                    </ul>
                </Card>
            </Col>
        </Row>
    )
}