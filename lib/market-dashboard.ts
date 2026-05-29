import { getBtcDominance } from "@/lib/coinmarketcap";
import { buildSignal, summarizeRegime, type CoinSignal } from "@/lib/signal-engine";
import { getDayCandles, getTopKrwTickers } from "@/lib/upbit";
import type { CandlePoint, UpbitTicker } from "@/lib/upbit";

export const bucketMeta: Record<CoinSignal["bucket"], { label: string; variant: "bull" | "bear" | "brand" }> = {
  daytrade: { label: "데이트레이드", variant: "bear" },
  swing: { label: "스윙", variant: "brand" },
  position: { label: "포지션", variant: "bull" },
};

export function formatSignedPercent(value: number | null) {
  if (value === null) return "n/a";
  return `${value > 0 ? "+" : ""}${value.toFixed(1)}%`;
}

export function metricTone(value: number | null) {
  if (value === null || value === 0) return "neutral" as const;
  return value > 0 ? "bull" as const : "bear" as const;
}

async function safeTopKrwTickers(limit: number): Promise<Array<UpbitTicker & { name?: string }>> {
  try {
    return await getTopKrwTickers(limit);
  } catch {
    return [];
  }
}

async function safeDayCandles(market: string, count: number): Promise<CandlePoint[]> {
  try {
    return await getDayCandles(market, count);
  } catch {
    return [];
  }
}

export async function getMarketDashboardData({
  tickerLimit = 12,
  analysisLimit = 8,
}: {
  tickerLimit?: number;
  analysisLimit?: number;
} = {}) {
  const topTickers = await safeTopKrwTickers(tickerLimit);
  const btcCandles = await safeDayCandles("KRW-BTC", 220);
  const regime = summarizeRegime(btcCandles);

  const analyzed = await Promise.all(
    topTickers.slice(0, analysisLimit).map(async (ticker) => {
      const candles = await safeDayCandles(ticker.market, 220);
      return buildSignal(ticker, candles, regime.regime);
    }),
  );
  const btcDominance = await getBtcDominance();

  return {
    btcDominance,
    regime,
    signals: analyzed.sort((a, b) => b.score - a.score),
    tickers: topTickers,
  };
}

export function buildMarketMetrics({
  btcDominance,
  regime,
  signals,
  updatedAt = new Date(),
}: Awaited<ReturnType<typeof getMarketDashboardData>> & { updatedAt?: Date }) {
  const totalVolumeKrw = signals.reduce((sum, signal) => sum + signal.volumeKrw24h, 0);
  const risingCount = signals.filter((signal) => signal.change24h >= 0).length;
  const fallingCount = signals.length - risingCount;
  const btcDominanceValue =
    btcDominance.dominance === null ? "n/a" : `${btcDominance.dominance.toFixed(1)}%`;
  const btcDominanceMeta =
    btcDominance.source === "coinmarketcap"
      ? `CMC global metrics · 24h ${formatSignedPercent(btcDominance.change24h)}`
      : btcDominance.source === "missing-key"
        ? "CMC API key missing · fallback"
        : "CMC unavailable · fallback";

  return [
    {
      label: "24h 거래대금",
      value: `${Math.round(totalVolumeKrw / 1_000_000_000).toLocaleString()}B`,
      meta: `KRW 상위 ${signals.length}개 합산`,
      tone: "neutral" as const,
    },
    {
      label: "BTC 7일 변동",
      value: formatSignedPercent(regime.change7d),
      meta: "Upbit KRW-BTC daily candles",
      tone: metricTone(regime.change7d),
    },
    {
      label: "BTC 도미넌스",
      value: btcDominanceValue,
      meta: btcDominanceMeta,
      tone: metricTone(btcDominance.change24h),
    },
    {
      label: "레짐 / 30일",
      value: regime.label,
      meta: `30d ${formatSignedPercent(regime.change30d)} · ${regime.macdTrend ?? "MACD n/a"}`,
      tone:
        regime.regime === "bullish" ? "bull" as const : regime.regime === "bearish" ? "bear" as const : "neutral" as const,
    },
    {
      label: "상승 / 하락",
      value: `${risingCount}/${fallingCount}`,
      meta: "24h signed change 기준",
      tone: risingCount >= fallingCount ? "bull" as const : "bear" as const,
    },
    {
      label: "업데이트 UTC",
      value: updatedAt.toISOString().slice(11, 19) + "Z",
      meta: "revalidate 300s · Upbit public API",
      tone: "neutral" as const,
    },
  ];
}
