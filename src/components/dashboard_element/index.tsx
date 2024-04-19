import { FullscreenOutlined, MoreOutlined } from "@ant-design/icons"
import { Card, theme, Modal, Dropdown, MenuProps } from "antd"
import React from "react";
import { Attribution, SourceProps } from "../attributions";

const { useToken } = theme;

//TODO integrer le composant loading container

export interface IDashboardElementProps{
    title:string,
    children:any,
    modalIsOpen:boolean,
    setModalIsOpen:Function,
    attributionData?:SourceProps[]
  }

/**
 * Composant permettant d'afficher un graphique ou une carte dans une card avec utilitaires (exports données, fullscreen, etc.)
 * @param param0 
 * @returns 
 */
export const DashboardElement: React.FC<IDashboardElementProps> = ({
  children,
  modalIsOpen: isModalOpen,
  setModalIsOpen: setModalIsOpen,
  title,
  attributionData,
}) => {

    const { token } = useToken();

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

  const dropdown_toolbox = <Dropdown menu={{ items:dd_items }} placement="bottomLeft">
                                <a style={{color:token.colorTextBase}}><MoreOutlined style={{marginLeft:10}}/></a>
                            </Dropdown>

  return (
    <Card title={
        <>
          {dropdown_toolbox}
          <span style={{marginLeft:5}}>{title}</span>
        </>}>

      {children}

      { attributionData && <Attribution data={attributionData} /> }

      <Modal
        title={title}
        open={isModalOpen}
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