import { BaseRecord, IResourceComponentsProps } from "@refinedev/core"
import { Row, Col, Alert, Select, Card } from "antd"
import {
    useQuery,
  } from "@tanstack/react-query";
import axios from "axios";
import { ChartEvolutionISDND } from "../chart_isdnd_installation";
import { BaseOptionType } from "antd/es/select";
import alasql from "alasql";
import { useEffect, useState } from "react";
import { ChartRaceBarISDND } from "../chart_isdnd_racebar";

import DataJson from "/data/isdnd_tonnage_annee.json?url";
import { Attribution } from "../attributions";
import { MapIsdnd } from "../map_isdnd";
import { TimelineIsdndCapacite } from "../timeline_isdnd_capacite";
import { ChartIsdndGlobal } from "../chart_isdnd_global";



export const EnfouissementPage: React.FC<IResourceComponentsProps> = () => {


    const [aiot, setAiot] = useState<string>('0007003529')
    const [year, setYear] = useState<number>(2022)
    const [center, setCenter] = useState<number[]>([2.4125069,50.67431])

    /*const IREP_attribution = {name: "Registre Francais des émissions polluantes", 
    url:'https://www.data.gouv.fr/fr/datasets/registre-francais-des-emissions-polluantes/'}*/


    const {data:data_isdnd} = useQuery({ // A remplacer par appel API WFS
        queryKey: ['repoData'],
        queryFn: () =>
          axios
            .get(DataJson)
            .then((res) => res.data),
    })

    useEffect(() => {
        const a = data_isdnd?.data ? data_isdnd.find((e:any) => e.aiot == aiot) : center;
        setCenter([a.lng, a.lat])
    },[data_isdnd, aiot])

    const select_options:BaseOptionType[] = data_isdnd ? alasql(`
        SELECT DISTINCT aiot AS [value], name AS label
        FROM ?
    `, [data_isdnd]).map((e:BaseRecord) => ({value:e.value, label:`${e.label} (${e.value})`})) : undefined


    return (<>
      <Row gutter={[16, 16]} align="stretch">
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
                { data_isdnd ? <ChartIsdndGlobal data={data_isdnd} onClick={(e:any) => setYear(Number(e.value[0]))} year={year}/> : <small>Chargement</small> }
                <Attribution data={[{name : 'GT ISDND'},{name: 'Odema'}]} />
                </Card>
               </Col>

                <Col xl={12} xs={24}>
                <Card title={`Tonnage enfouis par installation en ${year}`}>
                    <small>Ajouter légende (département)</small><br/>
                    <small>Le même graphique par département ?</small>
                 { data_isdnd ? <ChartRaceBarISDND data={data_isdnd} year={year} aiot={aiot} onClick={(e:any) => setAiot(e.data.key)} /> : <small>Chargement</small> }
                 <Attribution data={[{name : 'GT ISDND'},{name: 'Odema'}]}/>
                </Card>
               </Col>

                <Col xl={10} xs={24}>

               { data_isdnd ? 
                     <Card title="Tonnage enfouis : détail par installation" style={{height:"100%"}}>
                     <Select showSearch
                     optionFilterProp="label" 
                         defaultValue={aiot} value={aiot}
                         onSelect={(e) => setAiot(e)}
                        options={select_options} 
                        style={{width:'100%'}}/>
                        
                    <ChartEvolutionISDND data={data_isdnd} year={year} aiot={aiot} onClick={(e:any) => setYear(Number(e.value[0]))}></ChartEvolutionISDND> 
                    <Attribution data={[{name : 'GT ISDND'},{name: 'Odema'}]} />
                    </Card>
                : <small>Chargement</small> }

               </Col>

               <Col xl={14} xs={24}>
                    <Card title={`Installations de stockage de déchets non dangereux (ISDND) ${year}`}>
                    { data_isdnd ? <MapIsdnd data={data_isdnd} year={year} aiot={aiot} onClick={(e:any) => setAiot(e.aiot)} /> : <small>Chargement</small>}
                    </Card>
                </Col>

               <Col xl={12} xs={24}>
                <Card title={`Arrếtés`}>
                { data_isdnd ? <TimelineIsdndCapacite data={data_isdnd} aiot={aiot}></TimelineIsdndCapacite> : <small>Chargement</small> }
                </Card>
               </Col>





        </Row>
    </>)
}
