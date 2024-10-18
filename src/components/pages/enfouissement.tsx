import { CSSProperties, useState } from "react";
import { Row, Col, Drawer, Tooltip, Select, Form } from "antd"
import alasql from "alasql";

import { Control, DashboardElement, NextPrevSelect, SimpleRecord, useApi, useSearchParamsState } from "g2f-dashboard";

import { ChartEvolutionISDND } from "../chart_isdnd_installation";
import { ChartRaceBarISDND } from "../chart_isdnd_racebar";
import { MapIsdnd } from "../map_isdnd";
import { TimelineIsdndCapacite } from "../timeline_isdnd_capacite";
import { ChartIsdndGlobal } from "../chart_isdnd_global";
import { HistoryOutlined } from "@ant-design/icons";
import { ChartDonutIsdndCapacite } from "../chat_donut_isdnd_capacite";
import { BaseOptionType } from "antd/lib/select";
import { geo2franceProvider } from "../../App";


export const EnfouissementPage: React.FC = () => {


    const chartStyle:CSSProperties = {height:'350px'}

    const [aiot, setAiot] = useSearchParamsState('aiot','0007003529')
    const [year, setYear] = useState<number>(2022)

    const [drawerIsOpen, setdrawerIsOpen] = useState(false);

    const {data:data_isdnd, isFetching:isFetchingIsdnd} = useApi({ // Ne contient les capacité autorisé QUE pour les années où les entrants sont connus
        resource:"odema:isdnd_tonnage ",
        dataProvider:geo2franceProvider,
        pagination:{
            mode:"off"
        },
        meta:{
            properties:['annee','aiot','name','tonnage','capacite','lat','lng','departement'] //Reduce size, keep only used fields
        }
    })

    const select_options:BaseOptionType[] = data_isdnd && alasql(`
        SELECT DISTINCT aiot AS [value], name AS label
        FROM ?
    `, [data_isdnd.data]).map((e:SimpleRecord) => ({value:e.value, label:`${e.label} (${e.value})`})) // Liste des différentes installations

    const select_options_annees:BaseOptionType[] = data_isdnd && alasql(`
    SELECT DISTINCT annee
    FROM ?
    WHERE tonnage > 0
    ORDER BY annee DESC
`, [data_isdnd.data]).map((e:SimpleRecord) => ({value:Number(e.annee), label:e.annee}))


    const {data:data_capacite, isFetching:isFetchingCapacite} = useApi({ // Historique des arrếtés
        resource:"odema:capacite_isdnd",
        dataProvider:geo2franceProvider,
        /* filters:[{
            field:"aiot",
            operator:"eq",
            value:aiot
        }],*/
        pagination:{
            mode:"off"
        }
    })

      return (<>
      <Control>
            <Form layout="inline">
                <Form.Item label="Année">
                    <NextPrevSelect reverse={true}
                        options={select_options_annees}
                        style={{width:'100%'}}
                        value={year} defaultValue={year}
                        onChange={(e) => setYear(Number(e))} />
                </Form.Item>
                <Form.Item label="Installation">
                    <Select showSearch
                        optionFilterProp="label"
                        defaultValue={aiot} value={aiot}
                        onSelect={setAiot}
                        options={select_options}
                        style={{width:'100%'}}/>
                </Form.Item>
            </Form>
      </Control>
      <Row gutter={[14, 14]} style={{ margin: 16 }}>
                <Col xl={12} xs={24}>
                   <DashboardElement isFetching={isFetchingIsdnd || isFetchingCapacite} title={`Capacité régionale`}  attributions={[{name : 'GT ISDND', url:'https://www.geo2france.fr/datahub/dataset/1a1480b4-8c8b-492d-9cd0-a91b49576017'},{name: 'Odema'}]}>
                   { data_capacite && data_isdnd && <ChartIsdndGlobal style={chartStyle} data={data_isdnd.data} data_capacite={data_capacite.data} onClick={(e:any) => setYear(Number(e.value[0]))} year={year}/> }
                  </DashboardElement>
               </Col>

                <Col xl={12} xs={24}>
                  <DashboardElement isFetching={isFetchingIsdnd} title={`Tonnage enfouis par installation en ${year}`} attributions={[{name : 'GT ISDND', url:'https://www.geo2france.fr/datahub/dataset/1a1480b4-8c8b-492d-9cd0-a91b49576017'},{name: 'Odema'}]}>
                    { data_isdnd && <ChartRaceBarISDND style={chartStyle} data={data_isdnd.data} year={year} aiot={aiot} onClick={(e:any) => setAiot(e.data.key)} /> }
                  </DashboardElement>  
                </Col>

               <Col xl={8} lg={12} xs={24}>
                 <DashboardElement isFetching={isFetchingIsdnd} title={`Repartition des capacités autorisées ${year}`} attributions={[{name : 'GT ISDND', url:'https://www.geo2france.fr/datahub/dataset/1a1480b4-8c8b-492d-9cd0-a91b49576017'},{name: 'Odema'}]}>
                  { data_isdnd &&  <ChartDonutIsdndCapacite style={chartStyle} data={data_isdnd.data} year={year} aiot={aiot} onClick={(e:any) => setAiot(e.data.aiot)} /> }
                 </DashboardElement> 
                </Col>

                <Col xl={8} lg={12} xs={24}>


                     <DashboardElement isFetching={isFetchingIsdnd || isFetchingCapacite} title={`Tonnage enfouis : ${data_isdnd?.data.find((e:SimpleRecord) => e.aiot == aiot)?.name}`} attributions={[{name : 'GT ISDND', url:'https://www.geo2france.fr/datahub/dataset/1a1480b4-8c8b-492d-9cd0-a91b49576017'},{name: 'Odema'}]}>
                     { data_isdnd &&  data_capacite &&  
                        <ChartEvolutionISDND style={chartStyle} data={data_isdnd.data} data_capacite={data_capacite.data} year={year} aiot={aiot} onClick={(e:any) => setYear(Number(e.value[0]))}></ChartEvolutionISDND>
                      }
                        <div  style={{float:'right'}}>
                          <Tooltip title="Historique des arrêtés">
                              <a onClick={() => setdrawerIsOpen(true)}><HistoryOutlined /></a>
                          </Tooltip>
                        </div> 

                        <Drawer title="Historique des arrêtés" onClose={() => setdrawerIsOpen(false)} open={drawerIsOpen}>
                         { data_capacite && <TimelineIsdndCapacite data={data_capacite.data} aiot={aiot}></TimelineIsdndCapacite> }
                        </Drawer>

                    </DashboardElement> 

               </Col>

               <Col xl={8} lg={12} xs={24}>
                 <DashboardElement isFetching={isFetchingIsdnd} title={`Installations de stockage de déchets non dangereux (ISDND) ${year}`} >
                     { data_isdnd &&  <MapIsdnd style={{height:376}} data={data_isdnd.data} year={year} aiot={aiot} onClick={(e:any) => setAiot(e.aiot)} /> }
                 </DashboardElement>
               </Col>

        </Row>
    </>)
}
