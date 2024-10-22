export { chartBusinessProps} from "./nomenclature";



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

type DataPoint = [number, number];
export const interpolate = (data:DataPoint[], _type='linear'):DataPoint[] => {

    const result: DataPoint[] = [];

    for (let i = 0; i < data.length - 1; i++) {
        const [x1, y1] = data[i];
        const [x2, y2] = data[i + 1];

        // Ajoute le point de départ
        result.push(data[i]);

        // Calcule les points intermédiaires
        const steps = x2 - x1;
        for (let j = 1; j < steps; j++) {
            const x = x1 + j;
            const y = y1 + ((y2 - y1) / steps) * j;
            result.push([x, y]);
        }
    }

    // Ajoute le dernier point
    result.push(data[data.length - 1]);

    return result; 
}