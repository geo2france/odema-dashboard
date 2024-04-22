import { MutableRefObject, useEffect, useState } from "react";

export interface useChartExportProps{
    chartRef?:MutableRefObject<any>,
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
            console.log('export')
            const mychart = chartRef.current.getEchartsInstance();
                const dataURL = mychart.getDataURL();
                setImage64(dataURL);
                setExportRequested(false);
        }              
        }, [chartRef, exportRequested]
    )

    const exportImage = () => {
        console.log('called')
        setExportRequested(true);
    };
    return { img64, exportImage}
}