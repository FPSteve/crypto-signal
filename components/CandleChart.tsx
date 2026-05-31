"use client";

import { useEffect, useRef } from "react";
import { CandlestickSeries, ColorType, createChart, LineSeries } from "lightweight-charts";
import type { CandlePoint } from "@/lib/upbit";
import { ema } from "@/lib/indicators";

type CandleChartProps = {
  candles: CandlePoint[];
  height?: number;
};

export function CandleChart({ candles, height = 420 }: CandleChartProps) {
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

    const chart = createChart(containerRef.current, {
      height,
      layout: {
        background: { type: ColorType.Solid, color: bgCard },
        textColor: textMuted,
      },
      grid: {
        vertLines: { color: "rgba(255,255,255,0.04)" },
        horzLines: { color: "rgba(255,255,255,0.04)" },
      },
      rightPriceScale: {
        borderColor: rule,
      },
      timeScale: {
        borderColor: rule,
        timeVisible: true,
      },
      crosshair: {
        mode: 1,
      },
    });

    const candleSeries = chart.addSeries(CandlestickSeries, {
      upColor: bull,
      downColor: bear,
      borderVisible: false,
      wickUpColor: bull,
      wickDownColor: bear,
    });

    candleSeries.setData(candles.map(({ time, open, high, low, close }) => ({ time, open, high, low, close })));

    const ema20 = chart.addSeries(LineSeries, {
      color: brand,
      lineWidth: 2,
      priceLineVisible: false,
      lastValueVisible: false,
    });
    ema20.setData(ema(candles, 20));

    const ema50 = chart.addSeries(LineSeries, {
      color: textMuted,
      lineWidth: 2,
      priceLineVisible: false,
      lastValueVisible: false,
    });
    ema50.setData(ema(candles, 50));

    chart.timeScale().fitContent();

    const resizeObserver = new ResizeObserver(([entry]) => {
      chart.applyOptions({ width: entry.contentRect.width });
    });
    resizeObserver.observe(containerRef.current);

    return () => {
      resizeObserver.disconnect();
      chart.remove();
    };
  }, [candles, height]);

  return <div ref={containerRef} className="h-[420px] w-full overflow-hidden rounded-[var(--radius-md)] border border-[var(--rule)] bg-[var(--bg-card)]" />;
}
