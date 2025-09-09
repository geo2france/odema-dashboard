import './index.css';

import { WfsProvider, DatafairProvider, DashboardApp } from "@geo2france/api-dashboard";
import { Partner, RouteConfig } from "@geo2france/api-dashboard";

import { DmaComponent } from "./components/pages/dma";
import { EnfouissementPage } from "./components/pages/enfouissement";
import { DmaPageEPCI } from "./components/pages/dma_epci";
import { HomePage } from "./components/pages/home";
import { CloseSquareOutlined, HomeOutlined } from "@ant-design/icons";

import Odema_logo from "/img/logo_odema.png";
import Ademe from "/img/Logo_ADEME.svg?url";
import Prefet from "/img/Préfet_de_la_région_Hauts-de-France.svg?url";
import Region from "/img/Logo Région HDF.png";
import Cerc from "/img/Logo_CERC_Hauts-de-Fce_sans-sign.svg?url";
import Cerdd from "/img/Logo_cerdd.svg?url";
import Geo2France from "/img/geo2france.svg?url";
import { DdPage } from './components/pages/dd';
import { RepPage } from './components/pages/rep';

const myTheme = {
  token: {
    colorPrimary: "#DEAD8F",
    linkHoverDecoration:'underline',
    colorLink:'#FF6A48',
    colorLinkHover:'#9D7156',
    borderRadius:4,
   fontFamily:'Inter'
    },
  components:{
    Timeline:{
      itemPaddingBottom:40
    },
    Form:{
      labelColor:'rgba(0,0,0,0.7)'
    }
  }
}


/** Data provider **/
export const geo2franceProvider = WfsProvider("https://www.geo2france.fr/geoserver/ows")

export const ademe_opendataProvider = DatafairProvider("https://data.ademe.fr/data-fair/api/v1/datasets") 



/** Logo et partenaires du projets **/
const partenaires:Partner[] = [
  { logo: Odema_logo, name:"Odema", url:"https://odema-hautsdefrance.org/"},
  { logo: Ademe, name: "Ademe", url: "https://www.ademe.fr/" },
  {
    logo: Prefet,
    name: "Préfecture Hauts-de-France",
    url: "https://www.hauts-de-france.developpement-durable.gouv.fr/",
  },
  {
    logo: Region,
    name: "Région Hauts-de-France",
    url: "https://www.hautsdefrance.fr/",
  },
  {
    logo: Cerc,
    name: "CERC Hauts-de-France",
    url: "https://www.cerc-hautsdefrance.fr/",
  },
  { logo: Cerdd, name: "CERDD", url: "https://www.cerdd.org/" },
  { logo: Geo2France, name: "Géo2France", url: "https://www.geo2france.fr/" },
];


/*** Renseigner ici les différentes pages du projets **/
const route_config:RouteConfig[] = [
  {
    path: "",
    element: <HomePage />,
    hidden: true,
  },
  {
    path: "dma",
    label: "DMA",
    icon: <HomeOutlined />,
    element: <DmaComponent />,
    children: [
      { path: "region", label: "Hauts-de-France", element: <DmaComponent /> },
      { path: "epci", label: "EPCI", element: <DmaPageEPCI /> },
    ],
  },
  {
    path: "isdnd",
    label: "ISDND",
    element: <EnfouissementPage />,
    icon: <CloseSquareOutlined />,
  },
  {
    path: "dd",
    label: "Dechets Dangeureux",
    element: <DdPage />,
    hidden: true,
  },
    {
    path: "rep",
    label: "REP",
    element: <RepPage />,
    hidden: true,
  },
];

const App: React.FC = () => {

  return(
    <DashboardApp
      title="Odema"
      subtitle="Observatoire déchets-matières des Hauts-de-France"
      routes={route_config}
      logo={Odema_logo}
      theme={myTheme}
      brands={partenaires}
     />
  )
};

export default App;
