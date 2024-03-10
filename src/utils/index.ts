import { useSearchParams } from "react-router-dom";

export { chartBusinessProps} from "./nomenclature";
export { useChartEvents, useChartAction } from "./usecharthighlight";



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
