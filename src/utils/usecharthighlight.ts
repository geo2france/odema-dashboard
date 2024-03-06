import { MutableRefObject, useEffect } from "react";

/**
 * Hook permettant de réagir au survol d'un graphique (hilight)
 * TODO : Trouver un moyen pour utiliser plusieurs key
 * TODO : remplacer les paramètres par un object {}
 * @param chartRef - La référence du graphique
 * @param onFocus - Fonction permettant d'actualiser le state
 * @param focus_item - Nom de la série à mettre en higlight
 * @param highlight_key - Nom de la propriété à activer ; seriesIndex | seriesId | seriesName | dataIndex | name
 */
export const useChartHighlight = (chartRef:MutableRefObject<any>, onFocus:Function, focus_item?:string, highlight_key:'seriesIndex' | 'seriesId' | 'seriesName' | 'dataIndex' | 'name'='name') => {
    useEffect(() => {
      if (chartRef.current) {
        const mychart = chartRef.current.getEchartsInstance();
        const handleMouseOver = (e:any) => onFocus(e[highlight_key]);
        const handleMouseOut = () => onFocus(null);
  
        mychart.on('mouseover', handleMouseOver);
        mychart.on('mouseout', handleMouseOut);
  
        return () => {
          mychart.off('mouseover', handleMouseOver);
          mychart.off('mouseout', handleMouseOut);
        };
      }
    }, [chartRef, onFocus]);
  
    useEffect(() => {
      if (chartRef.current) {
        const mychart = chartRef.current.getEchartsInstance();
        mychart.dispatchAction({ type: 'downplay' });
        if (focus_item) {
            mychart.dispatchAction({ type: 'highlight', [highlight_key]: focus_item });
        }
      }
    }, [chartRef, focus_item]);
  };