import { BaseRecord } from "@refinedev/core";
import { FeatureCollection, Feature } from "geojson";
import { useSearchParams } from "react-router-dom";

export { chartBusinessProps} from "./nomenclature";
export { useChartEvents, useChartActionHightlight as useChartAction } from "./usecharthighlight";



/**
 * Return wrapped string
 * 
 * @param chaine - Input String
 * @param maxLength - Maximum line length
 * @returns The wrapped string
 */
export const wrappe = (chaine: string, maxLength: number): string => {
    return chaine.split(' ').reduce((result: string[], word: string) => {
        const lastLine = result[result.length - 1];
        if (!lastLine || (lastLine.length + word.length + 1) > maxLength) {
            result.push(word);
        } else {
            result[result.length - 1] += ' ' + word;
        }
        return result;
    }, []).join('\n');
}


/**
 * See https://blog.logrocket.com/use-state-url-persist-state-usesearchparams/
 * 
 * @param searchParamName 
 * @param defaultValue 
 * @returns searchParamsState & setSearchParamsState
 */
export function useSearchParamsState(
    searchParamName: string,
    defaultValue: string
): readonly [
    searchParamsState: string,
    setSearchParamsState: (newState: string) => void
] {
    const [searchParams, setSearchParams] = useSearchParams();

    const acquiredSearchParam = searchParams.get(searchParamName);
    const searchParamsState = acquiredSearchParam ?? defaultValue;

    const setSearchParamsState = (newState: string) => {
        const next = Object.assign(
            {},
            [...searchParams.entries()].reduce(
                (o, [key, value]) => ({ ...o, [key]: value }),
                {}
            ),
            { [searchParamName]: newState }
        );
        setSearchParams(next);
    };
    return [searchParamsState, setSearchParamsState];
}




export const default_app_palette = [
    "#5470c6",
    "#91cc75",
    "#fac858",
    "#ee6666",
    "#73c0de",
    "#3ba272",
    "#fc8452",
    "#9a60b4",
    "#ea7ccc"
]


export interface IBaseRecordToGeojsonPoint{
    data : BaseRecord[],
    x : string,
    y : string,
    crs_name? :string
}

export interface FeatureCollection_crs extends FeatureCollection {crs?:any};

export const BaseRecordToGeojsonPoint = ({data, x, y, crs_name}:IBaseRecordToGeojsonPoint) => {

    //Tester maplibre avec CRS != 4326
    const features:Feature[] = data.map((e:BaseRecord) => 
       ( {
        type:"Feature",
        properties:{...e},
        geometry:{
            type:"Point",
            coordinates:[e[y], e[x]]
         }
       }
    ))

    const geojson:FeatureCollection_crs = {"type": "FeatureCollection", features:features}

    if (crs_name){
        geojson.crs={type:"name", properties:{"name":crs_name}} //no longer supported in geoJSON ? https://github.com/DefinitelyTyped/DefinitelyTyped/issues/21794
    }
    return geojson
}


export type DataFileType = 'csv' | 'xlsx' | 'ods';
