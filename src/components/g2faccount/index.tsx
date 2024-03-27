import { UserOutlined } from "@ant-design/icons";
import {
    useQuery,
  } from "@tanstack/react-query";
import { Tooltip } from "antd";
import axios from "axios";

export interface IIdgAccountProps {
  style?:React.CSSProperties
}


export const IdgAccount: React.FC<IIdgAccountProps> = ({ style }) => {

    const {data} = useQuery({ 
        queryKey: ['whoami'],
        queryFn: () =>
          axios
            .get("https://www.geo2france.fr/whoami")
            .then((res) => res.data),
    })

    const username = data?.GeorchestraUser?.username;
    const authentified = username != 'anonymousUser' ? true : false ;

    return (
      <span style={style}>{ authentified ? 
         <><Tooltip title="Vous êtes authentifié sur la plateforme Géo2France">
            <UserOutlined /> 
           </Tooltip>
           <a href="https://www.geo2france.fr/portail/user/">{username}</a> </>
      : <></>
      }
      </span>
    )
}