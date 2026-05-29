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

// ---------------------------------------------------------------------------
// MACD (12, 26, 9)
// ---------------------------------------------------------------------------

export type MACDResult = {
  macd: number;
  signal: number;
  histogram: number;
  trend: "bullish" | "bearish" | "neutral";
};

export function macd(
  candles: CandlePoint[],
  fastPeriod = 12,
  slowPeriod = 26,
  signalPeriod = 9,
): MACDResult | null {
  if (candles.length < slowPeriod + signalPeriod) return null;

  const fast = ema(candles, fastPeriod);
  const slow = ema(candles, slowPeriod);

  // MACD line = fast EMA - slow EMA
  const macdLine = fast.map((f, i) => ({
    time: f.time,
    close: f.value - slow[i].value,
    open: 0, high: 0, low: 0, volume: 0,
  }));

  // Signal line = EMA(9) of MACD line
  const signalLine = ema(macdLine as CandlePoint[], signalPeriod);

  const lastMacd = macdLine.at(-1)!.close;
  const lastSignal = signalLine.at(-1)!.value;
  const histogram = lastMacd - lastSignal;

  // Trend: bullish if MACD > signal and histogram growing
  const prevHistogram = macdLine.length >= 2 && signalLine.length >= 2
    ? macdLine.at(-2)!.close - signalLine.at(-2)!.value
    : 0;

  let trend: "bullish" | "bearish" | "neutral" = "neutral";
  if (histogram > 0 && histogram > prevHistogram) trend = "bullish";
  else if (histogram < 0 && histogram < prevHistogram) trend = "bearish";

  return {
    macd: Number(lastMacd.toFixed(4)),
    signal: Number(lastSignal.toFixed(4)),
    histogram: Number(histogram.toFixed(4)),
    trend,
  };
}

// ---------------------------------------------------------------------------
// Bollinger Bands (20, 2σ)
// ---------------------------------------------------------------------------

export type BollingerResult = {
  upper: number;
  middle: number;
  lower: number;
  percentB: number; // (close - lower) / (upper - lower), 0~1 normal range
  bandwidth: number;
};

export function bollingerBands(
  candles: CandlePoint[],
  period = 20,
  stdDevMultiplier = 2,
): BollingerResult | null {
  if (candles.length < period) return null;

  const slice = candles.slice(-period);
  const closes = slice.map((c) => c.close);
  const mean = closes.reduce((a, b) => a + b, 0) / period;
  const variance = closes.reduce((sum, c) => sum + (c - mean) ** 2, 0) / period;
  const stdDev = Math.sqrt(variance);

  const upper = mean + stdDevMultiplier * stdDev;
  const lower = mean - stdDevMultiplier * stdDev;
  const close = candles.at(-1)!.close;
  const width = upper - lower;
  const percentB = width > 0 ? (close - lower) / width : 0.5;

  return {
    upper: Number(upper.toFixed(2)),
    middle: Number(mean.toFixed(2)),
    lower: Number(lower.toFixed(2)),
    percentB: Number(percentB.toFixed(4)),
    bandwidth: Number((width / mean * 100).toFixed(2)),
  };
}

// ---------------------------------------------------------------------------
// ATR (Average True Range, 14)
// ---------------------------------------------------------------------------

export function atr(candles: CandlePoint[], period = 14): number | null {
  if (candles.length < period + 1) return null;

  const trueRanges: number[] = [];
  for (let i = 1; i < candles.length; i++) {
    const high = candles[i].high;
    const low = candles[i].low;
    const prevClose = candles[i - 1].close;
    trueRanges.push(Math.max(high - low, Math.abs(high - prevClose), Math.abs(low - prevClose)));
  }

  // Initial ATR = simple average of first `period` true ranges
  let atrValue = trueRanges.slice(0, period).reduce((a, b) => a + b, 0) / period;

  // Smoothed ATR
  for (let i = period; i < trueRanges.length; i++) {
    atrValue = (atrValue * (period - 1) + trueRanges[i]) / period;
  }

  return Number(atrValue.toFixed(2));
}
