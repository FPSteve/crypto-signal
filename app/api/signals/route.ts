import { NextResponse } from "next/server";
import { buildDailySignalReport, buildSignal, summarizeRegime } from "@/lib/signal-engine";
import { getDayCandles, getTopKrwTickers } from "@/lib/upbit";

export async function GET() {
  const tickers = await getTopKrwTickers(12);
  const btcCandles = await getDayCandles("KRW-BTC", 220);
  const regime = summarizeRegime(btcCandles);

  const signals = await Promise.all(
    tickers.slice(0, 8).map(async (ticker) => {
      const candles = await getDayCandles(ticker.market, 220);
      return buildSignal(ticker, candles, regime.regime);
    }),
  );
  const sortedSignals = signals.sort((a, b) => b.score - a.score);
  const dailyReport = await buildDailySignalReport(sortedSignals, regime);

  return NextResponse.json({
    regime,
    signals: sortedSignals,
    dailyReport,
    buckets: dailyReport.buckets,
  });
}
