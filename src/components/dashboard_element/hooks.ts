import { chartContext } from ".";
import { MutableRefObject, useContext, useEffect } from "react";


/**
 * Hook permettant de faire remonter la référence du graphique dans le composant DashboardElement
 * Ceci est nécessaire pour les fonctionnalités d'export graphique
 * @example
 * useDashboardElement({chartRef:chartRef})
 */

export interface useDashboardElementProps {
  chartRef?: MutableRefObject<any>,
}

export const useDashboardElement = ({ chartRef }: useDashboardElementProps) => {
  const { setchartRef } = useContext(chartContext); //Gérer les cas où ce contexte n'existe pas

  useEffect(() => {
    if (setchartRef) {
      setchartRef(chartRef);
    }
  }, [chartRef]);
};

/**
 * Hook permettant de remonter les données au Dashboard Element
 * @param {any} props.data - Les données à proposer au téléchargement.
 * @param {Array<any>} [props.dependencies=[]] - Les dépendances suspeptibles de modifier les données
 */
export interface useChartDataProps {
  data?: any,
  dependencies?:any[]
}
export const useChartData = ({data, dependencies=[]}:useChartDataProps) => {
  const { setData, data:contextdata } = useContext(chartContext); 

  useEffect(() => {
    if (data && contextdata != data) {
      setData(data);
    }
  }, dependencies);
}