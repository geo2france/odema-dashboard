import { ApiOutlined } from "@ant-design/icons";
import { ThemedSiderV2, ThemedTitleV2 } from "@refinedev/antd";

export const AppTitle: React.FC = () => {

    return(
        <ThemedTitleV2 collapsed={false} icon={<ApiOutlined/>} text="Odema"/>
    )
}

export const AppSider: React.FC = () => {
    return (
        <>
            <ThemedSiderV2 Title={() => <AppTitle/> } />
        </>
    )
}
