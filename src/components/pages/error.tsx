import React, { useEffect, useState } from "react";
import { useGo, useResource, useRouterType } from "@refinedev/core";
import { RefineErrorPageProps } from "@refinedev/ui-types";
import { Button, Result, Typography, Space, Tooltip } from "antd";
import { InfoCircleOutlined } from "@ant-design/icons";
import { useNavigation, useTranslate } from "@refinedev/core";

const { Text } = Typography;

/**
 * When the app is navigated to a non-existent route, refine shows a default error page.
 * A custom error component can be used for this error page.
 *
 * @see {@link https://refine.dev/docs/packages/documentation/routers/} for more details.
 */
export const ErrorComponent: React.FC<RefineErrorPageProps> = () => {
    const [errorMessage, setErrorMessage] = useState<string>();
    const translate = useTranslate();
    const { push } = useNavigation();
    const go = useGo();
    const routerType = useRouterType();

    const { resource, action } = useResource();

    useEffect(() => {
        if (resource) {
            if (action) {
                setErrorMessage(
                  "Vérifiez que l'adresse saisie dans le navigateur est correcte."
                );
            }
        }
    }, [resource, action]);

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
                        {errorMessage && (
                            <Tooltip title={errorMessage}>
                                <InfoCircleOutlined data-testid="error-component-tooltip" />
                            </Tooltip>
                        )}
                    </Space>
                    <Button
                        type="primary"
                        onClick={() => {
                            if (routerType === "legacy") {
                                push("/");
                            } else {
                                go({ to: "/" });
                            }
                        }}
                    >
                        Retourner à l'accueil
                    </Button>
                </Space>
            }
        />
    );
};
