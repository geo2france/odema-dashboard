import Map, { Layer, LayerProps, Source, SourceProps } from 'react-map-gl/maplibre';
import { BaseLayer } from '../map_baselayer';
import { SimpleRecord, useApi, useDashboardElement } from "@geo2france/api-dashboard";
import { useRef } from 'react';
import { map_locale } from '../../utils';
import { geo2franceProvider } from '../../App';
import alasql from 'alasql';

interface MapEPCIDMAProps{
    data? : SimpleRecord[]
}

export const MapEPCIDMA: React.FC<MapEPCIDMAProps> = ({data}) => {


    const epci = useApi({
        dataProvider:geo2franceProvider,
        resource:"spld:epci",
        pagination:{pageSize:500},
        meta:{srsname:'EPSG:4326'},
    })

    const agg_data = data && alasql(`
            SELECT [siren_epci], SUM([ratio_hab]) as ratio_hab
            FROM ?
            GROUP BY [siren_epci]
        `, [data]) as Array<{ siren_epci: string; ratio_hab: number }>;

    epci.data?.geojson.features.forEach((feature:any) => { // Feature geosjon // Ajouter un useEffect/useMemo ?
        const indic_data = agg_data?.find( e => e.siren_epci == feature.properties?.code_epci)

        if(indic_data){
            feature.properties.ratio_hab = indic_data.ratio_hab 
        } 
    });


    console.log(epci.data?.geojson)
    const source_epci:SourceProps = {
        type:'geojson',
        data:epci.data?.geojson
      }

    const layer_epci:LayerProps = {
        'id': 'epci',
        'type': 'fill',
        'paint': {
          'fill-color': [
            'interpolate',
            ['linear'],
            ['get', 'ratio_hab'],
                0, 'rgba(241, 238, 246, 0.5)',  // 0 avec 50% de transparence
                300, 'rgba(189, 201, 225, 0.5)', // 1200 * 0.25
                600, 'rgba(116, 169, 207, 0.5)', // 1200 * 0.5
                900, 'rgba(43, 140, 190, 0.5)',  // 1200 * 0.75
                1200, 'rgba(4, 90, 141, 0.5)'    // 1200
    ],
          'fill-outline-color': 'black'
        }
    }

    const label_epci: LayerProps = {
        id: 'epci-label',
        type: 'symbol',
        layout: {
          'text-field': ['get', 'ratio_hab'],  // 🔥 Affiche la valeur de 'ratio_hab'
          'text-font': ['Open Sans Bold', 'Arial Unicode MS Bold'],
          'text-size': 12,
          'text-anchor': 'center',
        },
        paint: {
          'text-color': '#000000',     // Texte noir
          'text-halo-color': '#ffffff', // Contour blanc autour du texte
          'text-halo-width': 1
        }
      };

    const onMouseMoveMap = (evt:any) => { //Commun
        if (evt?.features.length > 0) {
          mapRef.current.getCanvasContainer().style.cursor = 'pointer'
        }else {
          mapRef.current.getCanvasContainer().style.cursor = 'grab'
        }
      }

    const mapRef = useRef<any>(null);
    useDashboardElement({chartRef:mapRef})
    return <Map
        reuseMaps
        preserveDrawingBuffer
        ref={mapRef}
        initialViewState={{
        latitude: 49.96462, //Centroid enveloppe HDF
        longitude: 2.820399,
        zoom: 6.5
        }}
        style={{ width: '100%', height:'500px' }}
        attributionControl={true}
        interactiveLayerIds={['epci']}
        onMouseMove={onMouseMoveMap}
        cooperativeGestures
        mapStyle="https://demotiles.maplibre.org/style.json"
        locale={map_locale}>

    {epci.data?.geojson && <Source {...source_epci}>
        <Layer {...label_epci}></Layer>
        <Layer {...layer_epci}></Layer>

      </Source> }

      <BaseLayer layer="osm"/>

    </Map>
}
