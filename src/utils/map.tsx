import React, { useRef, useEffect, useMemo } from 'react';
import maplibregl, { LngLatLike, MapLibreEvent } from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { BaseRecord } from '@refinedev/core';
import Map, {Marker} from 'react-map-gl/maplibre';
//import './map.css';

export interface IMapProps{
    data:BaseRecord[],
    aiot:string
}


export const MapIsdnd: React.FC<IMapProps> = ({ data, aiot }) => {
  const mapRef = useRef<any>(null);
  const zoom = 16;
  const year = 2022
  //const style = 'https://demotiles.maplibre.org/style.json';

  const aiot_center = data.find((e) => e.aiot == aiot)
  const center:LngLatLike = aiot_center ? [aiot_center.lng, aiot_center.lat] : [3,25] // ??


  useEffect(() => {
    if (mapRef.current){
        mapRef.current.flyTo({center:center, speed: 0.8, zoom:16})
    }
  }, [aiot] )

  const onLoad = (e:MapLibreEvent) => {
    e.target.addSource('wms-test-source',{
        'type': 'raster',
        'tiles': [
            'https://www.geo2france.fr/geoserver/geo2france/ows/?bbox={bbox-epsg-3857}&format=image/png&service=WMS&version=1.3.0&request=GetMap&srs=EPSG:3857&transparent=true&width=256&height=256&layers=ortho_regionale_2018_rvb'
        ],
        'tileSize': 256
        }
    )
    e.target.addLayer(
        {
            'id': 'wms-test-layer',
            'type': 'raster',
            'source': 'wms-test-source',
            'paint': {}
        }    );

  }

  const popup = (e:string) =>  useMemo(() => {
    console.log(e)
    return new maplibregl.Popup({ closeOnClick: false, closeButton: false }).setText(e);
  }, [])

  return (
    <Map
    ref={mapRef}
    initialViewState={{
      latitude: center[1],
      longitude: center[0],
      zoom: zoom
    }}
    style={{width: 800, height: 600}}
    //mapStyle={style}
    onLoad={onLoad}
    attributionControl={false}
  >
    {data.filter((e) => (e.annee == year)).map((item) =>
        <Marker key={`${item.aiot} ${item.annee}`} longitude={item.lng} latitude={item.lat} popup={popup(item.name)} color="red" />
     ) }
  </Map>
  );
}