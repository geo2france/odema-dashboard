import { SimpleRecord } from "@geo2france/api-dashboard";
import { Control, Dashboard, Dataset, Filter, Intro, Producer, Select, Statistics, StatisticsCollection, Transform, useControl } from "@geo2france/api-dashboard/dsl"
import { Table, Tag } from "antd";
import { ColumnsType } from "antd/es/table";


interface RowData {
  key: string;
  objectif: string;
  perimetre: string;
  reference: string;
}

const data_objectifs: RowData[] = [
  {
    key: "1",
    objectif: "-15 % de DMA entre 2010 et 2030",
    perimetre: "DMA tous flux confondus (DNDNI, DD, DI)",
    reference:
      "Article L541‑1 du Code de l’environnement (I‑1°) – Loi AGEC",
  },
  {
    key: "2",
    objectif:
      "-5 % de DAE par unité de valeur produite entre 2010 et 2030, notamment du secteur du bâtiment",
    perimetre: "DAE et DBTP tous flux confondus (DNDNI, DD, DI)",
    reference: "—",
  },
  {
    key: "3",
    objectif:
      "55 % de valorisation matière et organique des DMA en 2025 et 60 % en 2030",
    perimetre: "DMA tous flux confondus (DNDNI, DD, DI)",
    reference:
      "Article L541‑1 du Code de l’environnement (I‑4°bis) – Loi AGEC",
  },
  {
    key: "4",
    objectif:
      "55 % en 2020 et 65 % en 2025 de valorisation matière des déchets non dangereux non inertes (mesurés en masse)",
    perimetre:
      "DMA, DAE, DBTP hors inertes et déchets dangereux (seulement DNDNI)",
    reference: "Article L541‑1 du Code de l’environnement (I‑4°)",
  },
  {
    key: "5",
    objectif: "70 % de valorisation matière des déchets du BTP",
    perimetre: "DNDNI, DI",
    reference: "Loi TECV",
  },
  {
    key: "6",
    objectif:
      "70 % de valorisation énergétique des déchets ne pouvant faire l’objet de valorisation matière d’ici 2025",
    perimetre:
      "DMA, DAE, DBTP hors inertes et déchets dangereux (seulement DNDNI)",
    reference:
      "Article L541‑1 du Code de l’environnement (I‑6) – Loi AGEC",
  },
  {
    key: "7",
    objectif:
      "Capacité annuelle d’élimination par stockage des déchets non dangereux non inertes <br/>inférieure à 50 % en 2025 de la quantité admise en 2010",
    perimetre:
      "DMA, DAE, DBTP hors inertes et déchets dangereux (seulement DNDNI)",
    reference: "Article R541‑17 (loi TECV)",
  },
  {
    key: "8",
    objectif:
      "Réduire les quantités de DMA admis en installation de stockage en 2035 à 10 %",
    perimetre: "DMA tous flux confondus (DNDNI, DD, DI)",
    reference:
      "Article L541‑1 du Code de l’environnement (I‑6) – Loi AGEC",
  },
];

const columns: ColumnsType<RowData> = [
  {
    title: "Objectif réglementaire",
    dataIndex: "objectif",
    key: "objectif",
    render: (text:string) => (
      <span
        dangerouslySetInnerHTML={{ __html: text }}
        style={{ whiteSpace: "pre-wrap" }}
      />
    ),
    // largeur adaptée, vous pouvez ajuster
    width: "40%",
  },
  {
    title: "Périmètre",
    dataIndex: "perimetre",
    key: "perimetre",
    render: (text:string) => (
      <Tag color="blue" style={{ marginBottom: 4 }}>
        {text}
      </Tag>
    ),
    width: "35%",
  },
  {
    title: "Référence(s) législative(s)",
    dataIndex: "reference",
    key: "reference",
    render: (text:string) => (
      <span style={{ fontStyle: "italic", color: "#555" }}>{text}</span>
    ),
    width: "25%",
  },
];

