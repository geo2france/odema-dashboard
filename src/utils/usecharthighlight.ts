import { MutableRefObject, useEffect } from "react";

/**
 * Hook permettant de réagir au survol d'un graphique (hilight)
 * TODO : Trouver un moyen pour utiliser plusieurs key
 * TODO : remplacer les paramètres par un object {}
 * TODO : Ne pas utiliser highlight_key dans handleMouseOver, retourner directement le event object (comme pour onclick)
 * @param chartRef - La référence du graphique
 * @param onFocus - Callback appelé lors du survol (en général setState()). Contient 
 * @param onClick - Callback appelé lors du click (en général setState())
 * @param focus_item - Nom de la série à mettre en higlight
 * @param highlight_key - Nom de la propriété à activer ; seriesIndex | seriesId | seriesName | dataIndex | name
 */
export const useChartHighlight = (chartRef:MutableRefObject<any>, onFocus?:Function, focus_item?:string, highlight_key:'seriesIndex' | 'seriesId' | 'seriesName' | 'dataIndex' | 'name'='name',  onClick?:Function) => {
    useEffect(() => {
      if (chartRef.current) {
        const mychart = chartRef.current.getEchartsInstance();

        const handleMouseOver = onFocus ? (e:any) => onFocus(e[highlight_key]) : undefined; // Ne pas mettre le higligt key ici ?
        const handleMouseOut = onFocus ?  () => onFocus(null) : undefined;
        const handleClick = onClick ? (e:any) => onClick(e) : undefined;

        if (handleMouseOver) {
          mychart.on('mouseover', handleMouseOver);
          mychart.on('mouseout', handleMouseOut);
        }

        if (handleClick) {
          mychart.on('click', handleClick);
        }
  
        return () => {
          if (onFocus) {
            mychart.off('mouseover', handleMouseOver);
            mychart.off('mouseout', handleMouseOut);
          }

          if (onClick) {
            mychart.off('mouseover', handleClick);
          }

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