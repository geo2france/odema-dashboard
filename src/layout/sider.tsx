import {
  CloseSquareOutlined,
  HomeOutlined,
  //RollbackOutlined,
} from "@ant-design/icons";
import Odema from "/img/logo_odema.png";

import React, { CSSProperties, useState } from "react";
import { Layout, Menu, theme, Row, Col, Button, Divider } from "antd";
import { NavLink, useLocation } from "react-router-dom";

import { MdOutlineKeyboardDoubleArrowLeft, MdOutlineKeyboardDoubleArrowRight } from "react-icons/md";

import "./sider.css";


const style_img: CSSProperties = {
  width: "100%",
};

export const AppSider: React.FC = () => {

  const items = [
    {
      key: "/dma",
      label: <>Déchets ménagers</>,
      icon: <HomeOutlined />,
      children: [
        { key: "/dma/region", label: <NavLink to="/dma/region">Hauts-de-France </NavLink> },
        { key: "/dma/epci", label: <NavLink to="/dma/epci">EPCI</NavLink> },

      ]
    },
  /*  {
      key: "#/rep",
      disabled:true,
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
    },*/
    {
      key: "/isdnd",
      label: <NavLink to="/isdnd"> Exutoires</NavLink>,
      icon: <CloseSquareOutlined />,
    },
  ];
  
  const { token } = theme.useToken();
  const { pathname:selectedKey } = useLocation();
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [collapsed, setCollapsed] = useState(isMobile ? true : false);

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
    //backgroundColor: 'gainsboro',
    zIndex: 2, 
    //position: isMobile ? 'fixed' : 'relative', 
  };

  return (
    <>
    <Layout.Sider //TODO remplacer le Sider par un drawer
      theme="light"
      collapsible
      collapsedWidth={isMobile ? 40 : 80} //Utiliser la propriété breakpoint ?
      collapsed={collapsed}
      onCollapse={toggleCollapsed}
      style={siderStyle}
      width={isMobile ? '80%' : 220}
      trigger={null}
    >
      <Row justify="center">
        <Col span={24}>
          <div
            style={{
              margin: 4,
              //padding: "8px",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              //width:"80%",
              backgroundColor: token.colorBgElevated,
            }}
          >


            <NavLink to={""} style={{
                display:collapsed ? 'none' : undefined,
                marginTop:8, marginLeft:8
                }}>
              <img style={style_img} src={Odema} alt="Logo Odema" /> {/* TODO : utiliser une version mini du logo en affichage mobile */}
            </NavLink>
            <Divider style={{display:collapsed ? 'none' : undefined}} type="vertical" />
            <Button 
              type="text"
              onClick={() => setCollapsed(!collapsed)}
              icon={collapsed ? <MdOutlineKeyboardDoubleArrowRight/> : <MdOutlineKeyboardDoubleArrowLeft/>}
              style={{
                fontSize: '28px',
                width: 32,
                height: 32,
                //backgroundColor: token.colorFillSecondary,
                marginTop:8
              }}
              />


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
   {/* { && isMobile  && !collapsed &&

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
          } */}
            </>
  );
};