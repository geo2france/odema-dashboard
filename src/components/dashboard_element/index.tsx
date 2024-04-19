import { FullscreenOutlined, MoreOutlined } from "@ant-design/icons"
import { Card, theme, Modal, Dropdown, MenuProps } from "antd"
import React, { ReactNode, useState } from "react";
import { Attribution, SourceProps } from "../attributions";

const { useToken } = theme;

//TODO integrer le composant loading container

export interface IDashboardElementProps{
    title:string,
    children:ReactNode,
    attributions?:SourceProps[],
    toolbox?:boolean
  }

/**
 * Composant permettant d'afficher un graphique ou une carte dans une card avec utilitaires (exports données, fullscreen, etc.)
 * @param {object} props - Les propriétés du composant.
 * @param {React.ReactNode} props.children - Les éléments enfants à afficher à l'intérieur de la card.
 * @param {string} props.title - Le titre de la carte.
 * @param {SourceProps[]} [props.attributions] - Les attributions des données affichées dans la card.
 * @param {boolean} [props.toolbox=true] - Indique si la boîte à outils (toolbox) doit être affichée ou non. Par défaut, elle est affichée.
 * @returns {React.ReactNode} - Le composant de la card avec les éléments enfants et les utilitaires.
 */
export const DashboardElement: React.FC<IDashboardElementProps> = ({
  children,
  title,
  attributions,
  toolbox=true
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
        label: <a onClick={() => setModalIsOpen(true)}><FullscreenOutlined /> Plein écran</a>

    }
  ]

  const dropdown_toolbox = <Dropdown menu={{ items:dd_items }}>
                                <a style={{color:token.colorTextBase}}><MoreOutlined style={{marginLeft:10}}/></a>
                            </Dropdown>

  return (
    <Card title={
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>         
          <span style={{marginLeft:5}}>{title}</span>
          <div style={{paddingRight:5, fontSize:16}}>{toolbox && dropdown_toolbox}</div>
        </div>}>

      {children}

      { attributions && <Attribution data={attributions} /> }

      <Modal
        title={title}
        open={modalIsOpen}
        onCancel={(e) => setModalIsOpen(false)}
        onOk={(e) => setModalIsOpen(false)}
        footer={null}
        wrapClassName="modal-fullscreen"
      >
        {modifiedChildren}
        { attributions && <Attribution data={attributions} /> }

      </Modal>
    </Card>
  );
};