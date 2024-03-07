import { Alert, Card, Select, Space } from "antd"

export interface RepTopbarProps {
    onChangeYear:Function,
    year: number
}

export const RepTopbar: React.FC<RepTopbarProps> = ({onChangeYear, year}) => {
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
            </Card>
        </Space>
    )
}