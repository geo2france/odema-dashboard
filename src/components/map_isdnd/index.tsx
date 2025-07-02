import React, { CSSProperties, useRef } from 'react';
import 'maplibre-gl/dist/maplibre-gl.css';
import Map, { Layer, LayerProps, Source, SourceProps } from 'react-map-gl/maplibre';
import { BaseLayer } from '../map_baselayer';
import { useDashboardElement, BaseRecordToGeojsonPoint, useApi, SimpleRecord, useMapControl, MapLegend, LegendItem } from 'api-dashboard';
import { geo2franceProvider } from '../../App';
import { map_locale } from '../../utils';

export interface IMapProps{
    data:SimpleRecord[],
    aiot:string,
    year?:number,
    onClick?:Function,
    style?:CSSProperties
}

const legendItems:LegendItem[] = [
  { color: "rgba(34, 139, 34, 0.5)", label: 'Zone de chalandise principale' },
  { color: "rgba(144, 238, 144, 0.5)", label: 'Zone de chalandise secondaire' }
];

export const MapIsdnd: React.FC<IMapProps> = ({ data, aiot, year, onClick, style }) => {
  const mapRef = useRef<any>(null);
  useDashboardElement({chartRef:mapRef})

  useMapControl({mapRef, legendElement:<MapLegend items={legendItems}/>})

  const zoom = 6.4;

 const source_isdn:SourceProps = {
    type: 'geojson',
    data:BaseRecordToGeojsonPoint({data:data.filter((e) => (e.annee == year && e.capacite > 0 )), y:'lng',x:'lat'})
  }

  const geojson_dpt = useApi({
    resource:"spld:DEPARTEMENT",
    meta:{srsname:'EPSG:4326'},
    dataProvider:geo2franceProvider,
    pagination:{mode:"off"}
  })

  const geojson_chalandise = useApi({
    resource:"odema:isdnd_chalandise",
    meta:{srsname:'EPSG:4326'},
    dataProvider:geo2franceProvider,
    pagination:{mode:"off"},
    filters:[{
      field:"aiot",
      operator:"eq",
      value:aiot
    }]
  });


  const layer_entrants:LayerProps = {
    'id': 'isdnd',
    'type': 'circle',
    'paint': {
      'circle-radius': ["interpolate", ["linear"], ['get', 'tonnage'],0,0,1000000,60], 
      'circle-color': ['case', ['==', ['get', 'aiot'], aiot] ,'#C3885E', "#828282"],
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

  const source_chalandise:SourceProps = {
    type:'geojson',
    data:geojson_chalandise.data?.geojson
  }

  const layer_chalandise:LayerProps = {
      "id": "chalandise",
      "type": "fill",
      "paint": {
        "fill-color": [
          "match",
          ["get", "type_chalandise"],
          "Principal", legendItems[0].color || 'transparent',  
          "Secondaire", legendItems[1].color || 'transparent', 
          "grey"            
        ],
        "fill-outline-color": "black"
      }
  }

  const source_departements:SourceProps = {
    type:'geojson',
    data:geojson_dpt.data?.geojson
  }

  const layer_departements:LayerProps = {
    'id': 'dep',
    'type': 'fill',
    'paint': {
      'fill-color': 'transparent',
      'fill-outline-color': 'black'
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
      reuseMaps
      preserveDrawingBuffer
      ref={mapRef}
      initialViewState={{
        latitude: 49.96462, //Centroid enveloppe HDF
        longitude: 2.820399,
        zoom: zoom
      }}
      style={{ ...style, width: '100%', height:'500px',...style }}
      onClick={onClickMap}
      onMouseMove={onMouseMoveMap}
      attributionControl={true}
      interactiveLayerIds={['isdnd_entrant','isdnd_capacite']}
      cooperativeGestures
      locale={map_locale}
    >

      <BaseLayer layer="osm"/>

     {geojson_dpt.data && <Source {...source_departements}>
        <Layer {...layer_departements}></Layer>
      </Source> }


      <Source {...source_isdn}>
        <Layer {...layer_entrants} id="isdnd_entrant"  />
        <Layer {...layer_capacite} id="isdnd_capacite" beforeId='isdnd_entrant' />
      </Source>
      
      {geojson_chalandise.data && geojson_chalandise.isFetching === false &&
        <Source {...source_chalandise}>
          <Layer {...layer_chalandise} beforeId="isdnd_capacite"/>
        </Source>
      }

    </Map>
  );
}