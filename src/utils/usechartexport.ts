import { MutableRefObject, useEffect, useState } from "react";
export interface useChartExportProps{
    chartRef?:MutableRefObject<any>,
  }

/**
 * Fonction pour obtenir l'export (img64) d'un echarts ou d'un maplibre
 * @param ref - Référence de l'objet (echarts ou maplibre)
 * @returns - L'image en base64
 */
export const getDataURL = (ref:MutableRefObject<any>) => {
    if('getCanvas' in ref.current){ //maplibre
        return ref.current.getCanvas().toDataURL();
    }else if ('getEchartsInstance' in ref.current){ //Echart
        return ref.current.getEchartsInstance().getDataURL();
    }
}


/**
 * Hook personnalisé pour exporter une image à partir d'une instance ECharts.
 * @param {Object} props - Les propriétés du hook.
 * @param {MutableRefObject<any>} props.chartRef - La référence de l'instance ECharts.
 * @returns {Object} - Un objet contenant l'URL de l'image générée et la fonction pour déclencher l'export.
 * 
 * @exemple
 * const {img64, exportImage} = useChartExport({chartRef:chartRef})
 */
export const useChartExport = ( {chartRef}:useChartExportProps) => {
    const [img64, setImage64] = useState()
    const [exportRequested, setExportRequested] = useState(false); // Suivre l'état de l'export

    useEffect(() => {
        if (chartRef?.current && exportRequested) {
            const dataURL = getDataURL(chartRef)
            setImage64(dataURL);
            setExportRequested(false);
        }              
        }, [exportRequested]
    )

    const exportImage = () => {
        console.log('called')
        setExportRequested(true);
    };
    return { img64, exportImage}
}