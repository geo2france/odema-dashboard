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
