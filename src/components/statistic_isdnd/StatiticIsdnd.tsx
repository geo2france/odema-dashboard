import { QuestionCircleOutlined } from "@ant-design/icons";
import { Avatar, Card, Flex, Tooltip, Typography } from "antd"
import { ReactElement } from "react";

const { Text, Paragraph} = Typography;


interface StatisticIsdndProps {
    value?: number | string
    evolution?: number //Positive or negative number
    evolutionUnit?: string
    evolutionSuffix?: string
    title?: string
    color?: string
    unit?: string
    invertColor?: boolean
    icon?: ReactElement
    help?: string
}


// DEV : modele cf https://bootstrapbrain.com/component/bootstrap-statistics-card-example/
// Afficher la valeur + unité + picto + évolution depuis X

export const StatisticIsdnd: React.FC<StatisticIsdndProps> = ({value, unit, evolution, evolutionSuffix, evolutionUnit, title, icon, color, invertColor=false, help}) => {

  const evolution_is_good = invertColor ? evolution! < 0 : evolution! > 0;
  const tooltip =  help && <Tooltip title={help}><QuestionCircleOutlined /></Tooltip> 

  return (
    <Card
      title={title}
      style={{
        borderLeft: `4px solid ${color}`,
        borderRadius: 0,
        height:"100%"
      }}
        styles={{
        body: {
            padding: 16,
            paddingTop: 8,
            paddingBottom: 8
        },
        header: {
            padding: "5px",
            paddingLeft: "15px",
            fontSize: 14,
            minHeight: 35,
        },
        }}
        extra={tooltip}
    >
    <Flex vertical>
      <Flex justify="space-between" align="center">
        <Text style={{fontSize:"150%", paddingTop:8, paddingBottom:8, paddingLeft:0}}>{value?.toLocaleString()} {unit}</Text>
        {icon && <Avatar
            size={32+8}
            icon={icon}
            style={{ backgroundColor: color }}
        /> }
      </Flex>

      {evolution && <Paragraph style={{marginBottom:"0.5rem"}}>
        <Text strong type={ evolution_is_good ? "success" : "danger"} style={{fontSize:"120%"}}>
            { evolution < 0 ? '':'+'}{evolution}&nbsp;{ evolutionUnit }
        </Text>{" "}
        <Text italic type="secondary">
            {evolutionSuffix}
        </Text>
      </Paragraph> }
    </Flex>
    </Card>
  );
}