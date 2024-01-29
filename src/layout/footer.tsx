import { Layout } from "antd";

import Ademe from "../../public/Logo_ADEME.svg";
import Prefet from "../../public/Préfet_de_la_région_Hauts-de-France.svg";
import Region from "../../public/Logo Région HDF.png";
import Cerc from "../../public/Logo_CERC_Hauts-de-Fce_sans-sign.svg";
import Cerdd from "../../public/Logo_cerdd.svg";
import Geo2France from "../../public/geo2france.svg";

export const AppFooter: React.FC = () => {
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
            }}
          >
             <div className="logo">
              { logos.map((l) => 
                <a href={l.url}> 
                  <img style={{ 
                      height:'70px',
                      marginRight: '20px'
                     }}
                    src={l.src} alt={l.name}/>
                  </a>
              )}
            </div>
          </Layout.Footer>
    )
}
