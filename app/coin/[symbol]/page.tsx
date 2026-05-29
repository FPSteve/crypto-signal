import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { CandleChart } from "@/components/CandleChart";
import { ResearchEmbed } from "@/components/ResearchEmbed";
import { buildSignal, summarizeRegime } from "@/lib/signal-engine";
import { findResearch } from "@/lib/four-pillars";
import { getDayCandles, getTickers, toKrwMarket } from "@/lib/upbit";
import {
  AnimatedCoinHeader,
  AnimatedCoinChart,
  AnimatedCoinSidebar,
  AnimatedScore,
  AnimatedPrice,
  AnimatedChange,
} from "@/components/CoinDetailAnimations";

export const revalidate = 300;

export default async function CoinPage({ params }: { params: Promise<{ symbol: string }> }) {
  const { symbol } = await params;
  const market = toKrwMarket(symbol);
  const [ticker] = await getTickers([market]);
  const candles = await getDayCandles(market, 220);
  const btcCandles = await getDayCandles("KRW-BTC", 220);
  const regime = summarizeRegime(btcCandles);
  const signal = buildSignal(ticker, candles, regime.regime);
  const research = findResearch(signal.symbol);

  return (
    <main className="min-h-screen bg-[#080a0d] px-5 py-5 sm:px-8">
      <div className="mx-auto max-w-7xl">
        <AnimatedCoinHeader>
        <header className="flex flex-col gap-5 border-b border-white/10 pb-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <Link href="/" className="inline-flex items-center gap-2 text-sm text-gray-500 transition hover:text-white">
              <ArrowLeft size={16} />
              대시보드
            </Link>
            <h1 className="mt-4 text-4xl font-semibold text-white">{signal.symbol}</h1>
            <p className="mt-2 text-sm text-gray-500">{market} 차트, EMA, RSI, MACD, BB, ATR, Four Pillars 리서치 후보</p>
          </div>
          <div className="grid grid-cols-3 gap-5 text-sm">
            <div>
              <p className="text-gray-500">Score</p>
              <p className="mt-1 text-2xl font-semibold text-white"><AnimatedScore value={signal.score} /></p>
            </div>
            <div>
              <p className="text-gray-500">24h</p>
              <p className={signal.change24h >= 0 ? "mt-1 text-2xl font-semibold text-emerald-400" : "mt-1 text-2xl font-semibold text-red-400"}>
                <AnimatedChange value={signal.change24h} />
              </p>
            </div>
            <div>
              <p className="text-gray-500">Price</p>
              <p className="mt-1 text-2xl font-semibold text-white"><AnimatedPrice value={signal.price} /></p>
            </div>
          </div>
        </header>
        </AnimatedCoinHeader>

        <section className="grid gap-8 py-8 lg:grid-cols-[1fr_24rem]">
          <AnimatedCoinChart>
          <div>
            <CandleChart candles={candles} />
            <div className="mt-4 flex gap-4 text-xs text-gray-500">
              <span className="text-amber-400">EMA20</span>
              <span className="text-sky-400">EMA50</span>
              <span>일봉 기준</span>
            </div>
          </div>
          </AnimatedCoinChart>
          <AnimatedCoinSidebar>
          <aside>
            <section className="border-b border-white/10 pb-6">
              <p className="text-xs font-medium uppercase tracking-[0.2em] text-gray-500">Logic</p>
              <h2 className="mt-2 text-xl font-semibold text-white">{signal.thesis}</h2>
              <div className="mt-5 grid gap-3">
                {signal.signals.map((item) => (
                  <div key={item} className="flex justify-between border-b border-white/10 pb-3 text-sm">
                    <span className="text-gray-500">Signal</span>
                    <span className="text-gray-200">{item}</span>
                  </div>
                ))}
                <div className="flex justify-between border-b border-white/10 pb-3 text-sm">
                  <span className="text-gray-500">손절 기준</span>
                  <span className="text-gray-200">{Math.round(signal.stopLoss).toLocaleString()} KRW</span>
                </div>
              </div>
            </section>
            {signal.rationale.length > 0 && (
              <section className="border-b border-white/10 py-6">
                <p className="text-xs font-medium uppercase tracking-[0.2em] text-gray-500">왜 이 종목인가</p>
                <ul className="mt-3 space-y-2">
                  {signal.rationale.map((reason) => (
                    <li key={reason} className="flex items-start gap-2 text-sm text-gray-300">
                      <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-400" />
                      {reason}
                    </li>
                  ))}
                </ul>
              </section>
            )}
            <div id="research">
              <ResearchEmbed research={research} />
            </div>
          </aside>
          </AnimatedCoinSidebar>
        </section>
      </div>
    </main>
  );
}
