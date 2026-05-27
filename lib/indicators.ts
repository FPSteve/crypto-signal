import type { CandlePoint } from "./upbit";

export type IndicatorPoint = {
  time: string;
  value: number;
};

export function ema(candles: CandlePoint[], period: number): IndicatorPoint[] {
  if (candles.length === 0) return [];

  const multiplier = 2 / (period + 1);
  let previous = candles[0].close;

  return candles.map((candle, index) => {
    previous = index === 0 ? candle.close : candle.close * multiplier + previous * (1 - multiplier);
    return {
      time: candle.time,
      value: Number(previous.toFixed(4)),
    };
  });
}

export function rsi(candles: CandlePoint[], period = 14): number | null {
  if (candles.length <= period) return null;

  let gains = 0;
  let losses = 0;

  for (let index = 1; index <= period; index += 1) {
    const change = candles[index].close - candles[index - 1].close;
    if (change >= 0) gains += change;
    else losses -= change;
  }

  let avgGain = gains / period;
  let avgLoss = losses / period;

  for (let index = period + 1; index < candles.length; index += 1) {
    const change = candles[index].close - candles[index - 1].close;
    const gain = Math.max(change, 0);
    const loss = Math.max(-change, 0);
    avgGain = (avgGain * (period - 1) + gain) / period;
    avgLoss = (avgLoss * (period - 1) + loss) / period;
  }

  if (avgLoss === 0) return 100;
  const rs = avgGain / avgLoss;
  return Number((100 - 100 / (1 + rs)).toFixed(1));
}

export function percentChange(candles: CandlePoint[], lookback: number): number | null {
  if (candles.length <= lookback) return null;
  const current = candles[candles.length - 1].close;
  const previous = candles[candles.length - 1 - lookback].close;
  return Number((((current - previous) / previous) * 100).toFixed(1));
}
