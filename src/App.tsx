import { Refine } from "@refinedev/core";
import { ThemedLayoutV2, notificationProvider, RefineThemes } from "@refinedev/antd";
import routerBindings, { DocumentTitleHandler, NavigateToResource, UnsavedChangesNotifier } from "@refinedev/react-router-v6";
import {dataProvider as dfDataProvider} from "./refine-datafair";
import { HashRouter, Routes, Route, Outlet } from "react-router-dom";

import { ConfigProvider } from "antd";
import "@refinedev/antd/dist/reset.css";

import { DmaComponent } from "./components/pages/dma";
import { ressources } from "./ressources"
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

const myTheme = {...RefineThemes.Orange, 
  token: {
    colorPrimary: "#DEAD8F",
    linkHoverDecoration:'underline',
    colorLink:'#DEAD8F',
    colorLinkHover:'#9D7156'
    },
}

const App: React.FC = () => {
  return (
    <HashRouter>
      <ConfigProvider theme={myTheme}>
        <Refine
          routerProvider={routerBindings}
          dataProvider={{
              default:dfDataProvider("https://data.ademe.fr/data-fair/api/v1/datasets"),
              ademe_opendata:dfDataProvider("https://data.ademe.fr/data-fair/api/v1/datasets")
            }}
          notificationProvider={notificationProvider}
          resources={ressources}
          options={{
            syncWithLocation: true,
            warnWhenUnsavedChanges: true,
          }}
        >
          <Routes>
            <Route
              element={
                <ThemedLayoutV2
                  Sider={() => <AppSider /> }
                  Footer={() => <AppFooter />}
                >
                  <Outlet />
                </ThemedLayoutV2>
              }
            >
              <Route index element={<NavigateToResource resource="todos" />} />
              <Route path="DMA">
                <Route index element={<DmaComponent />} />
              </Route>
              <Route path="REP">
                <Route index element={<RepPage />} />
                <Route path="deee" element={<RepDeeePage />} />
                <Route path="pa" element={<RepPaPage />} />
                <Route path="pchim" element={<RepPchimPage />} />
                <Route path="tlc" element={<RepTlcPage />} />
                <Route path="mnu" element={<RepMnuPage />} />
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
          <UnsavedChangesNotifier />
          <DocumentTitleHandler handler={() => 'Odema tableau de bord'} />
        </Refine>
      </ConfigProvider>
    </HashRouter>
  );
};

export default App;
