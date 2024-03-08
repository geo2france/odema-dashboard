import { BaseRecord, IResourceComponentsProps, useList } from "@refinedev/core"
import { Row, Col, Alert, Select, Card } from "antd"
import {
    useQuery,
  } from "@tanstack/react-query";
import axios from "axios";
import { ChartEvolutionISDND } from "../chart_isdnd_installation";
import { BaseOptionType } from "antd/es/select";
import alasql from "alasql";
import { useState } from "react";
import { ChartRaceBarISDND } from "../chart_isdnd_racebar";



export const EnfouissementPage: React.FC<IResourceComponentsProps> = () => {

    const [aiot, setAiot] = useState('0007003529')

    const {data:data_isdnd} = useQuery({ // A remplacer par appel API WFS
        queryKey: ['repoData'],
        queryFn: () =>
          axios
            .get('/data/isdnd_tonnage_annee.json')
            .then((res) => res.data),
    })



    const select_options:BaseOptionType[] = data_isdnd ? alasql(`
        SELECT DISTINCT aiot AS [value], name AS label
        FROM ?
    `, [data_isdnd]).map((e:BaseRecord) => ({value:e.value, label:`${e.label} (${e.value})`})) : undefined

    //console.log(select_options)

    return (<>
      <Row gutter={[16, 16]}>
                <Col span={24}>
                    <Alert
                        message="En cours de construction"
                        description="Page en cours de construction"
                        type="warning"
                        showIcon
                    />
                </Col>
                <Col span={10}>

               { data_isdnd ? 
                     <Card title="Tonnage enfouis : détail par installation">
                     <Select showSearch
                     optionFilterProp="label" 
                         defaultValue={aiot}
                         onSelect={(e) => setAiot(e)}
                        options={select_options} 
                        style={{width:'100%'}}/>
                        
                    <ChartEvolutionISDND data={data_isdnd} aiot={aiot}></ChartEvolutionISDND> 
                    </Card>
                : <small>Chargement</small> }

               </Col>

               <Col span={14}>
                <Card title="Tonnage enfouis par installation en 2022">
                    <small>Ajouter légende (département)</small><br/>
                    <small>Le même graphique par département ?</small>
                 { data_isdnd ? <ChartRaceBarISDND data={data_isdnd} year={2022} /> : <small>Chargement</small> }
                </Card>
               </Col>

        </Row>
    </>)
}
