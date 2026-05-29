import Link from "next/link";
import { MessageSquare, RefreshCcw } from "lucide-react";
import { MarketRegime } from "@/components/MarketRegime";
import { CompactSignalRow, SignalRow } from "@/components/SignalCard";
import { buildSignal, summarizeRegime } from "@/lib/signal-engine";
import { getDayCandles, getTopKrwTickers } from "@/lib/upbit";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { DataTable } from "@/components/ui/DataTable";
import { SectionKicker } from "@/components/ui/SectionKicker";
import {
  AnimatedHeader,
  AnimatedRegimeSection,
  AnimatedSignalList,
  AnimatedSignalItem,
  AnimatedSidebar,
} from "@/components/DashboardAnimations";

export const revalidate = 300;

async function getDashboardData() {
  const topTickers = await getTopKrwTickers(12);
  const btcCandles = await getDayCandles("KRW-BTC", 220);
  const regime = summarizeRegime(btcCandles);

  const analyzed = await Promise.all(
    topTickers.slice(0, 8).map(async (ticker) => {
      const candles = await getDayCandles(ticker.market, 220);
      return buildSignal(ticker, candles, regime.regime);
    }),
  );

  return {
    regime,
    signals: analyzed.sort((a, b) => b.score - a.score),
    tickers: topTickers,
  };
}

export default async function Home() {
  const { regime, signals, tickers } = await getDashboardData();
  const updatedAt = new Intl.DateTimeFormat("ko-KR", {
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(new Date());
  const topSignals = signals.slice(0, 5);
  const buckets = {
    daytrade: signals.filter((signal) => signal.bucket === "daytrade").slice(0, 3),
    swing: signals.filter((signal) => signal.bucket === "swing").slice(0, 3),
    position: signals.filter((signal) => signal.bucket === "position").slice(0, 3),
  };

  return (
    <main className="min-h-screen" style={{ background: "var(--bg-base)" }}>
      <header className="sticky top-0 z-50 border-b border-[var(--rule)] bg-[var(--bg-base)] px-5 py-4 sm:px-8">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4">
          <Link href="/" className="text-2xl font-bold leading-none tracking-[-0.02em] text-[var(--text-primary)] sm:text-3xl">
            Signal Hub
          </Link>
          <div className="flex items-center gap-3">
            <Link
              href="/chat"
              className="inline-flex h-8 items-center gap-1.5 rounded-[var(--radius-sm)] border border-[var(--rule)] px-3 text-xs font-medium text-[var(--text-primary)] transition-colors hover:bg-white/[0.04]"
            >
              <MessageSquare size={13} />
              AI 채팅
            </Link>
            <span className="flex items-center gap-1.5 text-[11px] text-[var(--text-muted)]">
              <RefreshCcw size={12} />
              {updatedAt} · 5분
            </span>
          </div>
        </div>
      </header>

      <AnimatedRegimeSection>
        <MarketRegime regime={regime} />
      </AnimatedRegimeSection>

      <section className="mx-auto grid max-w-7xl gap-8 px-5 py-8 sm:px-8 lg:grid-cols-[1fr_22rem]">
        <div>
          <AnimatedHeader>
            <div className="flex items-end justify-between gap-4 pb-5">
              <div>
                <SectionKicker rule>Daily Signals</SectionKicker>
                <h1 className="mt-3 text-3xl font-bold leading-tight tracking-[-0.02em] text-[var(--text-primary)] sm:text-5xl">
                  KRW 마켓 상위 종목 분석
                </h1>
              </div>
              <p className="hidden max-w-xs text-right text-sm leading-6 text-[var(--text-secondary)] sm:block">
                거래대금 상위 종목을 EMA, RSI, 7일 모멘텀 기준으로 1차 선별합니다.
              </p>
            </div>
          </AnimatedHeader>

          <Card hover={false} flush>
            <div className="hidden grid-cols-[3rem_minmax(10rem,14rem)_1fr_auto] border-b border-[var(--rule)] px-5 py-3 text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--text-muted)] sm:grid">
              <span>Rank</span>
              <span>Market</span>
              <span>Research Lede</span>
              <span className="text-right">Score</span>
            </div>
            <AnimatedSignalList>
              {topSignals.map((signal, index) => (
                <AnimatedSignalItem key={signal.market}>
                  <SignalRow signal={signal} rank={index + 1} />
                </AnimatedSignalItem>
              ))}
            </AnimatedSignalList>
          </Card>
        </div>

        <AnimatedSidebar>
        <aside className="space-y-5 lg:sticky lg:top-20 lg:self-start">
          <Card hover={false}>
            <CardHeader>
              <SectionKicker>Buckets</SectionKicker>
            </CardHeader>
            <CardBody className="space-y-4">
              {(["daytrade", "swing", "position"] as const).map((key) => {
                const labels = { daytrade: "데이트레이드", swing: "스윙", position: "포지션" };
                const variants = { daytrade: "bear" as const, swing: "brand" as const, position: "bull" as const };
                return (
                  <div key={key}>
                    <div className="flex items-center gap-2">
                      <Badge variant={variants[key]}>{labels[key]}</Badge>
                    </div>
                    <DataTable className="mt-2">
                      {buckets[key].length ? (
                        buckets[key].map((signal) => <CompactSignalRow key={signal.market} signal={signal} />)
                      ) : (
                        <p className="py-2 text-xs text-[var(--text-muted)]">후보 없음</p>
                      )}
                    </DataTable>
                  </div>
                );
              })}
            </CardBody>
          </Card>

          <Card hover={false}>
            <CardHeader>
              <SectionKicker>Top Volume</SectionKicker>
            </CardHeader>
            <CardBody className="!py-0">
              {tickers.slice(0, 8).map((ticker) => (
                <Link
                  key={ticker.market}
                  href={`/coin/${ticker.market.replace("KRW-", "")}`}
                  className="flex justify-between border-b border-[var(--rule)] py-3 text-sm transition-colors last:border-b-0 hover:bg-white/[0.025]"
                  style={{ transitionDuration: "var(--duration-fast)" }}
                >
                  <span className="font-medium text-[var(--text-secondary)]">{ticker.market.replace("KRW-", "")}</span>
                  <span
                    className={`tabular-nums font-[family-name:var(--font-geist-mono)] ${
                      ticker.signed_change_rate >= 0 ? "text-[var(--accent-bull)]" : "text-[var(--accent-bear)]"
                    }`}
                  >
                    {(ticker.signed_change_rate * 100).toFixed(1)}%
                  </span>
                </Link>
              ))}
            </CardBody>
          </Card>
        </aside>
        </AnimatedSidebar>
      </section>
    </main>
  );
}
