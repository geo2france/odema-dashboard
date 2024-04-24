import { BaseRecord, IResourceComponentsProps } from "@refinedev/core"
import {
    useQuery,
  } from "@tanstack/react-query";
import axios from "axios";

import DataJson from "/data/objectifs.json?url";
import { Card, Col, InputNumber, Row, Switch } from "antd";
import { TargetCard } from "../target_card";
import { createContext, useState } from "react";

export interface PageContextI {
  remaningTime:boolean
}
export const pageContext = createContext<PageContextI>({remaningTime:true}); //Context permettant la remontée du ref Echarts enfant


export const ObjectifsPage: React.FC<IResourceComponentsProps> = () => {

    const [remaningTime, setRemaningTime] = useState(true)
    const [year, setYear] = useState<number | null>(2021)


    const {data:cible_indicateur} = useQuery({
        queryKey: ['fdfdsfdsfds'],
        queryFn: () =>
          axios
            .get(DataJson)
            .then((res) => res.data.sort((a:BaseRecord,b:BaseRecord) => Number(a.date) - Number(b.date) )),
    })

    const current = cible_indicateur?.filter((e:BaseRecord) => e.date == year)
        .map((e:BaseRecord) => ({
            ...e, 
            percent:(e.ref_value - e.value) / (e.ref_value - e.target ),
            trajectoire:1 - (Number(e.due_date) - Number(e.date)) /  ( Number(e.due_date) - Number(e.ref_date) )
        }))

    return(
      <pageContext.Provider value={{remaningTime}}>

        <h2>Objectifs</h2>
        <Card style={{ backgroundColor: 'lightgoldenrodyellow' }}>
          <Switch defaultChecked onChange={(e)=> setRemaningTime(e)} /> Temps restant
          <InputNumber min={2009} max={2023} value={year} onChange={setYear} />;
        </Card>
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

        </pageContext.Provider>
    )
}