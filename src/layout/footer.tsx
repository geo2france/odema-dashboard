import { Layout, Divider } from "antd";
import { CSSProperties, useState, useEffect } from "react";
import { grey } from "@ant-design/colors";

import Ademe from "/img/Logo_ADEME.svg";
import Prefet from "/img/Préfet_de_la_région_Hauts-de-France.svg";
import Region from "/img/Logo Région HDF.png";
import Cerc from "/img/Logo_CERC_Hauts-de-Fce_sans-sign.svg";
import Cerdd from "/img/Logo_cerdd.svg";
import Geo2France from "/img/geo2france.svg";
import Odema from "/img/logo_odema.png";

import { UpOutlined, DownOutlined } from "@ant-design/icons"; 

export const AppFooter: React.FC = () => {
  const [isVisible, setIsVisible] = useState(true);

  const toggleFooter = () => {
    setIsVisible(!isVisible);
  };

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setIsVisible(false);
      } else {
        setIsVisible(true);
      }
    };
    window.addEventListener("resize", handleResize);
    handleResize();

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  const style_img: CSSProperties = {
    height: "40px",
    marginRight: "20px",
  };

  const logos = [
    { src: Ademe, name: "Ademe", url: "https://www.ademe.fr/" },
    {
      src: Prefet,
      name: "Préfecture Hauts-de-France",
      url: "https://www.hauts-de-france.developpement-durable.gouv.fr/",
    },
    {
      src: Region,
      name: "Région Hauts-de-France",
      url: "https://www.hautsdefrance.fr/",
    },
    {
      src: Cerc,
      name: "CERC Hauts-de-France",
      url: "https://www.cerc-hautsdefrance.fr/",
    },
    { src: Cerdd, name: "CERDD", url: "https://www.cerdd.org/" },
    { src: Geo2France, name: "Géo2France", url: "https://www.geo2france.fr/" },
  ];

  return (
    <Layout.Footer
      style={{
        textAlign: "center",
        color: "#fff",
        backgroundColor: "#fff",
        bottom: isVisible ? "0" : "-300px", 
        position: "sticky", 
        right: "0px",
        transition: "bottom 0.5s ease-in-out", 
        width: "100%",
       
      }}
    >
      <div>
        <a href="/">
          <img style={style_img} src={Odema} alt="Odema" />
        </a>
        <Divider
          type="vertical"
          style={{ height: "30px", backgroundColor: grey[2] }}
        />
        {logos.map((l) => (
          <a href={l.url} key={l.name}>
            <img style={style_img} src={l.src} alt={l.name} />
          </a>
        ))}
      </div>

      {/* Bouton de contrôle pour afficher ou cacher le footer */}
      <div
        style={{
          position: "fixed",
          bottom: "10px", 
          right: "10px",
          cursor: "pointer",
          zIndex: 1001,
        }}
        onClick={toggleFooter}
      >
        {isVisible ? (
          <DownOutlined style={{ fontSize: "20px", color: "#000" }} />
        ) : (
          <UpOutlined style={{ fontSize: "20px", color: "#000" }} />
        )}
      </div>
    </Layout.Footer>
  );
};
