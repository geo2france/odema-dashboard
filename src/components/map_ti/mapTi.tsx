import { SimpleRecord, useApi, useDashboardElement, useMapControl, LegendItem, MapLegend } from "api-dashboard"
import { CSSProperties, useRef, useState } from "react"
import Map, { Layer, LayerProps, Source, SourceProps, Popup} from 'react-map-gl/maplibre';
import { BaseLayer } from '../map_baselayer';
import { geo2franceProvider } from "../../App";

import { NavLink } from "react-router-dom";
import { map_locale } from "../../utils";


interface IMapTIProps{
    data?:SimpleRecord[],
    year?:number,
    style?:CSSProperties
}



const colors = {incitative:"#7EDB69", classique:"#C479DC"}

const legendItems:LegendItem[] = [
    { color: colors.classique, label: 'Tarification classique' },
    { color: colors.incitative, label: 'Tarification incitative' }
];

export const MapTI: React.FC<IMapTIProps> = ({ style }) => {
    const [clickedFeature, setClickedFeature] = useState<any>(undefined);

    const mapRef = useRef<any>(null);
    useDashboardElement({chartRef:mapRef});
    useMapControl({mapRef, legendElement:<MapLegend items={legendItems}/>})

    const onClickMap = (evt:any) => {
       setClickedFeature({...evt.features[0], ...{lngLat:evt.lngLat}})
    }

    const geojson_ti = useApi({
        resource:"odema:tarification_om",
        meta:{srsname:'EPSG:4326'},
        dataProvider:geo2franceProvider,
        pagination:{mode:"off"}
    })

    const source_ti:SourceProps = {
        type:'geojson',
        data:geojson_ti.data?.geojson
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
      ref={mapRef}
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

     {geojson_ti.data && <Source {...source_ti}>
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

    </Map>
        </>
    )
}