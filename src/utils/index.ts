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
    const data_filtered = data.filter((r) => r[0] && r[1]).sort() // Sort and delete undefined

    if (data_filtered.length < 1){
        return []
    }

    for (let i = 0; i < data_filtered.length - 1; i++) {

        const [x1, y1] = data_filtered[i];
        const [x2, y2] = data_filtered[i + 1];

        // Ajoute le point de départ
        result.push(data_filtered[i]);

        // Calcule les points intermédiaires
        const steps = x2 - x1;
        for (let j = 1; j < steps; j++) {
            const x = x1 + j;
            const y = y1 + ((y2 - y1) / steps) * j;
            result.push([x, y]);
        }
    }

    // Ajoute le dernier point
    result.push(data_filtered[data_filtered.length - 1]);

    return result; 
}

// Utilisé dans la property locale du composant Map de React-Map-Gl (si CooperativeGesture est True)
export const map_locale = {
    'CooperativeGesturesHandler.WindowsHelpText': 'Utilisez Ctrl + molette pour zommer sur la carte.',
    'CooperativeGesturesHandler.MacHelpText': 'Utilisez ⌘ + molette pour zommer sur la carte.',
    'CooperativeGesturesHandler.MobileHelpText': 'Utilisez deux doights pour déplacer la carte.',
}