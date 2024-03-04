import { useMenu } from "@refinedev/core";
import { Alert, Card, Menu, Select, Space } from "antd"
import { NavLink } from "react-router-dom"
export interface RepTopbarProps {
    onChangeYear:Function,
    year: number
}
export const RepTopbar: React.FC<RepTopbarProps> = ({onChangeYear, year}) => {
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

            <Card>
                <Select onChange={(e) => e ? onChangeYear(e) : undefined } defaultValue={year} value={year} 
                  options={Array.from({ length: 2021 - 2018 + 1 }, (_, i) => 2018 + i).map((i) => ({label:i, value:i}) ).reverse()} />

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

            </Card>
        </Space>
    )
}