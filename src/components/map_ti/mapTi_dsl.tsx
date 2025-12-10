import {  LegendItem } from "@geo2france/api-dashboard"
import { CSSProperties, useState } from "react"
import Map, { Layer, LayerProps, Source, SourceProps, Popup} from 'react-map-gl/maplibre';
import { BaseLayer } from '../map_baselayer';

import { NavLink } from "react-router-dom";
import { map_locale } from "../../utils";
import { LegendControl, useBlockConfig, useDataset } from "@geo2france/api-dashboard/dsl";


interface IMapTIProps{
    dataset:string,
    year?:number,
    style?:CSSProperties,
    title?:string
}



const colors = {incitative:"#7EDB69", classique:"#C479DC"}

const legendItems:LegendItem[] = [
    { color: colors.classique, label: 'Tarification classique' },
    { color: colors.incitative, label: 'Tarification incitative' }
];

export const MapTI: React.FC<IMapTIProps> = ({ dataset:dataset_id, style, title}) => {
    const [clickedFeature, setClickedFeature] = useState<any>(undefined);
    const dataset = useDataset(dataset_id)

    const onClickMap = (evt:any) => {
       setClickedFeature({...evt.features[0], ...{lngLat:evt.lngLat}})
    }

    useBlockConfig({title, dataExport: dataset?.data})
    const geojson_ti = dataset?.geojson

    const source_ti:SourceProps = {
        type:'geojson',
        data:geojson_ti
      }

      const layer_ti:LayerProps = {
        'id': 'ti',
        'type': 'fill',
        'paint': {
            'fill-color': [
                'match',
                ['get', 'type_tarification'],
                'Classique', colors.classique, 
                'Incitative', colors.incitative, 
                /* Couleur par défaut*/ '#ffffff'
            ],
            'fill-outline-color': 'white',
        }
    };
    
    return (
        <>           

            <Map
      reuseMaps
      preserveDrawingBuffer
      initialViewState={{
        latitude: 49.96462, //Centroid enveloppe HDF
        longitude: 2.820399,
        zoom: 6.4
      }}
      style={{ ...style, width: '100%', height:'500px',...style }}
      onClick={onClickMap}
      attributionControl={true}
      interactiveLayerIds={['ti']}
      cooperativeGestures
      locale={map_locale}
    >

      <BaseLayer layer="osm"/>

     {geojson_ti && <Source {...source_ti}>
        <Layer {...layer_ti}></Layer>
      </Source> }

      {clickedFeature?.properties && 
        <Popup longitude={clickedFeature.lngLat.lng} 
                latitude={clickedFeature.lngLat.lat} 
                onClose={() => {setClickedFeature(undefined)} }>
        
        <>
            <p><span>{clickedFeature.properties.epci_nom}</span></p>
            <p><b>Tarification : {clickedFeature.properties.type_tarification}</b> - {clickedFeature.properties.population?.toLocaleString()} hab.</p>
            <p><NavLink to={`/dma/epci?siren=${clickedFeature.properties.epci_siren}`}>Fiche territoire</NavLink></p>
        </>
        
    </Popup> }
           <LegendControl items={legendItems} /> 

    </Map>
        </>
    )
}