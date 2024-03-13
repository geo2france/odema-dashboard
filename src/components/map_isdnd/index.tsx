import React, { useRef, useEffect } from 'react';
import { LngLatLike, MapLibreEvent } from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { BaseRecord } from '@refinedev/core';
import Map, { Layer, LayerProps, Source, SourceProps } from 'react-map-gl/maplibre';
import { BaseRecordToGeojsonPoint } from '../../utils';
//import './map.css';

export interface IMapProps{
    data:BaseRecord[],
    aiot:string
}


export const MapIsdnd: React.FC<IMapProps> = ({ data, aiot }) => {
  const mapRef = useRef<any>(null);
  const zoom = 7;
  const year = 2022
  //const style = 'https://demotiles.maplibre.org/style.json';

  const aiot_center = data.find((e) => e.aiot == aiot)
  const center:LngLatLike = aiot_center ? [aiot_center.lng, aiot_center.lat] : [3,25] // ??

  console.log(BaseRecordToGeojsonPoint({data:data, y:'lng',x:'lat'}))


const source_raster:SourceProps = //Ressource commune (fond de plan)
  {
    'type': 'raster',
    'tiles': [
        'https://www.geo2france.fr/geoserver/geo2france/ows/?bbox={bbox-epsg-3857}&format=image/png&service=WMS&version=1.3.0&request=GetMap&srs=EPSG:3857&transparent=true&width=256&height=256&layers=ortho_regionale_2018_rvb'
    ],
    'tileSize': 256
    }

const layer_raster:LayerProps = {
  'id': 'orthoHR-layer',
  'type': 'raster',
  'paint': {}
};

 const source_isdn:SourceProps = {
    type: 'geojson',
    data:BaseRecordToGeojsonPoint({data:data.filter((e) => (e.annee == year)), y:'lng',x:'lat'})
  }


  const layer_entrants:LayerProps = {
    'id': 'isdnd',
    'type': 'circle',
    'paint': {
      'circle-radius':  {
        property: 'tonnage',
        type:  'exponential',
        stops: [
          [0, 0],
          [1000000, 25]
        ]
      },  
      'circle-color': '#3887be'
    }
  }

  const layer_capacite:LayerProps = {
    'id': 'isdnd_capacite',
    'type': 'circle',
    'paint': {
      'circle-radius':  {
        property: 'capacite',
        type:  'exponential',
        stops: [
          [0, 1],
          [1000000, 25]
        ]
      },  
      'circle-color': 'black',
      "circle-opacity":0,
      "circle-stroke-width":2,
      "circle-stroke-color":"#ff0000",
    }
  }

  useEffect(() => {
    if (mapRef.current){
        mapRef.current.flyTo({center:center, speed: 0.8, zoom:7}) //TODO : Highlight installation, cf https://maplibre.org/maplibre-gl-js/docs/examples/hover-styles/
    }
  }, [aiot] )

  return (
    <Map
      ref={mapRef}
      initialViewState={{
        latitude: center[1],
        longitude: center[0],
        zoom: zoom
      }}
      style={{ width: 800, height: 600 }}
      //mapStyle={style}
      attributionControl={false}
    >

      <Source {...source_raster}>
        <Layer {...layer_raster} />
      </Source>

      <Source {...source_isdn}>
        <Layer {...layer_entrants} />
        <Layer {...layer_capacite} />
      </Source>


    </Map>
  );
}