import { ApiOutlined } from "@ant-design/icons";
import { ThemedTitleV2 } from "@refinedev/antd";
import React from "react";

export const AppTitle: React.FC = () => {

    return(
        <ThemedTitleV2 collapsed={false} icon={<ApiOutlined/>} text="Wall-e"/>
    )
}

export { AppFooter } from "./footer";
