import { IResourceComponentsProps } from "@refinedev/core"
import { Row, Col, Alert } from "antd"

export const IncinerationtPage: React.FC<IResourceComponentsProps> = () => {

    return (<>
      <Row gutter={[16, 16]}>
                <Col span={24}>
                    <Alert
                        message="En cours de construction"
                        description="Page en cours de construction"
                        type="warning"
                        showIcon
                    />
                </Col>
        </Row>
    </>)
}
