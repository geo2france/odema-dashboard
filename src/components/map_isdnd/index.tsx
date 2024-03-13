import React, { useRef, useEffect } from 'react';
import { LngLatLike, MapLibreEvent } from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { BaseRecord } from '@refinedev/core';
import Map, { Layer, LayerProps, Source, SourceProps } from 'react-map-gl/maplibre';
import { BaseRecordToGeojsonPoint } from '../../utils';
//import './map.css';

export interface IMapProps{
    data:BaseRecord[],
    aiot:string,
    onClick?:Function
}


export const MapIsdnd: React.FC<IMapProps> = ({ data, aiot, onClick }) => {
  const mapRef = useRef<any>(null);
  const zoom = 7;
  const year = 2022
  //const style = 'https://demotiles.maplibre.org/style.json';


const source_raster:SourceProps = //Ressource commune (fond de plan)
  {
    'type': 'raster',
    'tiles': [
        //'https://www.geo2france.fr/geoserver/geo2france/ows/?bbox={bbox-epsg-3857}&format=image/png&service=WMS&version=1.3.0&request=GetMap&srs=EPSG:3857&transparent=true&width=256&height=256&layers=ortho_regionale_2018_rvb'
        'https://osm.geo2france.fr/mapcache/?SERVICE=WMS&VERSION=1.1.1&REQUEST=GetMap&FORMAT=image%2Fpng&TRANSPARENT=false&LAYERS=grey&TILED=true&WIDTH=256&HEIGHT=256&SRS=EPSG%3A3857&STYLES=&BBOX={bbox-epsg-3857}'
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
      'circle-radius': ["interpolate", ["linear"], ['get', 'tonnage'],0,5,1000000,50], 
      'circle-color': ['case', ['==', ['get', 'aiot'], aiot] ,'#3887be', "#828282"],
      'circle-opacity': ['case', ['==', ['get', 'aiot'], aiot] ,0.8, 0.5]

    }
  }

  const layer_capacite:LayerProps = {
    'id': 'isdnd_capacite',
    'type': 'circle',
    'paint': {
      'circle-radius': ["interpolate", ["linear"], ['get', 'capacite'],0,5,1000000,50], 
      'circle-color': 'black',
      "circle-opacity":0,
      "circle-stroke-width":2,
      "circle-stroke-color":['case', ['==', ['get', 'aiot'], aiot] ,'#f00', "#828282"]
    }
  }

  const onClickMap =(evt:any) => { //Hook a faire ?
    const clicked = evt?.features[0]?.properties
    aiot = clicked ? clicked : aiot;
    if (clicked && onClick) {
      onClick(evt.features[0]?.properties)
    }
  }

  const onMouseMoveMap = (evt:any) => { //Commun
    if (evt?.features.length > 0) {
      mapRef.current.getCanvasContainer().style.cursor = 'pointer'
    }else {
      mapRef.current.getCanvasContainer().style.cursor = 'grab'
    }
  }

  return (
    <Map
      ref={mapRef}
      initialViewState={{
        latitude: 49.96462, //Centroid enveloppe HDF
        longitude: 2.820399,
        zoom: zoom
      }}
      style={{ width: '100%', height: 500 }}
      //mapStyle={style}
      onClick={onClickMap}
      onMouseMove={onMouseMoveMap}
      attributionControl={false}
      interactiveLayerIds={['isdnd_entrant','isdnd_capacite']}
    >

      <Source {...source_raster}>
        <Layer {...layer_raster} />
      </Source>

      <Source {...source_isdn}>
        <Layer {...layer_entrants} id="isdnd_entrant" />
        <Layer {...layer_capacite} id="isdnd_capacite"/>
      </Source>


    </Map>
  );
}