import { useMenu } from "@refinedev/core";
import { Alert, Menu, Space } from "antd"
import { NavLink } from "react-router-dom"

export const RepTopbar = () => {
    const { selectedKey } = useMenu();
    //TODO liste d'objet avec "key" et "libel" pour générer les Items
    return (
        <Space direction="vertical" style={{ display: 'flex' }}>
            <Alert
                message="En cours de construction"
                description="Document de travail en cours d'élaboration"
                type="warning"
                showIcon
            />
            <Menu mode="horizontal" selectedKeys={[selectedKey]}>
                <Menu.Item key="/rep"> 
                    <NavLink to="/rep" className="nav-text">Vrac</NavLink>
                </Menu.Item>
                <Menu.Item key="/rep/deee">
                    <NavLink to="/rep/deee" className="nav-text">D3E</NavLink>
                </Menu.Item>
                <Menu.Item key="/rep/pa">
                    <NavLink to="/rep/pa" className="nav-text">Piles & Accu</NavLink>
                </Menu.Item>
            </Menu>
        </Space>
    )
}