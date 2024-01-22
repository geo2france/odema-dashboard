import { BaseRecord } from "@refinedev/core";
import _ from "lodash";

export const dataGroupBy = (data:BaseRecord[], group_fields:string[], metric_field:string[], methods:string[]) => {

    if (metric_field.length !== methods.length) {
        throw new Error('<metric_field> and <methods> must to be same length arrays');
    }

    const agg_function:(arr:[] | BaseRecord[], field:string, method:string) => number | undefined  = ((arr, field, method) => {
        switch(method){
        case 'sum':
            return _.sumBy(arr, field)
       case 'min':
            return (_.minBy(arr, field) ?? {})[field] ?? undefined;
        case 'max':
            return (_.maxBy(arr, field) ?? {})[field] ?? undefined;
        case 'avg':
            return _.sumBy(arr, field) / arr.length
        case 'count':
            return arr.length
        default:
            throw new Error(`Méthode d'agrégation non prise en charge : ${method}`);
        }
    });

    return _.chain(data).groupBy((i)=>group_fields.map(f=>i[f]).join('|')).map((v)=>({
        ...Object.fromEntries(group_fields.map(field => [field, v[0][field]])),
        ...Object.fromEntries(
            metric_field.map((e, idx) => ([`${e}_${methods[idx]}`, agg_function(v, e, methods[idx]) ]
            )))
        })).value()
};

// IA Generated function
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