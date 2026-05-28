import Link from "next/link";
import { MessageSquare, RefreshCcw } from "lucide-react";
import { MarketRegime } from "@/components/MarketRegime";
import { CompactSignalRow, SignalCard } from "@/components/SignalCard";
import { buildSignal, summarizeRegime } from "@/lib/signal-engine";
import { getDayCandles, getTopKrwTickers } from "@/lib/upbit";

export const revalidate = 300;

async function getDashboardData() {
  const topTickers = await getTopKrwTickers(12);
  const analyzed = await Promise.all(
    topTickers.slice(0, 8).map(async (ticker) => {
      const candles = await getDayCandles(ticker.market, 220);
      return buildSignal(ticker, candles);
    }),
  );
  const btcCandles = await getDayCandles("KRW-BTC", 220);

  return {
    regime: summarizeRegime(btcCandles),
    signals: analyzed.sort((a, b) => b.score - a.score),
    tickers: topTickers,
  };
}

export default async function Home() {
  const { regime, signals, tickers } = await getDashboardData();
  const topSignals = signals.slice(0, 5);
  const buckets = {
    daytrade: signals.filter((signal) => signal.bucket === "daytrade").slice(0, 3),
    swing: signals.filter((signal) => signal.bucket === "swing").slice(0, 3),
    position: signals.filter((signal) => signal.bucket === "position").slice(0, 3),
  };

  return (
    <main className="min-h-screen bg-[#080a0d]">
      <header className="border-b border-white/10 px-5 py-4 sm:px-8">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4">
          <Link href="/" className="text-lg font-semibold text-white">
            Crypto Signal Hub
          </Link>
          <div className="flex items-center gap-4">
            <Link href="/chat" className="flex items-center gap-1.5 rounded-md bg-emerald-500/10 px-3 py-1.5 text-xs font-medium text-emerald-400 transition-colors hover:bg-emerald-500/20">
              <MessageSquare size={13} />
              AI 채팅
            </Link>
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <RefreshCcw size={14} />
              Upbit 5분 캐시
            </div>
          </div>
        </div>
      </header>

      <MarketRegime regime={regime} />

      <section className="mx-auto grid max-w-7xl gap-8 px-5 py-8 sm:px-8 lg:grid-cols-[1fr_22rem]">
        <div>
          <div className="flex items-end justify-between gap-4 border-b border-white/10 pb-4">
            <div>
              <p className="text-xs font-medium uppercase tracking-[0.2em] text-gray-500">Daily Signals</p>
              <h1 className="mt-2 text-3xl font-semibold text-white">KRW 마켓 상위 종목 분석</h1>
            </div>
            <p className="hidden max-w-sm text-right text-sm leading-6 text-gray-500 sm:block">
              거래대금 상위 종목을 EMA, RSI, 7일 모멘텀 기준으로 1차 선별합니다.
            </p>
          </div>

          <div>
            {topSignals.map((signal, index) => (
              <SignalCard key={signal.market} signal={signal} rank={index + 1} />
            ))}
          </div>
        </div>

        <aside className="lg:sticky lg:top-4 lg:self-start">
          <section className="border-b border-white/10 pb-6">
            <p className="text-xs font-medium uppercase tracking-[0.2em] text-gray-500">Buckets</p>
            <div className="mt-4 grid gap-5">
              <div>
                <h2 className="text-sm font-semibold text-white">데이트레이드</h2>
                {buckets.daytrade.length ? buckets.daytrade.map((signal) => <CompactSignalRow key={signal.market} signal={signal} />) : <p className="mt-3 text-sm text-gray-500">강한 단기 후보 없음</p>}
              </div>
              <div>
                <h2 className="text-sm font-semibold text-white">스윙</h2>
                {buckets.swing.length ? buckets.swing.map((signal) => <CompactSignalRow key={signal.market} signal={signal} />) : <p className="mt-3 text-sm text-gray-500">스윙 후보 없음</p>}
              </div>
              <div>
                <h2 className="text-sm font-semibold text-white">포지션</h2>
                {buckets.position.length ? buckets.position.map((signal) => <CompactSignalRow key={signal.market} signal={signal} />) : <p className="mt-3 text-sm text-gray-500">포지션 후보 없음</p>}
              </div>
            </div>
          </section>

          <section className="py-6">
            <p className="text-xs font-medium uppercase tracking-[0.2em] text-gray-500">Top Volume</p>
            <div className="mt-4">
              {tickers.slice(0, 8).map((ticker) => (
                <Link key={ticker.market} href={`/coin/${ticker.market.replace("KRW-", "")}`} className="flex justify-between border-b border-white/10 py-3 text-sm">
                  <span className="text-gray-300">{ticker.market.replace("KRW-", "")}</span>
                  <span className={ticker.signed_change_rate >= 0 ? "text-emerald-400" : "text-red-400"}>
                    {(ticker.signed_change_rate * 100).toFixed(1)}%
                  </span>
                </Link>
              ))}
            </div>
          </section>
        </aside>
      </section>
    </main>
  );
}
