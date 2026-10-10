import { PageProps, SimpleRecord } from "@geo2france/api-dashboard"
import { Control, Dashboard, Dataset, Filter, Intro, Join, MapIndicator, Palette, Select, Transform, useControl } from "@geo2france/api-dashboard/dsl"
import RacebarEpci from "../indicateur/RriRacebar";
import SingleAxis from "../indicateur/RriSingleAxisScatter";
import TargetPie from "../indicateur/RriTargetPie";
import { theme } from "antd";

function between(value: number, a: number, b: number): boolean {
  return value >= Math.min(a, b) && value <= Math.max(a, b);
}

const indicateurs = [
    {
        name:"Part de DMA orienté vers recyclage et réutilisation (L541-1 4°bis)",
        layername:"odema:rri_indic_epci_dma_recyclage_reutilisation",
        layername_region:"odema_rri_indic_region_dma_recyclage_reutilisation",
        unit:'%',
        goalValue: 65,
        balanceValue:54 //2024
        },
    {
        name:"Part de déchets DNNI orienté vers valorisation matière (L541-1 4°)",
        layername:"odema:rri_indic_epci_dma_dndni_valo",
        unit:'%',
        goalValue: 65,
        balanceValue:64.999 //2024
    },
    {
        name:"Production de DMA par habitant par rapport à 2017",
        layername:'odema:rri_indic_epci_ratiodma_pr_2017',
        description: `La pruduction en 2030 doit être au minimum égale à 85% de la production de 2017 (réduction de 15%)`,
        unit:'%',
        goalValue: 85, //devnote : permettre une valeur absolue, ou une fonction ? (qui dépend des data)
        balanceValue:90,
        decrease:true
    },
    {
        name:"Réduction de la part de DMA enfouie",
        layername:'odema:rri_indic_epci_dma_part_enfouie',
        description: 'La part de DMA enfouis doit être au plus de 10% du tonnage total.',
        unit:'%',
        goalValue: 10,
        balanceValue:16.6,
        decrease:true
    }

]






export const PageJourneeCollec:React.FC<PageProps> = () => {
    const { token } = theme.useToken();


    const layername = useControl("indicateur")
    const annee = useControl('annee')
    const variable =  useControl('variable')

    const current_indic = indicateurs.find( i => i.layername == layername)
    
    const goalValue = current_indic?.goalValue || NaN ;
    const balanceValue = current_indic?.balanceValue || NaN ;
    const decrease = goalValue < balanceValue ;

    return (
        <Dashboard columns={2} debug>
            <Palette steps={['#264653','#2a9d8f', '#e9c46a','#f4a261','#e76f51']} labels={{'Atteint':'rgb(115, 185, 144)', 'Dans les temps':'rgb(133, 171, 252)', 'En retard':'#cecece'}}/>
            <Dataset 
                id="territoires"
                resource="odema:epci_latest"
                url="https://www.geo2france.fr/geoserver/odema/ows"
                type="wfs"
                meta={{properties:['nom', 'siren','population','population_collecte','population_traitement', 'typologie_ademe','tarification']}}
            >
                <Transform>{(data:SimpleRecord[]) => data.map( row =>
                        ( {...row,   
                               competence_collecte: row.population_collecte > 0 ? 'Exercée' : 'Déléguée',
                               competence_traitement: row.population_traitement > 0 ? 'Exercée' : 'Déléguée',
                        } )
                ) }</Transform>
            </Dataset>

            <Dataset 
                type="wfs"
                id="indic"
                url="https://www.geo2france.fr/geoserver/odema/ows"
                resource={useControl('indicateur') || ''}
            >
                <Filter field="date_mesure">{`${annee}-01-01`}</Filter>
                <Transform>{(data:SimpleRecord[] )=> 
                    data.map( row =>({
                        ...row, 
                        count:1,
                        valeur: current_indic?.layername=='rri_indic_epci_ratiodma_pr_2017' ? -1*row.valeur+100 : row.valeur,
                        objectif: decrease && row.valeur <= goalValue ? 'Atteint' :
                                    !decrease && row.valeur >= goalValue ? 'Atteint':
                                    between(row.valeur, goalValue, balanceValue) ? 'Dans les temps':
                                    'En retard',
                        }) )
                    }
                </Transform>
                <Join dataset="territoires" joinKey={['geocode_epci','siren']}/>
            </Dataset>

            <Dataset
                type="wfs"
                id="indic_region"
                url="https://www.geo2france.fr/geoserver/odema/ows"
                resource={useControl('indicateur') || ''}
                >
                    <Filter field="date_mesure">{`${annee}-01-01`}</Filter>
                    <Transform>SELECT 
                                date_mesure,
                                sum([numerateur]) as numerateur, 
                                sum([denominateur]) as denominateur,
                                sum([numerateur])/sum([denominateur]) as valeur ,
                                count(*)
                                FROM ? GROUP BY date_mesure</Transform>
            </Dataset>

            <Control>
                <Select name="indicateur" options={indicateurs.map( i => ({value:i.layername, label:i.name}))}/>
                <Select name="annee" arrows options={['2023','2024']} defaultValue={'2024'}/>
                <Select name="variable" options={['competence_collecte','competence_traitement','typologie_ademe','tarification', 'type_valo_matiere']} />
            </Control>
            
          {/*  <ChartComparison 
                title={`Objectif : ${current_indic?.name}`}
                size={0.75}
                chartType="donut"
                dataset="indic"
                nameKey="objectif"
                valueKey="count"
                option={{  graphic: {
                    elements: [
                    {
                        type: 'text',
                        left: 'center',
                        top: 'middle',
                        style: {
                        text: `${current_indic?.goalValue}`,
                        fontSize: 24,
                        fontWeight: 'bold'
                        }
                    }
                    ]
                },}}
            /> */}
            <Intro>
             <div>Choisir un indicateur, une année et une variable (dimension) d'analyse.
             ℹ️ Les axes sont sont pas disponibles pour tous les indicateurs.</div>
            </Intro>
            <div>{current_indic?.name}<br/>
                Description de l'indicateur : {current_indic?.description}
            </div>
            <SingleAxis 
                title="Valeurs de l'indicateur dans les territoires"
                dataset='indic' 
                size={1.25} 
                goalValue={current_indic?.goalValue || NaN} balanceValue={current_indic?.balanceValue || NaN} 
                categoryKey={variable} 
                unit={current_indic?.unit}
                />
          <TargetPie 
                size={0.75} 
                dataset='indic'
                goalValue={current_indic?.goalValue} balanceValue={current_indic?.balanceValue}
                unit={current_indic?.unit}
            />
            <RacebarEpci dataset='indic' 
                size={1} 
                goalValue={current_indic?.goalValue || NaN} 
                balanceValue={current_indic?.balanceValue || NaN} 
                categoryKey={variable}
                unit={current_indic?.unit}
                />

            <MapIndicator dataset='indic' dataLevel="epci" 
                    color={token.green}
                    unit={current_indic?.unit}
                    highlightProperty={'geocode_epci'}
                    />
        </Dashboard>
    )
}