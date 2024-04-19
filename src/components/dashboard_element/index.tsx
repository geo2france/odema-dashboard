import { FullscreenOutlined, MoreOutlined } from "@ant-design/icons"
import { Card, theme, Modal, Dropdown, MenuProps } from "antd"
import React, { ReactNode, useState } from "react";
import { Attribution, SourceProps } from "../attributions";

const { useToken } = theme;

//TODO integrer le composant loading container

export interface IDashboardElementProps{
    title:string,
    children:ReactNode,
    attributions?:SourceProps[]
  }

/**
 * Composant permettant d'afficher un graphique ou une carte dans une card avec utilitaires (exports données, fullscreen, etc.)
 * @param param0 
 * @returns 
 */
export const DashboardElement: React.FC<IDashboardElementProps> = ({
  children,
  title,
  attributions: attributionData,
}) => {

    const { token } = useToken();
    const [modalIsOpen, setModalIsOpen] = useState(false);


  const modifiedChildren = React.Children.map(children, (child, index) => {
    // Vérifiez si c'est le deuxième enfant
    if (index === 0 && React.isValidElement(child)) {
      //Détecter ici s'il s'agit d'un graphique, ou d'une carte (sur quelle base ? chartRef ?)
      return React.cloneElement(child, {
        ...child.props?.style,
        style: { height: "80vh" },
      });
    }
    return child;
  });

  const dd_items: MenuProps['items'] = [
    {
        key: 'fullscreen',
        label: <a onClick={(e) => setModalIsOpen(true)}><FullscreenOutlined /> Plein écran</a>

    }
  ]

  const dropdown_toolbox = <Dropdown menu={{ items:dd_items }}>
                                <a style={{color:token.colorTextBase}}><MoreOutlined style={{marginLeft:10}}/></a>
                            </Dropdown>

  return (
    <Card title={
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>         
          <span style={{marginLeft:5}}>{title}</span>
          <div style={{paddingRight:5, fontSize:16}}>{dropdown_toolbox}</div>
        </div>}>

      {children}

      { attributionData && <Attribution data={attributionData} /> }

      <Modal
        title={title}
        open={modalIsOpen}
        onCancel={(e) => setModalIsOpen(false)}
        onOk={(e) => setModalIsOpen(false)}
        footer={null}
        wrapClassName="modal-fullscreen"
      >
        {modifiedChildren}
        { attributionData && <Attribution data={attributionData} /> }

      </Modal>
    </Card>
  );
};