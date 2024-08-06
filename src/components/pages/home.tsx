import { Card, Col, Divider, Row, Typography } from "antd"
import { FaCreativeCommons, FaCreativeCommonsBy, FaEnvelope, FaGithub } from "react-icons/fa";
import Odema from "/img/logo_odema.png";

const { Text, Link, Title } = Typography;

export const HomePage:React.FC = () => {
    return (
      <Row gutter={[16, 16]}>
        <Col xs={24}>
          <Card style={{ width: "100%", padding: 15 }}>
            <Row gutter={32} align={"middle"}>
              <Col md={24 - 18}>
                <img
                  src={Odema}
                  style={{ marginRight: 25, maxWidth: "100%", width: "auto" }}
                ></img>
              </Col>
              <Col md={18}>
                <Title level={1}>Tableaux de bords de l'Odema</Title>

                <p>
                  Vous trouverez ici les <Text strong>tableaux de bord thématiques</Text> élaborés
                  par l'Observatoire déchets-matières des Hauts-de-France
                  (Odema).
                </p>
                <p>
                  Pour toute sollicitation, contactez-nous à{" "}
                  <Link href="mailto:odema@cerdd.org">
                    odema@cerdd.org <FaEnvelope />
                  </Link>
                  .
                </p>
              </Col>
            </Row>

            <Divider />

            <Title level={2}>A voir aussi</Title>

            <ul>
              <li>
                <Link href="https://www.cerdd.org/L-Odema-Observatoire-dechets-matieres-des-Hauts-de-France">
                  Site web de l'Odema
                </Link>
              </li>
              <li>
                <Link href="https://www.geo2france.fr/datahub/search?q=odema">
                  Accès aux données
                </Link>
              </li>
              <li>
                <Link href="https://www.geo2france.fr/mviewer/?config=apps/obs_dechet.xml">
                  Cartographie intéractive
                </Link>
              </li>
              <li>
                <Text disabled>Groupe projet et accès données sensibles</Text>
              </li>
            </ul>
            <Divider />
            <Title level={2}>A propos</Title>
            <p>
              Le code source de ce tableau de bord est libre et peut-être
              consulter sur le{" "}
              <Link href="https://github.com/geo2france/odema-dashboard">
                {" "}
                dépot de code <FaGithub />
              </Link>
              .
            </p>
            <p>
              Cette application est alimentée simultanément par des données
              hébergées par{" "}
              <Link href="https://www.geo2france.fr/">Géo2France</Link> et par
              l'<Link href="https://data.ademe.fr/">Ademe</Link>. La source est
              indiquée sous chaque graphique. La plupart des données sont sous
              licence libre et peuvent être réutilisées.
            </p>
            <p>
              Sauf mention contraire, les graphiques présentés ici sont sous
              licence{" "}
              <Link href="https://creativecommons.org/licenses/by/2.0/fr/deed.fr">
                {" "}
                CC BY <FaCreativeCommons /> <FaCreativeCommonsBy />
              </Link>{" "}
              et peuvent donc également être librement ré-utilisés sous réserve
              de citation de l'auteur (Observatoire déchets-matières des
              Hauts-de-France).{" "}
            </p>
          </Card>
        </Col>
      </Row>
    );
}