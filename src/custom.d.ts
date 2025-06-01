// src/custom.d.ts
interface ChartXKCDConfig {
    title?: string;
    fontFamily?: string;
    width?: number;
    height?: number;
    roughness?: number;
    fillStyle?: string;
    strokeWidth?: number;
    data?: unknown;       // les données brutes (labels / datasets)
    options?: unknown;    // options additionnelles (position de légende, etc.)
    [key: string]: unknown;
}

interface ChartXKCDStatic {
    config: {
        positionType: Record<'upLeft'|'upRight'|'downLeft'|'downRight', string>;
    };
    Line: new (
        container: HTMLElement | SVGSVGElement,
        config: ChartXKCDConfig
    ) => void;
    Bar: new (
        container: HTMLElement | SVGSVGElement,
        config: ChartXKCDConfig
    ) => void;
    BarH: new (
        container: HTMLElement | SVGSVGElement,
        config: ChartXKCDConfig
    ) => void;
    Pie: new (
        container: HTMLElement | SVGSVGElement,
        config: ChartXKCDConfig
    ) => void;
    Donut: new (
        container: HTMLElement | SVGSVGElement,
        config: ChartXKCDConfig
    ) => void;
    Scatter: new (
        container: HTMLElement | SVGSVGElement,
        config: ChartXKCDConfig
    ) => void;
    Radar: new (
        container: HTMLElement | SVGSVGElement,
        config: ChartXKCDConfig
    ) => void;
}

declare module 'chart.xkcd' {
    const chartXkcd: ChartXKCDStatic;
    export default chartXkcd;
}
