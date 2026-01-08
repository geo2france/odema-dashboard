import { Producer, Transform } from "@geo2france/api-dashboard/dsl";
import { ChartPie } from "@geo2france/api-dashboard/dsl";
import { Dashboard, Dataset, Debug, Filter, Control } from "@geo2france/api-dashboard/dsl";
import { chartBusinessProps } from "../../utils";
import { NextPrevSelect, SimpleRecord } from "@geo2france/api-dashboard";
import { useControl } from "@geo2france/api-dashboard/dsl";
import { Palette } from "@geo2france/api-dashboard/dsl";

//TODO splitter cette page pour chaque filière (rep_mnu.tsx, rep_vhu.tsx...). Ici mettre un Tab pour chaque filière.

export const RepPage: React.FC = () => {

    return(
        <Dashboard>
          <Debug />
          <Palette steps={['#264653','#2a9d8f', '#e9c46a','#f4a261','#e76f51']}/>
          <Control>
            <NextPrevSelect name='annee' options={[2022,2023]} defaultValue={2023}/>
          </Control>
          <Dataset
            id='traitement_rep'
            type='datafair'
            resource="rep-tonnages-de-dechets-traites-des-filieres-rep/lines"
            url="https://data.ademe.fr/data-fair/api/v1/datasets"
            pageSize={5000}
          >
            <Filter field="dep_site_trt" operator="in">{['59','62','80','02','60']}</Filter>
            <Filter field="annee">{useControl('annee')}</Filter>
            <Transform>{
                (data) => data.map((row:SimpleRecord)  => ({...row, 
                    'filiere_libel':chartBusinessProps(row.filiere).label,
                    'tonnage': row.masse
                } ))}
            </Transform>
            <Producer url="https://data.ademe.fr/datasets/rep-tonnages-de-dechets-traites-des-filieres-rep">Ademe, Eco-organismes</Producer>
        </Dataset>  

        <Dataset
            id='collecte_rep'
            type='datafair'
            resource="rep-tonnages-issus-des-lieux-de-collecte-ou-de-reprise-des-dechets-des-filieres-rep/lines"
            url="https://data.ademe.fr/data-fair/api/v1/datasets"
            pageSize={5000}
          >
            <Filter field="dep_site_coll" operator="in">{['59','62','80','02','60']}</Filter>
            <Filter field="annee">{useControl('annee')}</Filter>
            <Transform>{
                (data) => data.map((row:SimpleRecord)  => ({...row, 
                    'filiere_libel':chartBusinessProps(row.filiere).label,
                    'tonnage': row.masse
                } ))}
            </Transform>
            <Producer url="https://data.ademe.fr/datasets/rep-tonnages-issus-des-lieux-de-collecte-ou-de-reprise-des-dechets-des-filieres-rep">Ademe, Eco-organismes</Producer>
        </Dataset>  

        <Dataset
            id='reemploi_rep'
            type='datafair'
            resource="rep-tonnages-des-produits-usages-reemployes-reutilises/lines"
            url="https://data.ademe.fr/data-fair/api/v1/datasets"
            pageSize={5000}
          >
            <Filter field="dep_rr" operator="in">{['59','62','80','02','60']}</Filter>
            <Filter field="annee">{useControl('annee')}</Filter>
            <Transform>{
                (data) => data.map((row:SimpleRecord) => ({...row, 
                    'filiere_libel':chartBusinessProps(row.filiere).label,
                    'tonnage': row.masse
                } ))}
            </Transform>
            <Producer url="https://data.ademe.fr/datasets/rep-tonnages-issus-des-lieux-de-collecte-ou-de-reprise-des-dechets-des-filieres-rep">Ademe, Eco-organismes</Producer>
        </Dataset>  
        
        
        <ChartPie
            title="REP - Traitement en HdF"
            dataset="traitement_rep"
            dataKey="tonnage"
            nameKey="filiere_libel"
            unit="T"
            donut
        />
        <div>
            <ChartPie
                title="REP - Collecte en HDF"
                dataset="collecte_rep"
                dataKey="tonnage"
                nameKey="filiere_libel"
                unit="T"
                donut
            />
        <small>* Les filière "Emballage" et TLC ne sont pas concernées</small>
        </div>

        <ChartPie
            title="REP - Ré-emploi en HDF"
            dataset="reemploi_rep"
            dataKey="tonnage"
            nameKey="filiere_libel"
            unit="T"
            donut
        />

      {/*  <ChartYearSerie
            title="REP -"
            dataset="collecte_rep"
            valueKey="tonnage"
            yearKey="annee"
            yearMark={useControl('annee')}
            type="area"
            categoryKey="filiere_libel"
        /> */}
      </Dashboard>
    )
}

