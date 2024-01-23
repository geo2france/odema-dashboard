import { Refine } from "@refinedev/core";
import { ThemedLayoutV2, notificationProvider, ErrorComponent, RefineThemes } from "@refinedev/antd";
import routerBindings, { NavigateToResource, UnsavedChangesNotifier } from "@refinedev/react-router-v6";
import {dataProvider as dfDataProvider} from "./datafair-dataprovider";
import { HashRouter, Routes, Route, Outlet } from "react-router-dom";
import { AntdInferencer } from "@refinedev/inferencer/antd";

import { ConfigProvider } from "antd";
import "@refinedev/antd/dist/reset.css";

import { AdemeView } from "./components/chiffre_ademe_view";
import { ressources } from "./ressources"

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
              datafair:dfDataProvider("https://data.ademe.fr/data-fair/api/v1/datasets")
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
                <ThemedLayoutV2>
                  <Outlet />
                </ThemedLayoutV2>
              }
            >
              <Route index element={<NavigateToResource resource="todos" />} />
              <Route path="oma">
                <Route index element={<AdemeView />} />
                <Route path="show/:id" element={<AntdInferencer />} />
                <Route path="edit/:id" element={<AntdInferencer />} />
                <Route path="create" element={<AntdInferencer />} />
              </Route>
              <Route path="*" element={<ErrorComponent />} />
            </Route>
          </Routes>
          <UnsavedChangesNotifier />
        </Refine>
      </ConfigProvider>
    </HashRouter>
  );
};

export default App;
