import { Card, Col, Divider, Row, Typography } from "antd"
import { FaCreativeCommons, FaCreativeCommonsBy, FaDatabase, FaEnvelope, FaGithub, FaMapMarked } from "react-icons/fa";
//import { BsPersonWorkspace } from "react-icons/bs";
import { List } from 'antd';
import { FaHome } from "react-icons/fa";
import Odema from "/img/logo_odema.png";
import { ReactNode } from "react";

const { Text, Link, Title } = Typography;


const ListRelated:React.FC = () => {
  const data:{description?:string, url?:string, title:string, picto?:ReactNode}[] = [
    {
      title: "Site web de l'Odema",
      description:"Site public de l'observatoire",
      url:"https://odema-hautsdefrance.org",
      picto:<FaHome/>
    },
    {
      title: "Accès aux données",
      description:"Datahub, catalogue de données Géo2France",
      url:"https://www.geo2france.fr/datahub/search?q=odema",
      picto:<FaDatabase />
    },
    {
      title: "Cartographie interactive",
      description: "Visionneuse cartographique mViewer",
      url:"https://www.geo2france.fr/mviewer/?config=apps/odema/obs_dechet.xml",
      picto:<FaMapMarked />
    },
   /* {
      title: "Groupe projet et accès aux données sensibles",
      description:"Accès membres de l'Odema",
      picto:<BsPersonWorkspace />
    }*/
  ]

  return (
    <List 
      itemLayout="horizontal"
      dataSource={data}
      renderItem={ (item, _index) => (
        <List.Item>
          <List.Item.Meta 
            title={<a href={item.url}>{item.title}</a>}
            description={item.description}
            avatar={item.picto}
            style={{marginLeft:10}}
          />
        </List.Item>

    )}
    />

  )
}

export const HomePage:React.FC = () => {
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
                  <Link href="mailto:odema@cerdd.org">
                    odema@cerdd.org <FaEnvelope />
                  </Link>.
                </p>
              </Col>
            </Row>
          </Card>  
        </Col>
        <Col md={12} style={{ width: "100%" }}>
          <Card title="À voir aussi">
            <ListRelated />
          </Card>
        </Col>
        <Col md={12}>
          <Card title="À propos" style={{ height: "100%" }}>
            <p>
              Le code source de ce tableau de bord est libre et peut être
              consulté sur le{" "}
              <Link href="https://github.com/geo2france/odema-dashboard">
                dépot de code <FaGithub />
              </Link>
              .
            </p>
            <p>
              Cette application est alimentée simultanément par des
              données hébergées par{" "}
              <Link href="https://www.geo2france.fr/">Géo2France</Link> et
              par l'<Link href="https://data.ademe.fr/">Ademe</Link>. La
              source est indiquée sous chaque graphique. La plupart des
              données sont sous licence libre et peuvent être réutilisées.
            </p>
            <p>
              Sauf mention contraire, les graphiques présentés ici sont
              sous licence{" "}
              <Link href="https://creativecommons.org/licenses/by/2.0/fr/deed.fr">
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