import { useMenu } from "@refinedev/core";
import { Alert, Card, Menu, Select, Space } from "antd"
import { NavLink } from "react-router-dom"

export interface RepTopbarProps {
    onChangeYear:Function,
    year: number
}

export const RepTopbar: React.FC<RepTopbarProps> = ({onChangeYear, year}) => {
    const { selectedKey } = useMenu();
    const items = [
        {path:'/rep/deee', label:"D3E"},
        {path:'/rep/pa', label:"Piles & Accu"},
        {path:'/rep/pchim', label:"Produits chimiques"},
        {path:'/rep/tlc', label:"Textiles"},
        {path:'/rep', label:"Vrac"},
    ]
    
    return (
        <Space direction="vertical" style={{ display: 'flex' }}>
            <Alert
                message="En cours de construction"
                description="Document de travail en cours d'élaboration"
                type="warning"
                showIcon
            />

            <Card>
                <Select onChange={(e) => e ? onChangeYear(e) : undefined } defaultValue={year} value={year} 
                  options={Array.from({ length: 2021 - 2018 + 1 }, (_, i) => 2018 + i).map((i) => ({label:i, value:i}) ).reverse()} />

                <Menu mode="horizontal" selectedKeys={[selectedKey]}>
                    {items.map((item) =>
                    <Menu.Item key={item.path}> 
                        <NavLink to={item.path} className="nav-text">{item.label}</NavLink>
                    </Menu.Item>
                    )}
                </Menu>

            </Card>
        </Space>
    )
}