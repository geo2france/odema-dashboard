import { BaseRecord, IResourceComponentsProps } from "@refinedev/core"
import {
    useQuery,
  } from "@tanstack/react-query";
import axios from "axios";

import DataJson from "/data/objectifs.json?url";
import { Card, Col, Progress, Row } from "antd";
import { ChartGaugeTarget } from "../chart_gauge_targets";

export const ObjectifsPage: React.FC<IResourceComponentsProps> = () => {

    const {data:cible_indicateur} = useQuery({
        queryKey: ['fdfdsfdsfds'],
        queryFn: () =>
          axios
            .get(DataJson)
            .then((res) => res.data),
    })

    const current = cible_indicateur?.filter((e:BaseRecord) => e.date == "2022")
        .map((e:BaseRecord) => ({
            ...e, 
            percent:(e.ref_value - e.value) / (e.ref_value - e.target ),
            trajectoire:1 - (Number(e.due_date) - Number(e.date)) /  ( Number(e.due_date) - Number(e.ref_date) )
        }))

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
            </Card>
          </Col> 
        )}
        </Row>
        </>
    )
}