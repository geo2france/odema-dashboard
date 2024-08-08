import { Layout, Divider } from "antd";
import { CSSProperties } from "react";
import { grey } from '@ant-design/colors';

import Ademe from "/img/Logo_ADEME.svg";
import Prefet from "/img/Préfet_de_la_région_Hauts-de-France.svg";
import Region from "/img/Logo Région HDF.png";
import Cerc from "/img/Logo_CERC_Hauts-de-Fce_sans-sign.svg";
import Cerdd from "/img/Logo_cerdd.svg";
import Geo2France from "/img/geo2france.svg";
import Odema from "/img/logo_odema.png";

export const AppFooter: React.FC = () => {

  const style_img:CSSProperties = { 
    height:'40px',
    marginRight: '20px'
  }

  const logos = [
    {src : Ademe, name: "Ademe", url: "https://www.ademe.fr/"},
    {src : Prefet, name: "Préfecture Hauts-de-France", url: "https://www.hauts-de-france.developpement-durable.gouv.fr/"},
    {src : Region, name: "Région Hauts-de-France", url: "https://www.hautsdefrance.fr/"},
    {src : Cerc, name: "CERC Hauts-de-France", url: "https://www.cerc-hautsdefrance.fr/"},
    {src : Cerdd, name: "CERDD", url: "https://www.cerdd.org/"},
    {src : Geo2France, name: "Géo2France", url: "https://www.geo2france.fr/"}

  ]
  return(
      <Layout.Footer
          style={{
            textAlign: "center",
            color: "#fff",
            backgroundColor: "#fff",
            position:"sticky",
            bottom:0,
            right:"0px",
            width:"100%"
          }}
        >
            <div>
            <a href="/">
              <img style={style_img} src={Odema} alt="Odema"/>
            </a>
            <Divider type="vertical" style={{ height: "30px", backgroundColor: grey[2] }} />
            { logos.map((l) => 
              <a href={l.url} key={l.name}> 
                <img style={style_img}
                  src={l.src} alt={l.name}/>
                </a>
            )}
          </div>
        </Layout.Footer>
  )
}
