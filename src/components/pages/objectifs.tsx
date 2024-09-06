import {
    useQuery,
  } from "@tanstack/react-query";
import axios from "axios";

import DataJson from "/data/objectifs.json?url";
import { Card, Col, InputNumber, Row, Switch } from "antd";
import { TargetCard } from "../target_card";
import { createContext, useState } from "react";
import alasql from "alasql";

export interface PageContextI {
  remaningTime:boolean
}
export const pageContext = createContext<PageContextI>({remaningTime:true}); //Context permettant la remontée du ref Echarts enfant


export const ObjectifsPage: React.FC = () => {

    const [remaningTime, setRemaningTime] = useState(false)
    const [year, setYear] = useState<number>(2021)


    const {data:cible_indicateur} = useQuery({
        queryKey: ['fdfdsfdsfds'],
        queryFn: () =>
          axios
            .get(DataJson)
            .then((res) => res.data.sort((a:any,b:any) => Number(a.date) - Number(b.date) )),
    })

    const objectifs = cible_indicateur && alasql(`
    SELECT DISTINCT id_cible, cible, indicateur, due_date, ref_date, ref_value, [target], [thématiques] as tags FROM ?
    `, [cible_indicateur])

    return(
      <pageContext.Provider value={{remaningTime}}>

        <h2>Objectifs</h2>
        <Card style={{ backgroundColor: 'lightgoldenrodyellow' }}>
          <Switch defaultChecked onChange={setRemaningTime} value={remaningTime}/> Temps restant
          <InputNumber min={2009} max={2023} value={year} onChange={(e) => e && setYear(e)} /> Année
        </Card>
        <Row gutter={[12,12]}>
        {objectifs?.map((e:any)=> 
          <Col span={8} key={e.id_cible}>
            <Card title={e.cible}>
            <TargetCard data={cible_indicateur.filter((x:any) => x.id_cible == e.id_cible)} objectif_name={e.indicateur} 
              tags={e.tags?.split(',')}
              date={year.toString()} due_date={e.due_date} ref_date={e.ref_date} 
              ref_value={e.ref_value} target_value={e.target} />
            </Card>
          </Col> 
        )}
        </Row>

        </pageContext.Provider>
    )
}