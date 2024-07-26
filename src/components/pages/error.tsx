import React from "react";
import { Result, Typography, Space } from "antd";

const { Text } = Typography;

export const ErrorComponent: React.FC = () => {
    return (
        <Result
            status="404"
            title="404"
            extra={
                <Space direction="vertical" size="large">
                    <Space>
                        <Text>
                            La page n'existe pas
                        </Text>
                    </Space>
                </Space>
            }
        />
    );
};
