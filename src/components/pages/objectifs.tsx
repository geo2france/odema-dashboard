import { BaseRecord, IResourceComponentsProps } from "@refinedev/core"
import {
    useQuery,
  } from "@tanstack/react-query";
import axios from "axios";

import DataJson from "/data/objectifs.json?url";
import { Card, Col, Row } from "antd";
import { TargetCard } from "../target_card";

export const ObjectifsPage: React.FC<IResourceComponentsProps> = () => {

    const {data:cible_indicateur} = useQuery({
        queryKey: ['fdfdsfdsfds'],
        queryFn: () =>
          axios
            .get(DataJson)
            .then((res) => res.data),
    })

    const current = cible_indicateur?.filter((e:BaseRecord) => e.date == "2021")
        .map((e:BaseRecord) => ({
            ...e, 
            percent:(e.ref_value - e.value) / (e.ref_value - e.target ),
            trajectoire:1 - (Number(e.due_date) - Number(e.date)) /  ( Number(e.due_date) - Number(e.ref_date) )
        }))

    return(
        <><h2>Objectifs</h2>
        <Row gutter={[12,12]}>
        {current?.map((e:BaseRecord)=> 
          <Col span={8} key={e.id}>
            <Card title={e.cible}>
            <TargetCard data={cible_indicateur.filter((x:BaseRecord) => x.id_cible == e.id_cible)} objectif_name={e.cible} value={e.value} date={e.date} due_date={e.due_date} ref_date={e.ref_date} 
              ref_value={e.ref_value} target_value={e.target} />
            </Card>
          </Col> 
        )}
        </Row>
        </>
    )
}