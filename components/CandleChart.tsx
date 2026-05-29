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

    const chart = createChart(containerRef.current, {
      height,
      layout: {
        background: { type: ColorType.Solid, color: "#16181c" },
        textColor: "#9aa1ad",
      },
      grid: {
        vertLines: { color: "rgba(255,255,255,0.04)" },
        horzLines: { color: "rgba(255,255,255,0.04)" },
      },
      rightPriceScale: {
        borderColor: "rgba(255,255,255,0.08)",
      },
      timeScale: {
        borderColor: "rgba(255,255,255,0.08)",
        timeVisible: true,
      },
      crosshair: {
        mode: 1,
      },
    });

    const candleSeries = chart.addSeries(CandlestickSeries, {
      upColor: "#17ba7c",
      downColor: "#f0384a",
      borderVisible: false,
      wickUpColor: "#17ba7c",
      wickDownColor: "#f0384a",
    });

    candleSeries.setData(candles.map(({ time, open, high, low, close }) => ({ time, open, high, low, close })));

    const ema20 = chart.addSeries(LineSeries, {
      color: "#7b5cff",
      lineWidth: 2,
      priceLineVisible: false,
      lastValueVisible: false,
    });
    ema20.setData(ema(candles, 20));

    const ema50 = chart.addSeries(LineSeries, {
      color: "#6b727e",
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
