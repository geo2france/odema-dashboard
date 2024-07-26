import { WfsProvider, DatafairProvider } from "g2f-dashboard";
import { HashRouter, Routes, Route, Outlet } from "react-router-dom";
import { QueryClient,  QueryClientProvider } from '@tanstack/react-query'

import { ConfigProvider, Layout, ThemeConfig } from "antd";
import './index.css';

import { DmaComponent } from "./components/pages/dma";
import { AppFooter, AppSider } from "./layout";
import { ErrorComponent } from "./components/pages/error";
import { RepPage } from "./components/pages/rep";
import { EnfouissementPage } from "./components/pages/enfouissement";
import { IncinerationtPage } from "./components/pages/incineration";
import { RepDeeePage } from "./components/pages/rep_deee";
import { RepPaPage } from "./components/pages/rep_pa";
import { RepPchimPage } from "./components/pages/rep_pchim";
import { RepTlcPage } from "./components/pages/rep_tlc";
import { RepMnuPage } from "./components/pages/rep_mnu";
import { RepDispmedPage } from "./components/pages/rep_dispmed";
import { DmaPageEPCI } from "./components/pages/dma_epci";


const myTheme:ThemeConfig = {
  token: {
    colorPrimary: "#DEAD8F",
    linkHoverDecoration:'underline',
    colorLink:'#FF6A48',
    colorLinkHover:'#9D7156',
    borderRadius:4,
    },
  components:{
    Timeline:{
      itemPaddingBottom:40
    },
    Card:{
      headerHeight:35,
      headerFontSize:14,
      paddingLG:0,
    },
    Form:{
      labelColor:'rgba(0,0,0,0.7)'
    }
  }
}

//Cf https://github.com/geo2france/g2f-dashboard/issues/5
export const geo2franceProvider = WfsProvider("https://www.geo2france.fr/geoserver/ows")
export const ademe_opendataProvider = DatafairProvider("https://data.ademe.fr/data-fair/api/v1/datasets") 

const queryClient = new QueryClient()

const App: React.FC = () => {
  return (
  <QueryClientProvider client={queryClient}>
    <HashRouter>
      <ConfigProvider theme={myTheme}>
          <Routes>
            <Route
              element={
                <Layout>
                  <Layout>
                    <AppSider />
                    <div style={{padding:24}}>
                      <Outlet />
                    </div>
                  </Layout>
                  <AppFooter />
                </Layout>
              }
            >
              <Route index element={<DmaComponent />} />
              <Route path="DMA">
                <Route index element={<DmaComponent />} />
                <Route path="epci" element={<DmaPageEPCI />} />
              </Route>
              <Route path="REP">
                <Route index element={<RepPage />} />
                <Route path="deee" element={<RepDeeePage />} />
                <Route path="pa" element={<RepPaPage />} />
                <Route path="pchim" element={<RepPchimPage />} />
                <Route path="tlc" element={<RepTlcPage />} />
                <Route path="mnu" element={<RepMnuPage />} />
                <Route path="disp_med" element={<RepDispmedPage />} />
              </Route>
              <Route path="isdnd">
                <Route index element={<EnfouissementPage />} />
              </Route>
              <Route path="cve">
                <Route index element={<IncinerationtPage />} />
              </Route>
              <Route path="*" element={<ErrorComponent />} />
            </Route>
          </Routes>
      </ConfigProvider>
    </HashRouter>
  </QueryClientProvider>
  );
};

export default App;
