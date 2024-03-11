import React, { useRef, useEffect } from 'react';
import maplibregl, { LngLatLike } from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { BaseRecord } from '@refinedev/core';
//import './map.css';

export interface IMapProps{
    data:BaseRecord[],
    aiot:string
}

//TODO : composant carto générique ? Ou voir https://github.com/visgl/react-map-gl
// TODO : UseEffect[] pour initaliser carte ?
export const Map: React.FC<IMapProps> = ({ data, aiot }) => {
  const mapContainer = useRef<any>();
  const map = useRef<maplibregl.Map | null>(null);
  const zoom = 6;
  const style = 'https://demotiles.maplibre.org/style.json';

  const aiot_center = data.find((e) => e.aiot == aiot)
  const center:LngLatLike = aiot_center ? [aiot_center.lng, aiot_center.lat] : [3,25] // ??

  useEffect(() => {
    if (map.current) return; // stops map from intializing more than once

    map.current = new maplibregl.Map({
      container: mapContainer.current!,
      style: style,
      center: center,
      zoom: zoom
    });

  }, [style, center, zoom]);

  useEffect(() => {
    if (map.current){
        console.log("Flying to...")
        map.current.easeTo({center:center})
    }
  }, [aiot] )

  return (
      <div ref={mapContainer} className="map" style={{height:'300px'}}/>
  );
}