import { PageProps } from "@geo2france/api-dashboard";
import {
  Control,
  Dashboard,
  Dataset,
  Map,
  Select,
} from "@geo2france/api-dashboard/dsl";
import { Alert, Flex, Typography } from "antd";
import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";

const { Title, Paragraph, Text } = Typography;

export const DmaPageEPCIHome: React.FC<PageProps> = () => {
  const navigate = useNavigate();
  return (
    <Dashboard>
      <Control>
        <Select
          dataset="epci"
          labelField="nom_epci"
          valueField="code_epci"
          name="epci"
          label="Territoire"
          onSelect={(e) => navigate(`/dma/epcifiche?siren_epci=${e}`)}
          style={{ minWidth: 300 }}
          showSearch
          placeholder="Choisir un territoire"
        />
      </Control>

      <Dataset
        id="epci"
        type="wfs"
        url="https://www.geo2france.fr/geoserver/spld/ows"
        resource="spld:epci"
        meta={{ srsname: "EPSG:4326" }}
      />

      <Flex
        vertical
        style={{ padding: 16, height: "100%" }}
        justify="space-between"
      >
        <Typography>
          <Title level={4} style={{ marginTop: 8 }}>
            Tableau de bord des EPCI à fiscalité propre
          </Title>
          <Paragraph>
            Ce tableau de bord présente des <Text strong>indicateurs clés</Text>{" "}
            et des chiffres à l’échelle des{" "}
            <Text strong>EPCI à fiscalité propre</Text>.
          </Paragraph>

          <Paragraph>
            Les données proviennent des réponses aux enquêtes de collecte{" "}
            <Text italic>(Sinoe)</Text>, renseignées par les structures en
            charge de la gestion des déchets ménagers et assimilés ainsi que des
            déchetteries (EPCI ou syndicats).
          </Paragraph>

          <Paragraph>
            Lorsque le périmètre d’un EPCI ne correspond pas exactement à celui
            de l’enquête, les résultats sont{" "}
            <Text strong>ajustés au prorata de la population desservie</Text>.
          </Paragraph>
        </Typography>

        <Alert
          type="info"
          showIcon
          message="Pour commencer"
          description="Sélectionnez un territoire dans le menu ou directement sur la carte"
        />
      </Flex>

      <Map
        dataset="epci"
        popup
        labelKey="nom_epci"
        color="#ffbc75b2"
        interpolationMethod="quantile"
        popupFormatter={(row) => (
          <div>
            {row.nom_epci} <br />
            <Link to={{ pathname: "/dma/epcifiche", search: `?siren_epci=${row.code_epci}` }}>
              Voir la fiche
            </Link>
          </div>
        )}
      />
    </Dashboard>
  );
};
