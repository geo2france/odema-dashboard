import React, { useRef } from 'react';
import 'maplibre-gl/dist/maplibre-gl.css';
import { BaseRecord } from '@refinedev/core';
import Map, { Layer, LayerProps, Source, SourceProps } from 'react-map-gl/maplibre';
import { BaseRecordToGeojsonPoint } from '../../utils';
import { BaseLayer } from '../map_baselayer';

export interface IMapProps{
    data:BaseRecord[],
    aiot:string,
    year?:number,
    onClick?:Function
}

export const MapIsdnd: React.FC<IMapProps> = ({ data, aiot, year, onClick }) => {
  const mapRef = useRef<any>(null);
  const zoom = 6.5;

 const source_isdn:SourceProps = {
    type: 'geojson',
    data:BaseRecordToGeojsonPoint({data:data.filter((e) => (e.annee == year && e.capacite > 0 )), y:'lng',x:'lat'})
  }


  const layer_entrants:LayerProps = {
    'id': 'isdnd',
    'type': 'circle',
    'paint': {
      'circle-radius': ["interpolate", ["linear"], ['get', 'tonnage'],0,0,1000000,60], 
      'circle-color': ['case', ['==', ['get', 'aiot'], aiot] ,'#3887be', "#828282"],
      'circle-opacity': ['case', ['==', ['get', 'aiot'], aiot] ,0.8, 0.5]

    }
  }

  const layer_capacite:LayerProps = {
    'id': 'isdnd_capacite',
    'type': 'circle',
    'paint': {
      'circle-radius': ["interpolate", ["linear"], ['get', 'capacite'],0,0,1000000,60], 
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
      onClick={onClickMap}
      onMouseMove={onMouseMoveMap}
      attributionControl={true}
      interactiveLayerIds={['isdnd_entrant','isdnd_capacite']}
    >

      <BaseLayer layer="osm"/>

      <Source {...source_isdn}>
        <Layer {...layer_entrants} id="isdnd_entrant" />
        <Layer {...layer_capacite} id="isdnd_capacite"/>
      </Source>


    </Map>
  );
}