import { BaseRecord, IResourceComponentsProps, useList } from "@refinedev/core"
import { Row, Col, Alert, Card, Drawer, Tooltip } from "antd"
import {
    useQuery,
  } from "@tanstack/react-query";
import axios from "axios";
import { ChartEvolutionISDND } from "../chart_isdnd_installation";
import { CSSProperties, useEffect, useState } from "react";
import { ChartRaceBarISDND } from "../chart_isdnd_racebar";

import DataJson from "/data/isdnd_tonnage_annee.json?url";
import { Attribution } from "../attributions";
import { MapIsdnd } from "../map_isdnd";
import { TimelineIsdndCapacite } from "../timeline_isdnd_capacite";
import { ChartIsdndGlobal } from "../chart_isdnd_global";
import { HistoryOutlined } from "@ant-design/icons";
import { ChartDonutIsdndCapacite } from "../chat_donut_isdnd_capacite";



export const EnfouissementPage: React.FC<IResourceComponentsProps> = () => {

    const chartStyle:CSSProperties = {height:'350px'}

    const [aiot, setAiot] = useState<string>('0007003529')
    const [year, setYear] = useState<number>(2022)
    const [center, setCenter] = useState<number[]>([2.4125069,50.67431])

    const [drawerIsOpen, setdrawerIsOpen] = useState(false);

    /*const IREP_attribution = {name: "Registre Francais des émissions polluantes", 
    url:'https://www.data.gouv.fr/fr/datasets/registre-francais-des-emissions-polluantes/'}*/


    const {data:data_isdnd} = useQuery({ // A remplacer par appel API WFS
        queryKey: ['repoData'],
        queryFn: () =>
          axios
            .get(DataJson)
            .then((res) => res.data),
    })


    const data_capacite = useList({
        resource:"odema:capacite_isdnd",
        dataProviderName:"geo2france",
        filters:[{
            field:"aiot",
            operator:"eq",
            value:aiot
        }],
        pagination:{
            mode:"off"
        }
    })

    useEffect(() => {
        const a = data_isdnd?.data ? data_isdnd.find((e:any) => e.aiot == aiot) : center;
        setCenter([a.lng, a.lat])
    },[data_isdnd, aiot])

      return (<>
      <Row gutter={[14, 14]} align="stretch">
                <Col span={24}>
                    <Alert
                        message="En cours de construction"
                        description={<>Page en cours de construction. Les données 2022 ne sont <b>pas encore validées</b>.</>}
                        type="warning"
                        showIcon closable
                    />
                </Col>

                <Col xl={12} xs={24}>
                <Card title={`Capacité régionale`}>
                { data_isdnd ? <ChartIsdndGlobal style={chartStyle} data={data_isdnd} onClick={(e:any) => setYear(Number(e.value[0]))} year={year}/> : <small>Chargement</small> }
                <Attribution data={[{name : 'GT ISDND'},{name: 'Odema'}]} />
                </Card>
               </Col>

                <Col xl={12} xs={24}>
                <Card title={`Tonnage enfouis par installation en ${year}`}>
                 { data_isdnd ? <ChartRaceBarISDND style={chartStyle} data={data_isdnd} year={year} aiot={aiot} onClick={(e:any) => setAiot(e.data.key)} /> : <small>Chargement</small> }
                 <Attribution data={[{name : 'GT ISDND'},{name: 'Odema'}]}/>
                </Card>
               </Col>

               <Col xl={8} lg={12} xs={24}>
                    <Card title={`Repartition des capacités autorisées ${year}`}>
                    { data_isdnd ? <ChartDonutIsdndCapacite style={chartStyle} data={data_isdnd} year={year} aiot={aiot} onClick={(e:any) => setAiot(e.data.aiot)} /> : <small>Chargement</small>}
                    </Card>
                </Col>

                <Col xl={8} lg={12} xs={24}>

               { data_isdnd ? 
                     <Card title={`Tonnage enfouis : ${data_isdnd.find((e:BaseRecord) => e.aiot == aiot)?.name}`} style={{height:"100%"}}>
                            
                        <ChartEvolutionISDND style={chartStyle} data={data_isdnd} year={year} aiot={aiot} onClick={(e:any) => setYear(Number(e.value[0]))}></ChartEvolutionISDND>

                        <Attribution data={[{name : 'GT ISDND'},{name: 'Odema'}]} /> 

                        <div  style={{float:'right'}}>
                          <Tooltip title="Historique des arrêtés">
                              <a onClick={() => setdrawerIsOpen(true)}><HistoryOutlined /></a>
                          </Tooltip>
                        </div> 

                        <Drawer title="Historique des arrêtés" onClose={() => setdrawerIsOpen(false)} open={drawerIsOpen}>
                         { data_capacite.data ? <TimelineIsdndCapacite data={data_capacite.data.data} aiot={aiot}></TimelineIsdndCapacite> : <small>Chargement</small> }
                        </Drawer>

                    </Card>
                : <small>Chargement</small> }

               </Col>

               <Col xl={8} lg={12} xs={24}>
                    <Card title={`Installations de stockage de déchets non dangereux (ISDND) ${year}`} >
                    { data_isdnd ? <MapIsdnd style={{height:376}} data={data_isdnd} year={year} aiot={aiot} onClick={(e:any) => setAiot(e.aiot)} /> : <small>Chargement</small>}
                    </Card>
                </Col>

        </Row>
    </>)
}
