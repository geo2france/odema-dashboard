import { Typography } from 'antd';
import React from 'react';

const { Text, Link } = Typography;

export interface SourceProps {
    name:string,
    url?:string,
}

export interface AttributionProps {
    data:SourceProps[]
}

export const Attribution: React.FC<AttributionProps> = ({ data }) => {
    const plural = data.length > 1 ? 's' : ''
    return (
        <>
            <Text type="secondary">{`Source${plural} : `} 
                {data.map((e: SourceProps, i:number) => (
                    <React.Fragment key={i}>
                        <Link href={e.url}>{e.name}</Link>
                        {i < data.length - 1 ? ", " : ""}
                    </React.Fragment>
                ))}
            </Text>

        </>
    )
}