import React from "react";
import { IResourceComponentsProps, BaseRecord, useList, useMany } from "@refinedev/core";
import { useTable, List, ShowButton, BooleanField } from "@refinedev/antd";
import { Table, Space } from "antd";

import { format } from 'date-fns';
export const TodosView: React.FC<IResourceComponentsProps> = () => {
    const { data, dataUpdatedAt, isLoading, isError } = useList({
        resource: "isdnd",
        pagination: {
            mode: "server",
        },
        filters:[
            {
                field : "geometry",
                operator : "in",
                value:'516811.57382454018807039,6787363.74617279972881079,755119.01895937265362591,6926462.76577867474406958'
            }
        ]
    });


    const todos = data?.data ?? [];
    const myDate = format(new Date(dataUpdatedAt), 'yyyy-MM-dd HH:mm:ss');


    return (
        <> {myDate }
            <ul>
            {todos.map((todo) => (
                <li key={todo.id}>
                <h4>
                    {todo.nom} - ({todo.nom_territoire })
                </h4>
                </li>
            ))}
            </ul>
        </>
      );
};
