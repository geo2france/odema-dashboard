import { FullscreenOutlined, MoreOutlined } from "@ant-design/icons"
import { Card, theme, Modal, Dropdown, MenuProps } from "antd"
import React, { ReactNode, createContext, useEffect, useState } from "react";
import { Attribution, SourceProps } from "../attributions";
import { useChartExport } from "../../utils/usechartexport";

const { useToken } = theme;
export const imgContext = createContext(undefined);
export const chartContext = createContext<any>({setchartRef:()=>{}}); //Context permettant la remontée du ref Echarts enfant

//TODO integrer le composant loading container


export interface IDashboardElementProps{
    title:string,
    children:ReactNode,
    attributions?:SourceProps[],
    toolbox?:boolean,
    fullscreen?:boolean
  }

/**
 * Composant permettant d'afficher un graphique ou une carte dans une card avec utilitaires (exports données, fullscreen, etc.)
 * @param {object} props - Les propriétés du composant.
 * @param {React.ReactNode} props.children - Les éléments enfants à afficher à l'intérieur de la card.
 * @param {string} props.title - Le titre de la carte.
 * @param {SourceProps[]} [props.attributions] - Les attributions des données affichées dans la card.
 * @param {boolean} [props.toolbox=true] - Indique si la boîte à outils (toolbox) doit être affichée ou non. Par défaut, elle est affichée.
 * @param {boolean} [props.fullscreen=true] - Autoriser l'affichage en plein écran. Autorisé par défaut.
 * @returns {React.ReactNode} - Le composant de la card avec les éléments enfants et les utilitaires.
 */
export const DashboardElement: React.FC<IDashboardElementProps> = ({
  children,
  title,
  attributions,
  toolbox=true,
  fullscreen=true,
}) => {

    const { token } = useToken();
    const [modalIsOpen, setModalIsOpen] = useState(false);
    const [chartRef, setchartRef] = useState(undefined);
    const [requestDlImage, setRequestDlImage ] = useState(false);

    const {img64, exportImage} = useChartExport({chartRef:chartRef})

    const downloadImage = () => {
      exportImage()
      setRequestDlImage(true)
    }

  useEffect(() => { //Proposer le téléchargement d'une image générée.
    if(img64 && requestDlImage){
      const link = document.createElement('a');
      link.href = img64;
      link.download = `${title}.png`;
      link.style.display = 'none';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setRequestDlImage(false)
    }
  }, [img64, requestDlImage])

  const fullscreenChildren = React.Children.map(children, (child, index) => {
    if (index === 0 && React.isValidElement(child)) { // Que le premier enfant
      //Possible de détecter ici s'il s'agit d'un graphique, ou d'une carte ?
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
        label: <a onClick={() => setModalIsOpen(true)}><FullscreenOutlined /> Plein écran</a>,
        disabled: !fullscreen,
    },
    {
      key: 'export_img',
      label : <a onClick={downloadImage}>Télécharger image</a>
    }
  ]



  const dropdown_toolbox = <Dropdown menu={{ items:dd_items }}>
                                <a style={{color:token.colorTextBase}}><MoreOutlined style={{marginLeft:10}}/></a>
                            </Dropdown>

  return (
  <>
    <Card title={
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>         
          <span style={{marginLeft:5}}>{title}</span>
          <div style={{paddingRight:5, fontSize:16}}>{toolbox && dropdown_toolbox}</div>
        </div>}>
      <chartContext.Provider value={{chartRef, setchartRef}}>
        {children}
        { attributions && <Attribution data={attributions} /> }
        {img64 && <><span>Debug :</span> <img src={img64} /> </>}
      </chartContext.Provider>
    </Card>

    { toolbox && fullscreen &&
      <Modal
        forceRender={true}
        title={title}
        open={modalIsOpen}
        onCancel={() => setModalIsOpen(false)}
        onOk={() => setModalIsOpen(false)}
        footer={null}
        wrapClassName="modal-fullscreen"
        >
            {fullscreenChildren}
            { attributions && <Attribution data={attributions} /> }
      </Modal>
    }
  </>
  );
};