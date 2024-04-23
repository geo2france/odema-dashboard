import { Tooltip, Typography } from 'antd';
import React from 'react';
import CC from "/img/cc.svg";
import BY from "/img/by.svg";


const { Text, Link } = Typography;

export interface SourceProps {
    name:string,
    url?:string,
}

export interface AttributionProps {
    data:SourceProps[]
}

export const Attribution: React.FC<AttributionProps> = ({ data }) => {
    const licence_logo_style:React.CSSProperties = {height:'12px'}

    const plural = data.length > 1 ? 's' : ''
    return (
        <div style={{paddingLeft:4, paddingBottom:4}}>
            <Text type="secondary">{`Source${plural} des données: `}
                {data.map((e: SourceProps, i:number) => (
                    <React.Fragment key={i}>
                        <Link href={e.url}>{e.name}</Link>
                        {i < data.length - 1 ? ", " : ""}
                    </React.Fragment>
                ))}
                <span> | Réalisation : <a href='https://www.hautsdefrance.fr/communique-de-presse-lancement-de-lobservatoire-dechets-matieres-odema-des-hauts-de-france/' >Odema</a> </span>
                <Tooltip title="CC BY" placement="bottom">
                    <img src={CC} style={licence_logo_style} />
                    <img src={BY} style={licence_logo_style}></img>
                </Tooltip>
            </Text>

        </div>
    )
}