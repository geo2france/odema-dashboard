import {
  ApiOutlined,
  CloseSquareOutlined,
  HomeOutlined,
  RollbackOutlined,
} from "@ant-design/icons";
import { ThemedTitleV2 } from "@refinedev/antd";
import Odema from "/img/logo_odema.png";


export const AppTitle: React.FC = () => {
  return (
    <ThemedTitleV2 collapsed={false} icon={<ApiOutlined />} text="Odema" />
  );
};

export const AppSider: React.FC = () => {
  return (
    <>
      <CustomSider  />
    </>
  );
};

import React, { CSSProperties, useState } from "react";
import { Layout, Menu, theme, Row, Col } from "antd";
import { NavLink, useLocation } from "react-router-dom";
import "./sider.css";


const style_img: CSSProperties = {
  width: "100%",
};

export const CustomSider: React.FC = () => {

  const items = [
    {
      key: "/dma",
      label: <>DMA</>,
      icon: <HomeOutlined />,
      children: [
        { key: "/dma/region", label: <NavLink to="/dma">Hauts-de-France </NavLink> },
        { key: "/dma/epci", label: <NavLink to="/dma/epci">EPCI</NavLink> },

      ]
    },
    {
      key: "#/rep",
      label: <>REP</>,
      icon: <RollbackOutlined />,
      children: [
        { key: "/rep/deee", label: <NavLink to="/rep/deee">D3E</NavLink> },
        {
          key: "/rep/pa",
          label: <NavLink to="/rep/pa">Piles et Accu</NavLink>,
        },
        {
          key: "/rep/pchim",
          label: <NavLink to="/rep/pchim">Produits chimiques</NavLink>,
        },
        { key: "/rep/tlc", label: <NavLink to="/rep/tlc">Textiles</NavLink> },
        {
          key: "/rep/mnu",
          label: <NavLink to="/rep/mnu">Médicaments</NavLink>,
        },
        {
          key: "/rep/disp_med",
          label: <NavLink to="/rep/disp_med">DASRI</NavLink>,
        },
        { key: "/rep", label: <NavLink to="/rep/">Vrac</NavLink> },
      ],
    },
    {
      key: "/isdnd",
      label: <NavLink to="/isdnd"> Elimination</NavLink>,
      icon: <CloseSquareOutlined />,
    },
  ];
  
  const { token } = theme.useToken();
  const { pathname:selectedKey } = useLocation();
  const [collapsed, setCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  window.addEventListener("resize", () => {
    setIsMobile(window.innerWidth < 768);
  });

  const toggleCollapsed = () => {
    setCollapsed(!collapsed);
  };

  const siderStyle: CSSProperties = {
    height: "100vh",
    width : '100%',
    backgroundColor: token.colorBgContainer,
    zIndex: 2, 
    position: isMobile ? 'fixed' : 'relative', 
  };

  return (
    <>
    <Layout.Sider //TODO remplacer le Sider par un drawer
      theme="light"
      collapsible
      collapsedWidth={isMobile ? 0 : 80} //Utiliser la propriété breakpoint ?
      collapsed={collapsed}
      onCollapse={toggleCollapsed}
      style={siderStyle}
      width={isMobile ? '80%' : undefined}
    >
      <Row justify="center">
        <Col span={24}>
          <div
            style={{
              padding: "16px",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              backgroundColor: token.colorBgElevated,
            }}
          >
            <NavLink to={""}>
              <img style={style_img} src={Odema} alt="Logo Odema" /> {/* TODO : utiliser une version mini du logo en affichage mobile */}
            </NavLink>
          </div>
        </Col>
        <Col span={24}>
          <Menu
            items={items}
            selectedKeys={[selectedKey]}
            mode="inline"
            style={{ marginTop: "20px", width: "100%" }}
          />
        </Col>
      </Row>
    </Layout.Sider>
    { isMobile  && !collapsed &&

            <div
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'rgba(0, 0, 0, 0.1)',
              zIndex: 1,
            }} ></div>
          }
            </>
  );
};