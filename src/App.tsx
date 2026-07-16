import './index.css';

import { WfsProvider, DatafairProvider, DashboardApp, PagesGroup } from "@geo2france/api-dashboard";
import { Partner } from "@geo2france/api-dashboard";

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
import { RepPage } from './components/pages/rep';
import { DaePage } from './components/pages/dae';
import { PageDma } from './components/pages/dma';
import { DmaPageEPCIHome } from './components/pages/dma_epci_home';

const visualIdentity = {
    name: 'Odema',
    light: {
      colorPrimary: '#DEAD8F',
      colorLink: '#DEAD8F',
    },
    typography: {
      fontFamily: '"Roboto",sans-serif',
    },
    borderRadius: 6,
    logo: {
      src: '/img/logo_odema.png',
      //srcDark: '/logo-dark.svg',
      alt: 'Odema',
      height: 32,
    },
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


const App: React.FC = () => {

  return(
    <DashboardApp
      title="Odema"
      subtitle="Observatoire déchets-matières des Hauts-de-France"
      logo={Odema_logo}
      visualIdentity={visualIdentity}
      brands={partenaires}
      footerSlider={false}
      themeMode='light'
     >
      <HomePage title="Home" hidden={true}/>
      <PagesGroup title='DMA' icon={<HomeOutlined />}>
        <PageDma title="Région"/>
        <DmaPageEPCIHome title="EPCI"/> 
        <DmaPageEPCI title="EPCI_fiche" hidden/> 
      </PagesGroup>
      <EnfouissementPage title="ISDND" icon={<CloseSquareOutlined />}/>
      <RepPage title="REP" hidden={true}/>
      <DaePage title="DAE" icon="material-symbols:factory-outline" hidden />
     </ DashboardApp>
  )
};

export default App;
