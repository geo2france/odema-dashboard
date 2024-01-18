import { BaseRecord } from "@refinedev/core";
import _ from "lodash";

export const dataGroupBy = (data:BaseRecord[], group_fields:string[], metric_field:string, method:string) => {

    const agg_function:(arr:[] | BaseRecord[], field:string) => number | undefined  = ((arr, field) => {
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
        [`${metric_field}_${method}`]:agg_function(v, metric_field)})
        ).value()
};

