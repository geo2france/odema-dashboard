import { CSSProperties, useState } from "react";
import { BaseRecord, IResourceComponentsProps, useList } from "@refinedev/core"
import { Row, Col, Alert, Card, Drawer, Tooltip, Select, Form } from "antd"
import alasql from "alasql";

import { DashboardElement } from "../../g2f-dashboard/components/dashboard_element";

import { ChartEvolutionISDND } from "../chart_isdnd_installation";
import { ChartRaceBarISDND } from "../chart_isdnd_racebar";
import { MapIsdnd } from "../map_isdnd";
import { TimelineIsdndCapacite } from "../timeline_isdnd_capacite";
import { ChartIsdndGlobal } from "../chart_isdnd_global";
import { HistoryOutlined } from "@ant-design/icons";
import { ChartDonutIsdndCapacite } from "../chat_donut_isdnd_capacite";
import { BaseOptionType } from "antd/lib/select";




export const EnfouissementPage: React.FC<IResourceComponentsProps> = () => {


    const chartStyle:CSSProperties = {height:'350px'}

    const [aiot, setAiot] = useState<string>('0007003529')
    const [year, setYear] = useState<number>(2022)

    const [drawerIsOpen, setdrawerIsOpen] = useState(false);

    const {data:data_isdnd, isFetching:isFetchingIsdnd} = useList({
        resource:"odema:isdnd_tonnage ",
        dataProviderName:"geo2france",
        pagination:{
            mode:"off"
        }
    })

    const select_options:BaseOptionType[] = data_isdnd && alasql(`
        SELECT DISTINCT aiot AS [value], name AS label
        FROM ?
    `, [data_isdnd.data]).map((e:BaseRecord) => ({value:e.value, label:`${e.label} (${e.value})`})) // Liste des différentes installations

    const select_options_annees:BaseOptionType[] = data_isdnd && alasql(`
    SELECT DISTINCT annee
    FROM ?
    WHERE tonnage > 0
    ORDER BY annee DESC
`, [data_isdnd.data]).map((e:BaseRecord) => ({value:Number(e.annee), label:e.annee}))


    const {data:data_capacite} = useList({ // Historique des arrếtés
        resource:"odema:capacite_isdnd",
        dataProviderName:"geo2france",
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
      <Row gutter={[14, 14]} align="stretch">
                <Col span={24/2}>
                    <Card style={{height:'100%', alignContent:'center', display:'grid'}}>
                        <Form  layout="inline" style={{padding:18}}>
                            <Form.Item label="Installation">
                                <Select showSearch
                                    optionFilterProp="label"
                                    defaultValue={aiot} value={aiot}
                                    onSelect={setAiot}
                                    options={select_options}
                                    style={{width:'100%'}}/>
                            </Form.Item>
                            <Form.Item label="Année">

                                <Select showSearch
                                    options={select_options_annees}
                                    style={{width:'100%'}}
                                    value={year} defaultValue={year}
                                    onSelect={setYear} />
                            </Form.Item>
                        </Form>
                    </Card>
                </Col>
                <Col span={24/2}>
                    <Alert
                        message="En cours de construction"
                        description={<>Page en cours de construction. Les données 2022 et 2023 ne sont <b>pas encore validées</b>.</>}
                        type="warning"
                        showIcon closable={false}
                    />
                </Col>

                <Col xl={12} xs={24}>
                   <DashboardElement isFetching={isFetchingIsdnd} title={`Capacité régionale`}  attributions={[{name : 'GT ISDND'},{name: 'Odema'}]}>
                   { data_capacite && data_isdnd && <ChartIsdndGlobal style={chartStyle} data={data_isdnd.data} data_capacite={data_capacite.data} onClick={(e:any) => setYear(Number(e.value[0]))} year={year}/> }
                  </DashboardElement>
               </Col>

                <Col xl={12} xs={24}>
                  <DashboardElement isFetching={isFetchingIsdnd} title={`Tonnage enfouis par installation en ${year}`} attributions={[{name : 'GT ISDND'},{name: 'Odema'}]}>
                    { data_isdnd && <ChartRaceBarISDND style={chartStyle} data={data_isdnd.data} year={year} aiot={aiot} onClick={(e:any) => setAiot(e.data.key)} /> }
                  </DashboardElement>  
                </Col>

               <Col xl={8} lg={12} xs={24}>
                 <DashboardElement isFetching={isFetchingIsdnd} title={`Repartition des capacités autorisées ${year}`} attributions={[{name : 'GT ISDND'},{name: 'Odema'}]}>
                  { data_isdnd &&  <ChartDonutIsdndCapacite style={chartStyle} data={data_isdnd.data} year={year} aiot={aiot} onClick={(e:any) => setAiot(e.data.aiot)} /> }
                 </DashboardElement> 
                </Col>

                <Col xl={8} lg={12} xs={24}>


                     <DashboardElement isFetching={isFetchingIsdnd} title={`Tonnage enfouis : ${data_isdnd?.data.find((e:BaseRecord) => e.aiot == aiot)?.name}`} attributions={[{name : 'GT ISDND'},{name: 'Odema'}]}>
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
