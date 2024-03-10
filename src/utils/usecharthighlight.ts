import { MutableRefObject, useEffect } from "react";

export interface useChartEventsProps{
  /** La référence du graphique */
  chartRef:MutableRefObject<any>,
  /** Fonction appelée lors du click Généralement c'est un setStat() */
  onClick?: Function,
  /** Fonction appelée lors du mouse-over ET mouse-out (avec paramètre null pour le mouse-out). Généralement c'est un setStat() */
  onFocus?: Function
}
/** Hook permettant de récupérer les évenements click et mouseover/mouseout d'un graphique ECharts 
 * @category Hook
*/
export const useChartEvents = ({chartRef, onClick, onFocus}:useChartEventsProps) => {
  useEffect(() => {
    if (chartRef.current) { //Factoriser pour les différents type d'évenment ?
      const mychart = chartRef.current.getEchartsInstance();

      const handleMouseOver = onFocus ? (e:any) => onFocus(e) : undefined; 
      const handleMouseOut = onFocus ?  () => onFocus(null) : undefined; //Retourner plutôt un '' ?
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
  }, [chartRef]);

}

export interface useChartActionProps{ //TODO : remplacer highlight_key et item par un seul paramètre : {highlight_key: item} ?
  /** La référence du graphique */
  chartRef:MutableRefObject<any>,
  /** La champs à utiliser pour sélectionner l'objet à focus (cf. https://echarts.apache.org/en/api.html#action.highlight) */
  highlight_key:'seriesIndex' | 'seriesId' | 'seriesName' | 'name',
  /** La valeur à focus */
  item? : string
}

/** Hook permettant de highlight un élément d'un graphique ECharts 
 * @category Hook
*/
export const useChartAction = ({chartRef, highlight_key, item}:useChartActionProps) => {

  useEffect(() => {
    if (chartRef.current) {
      const mychart = chartRef.current.getEchartsInstance();
      mychart.dispatchAction({ type: 'downplay' });
      if (item) {
          mychart.dispatchAction({ type: 'highlight', [highlight_key]: item });
      }
    }
  }, [chartRef, item]);
}