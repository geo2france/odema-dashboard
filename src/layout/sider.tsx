import { ApiOutlined, CloseSquareOutlined, FireOutlined, HomeOutlined, RollbackOutlined } from "@ant-design/icons";
import { Sider, ThemedSiderV2, ThemedTitleV2 } from "@refinedev/antd";

export const AppTitle: React.FC = () => {

    return(
        <ThemedTitleV2 collapsed={false} icon={<ApiOutlined/>} text="Odema"/>
    )
}

export const AppSider: React.FC = () => {
    return (
        <>
            <CustomSider Title={() => <AppTitle/> } />
        </>
    )
}

/*** WIP ***/

import React, { CSSProperties } from "react";
import {
  useTranslate,
  useLogout,
  useTitle,
  CanAccess,
  ITreeMenu,
  useIsExistAuthentication,
  useRouterContext,
  useMenu,
  useRefineContext,
  useLink,
  useRouterType,
  useActiveAuthProvider,
  pickNotDeprecated,
  useWarnAboutChange,
} from "@refinedev/core";
import { useThemedLayoutContext } from "@refinedev/antd";
import {
  DashboardOutlined,
  LogoutOutlined,
  UnorderedListOutlined,
  BarsOutlined,
  LeftOutlined,
  RightOutlined,
} from "@ant-design/icons";
import { Layout, Menu, Grid, Drawer, Button, theme } from "antd";
import type { RefineThemedLayoutV2SiderProps } from "@refinedev/antd";
import { NavLink } from "react-router-dom";

const drawerButtonStyles: CSSProperties = {
  borderTopLeftRadius: 0,
  borderBottomLeftRadius: 0,
  position: "fixed",
  top: 64,
  zIndex: 999,
};

export const CustomSider: React.FC<RefineThemedLayoutV2SiderProps> = ({}) => {
    const { token } = theme.useToken();

    const { selectedKey } = useMenu();

    const items =[
        {key:'/dma', label:<NavLink to='/dma'><HomeOutlined /> DMA</NavLink>},
        {key:'#/rep', label:<><RollbackOutlined /> REP</>, children:[
            {key:'/rep/deee', label:<NavLink to='/rep/deee'>D3E</NavLink>},
            {key:'/rep/pa', label:<NavLink to='/rep/pa'>Piles et Accu</NavLink>},
            {key:'/rep/pchim', label:<NavLink to='/rep/pchim'>Produits chimiques</NavLink>},
            {key:'/rep/tlc', label:<NavLink to='/rep/tlc'>Textiles</NavLink>},
            {key:'/rep/mnu', label:<NavLink to='/rep/mnu'>Médicaments</NavLink>},
            {key:'/rep/disp_med', label:<NavLink to='/rep/disp_med'>DASRI</NavLink>},
            {key:'/rep', label:<NavLink to='/rep/'>Vrac</NavLink>},
        ]},
        {key:'/isdnd', disabled:true, label:<NavLink to='#'><CloseSquareOutlined /> Enfouissement</NavLink>},
        {key:'/cve', disabled:true, label:<NavLink to='#'><FireOutlined /> Incinération</NavLink>},
    ]

    return (
        <Layout.Sider style={{
            height: "100vh",
            backgroundColor: token.colorBgContainer,
            borderRight: `1px solid ${token.colorBgElevated}`,
        }}>
            <ThemedTitleV2 collapsed={false} icon={<ApiOutlined/>} text="Odema"/>
            <Menu items={items} selectedKeys={[selectedKey]} mode="inline">
                
            </Menu>
        </Layout.Sider>
    )
}