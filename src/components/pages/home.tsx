import { Card, Col, Flex, Row, theme, Typography } from "antd"
import { FaCreativeCommons, FaCreativeCommonsBy, FaEnvelope, FaGithub } from "react-icons/fa";
import Odema from "/img/logo_odema.png";
import { PageProps } from "@geo2france/api-dashboard";
import { Icon } from "@iconify/react";
import { Link } from "react-router-dom"
const { Text, Title } = Typography;
const { useToken } = theme;


export const HomePage:React.FC<PageProps> = () => {
    const { token } = useToken();
    return (
      <Row gutter={[16, 16]} style={{ margin: 16 }}>
        <Col span={24}>
          <Card>
            <Row gutter={32} align={"middle"}>
              <Col md={24 - 18}>
                <img
                  src={Odema}
                  style={{ marginRight: 25, maxWidth: "100%", width: "auto" }}/>
              </Col>
              <Col md={18}>
                <Title level={1}>Tableaux de bords de l'Odema</Title>
                <p>
                  Vous trouverez ici les{" "}
                  <Text strong>tableaux de bord thématiques</Text> élaborés par
                  l'Observatoire déchets-matières des Hauts-de-France (Odema).
                </p>
                <p>Pour commencer, sélectionnez une thématique dans le menu de gauche.
                </p>
                <p>
                  Pour toute sollicitation, contactez-nous à{" "}
                  <Link to="mailto:odema@cerdd.org">
                    odema@cerdd.org <FaEnvelope />
                  </Link>.
                </p>
              </Col>
            </Row>
          </Card>  
        </Col>
        <Col md={12} style={{ width: "100%" }}>
          <Card title="À voir aussi" style={{height:"100%"}}>
            <Link to="https://odema-hautsdefrance.org/" style={{ display: "block" }}>
              <Card
                hoverable
                style={{
                  height: "100%", borderColor: token.colorPrimary,
                }}
                styles={{
                  body: {
                    height: "100%",display: "flex",
                    alignItems: "center", justifyContent: "center",
                  },
                }}
              >
                <Flex vertical align="center" gap={12}>
                  <Icon icon="gg:website" fontSize={72} color={token.colorPrimary} />
                  <div
                    style={{
                      fontSize: "1.2rem", textAlign: "center",
                      fontWeight: 500, color:token.colorPrimary
                    }}
                  >
                    Site internet de l’Odema.
                  </div>
                </Flex>
              </Card>
            </Link>
          </Card>
        </Col>
        <Col md={12}>
          <Card title="À propos" style={{ height: "100%" }}>
            <p>
              Le code source de ce tableau de bord est libre et peut être
              consulté sur le{" "}
              <Link to="https://github.com/geo2france/odema-dashboard">
                dépot de code <FaGithub />
              </Link>
              .
            </p>
            <p>
              Cette application est alimentée simultanément par des
              données hébergées par{" "}
              <Link to="https://www.geo2france.fr/">Géo2France</Link> et
              par l'<Link to="https://data.ademe.fr/">Ademe</Link>. La
              source est indiquée sous chaque graphique. La plupart des
              données sont sous licence libre et peuvent être réutilisées.
            </p>
            <p>
              Sauf mention contraire, les graphiques présentés ici sont
              sous licence{" "}
              <Link to="https://creativecommons.org/licenses/by/2.0/fr/deed.fr">
                {" "}
                CC BY <FaCreativeCommons /> <FaCreativeCommonsBy />
              </Link>{" "}
              et peuvent donc également être librement ré-utilisés sous
              réserve de citation de l'auteur (Observatoire
              déchets-matières des Hauts-de-France).{" "}
            </p>
          </Card>
        </Col>
      </Row>
    );
}