import { BaseRecord, IResourceComponentsProps } from "@refinedev/core"
import {
    useQuery,
  } from "@tanstack/react-query";
import axios from "axios";

import DataJson from "/data/objectifs.json?url";
<<<<<<< HEAD
import { Card, Col, Row } from "antd";
import { TargetCard } from "../target_card";
=======
import { Card, Col, Progress, Row } from "antd";
import { ChartGaugeTarget } from "../chart_gauge_targets";
>>>>>>> 89e0330 (objectifs page et component)

export const ObjectifsPage: React.FC<IResourceComponentsProps> = () => {

    const {data:cible_indicateur} = useQuery({
        queryKey: ['fdfdsfdsfds'],
        queryFn: () =>
          axios
            .get(DataJson)
            .then((res) => res.data),
    })

<<<<<<< HEAD
    const current = cible_indicateur?.filter((e:BaseRecord) => e.date == "2021")
=======
    const current = cible_indicateur?.filter((e:BaseRecord) => e.date == "2022")
>>>>>>> 89e0330 (objectifs page et component)
        .map((e:BaseRecord) => ({
            ...e, 
            percent:(e.ref_value - e.value) / (e.ref_value - e.target ),
            trajectoire:1 - (Number(e.due_date) - Number(e.date)) /  ( Number(e.due_date) - Number(e.ref_date) )
        }))

<<<<<<< HEAD
    return(
        <><h2>Objectifs</h2>
        <Row gutter={[12,12]}>
        {current?.map((e:BaseRecord)=> 
          <Col span={8} key={e.id}>
            <Card title={e.cible}>
            <TargetCard data={cible_indicateur.filter((x:BaseRecord) => x.id_cible == e.id_cible)} objectif_name={e.cible} value={e.value} date={e.date} due_date={e.due_date} ref_date={e.ref_date} 
              ref_value={e.ref_value} target_value={e.target} />
=======
    //TODO Dans le json, ajouter la valeur théorique (trajectoire) pour deltabar ou calculer dans l'application ?

    return(
        <><h2>Objectifs</h2>
        <Row>
        {current?.map((e:BaseRecord)=> 
          <Col span={8} key={e.id}>
            <Card>
            <h3>{e.cible}</h3>
            <p>Current : {e.percent.toFixed(2)*100}</p>
            <p> Trajectoire : {e.trajectoire.toFixed(2)*100 }</p>
            <p>{ (e.percent < e.trajectoire) ? 'Retard' : 'OK' }</p>
            <span>{e.value} / {e.target}</span>
            <ChartGaugeTarget value_trajectoire={e.trajectoire*100} value={Math.round(e.percent * 100)} ></ChartGaugeTarget>
            {/* Ajouter un marker sur la progress bar qui représente la trajectoire ?*/}
>>>>>>> 89e0330 (objectifs page et component)
            </Card>
          </Col> 
        )}
        </Row>
        </>
    )
}