export const PageSRADDET:React.FC = ({}) => {
    return (
        <Dashboard debug>
            <Intro title="Pour travail, indicateurs réglementaire">
            <Table
                columns={columns}
                dataSource={data_objectifs}
                pagination={false}
                bordered
                size="middle"
                />
            </Intro>

            <Dataset
                id="indicateur_sraddet" 
                type="wfs"
                url="https://www.geo2france.fr/geoserver/odema/ows"
                resource="odema:indicateur_sraddet"
            >
                {/*<Filter field="annee">{useControl('annee')}</Filter>   */}
                <Transform>SELECT * FROM ? ORDER BY annee</Transform>
            </Dataset>

            <Dataset
                id="indicateur_dae"
                type="file"
                url="data"
                resource="dae.json">
                <Producer url="https://odema-hautsdefrance.org/">Odema</Producer>
                <Transform>{data => data.map((r:SimpleRecord)  => ({
                    ...r,
                    'valo_matiere_ycOrga':r.B1 + r.B3,
                    'B8t3_pct':r.B8t3*100,
                    'pct_valo':100*((r.B1 + r.B3) / r.A2t3 )
                }))}</Transform>
            </Dataset>

            <Dataset
                id="pop_ti" 
                type="wfs"
                url="https://www.geo2france.fr/geoserver/odema/ows"
                resource=" 	odema:population_tarification_ti_region "
            >
                <Filter field="annee" operator="lte">2024</Filter>
                <Transform>SELECT * FROM ? ORDER BY annee</Transform>
            </Dataset>

            <StatisticsCollection title="DMA">
                <Statistics dataset="indicateur_sraddet" dataKey="dma_pr_2011" unit="%" 
                icon="streamline-flex:bag-solid" color="grey" aggregate="lastNotNull"
                title="Réduction de DMA" annotation={(p) => `${ p.row?.annee } : Réduction de DMA depuis 2011 (par habitant). Objectif -15% en 2030`}
                valueFormatter={(p) => p.value.toLocaleString(undefined, {maximumFractionDigits:1})}/>

                <Statistics dataset="indicateur_sraddet" dataKey="part_valo" unit="%" 
                icon="fa6-solid:recycle" color="#f0ca33" aggregate="lastNotNull"
                title="Valorisation de DMA" annotation={(p) => `${ p.row?.annee } : Part de DMA valorisée (matière ou organique). Objectif 60% en 2030`}
                valueFormatter={(p) => p.value.toLocaleString(undefined, {maximumFractionDigits:1})}/>

                <Statistics dataset="indicateur_sraddet" dataKey="dma_part_stockage" unit="%" 
                icon="material-symbols:front-loader" color="#d04e49" aggregate="lastNotNull"
                title="Stockage des DMA" annotation={(p) => `${ p.row?.annee } : Part de DMA stocké (y.c inertes et DD). Objectif 10% en 2030`}
                valueFormatter={(p) => p.value.toLocaleString(undefined, {maximumFractionDigits:1})}/>

             
            </StatisticsCollection>


            <StatisticsCollection title="Capacité annuelle d’élimination par stockage des déchets non dangereux non inertes inférieure à 50 % en 2025 de la quantité admise en 2010">
                <Statistics dataset="indicateur_sraddet" dataKey="tonnage_isdnd_pr_tonnage_2010" unit="%" 
                icon="material-symbols:front-loader" color="#d04e49" aggregate="lastNotNull"
                title="Enfouissement" annotation={(p) => `${ p.row?.annee } : Quantité enfouie vs quantité enfouie en 2010.`}
                valueFormatter={(p) => p.value.toLocaleString(undefined, {maximumFractionDigits:1})}/>

                <Statistics dataset="indicateur_sraddet" dataKey="capacite_isdnd_pr_tonnage_2010" unit="%" 
                icon="material-symbols:front-loader" color="#d04e49" aggregate="lastNotNull"
                title="Enfouissement" annotation={(p) => `${ p.row?.annee } : Capacité autorisée vs quantité enfouie en 2010.`}
                valueFormatter={(p) => p.value.toLocaleString(undefined, {maximumFractionDigits:1})}/>
            </StatisticsCollection>

            <StatisticsCollection title="Valorisation matière objectifs 65% (DNDNI)">
                <Statistics dataset="indicateur_sraddet" dataKey="part_valo_matiere_btp" unit="%" 
                icon="mdi:bricks" color="#e4a909" aggregate="lastNotNull"
                title="Valorisation matière BTP" annotation={(p) => `${p.row?.annee} : Part de valorisation matière BTP`}
                valueFormatter={(p) => p.value.toLocaleString(undefined, {maximumFractionDigits:1})}/>

            <Statistics 
                    dataset="indicateur_dae"
                    dataKey="pct_valo" title="Valorisation matière DAE" aggregate="lastNotNull" unit="%"
                    valueFormatter={ (p) => p.value.toLocaleString(undefined, { maximumFractionDigits: 0 }) }
                    annotation={(p) => `${p.row?.annee} : Part de valorisation matière DAE` }
                    color="#cfe45cff" icon="ph:recycle-bold"/>

            <Statistics dataset="indicateur_sraddet" dataKey="dma_part_valo_dndni" unit="%" 
                icon="fa6-solid:recycle" color="#f0ca33" aggregate="lastNotNull"
                title="DMA valo matière (DNDNI)" annotation={(p) => `${ p.row?.annee } : Part valorisation matière DMA`}
                valueFormatter={(p) => p.value.toLocaleString(undefined, {maximumFractionDigits:1})}/>


            </StatisticsCollection>

            <StatisticsCollection title="Non réglementaire">
              <Statistics dataset="pop_ti" dataKey="part_pop_ti" unit="%" 
                icon="tabler:report-money" color="#bd4cbdff" aggregate="lastNotNull"
                title="Population en TI" annotation={(p) => `${ p.row?.annee } : Population couverte par une tarification incitative sur les OMR` }
                valueFormatter={(p) => (p.value*100).toLocaleString(undefined, {maximumFractionDigits:1})}/>
            </StatisticsCollection>


        </Dashboard>
    )
}