import React, { useEffect, useRef } from 'react';
import chartXkcd from 'chart.xkcd';

// Typages pour Chart.xkcd (on n’importe que ce qui nous intéresse)
type ChartType = 'Line' | 'Bar' | 'BarH' | 'Pie' | 'Donut' | 'Scatter' | 'Radar';

export interface ChartXKCDConfig {
    title?: string;
    fontFamily?: string;
    width?: number;
    height?: number;
    roughness?: number;
    fillStyle?: string;
    strokeWidth?: number;

    // On supporte les deux formats "single‐series" et "multi‐series"
    data: {
        labels: string[];
        // Cas multi‐series :
        datasets?: Array<{ label: string; data: number[] }>;
        // Cas single‐series (fallback) :
        values?: number[];
    };

    options?: {
        legendPosition?: string;
        showLegend?: boolean;
        [key: string]: unknown;
    };

    [key: string]: unknown;
}

// On force le cast chartXkcd pour accéder aux constructeurs
interface ChartXKCDStatic {
    config: {
        positionType: Record<'upLeft' | 'upRight' | 'downLeft' | 'downRight', string>;
    };
    Line: new (container: HTMLElement | SVGSVGElement, cfg: ChartXKCDConfig) => void;
    Bar: new (container: HTMLElement | SVGSVGElement, cfg: ChartXKCDConfig) => void;
    BarH: new (container: HTMLElement | SVGSVGElement, cfg: ChartXKCDConfig) => void;
    Pie: new (container: HTMLElement | SVGSVGElement, cfg: ChartXKCDConfig) => void;
    Donut: new (container: HTMLElement | SVGSVGElement, cfg: ChartXKCDConfig) => void;
    Scatter: new (container: HTMLElement | SVGSVGElement, cfg: ChartXKCDConfig) => void;
    Radar: new (container: HTMLElement | SVGSVGElement, cfg: ChartXKCDConfig) => void;
}

const xkcd = (chartXkcd as unknown) as ChartXKCDStatic;

export const ChartXKCD: React.FC<{
    type: ChartType;
    config: ChartXKCDConfig;
    width?: number;
    height?: number;
}> = ({ type, config, width = 400, height = 300 }) => {
    const svgRef = useRef<SVGSVGElement>(null);

    useEffect(() => {
        const container = svgRef.current;
        if (!container) return;

        // On vide tout ce qui existait avant
        container.innerHTML = '';

        // On prépare un objet "data" qui contient forcément "datasets"
        let finalData:
            | { labels: string[]; datasets: Array<{ label: string; data: number[] }> }
            | null = null;

        // 1) Si l'utilisateur a passé un tableau "datasets" non vide, on l'utilise
        if (Array.isArray(config.data.datasets) && config.data.datasets.length > 0) {
            finalData = {
                labels: config.data.labels,
                datasets: config.data.datasets
            };
        }
        // 2) Sinon, si on a un tableau "values", on le transforme en un dataset unique
        else if (Array.isArray(config.data.values) && config.data.values.length > 0) {
            finalData = {
                labels: config.data.labels,
                datasets: [
                    {
                        label: '',
                        data: config.data.values
                    }
                ]
            };
        }

        if (!finalData) {
            console.warn('[ChartXKCD] config.data.datasets manquant ou vide 🚨');
            return;
        }

        // On récupère le constructeur correspondant (Bar, Line, etc.)
        const Ctor = xkcd[type] as new (node: SVGSVGElement, cfg: ChartXKCDConfig) => void;

        // On fusionne dans un nouvel objet de façon à remplacer "data" par finalData
        const cfgToSend: ChartXKCDConfig = {
            ...config,
            width,
            height,
            data: finalData
        };

        // On crée enfin le chart
        new Ctor(container, cfgToSend);
    }, [type, config, width, height]);

    return <svg ref={svgRef} />;
};