import { FilePdfOutlined } from "@ant-design/icons"
import { useBlockConfig, useDataset } from "@geo2france/api-dashboard/dsl"
import { Card } from "antd"
import { grey } from '@ant-design/colors';

interface ChartRPQSProps {
    dataset: string
    year?: number
}

export const ChartRPQS:React.FC<ChartRPQSProps> = ({dataset:dataset_id, year}) => {

    const dataset = useDataset(dataset_id)
    const data = dataset?.data
    useBlockConfig({
        title:"Rapports RPQS"
    })
    return (
        <Card>
        {data && data?.filter((e: any) => e.url).length > 0 ? (
                data?.sort((a: any, b: any) => b.annee_exercice - a.annee_exercice)
                  .map((d: any) => (
                    <Card.Grid
                      key={d.annee_exercice}
                      hoverable={d.url}
                      style={{ width: "20%", paddingTop: 5, textAlign: "center" }}
                    >
                      {d.url ? (
                        <a href={d.url}>
                          <FilePdfOutlined style={{ fontSize: 25 }} />{" "}
                        </a>
                      ) : (
                        <FilePdfOutlined
                          style={{ color: grey[1], fontSize: 25 }}
                        />
                      )}
                      <br />
                      {d.annee_exercice == year ? (
                        <strong>{d.annee_exercice}</strong>
                      ) : d.url ? (
                        <span>{d.annee_exercice}</span>
                      ) : (
                        <span style={{ color: grey[1] }}>{d.annee_exercice}</span>
                      )}
                    </Card.Grid>
                  ))
              ) : (
                <small style={{ margin: 5 }}>
                  🙁 Aucun rapport n'est disponible.
                </small>
              ) }
        </Card>
    )
}