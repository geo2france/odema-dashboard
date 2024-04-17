import {
  ApiOutlined,
  CloseSquareOutlined,
  FireOutlined,
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

/*** WIP ***/
import React, { CSSProperties, useState } from "react";
import { Layout, Menu, theme } from "antd";
import { NavLink } from "react-router-dom";

import './sider.css'

const style_img: CSSProperties = {
  width: "100%",
};

export const CustomSider: React.FC = () => {
  const { token } = theme.useToken();
  const [collapsed, setCollapsed] = useState(false); // Etat du collapsible
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768); // Vérifie si l'écran est mobile initialement


    // Mettre à jour isMobile lors du redimensionnement de la fenêtre
    window.addEventListener('resize', () => {
      setIsMobile(window.innerWidth < 768);
    });
  

  const toggleCollapsed = () => {
    setCollapsed(!collapsed);
  };

  const items = [
    {
      key: "/dma",
      label: <NavLink to="/dma"> DMA</NavLink>,
      icon: <HomeOutlined />,
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
      label: <NavLink to="/isdnd"> Enfouissement</NavLink>,
      icon: <CloseSquareOutlined />,
    },
    {
      key: "/cve",
      disabled: true,
      label: <NavLink to="#"> Incinération</NavLink>,
      icon: <FireOutlined />,
    },
  ];

  return (
    <Layout.Sider
      className="custom-sider"
      collapsible
      collapsedWidth={isMobile ? 0 :80}
      collapsed={collapsed}
      onCollapse={toggleCollapsed}
      style={{
        height: "100vh",
        backgroundColor: token.colorBgContainer,
      }}
    >
      <div style={{ position: "fixed",}}>
        <div
          style={{
            width: collapsed ? "80px" : "200px", // Largeur réduite en cas de collapse
            padding: "0 16px",
            display: "flex",
            justifyContent: "flex-start",
            alignItems: "center",
            height: "64px",
            backgroundColor: token.colorBgElevated,
          }}
        >
          <NavLink to={""}>
            <img style={style_img} src={Odema} alt="Logo Odema" />
          </NavLink>
        </div>
        <Menu mode="inline" style={{ marginTop: "20px", width: collapsed ? "65%" : "100%"}} selectedKeys={[]}>
          {items.map((item) =>
            item.disabled ? (
              <Menu.Item key={item.key} icon={item.icon} disabled>
                {item.label}
              </Menu.Item>
            ) : item.children ? (
              <Menu.SubMenu key={item.key} icon={item.icon} title={item.label}>
                {item.children.map((child) => (
                  <Menu.Item key={child.key}>{child.label}</Menu.Item>
                ))}
              </Menu.SubMenu>
            ) : (
              <Menu.Item key={item.key} icon={item.icon}>
                {item.label}
              </Menu.Item>
            )
          )}
        </Menu>
      </div>
    </Layout.Sider>
  );
};
