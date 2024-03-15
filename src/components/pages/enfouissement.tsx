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

    const IREP_attribution = {name: "Registre Francais des émissions polluantes", 
    url:'https://www.data.gouv.fr/fr/datasets/registre-francais-des-emissions-polluantes/'}


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
                        description="Page en cours de construction"
                        type="warning"
                        showIcon closable
                    />
                </Col>
                <Col span={10}>

               { data_isdnd ? 
                     <Card title="Tonnage enfouis : détail par installation" style={{height:"100%"}}>
                     <Select showSearch
                     optionFilterProp="label" 
                         defaultValue={aiot} value={aiot}
                         onSelect={(e) => setAiot(e)}
                        options={select_options} 
                        style={{width:'100%'}}/>
                        
                    <ChartEvolutionISDND data={data_isdnd} year={year} aiot={aiot} onClick={(e:any) => setYear(e.name)}></ChartEvolutionISDND> 
                    <Attribution data={[IREP_attribution,
                        {name: 'Odema'}]} />
                    </Card>
                : <small>Chargement</small> }

               </Col>

               <Col span={14}>
                    <Card title={`Installations de stockage de déchets non dangereux (ISDND) ${year}`}>
                    { data_isdnd ? <MapIsdnd data={data_isdnd} year={year} aiot={aiot} onClick={(e:any) => setAiot(e.aiot)} /> : <small>Chargement</small>}
                    </Card>
                </Col>

               <Col span={12}>
                <Card title={`Tonnage enfouis par installation en ${year}`}>
                    <small>Ajouter légende (département)</small><br/>
                    <small>Le même graphique par département ?</small>
                 { data_isdnd ? <ChartRaceBarISDND data={data_isdnd} year={year} aiot={aiot} onClick={(e:any) => setAiot(e.data.key)} /> : <small>Chargement</small> }
                 <Attribution data={[IREP_attribution]}/>
                </Card>
               </Col>

               <Col span={12}>
                <Card title={`Arrếtés`}>
                { data_isdnd ? <TimelineIsdndCapacite data={data_isdnd} aiot={aiot}></TimelineIsdndCapacite> : <small>Chargement</small> }
                </Card>
               </Col>

               <Col span={12}>
                <Card title={`Capacité régionale`}>
                { data_isdnd ? <ChartIsdndGlobal data={data_isdnd} /> : <small>Chargement</small> }
                <small>Données à vérfier + couvrir une période plus large (2010-2030) + ajouter les objectifs 2025 et 2020</small>
                <br/><small>CF https://sig.hautsdefrance.fr/ext/g2f/odema/64f03092-5df6-474b-a8f2-c60719176df2/indicateur_isdnd.html</small>

                </Card>
               </Col>



        </Row>
    </>)
}
