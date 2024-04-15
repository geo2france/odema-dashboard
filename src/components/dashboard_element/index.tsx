import { FullscreenOutlined } from "@ant-design/icons"
import { Card, Button, Modal } from "antd"

//TODO integrer le composant loading container

export interface IDashboardElementProps{
    title:string,
    children:any,
    modalIsOpen:boolean,
    setModalIsOpen:Function
  }

/**
 * Composant permettant d'afficher un graphique ou une carte dans une card avec utilitaires (exports données, fullscreen, etc.)
 * @param param0 
 * @returns 
 */
export const DashboardElement:React.FC<IDashboardElementProps> = ({children, modalIsOpen: isModalOpen,setModalIsOpen: setModalIsOpen, title}) => {
    return(
        <Card title={title}>
            <Button onClick={(e) => setModalIsOpen(true)}><FullscreenOutlined /></Button>
            {children}
            <Modal title={title} open={isModalOpen} onCancel={(e) => setModalIsOpen(false)} onOk={(e) => setModalIsOpen(false)} footer={null}
            wrapClassName="modal-fullscreen">
            {children}
            </Modal>
        </Card>
    )
}