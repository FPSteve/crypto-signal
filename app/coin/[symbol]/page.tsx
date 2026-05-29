import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { CandleChart } from "@/components/CandleChart";
import { ResearchEmbed } from "@/components/ResearchEmbed";
import { buildSignal, summarizeRegime } from "@/lib/signal-engine";
import { findVerifiedResearch } from "@/lib/four-pillars";
import { getDayCandles, getTickers, toKrwMarket } from "@/lib/upbit";
import { DataRow, DataTable } from "@/components/ui/DataTable";
import { ScoreRing } from "@/components/ui/ScoreRing";
import { SectionKicker } from "@/components/ui/SectionKicker";
import {
  AnimatedCoinHeader,
  AnimatedCoinChart,
  AnimatedCoinSidebar,
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
  const research = await findVerifiedResearch(signal.symbol);

  return (
    <main className="min-h-screen px-5 py-5 sm:px-8" style={{ background: "var(--bg-base)" }}>
      <div className="mx-auto max-w-7xl">
        <AnimatedCoinHeader>
        <header className="flex flex-col gap-6 border-b border-[var(--rule)] pb-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <Link href="/" className="inline-flex items-center gap-2 text-sm text-[var(--text-muted)] transition hover:text-white">
              <ArrowLeft size={16} />
              대시보드
            </Link>
            <SectionKicker className="mt-5">Coin Detail</SectionKicker>
            <h1 className="mt-2 text-5xl font-bold leading-none tracking-[-0.02em] text-[var(--text-primary)] sm:text-7xl">
              {signal.symbol}
            </h1>
            <p className="mt-3 text-sm text-[var(--text-secondary)]">{market} 차트, EMA, RSI, MACD, BB, ATR, Four Pillars 리서치 후보</p>
          </div>
          <div className="grid min-w-full grid-cols-1 divide-y divide-[var(--rule)] border-y border-[var(--rule)] text-sm sm:grid-cols-3 sm:divide-x sm:divide-y-0 lg:min-w-[28rem]">
            <div className="px-4 py-3">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--text-muted)] font-[family-name:var(--font-geist-mono)]">Score</p>
              <div className="mt-2">
                <ScoreRing score={signal.score} size={58} />
              </div>
            </div>
            <div className="px-4 py-3">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--text-muted)] font-[family-name:var(--font-geist-mono)]">24h</p>
              <p className={signal.change24h >= 0 ? "mt-2 text-2xl font-semibold text-[var(--accent-bull)]" : "mt-2 text-2xl font-semibold text-[var(--accent-bear)]"}>
                <AnimatedChange value={signal.change24h} />
              </p>
            </div>
            <div className="px-4 py-3">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--text-muted)] font-[family-name:var(--font-geist-mono)]">Price</p>
              <p className="mt-2 text-2xl font-semibold tabular-nums text-[var(--text-primary)] font-[family-name:var(--font-geist-mono)]">
                <AnimatedPrice value={signal.price} />
              </p>
            </div>
          </div>
        </header>
        </AnimatedCoinHeader>

        <section className="grid gap-8 py-8 lg:grid-cols-[1fr_24rem]">
          <AnimatedCoinChart>
          <div>
            <CandleChart candles={candles} />
            <div className="mt-4 flex gap-4 text-xs text-[var(--text-muted)]">
              <span className="text-[var(--accent-brand)]">EMA20</span>
              <span className="text-[var(--text-muted)]">EMA50</span>
              <span>일봉 기준</span>
            </div>
          </div>
          </AnimatedCoinChart>
          <AnimatedCoinSidebar>
          <aside>
            <section className="border-b border-[var(--rule)] pb-6">
              <SectionKicker>Logic</SectionKicker>
              <h2 className="mt-3 text-2xl font-bold leading-tight tracking-[-0.02em] text-[var(--text-primary)]">
                {signal.thesis}
              </h2>
              <DataTable className="mt-5">
                {signal.signals.map((item) => (
                  <DataRow key={item} label="Signal" value={item} />
                ))}
                <DataRow label="손절 기준" value={`${Math.round(signal.stopLoss).toLocaleString()} KRW`} />
              </DataTable>
            </section>
            {signal.rationale.length > 0 && (
              <section className="border-b border-[var(--rule)] py-6">
                <SectionKicker>왜 이 종목인가</SectionKicker>
                <ul className="mt-3 space-y-2">
                  {signal.rationale.map((reason) => (
                    <li key={reason} className="flex items-start gap-2 text-sm leading-6 text-[var(--text-secondary)]">
                      <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--accent-brand)]" />
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
