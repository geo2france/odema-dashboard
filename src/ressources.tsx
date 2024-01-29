import { HomeOutlined, RollbackOutlined } from "@ant-design/icons";
import { IResourceItem } from "@refinedev/core";

export const ressources:IResourceItem[] = [
  {
    meta: { label: "DMA"},
    identifier : "dma",
    icon: <HomeOutlined />,
    list: "/dma",
    name: "",
  },
  {
    meta: { label: "REP"},
    identifier : "rep",
    icon: <RollbackOutlined />,
    list: "/rep",
    name: "",
  }
]