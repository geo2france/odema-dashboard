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
