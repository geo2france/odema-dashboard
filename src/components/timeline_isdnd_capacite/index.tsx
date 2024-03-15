import { BaseRecord } from "@refinedev/core"
import { Timeline } from "antd"

export interface ITimelineIsdndCapaciteProps {
    data : BaseRecord[]
    aiot : string
}

export const TimelineIsdndCapacite: React.FC<ITimelineIsdndCapaciteProps> = ({ data, aiot }) => {

    const data_sample = [{
        signature:'2012-03-01',
        nom : 'Arrete préfectoral XYZ',
        url : 'https://www.geo2france.fr/public/odema/RPQS/doc/1711f826-0b5f-469f-b4ef-f1869f002d86.pdf',
        capacite : 70000,
        fin_effet:'2025-07-03',
        debut_effet:'2012-03-01'
    },
    {
        signature:'2021-03-01',
        nom : 'arrete préfectoral ABC',
        url : 'https://www.geo2france.fr/public/odema/RPQS/doc/1711f826-0b5f-469f-b4ef-f1869f002d86.pdf',
        capacite : 60000,
        fin_effet:'2040-07-03',
        debut_effet:'2021-03-01'
    }]


    const nom_isdnd = data.find((e:any) => e.aiot == aiot)?.name


    const items = data_sample.map((e:BaseRecord) => ({color:"#D44F4A", label:<> <b>{e.capacite.toLocaleString()} t</b> 🫙  {e.fin_effet} 📅</>, children:<><a href={e.url}>{e.nom}</a> {e.signature}</>}))
    return(
    <>
    <h3>{nom_isdnd} {aiot}</h3>
    <Timeline mode='right'
        items={items}
    />
    <small>Données fictives</small>
    </>
    )
}