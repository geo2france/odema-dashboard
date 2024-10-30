import { SimpleRecord, useApi, useDashboardElement } from "g2f-dashboard"
import { CSSProperties, useEffect, useRef, useState } from "react"
import Map, { Layer, LayerProps, Source, SourceProps, Popup} from 'react-map-gl/maplibre';
import { BaseLayer } from '../map_baselayer';
import { geo2franceProvider } from "../../App";

import { createRoot } from 'react-dom/client';
import { NavLink } from "react-router-dom";


interface IMapTIProps{
    data?:SimpleRecord[],
    year?:number,
    style?:CSSProperties
}


const colors = {incitative:"#7EDB69", classique:"#C479DC"}

const MapLegend:React.FC = () => {
    const legendItems = [
        { color: colors.classique, label: 'Tarification classique' },
        { color: colors.incitative, label: 'Tarification incitative' }
    ];
    return (
        <div style={{ 
                backgroundColor: 'rgba(256,256,256,0.8)',
                padding: '10px',
                borderRadius: '4px',
                border:'1px solid grey', 
                margin:8
            }}>
            {legendItems.map((item, index) => (
                <div key={index} style={{ display: 'flex', alignItems: 'center', marginBottom: '4px' }}>
                    <div style={{
                        width: '16px',
                        height: '16px',
                        backgroundColor: item.color,
                        borderRadius: '2px',
                        marginRight: '8px'
                    }}></div>
                    <span>{item.label}</span>
                </div>
            ))}
        </div>
    )
}

export const MapTI: React.FC<IMapTIProps> = ({ style }) => {
    const [clickedFeature, setClickedFeature] = useState<any>(undefined);

    const mapRef = useRef<any>(null);
    useDashboardElement({chartRef:mapRef});

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

   useEffect(() => {
        if (mapRef?.current) {

            const controlDiv = document.createElement('div');
            const root = createRoot(controlDiv);


            const customControl = {
                onAdd: () => {
                    root.render(<MapLegend />);
                    return controlDiv;
                },
                onRemove: () => {
                    //root.unmount(); 
                    controlDiv.parentNode?.removeChild(controlDiv);
                }
            };

            mapRef?.current?.getMap().addControl(customControl, 'top-right');

            return () => {
                customControl.onRemove(); 
            };
        }

    }, [ mapRef?.current]);

    
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