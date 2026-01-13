import { CSSProperties, useState } from "react";
import { Row, Col, Drawer, Select, Flex, Typography } from "antd"
import alasql from "alasql";
import * as aq from 'arquero';
import { Control, DashboardElement, NextPrevSelect, SimpleRecord, useApi, useSearchParamsState } from "@geo2france/api-dashboard";

import { ChartEvolutionISDND } from "../chart_isdnd_installation";
import { ChartRaceBarISDND } from "../chart_isdnd_racebar";
import { MapIsdnd } from "../map_isdnd";
import { TimelineIsdndCapacite } from "../timeline_isdnd_capacite";
import { ChartIsdndGlobal } from "../chart_isdnd_global";
import { HistoryOutlined } from "@ant-design/icons";
//import { ChartDonutIsdndCapacite } from "../chat_donut_isdnd_capacite";
import { geo2franceProvider } from "../../App";
import { FaLocationPin } from "react-icons/fa6";
import { MdFrontLoader } from "react-icons/md";
import { GiResize } from "react-icons/gi";
import Tag from "antd/es/tag";
import { StatisticIsdnd } from "../statistic_isdnd/StatiticIsdnd";


export const EnfouissementPage: React.FC = () => {
    const default_year:number = 2024 ;

    const chartStyle:CSSProperties = {height:'350px'}

    const [aiot, setAiot] = useSearchParamsState('aiot','0007003529')
    const [year, setYear] = useSearchParamsState('year', default_year.toString())

    const [drawerIsOpen, setdrawerIsOpen] = useState(false);

    const {data:data_isdnd, isFetching:isFetchingIsdnd} = useApi({ // Ne contient les capacité autorisé QUE pour les années où les entrants sont connus
        resource:"odema:isdnd_tonnage ",
        dataProvider:geo2franceProvider,
        pagination:{
            mode:"off"
        },
        meta:{
            properties:['annee','aiot','name','tonnage','capacite','lat','lng','departement'] //Reduce size, keep only used fields
        }
    })
    

    const key_figures:SimpleRecord[] | undefined = data_isdnd?.data && aq.from(data_isdnd?.data)
        .filter(d => d.tonnage > 0)
        .groupby('annee')
        .rollup({ 
            tonnage: d => aq.op.sum(d.tonnage) , 
            n_installation : aq.op.count() ,
            capacite : d => aq.op.sum(d.capacite) 
        }).objects()

    const current_key_figures = key_figures?.find((e) => e.annee==Number(year))


    const select_options = data_isdnd && (alasql(`
        SELECT DISTINCT aiot AS [value], name AS label
        FROM ?
    `, [data_isdnd.data]) as SimpleRecord[]).map((e:SimpleRecord) => ({value:e.value, label:`${e.label} (${e.value})`})) // Liste des différentes installations

    const select_options_annees = data_isdnd && (alasql(`
    SELECT DISTINCT annee
    FROM ?
    WHERE tonnage > 0
    ORDER BY annee DESC
`, [data_isdnd.data]) as SimpleRecord[]).map((e:SimpleRecord) => ({value:String(e.annee), label:e.annee}))


    const {data:data_capacite, isFetching:isFetchingCapacite} = useApi({ // Historique des arrếtés
        resource:"odema:capacite_isdnd",
        dataProvider:geo2franceProvider,
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
      <Control>
         <Flex wrap justify="flex-start" align="flex-start" gap="small">
            <NextPrevSelect reverse={true}
                name="annee" label="Année"
                options={select_options_annees}
                value={year} defaultValue={year}
                onChange={(e) => setYear(e.toString())} />
            <Select showSearch
                optionFilterProp="label"
                defaultValue={aiot} value={aiot}
                onSelect={setAiot}
                options={select_options}
                style={{ maxWidth:"80vw" }} />
        </Flex>
      </Control>
      <Row gutter={[14, 14]} style={{ margin: 16 }}>
                <Col xl={12} xs={24}>
                   <DashboardElement isFetching={isFetchingIsdnd || isFetchingCapacite} title={`Capacité régionale`}  attributions={[{name : 'GT ISDND', url:'https://www.geo2france.fr/datahub/dataset/1a1480b4-8c8b-492d-9cd0-a91b49576017'},{name: 'Odema'}]}>
                   { data_capacite && data_isdnd && <ChartIsdndGlobal style={chartStyle} data={data_isdnd.data} data_capacite={data_capacite.data} onClick={(e:any) => setYear(e.value[0])} year={Number(year)}/> }
                  </DashboardElement>
               </Col>

               <Col xl={12} xs={24}>
                   <DashboardElement isFetching={isFetchingIsdnd || isFetchingCapacite} title={`Chiffres-clé ${year}`}  attributions={[{name : 'GT ISDND', url:'https://www.geo2france.fr/datahub/dataset/1a1480b4-8c8b-492d-9cd0-a91b49576017'},{name: 'Odema'}]}>
                    <Row gutter={[8,8]} style={{margin:8}}>
                    <Col xl={24/3} md={24/3} xs={24}> 
                       <StatisticIsdnd title={`Installations en service`} icon={<FaLocationPin />}
                        value={current_key_figures?.n_installation} 
                        help={`Installations ayant enfoui des déchets en ${year}`}/>
                    </Col>
                    <Col xl={24/3} md={24/3} xs={24}> 
                       <StatisticIsdnd color="#ddb090" title={`Enfouissement`} icon={<MdFrontLoader />}
                        value={current_key_figures?.tonnage} unit="t"
                        evolution={Math.round( 100 * (current_key_figures?.tonnage - key_figures?.find((e) => e.annee==Number(2010))?.tonnage )
                                    / key_figures?.find((e) => e.annee==Number(2010))?.tonnage ) }  
                        evolutionUnit="%" evolutionSuffix="depuis 2010" invertColor 
                        help="Quantité de déchets enfouis en ISDND" />
                    </Col>
                    <Col xl={24/3} md={24/3} xs={24}> 
                       <StatisticIsdnd color="#d44f4a"  title={`Capacité autorisée`}  icon={<GiResize />}
                        value={current_key_figures?.capacite} unit="t"
                        evolution={Math.round( 100 * (current_key_figures?.capacite - key_figures?.find((e) => e.annee==Number(2010))?.capacite )
                                    / key_figures?.find((e) => e.annee==Number(2010))?.capacite ) }  
                        evolutionUnit="%" evolutionSuffix="depuis 2010" invertColor
                        help="Capacitée régionale autorisée par les arrếtés d'autorisation"
                        />
                    </Col>
                    </Row>
                   </DashboardElement>
               </Col>

                <Col xl={12} xs={24}>
                  <DashboardElement isFetching={isFetchingIsdnd} title={`Tonnage enfouis par installation en ${year}`} attributions={[{name : 'GT ISDND', url:'https://www.geo2france.fr/datahub/dataset/1a1480b4-8c8b-492d-9cd0-a91b49576017'},{name: 'Odema'}]}>
                    { data_isdnd && <ChartRaceBarISDND style={chartStyle} data={data_isdnd.data} year={Number(year)} aiot={aiot} onClick={(e:any) => setAiot(e.data[2])} /> }
                  </DashboardElement>  
                </Col>

               {/*<Col xl={12} lg={12} xs={24}>
                 <DashboardElement isFetching={isFetchingIsdnd} title={`Repartition des capacités autorisées ${year}`} attributions={[{name : 'GT ISDND', url:'https://www.geo2france.fr/datahub/dataset/1a1480b4-8c8b-492d-9cd0-a91b49576017'},{name: 'Odema'}]}>
                  { data_isdnd &&  <ChartDonutIsdndCapacite style={chartStyle} data={data_isdnd.data} year={Number(year)} aiot={aiot} onClick={(e:any) => setAiot(e.data.aiot)} /> }
                 </DashboardElement> 
                </Col>*/}

                <Col xl={12} lg={12} xs={24}>

                     <DashboardElement isFetching={isFetchingIsdnd || isFetchingCapacite} title={`Tonnage enfouis : ${data_isdnd?.data.find((e:SimpleRecord) => e.aiot == aiot)?.name}`} attributions={[{name : 'GT ISDND', url:'https://www.geo2france.fr/datahub/dataset/1a1480b4-8c8b-492d-9cd0-a91b49576017'},{name: 'Odema'}]}>
                     { data_isdnd &&  data_capacite &&  
                        <ChartEvolutionISDND style={chartStyle} data={data_isdnd.data} data_capacite={data_capacite.data} year={Number(year)} aiot={aiot} onClick={(e:any) => setYear(e.value[0])}></ChartEvolutionISDND>
                      }
                        <div  style={{marginLeft:5}}>
                              <Typography.Link onClick={() => setdrawerIsOpen(true)}>
                                <Tag><span> Historique des arrếtés <HistoryOutlined /></span></Tag>
                                </Typography.Link>
                        </div> 

                        <Drawer title="Historique des arrêtés" onClose={() => setdrawerIsOpen(false)} open={drawerIsOpen}>
                         { data_capacite && <TimelineIsdndCapacite data={data_capacite.data} aiot={aiot}></TimelineIsdndCapacite> }
                        </Drawer>

                    </DashboardElement> 

               </Col>

               <Col xl={12} lg={12} xs={24}>
                 <DashboardElement isFetching={isFetchingIsdnd} title={`Installations de stockage de déchets non dangereux (ISDND) ${year}`} >
                     { data_isdnd &&  <MapIsdnd style={{height:376}} data={data_isdnd.data} year={Number(year)} aiot={aiot} onClick={(e:any) => setAiot(e.aiot)} /> }
                 </DashboardElement>
               </Col>

        </Row>
    </>)
}
