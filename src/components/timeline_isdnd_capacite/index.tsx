import { InfoCircleOutlined } from "@ant-design/icons"
import { BaseRecord } from "@refinedev/core"
import alasql from "alasql"
import { Timeline, Tooltip } from "antd"

export interface ITimelineIsdndCapaciteProps {
    data : BaseRecord[]
    aiot : string
}

export const TimelineIsdndCapacite: React.FC<ITimelineIsdndCapaciteProps> = ({ data, aiot }) => {

    const data_timeline = alasql(`
        SELECT [arrete_date_signature] AS signature,
            [arrete_nom] AS nom,
            [arrete_url] AS url,
            [capacite],
            MAX([annee]) AS fin_effet,
            MIN([annee]) AS debut_effet
        FROM ?
        GROUP BY [arrete_date_signature], [arrete_url], [arrete_nom],[capacite]
        ORDER BY [annee]
    `,[data.filter((e:BaseRecord) => e.aiot == aiot)]).map((e:BaseRecord) => ({...e, signature:new Date(e.signature) }))

    const nom_isdnd = data.find((e:any) => e.aiot == aiot)?.nom_isdnd

    const items = data_timeline.map((e:BaseRecord) => (
        {color:"#D44F4A",
        label:<>
            <b>{e.capacite.toLocaleString()} t</b> 🫙<br/>
            {e.debut_effet} - {e.fin_effet} 📅</>,
            children: (
               <><Tooltip title={e.nom}> <InfoCircleOutlined /> </Tooltip> <a href={e.url}>Arrếté du {e.signature.toLocaleDateString()}</a></> ) }
    ))
    return(
    <>
        <h3>{nom_isdnd} <br/><small>{aiot}</small></h3>
        <br/>
        <Timeline mode='right'
            items={items}
        />
    </>
    )
}