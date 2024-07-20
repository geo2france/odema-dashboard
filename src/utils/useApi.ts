//TODO a passer dans g2f-dashboard
import { CrudFilter, DataProvider, Pagination, CrudSort, MetaQuery } from "@refinedev/core";
import {useQuery} from "@tanstack/react-query";

interface useApiProps {
    dataProvider:DataProvider
    resource:string
    filters?:CrudFilter[]
    pagination?:Pagination
    sorters?:CrudSort[]
    meta?:MetaQuery
}

const useApi = ({dataProvider, resource, filters, pagination, sorters, meta }:useApiProps) => {
    const out = useQuery({
        queryKey:[dataProvider.getApiUrl, resource],
        queryFn: () => dataProvider.getList(
            {
                resource:resource, 
                filters:filters,
                pagination:pagination,
                sorters:sorters,
                meta:meta
            }
        ),
        enabled: true
    })

    return (out)
}

export default useApi