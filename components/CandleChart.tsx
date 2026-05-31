"use client";

import { useEffect, useRef, type CSSProperties } from "react";
import {
  CandlestickSeries,
  ColorType,
  createChart,
  HistogramSeries,
  LineSeries,
  LineStyle,
} from "lightweight-charts";
import type { CandlePoint } from "@/lib/upbit";
import { ema } from "@/lib/indicators";

type CandleChartProps = {
  candles: CandlePoint[];
  height?: number;
  symbol?: string;
};

type CSSVars = CSSProperties & Record<`--${string}`, string | number>;

function formatKrwAxis(price: number) {
  const abs = Math.abs(price);
  const sign = price < 0 ? "-" : "";

  if (abs >= 100_000_000) {
    return `${sign}${(abs / 100_000_000).toFixed(abs >= 1_000_000_000 ? 1 : 2)}억`;
  }

  if (abs >= 10_000) {
    return `${sign}${Math.round(abs / 10_000).toLocaleString("ko-KR")}만`;
  }

  return `${sign}${Math.round(abs).toLocaleString("ko-KR")}`;
}

function withAlpha(color: string, alpha: number) {
  const hex = color.trim();
  const match = /^#([0-9a-f]{6})$/i.exec(hex);

  if (!match) return color;

  const value = match[1];
  const r = Number.parseInt(value.slice(0, 2), 16);
  const g = Number.parseInt(value.slice(2, 4), 16);
  const b = Number.parseInt(value.slice(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

export function CandleChart({ candles, height = 420, symbol }: CandleChartProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current || candles.length === 0) return;

    const rootStyle = getComputedStyle(document.documentElement);
    const token = (name: string, fallback: string) => rootStyle.getPropertyValue(name).trim() || fallback;
    const bgCard = token("--bg-card", "#202020");
    const textMuted = token("--text-muted", "#8f8f8f");
    const rule = token("--rule", "#2a2a2a");
    const brand = token("--accent-brand", "#a855f7");
    const bull = token("--accent-bull", "#17ba7c");
    const bear = token("--accent-bear", "#f0384a");
    const fontMono = token("--font-geist-mono", token("--font-mono", "ui-monospace, SFMono-Regular, Menlo, monospace"));
    const container = containerRef.current;

    const chart = createChart(container, {
      width: container.clientWidth,
      height: container.clientHeight || height,
      layout: {
        background: { type: ColorType.Solid, color: bgCard },
        textColor: "#7c7c7c",
        fontFamily: fontMono,
        fontSize: 11,
        attributionLogo: false,
      },
      localization: {
        locale: "ko-KR",
        priceFormatter: formatKrwAxis,
      },
      grid: {
        vertLines: { color: "rgba(255,255,255,0.025)", style: LineStyle.Dotted, visible: false },
        horzLines: { color: "rgba(255,255,255,0.05)", style: LineStyle.Solid },
      },
      rightPriceScale: {
        borderColor: rule,
        scaleMargins: { top: 0.12, bottom: 0.18 },
      },
      timeScale: {
        borderColor: rule,
        timeVisible: true,
        rightOffset: 6,
        barSpacing: 8,
      },
      crosshair: {
        mode: 1,
        vertLine: {
          color: "rgba(168,85,247,0.45)",
          width: 1,
          style: LineStyle.Dashed,
          labelBackgroundColor: brand,
        },
        horzLine: {
          color: "rgba(168,85,247,0.45)",
          width: 1,
          style: LineStyle.Dashed,
          labelBackgroundColor: brand,
        },
      },
    });

    const candleSeries = chart.addSeries(CandlestickSeries, {
      upColor: bull,
      downColor: bear,
      borderVisible: false,
      wickUpColor: bull,
      wickDownColor: bear,
      priceLineColor: brand,
      priceLineStyle: LineStyle.Dashed,
      priceLineWidth: 1,
    });

    candleSeries.setData(candles.map(({ time, open, high, low, close }) => ({ time, open, high, low, close })));

    const ema20 = chart.addSeries(LineSeries, {
      color: brand,
      lineWidth: 2,
      priceLineVisible: false,
      lastValueVisible: false,
      crosshairMarkerVisible: false,
    });
    ema20.setData(ema(candles, 20));

    const ema50 = chart.addSeries(LineSeries, {
      color: withAlpha(textMuted, 0.65),
      lineWidth: 1,
      priceLineVisible: false,
      lastValueVisible: false,
      crosshairMarkerVisible: false,
    });
    ema50.setData(ema(candles, 50));

    const volumeSeries = chart.addSeries(HistogramSeries, {
      priceFormat: { type: "volume" },
      priceLineVisible: false,
      lastValueVisible: false,
      priceScaleId: "",
    });
    volumeSeries.setData(
      candles.map((candle) => ({
        time: candle.time,
        value: candle.volume,
        color: withAlpha(candle.close >= candle.open ? bull : bear, 0.36),
      })),
    );
    volumeSeries.priceScale().applyOptions({
      scaleMargins: { top: 0.82, bottom: 0 },
    });

    chart.timeScale().fitContent();

    const resizeObserver = new ResizeObserver(([entry]) => {
      chart.applyOptions({ width: entry.contentRect.width, height: entry.contentRect.height || height });
    });
    resizeObserver.observe(container);

    return () => {
      resizeObserver.disconnect();
      chart.remove();
    };
  }, [candles, height]);

  return (
    <div
      className="candle-chart-frame relative w-full overflow-hidden rounded-[var(--radius-md)] border border-[var(--rule)] bg-[var(--bg-card)]"
      style={{ "--chart-height": `${height}px` } as CSSVars}
    >
      <div className="pointer-events-none absolute left-3 top-3 z-10 flex max-w-[calc(100%-1.5rem)] flex-wrap items-center gap-2 rounded-[var(--radius-sm)] border border-white/10 bg-[rgba(26,26,26,0.72)] px-3 py-2 font-[family-name:var(--font-geist-mono)] text-[10px] font-semibold uppercase text-[var(--text-muted)] backdrop-blur-md sm:left-4 sm:top-4">
        <span className="text-[var(--text-primary)]">{symbol ? `KRW-${symbol.toUpperCase()}` : "KRW Market"}</span>
        <span>일봉</span>
        <span className="inline-flex items-center gap-1">
          <span className="h-1.5 w-1.5 rounded-full bg-[var(--accent-brand)]" />
          EMA20
        </span>
        <span className="inline-flex items-center gap-1">
          <span className="h-1.5 w-1.5 rounded-full bg-[var(--text-muted)]" />
          EMA50
        </span>
      </div>
      <div ref={containerRef} className="h-full w-full" />
    </div>
  );
}
