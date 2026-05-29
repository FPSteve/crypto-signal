import Link from "next/link";
import { ArrowUpRight, ListFilter } from "lucide-react";
import { MarketRegime } from "@/components/MarketRegime";
import { CompactSignalRow } from "@/components/SignalCard";
import { MarketMetricGrid } from "@/components/MarketMetricGrid";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { DataTable } from "@/components/ui/DataTable";
import { SectionKicker } from "@/components/ui/SectionKicker";
import { ScoreTag } from "@/components/ui/ScoreTag";
import {
  AnimatedHeader,
  AnimatedRegimeSection,
  AnimatedSignalList,
  AnimatedSignalItem,
  AnimatedSidebar,
} from "@/components/DashboardAnimations";
import {
  bucketMeta,
  buildMarketMetrics,
  formatSignedPercent,
  getMarketDashboardData,
} from "@/lib/market-dashboard";

export const revalidate = 300;

export default async function Home() {
  const dashboard = await getMarketDashboardData();
  const { regime, signals } = dashboard;
  const marketMetrics = buildMarketMetrics({ ...dashboard, updatedAt: new Date() });
  const topSignals = signals.slice(0, 8);
  const leadSignal = topSignals[0];
  const gridSignals = signals.slice(1, 8);
  const buckets = {
    daytrade: signals.filter((signal) => signal.bucket === "daytrade").slice(0, 3),
    swing: signals.filter((signal) => signal.bucket === "swing").slice(0, 3),
    position: signals.filter((signal) => signal.bucket === "position").slice(0, 3),
  };

  return (
    <main className="min-h-screen" style={{ background: "var(--bg-base)" }}>
      <AnimatedRegimeSection>
        <MarketRegime regime={regime} />
      </AnimatedRegimeSection>

      <MarketMetricGrid metrics={marketMetrics} />

      <section className="mx-auto grid max-w-7xl gap-8 px-5 py-8 sm:px-8 lg:grid-cols-[1fr_22rem]">
        <div>
          <AnimatedHeader>
            <div className="flex items-end justify-between gap-4 pb-5">
              <div>
                <SectionKicker rule>Signals</SectionKicker>
                <h1 className="mt-3 font-[family-name:var(--font-display)] text-3xl font-bold leading-tight text-[var(--text-primary)] sm:text-5xl">
                  KRW 마켓 시그널 랭킹
                </h1>
              </div>
              <p className="hidden max-w-xs text-right text-sm leading-6 text-[var(--text-secondary)] sm:block">
                거래대금 상위 종목을 EMA, RSI, MACD, ATR 기준으로 점수화합니다.
              </p>
            </div>
          </AnimatedHeader>

          {leadSignal && (
            <Card hover={false} className="mb-5 overflow-hidden rounded-[var(--radius-lg)]">
              <article className="grid gap-5 p-5 sm:p-6 lg:grid-cols-[1fr_9rem]">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge variant="brand">Lead Signal</Badge>
                    <Badge variant={leadSignal.change24h >= 0 ? "bull" : "bear"}>
                      24h {formatSignedPercent(leadSignal.change24h)}
                    </Badge>
                    <Badge variant={bucketMeta[leadSignal.bucket].variant}>{bucketMeta[leadSignal.bucket].label}</Badge>
                  </div>
                  <div className="mt-5 flex flex-wrap items-end gap-x-4 gap-y-2">
                    <Link
                      href={`/coin/${leadSignal.symbol}`}
                      className="font-[family-name:var(--font-display)] text-5xl font-bold leading-none text-[var(--text-primary)] transition-colors hover:text-white sm:text-7xl"
                    >
                      {leadSignal.symbol}
                    </Link>
                    <div className="pb-1 font-[family-name:var(--font-mono)] text-xs text-[var(--text-muted)]">
                      #1 · SCORE {leadSignal.score} · {leadSignal.name ?? leadSignal.market}
                    </div>
                  </div>
                  <p className="mt-5 max-w-4xl font-[family-name:var(--font-display)] text-3xl font-semibold leading-snug text-[var(--text-primary)] sm:text-4xl">
                    {leadSignal.thesis}
                  </p>
                  <div className="mt-5 flex flex-wrap gap-x-5 gap-y-2 font-[family-name:var(--font-mono)] text-xs text-[var(--text-muted)]">
                    <span>24h VOL {Math.round(leadSignal.volumeKrw24h / 1_000_000_000).toLocaleString()}B KRW</span>
                    <span>STOP {Math.round(leadSignal.stopLoss).toLocaleString()} KRW</span>
                    <span>RSI {leadSignal.metrics.rsi14 ?? "n/a"}</span>
                  </div>
                </div>

                <Link
                  href={`/coin/${leadSignal.symbol}`}
                  className="flex h-24 items-center justify-between rounded-[var(--radius-md)] border border-[var(--rule)] px-4 font-[family-name:var(--font-mono)] text-xs uppercase tracking-[0.14em] text-[var(--text-secondary)] transition-colors hover:border-white/20 hover:bg-white/[0.04] lg:h-full lg:flex-col lg:items-start"
                >
                  <span>Open Detail</span>
                  <ArrowUpRight size={18} />
                </Link>
              </article>
            </Card>
          )}

          <AnimatedSignalList>
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {gridSignals.map((signal, index) => {
                const bucket = bucketMeta[signal.bucket];
                return (
                  <AnimatedSignalItem key={signal.market}>
                    <Link
                      href={`/coin/${signal.symbol}`}
                      className="group block h-full overflow-hidden rounded-[var(--radius-md)] border border-[var(--rule)] bg-[var(--bg-card)] transition-colors hover:border-white/20 hover:bg-[var(--bg-card-hover)]"
                      style={{ transitionDuration: "var(--duration-fast)" }}
                    >
                      <article className="flex h-full min-h-[20rem] flex-col p-4 sm:p-5">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <p className="font-[family-name:var(--font-mono)] text-xs font-semibold text-[var(--text-muted)]">
                              #{index + 2}
                            </p>
                            <h2 className="mt-2 font-[family-name:var(--font-display)] text-3xl font-bold leading-none text-[var(--text-primary)] group-hover:text-white">
                              {signal.symbol}
                            </h2>
                            <p className="mt-1 truncate text-xs text-[var(--text-muted)]">
                              {signal.name ?? signal.market}
                            </p>
                          </div>
                          <ScoreTag score={signal.score} />
                        </div>

                        <div className="mt-4 flex flex-wrap gap-2">
                          <Badge variant={bucket.variant}>{bucket.label}</Badge>
                          <Badge variant={signal.change24h >= 0 ? "bull" : "bear"}>
                            24h {formatSignedPercent(signal.change24h)}
                          </Badge>
                        </div>

                        <p className="mt-4 line-clamp-4 font-[family-name:var(--font-display)] text-base font-semibold leading-snug text-[var(--text-primary)] sm:text-lg">
                          {signal.thesis}
                        </p>

                        <div className="mt-auto space-y-3 pt-5">
                          <div className="grid grid-cols-2 gap-3 border-t border-[var(--rule)] pt-4 font-[family-name:var(--font-mono)] text-[11px] text-[var(--text-muted)]">
                            <span>
                              <span className="block uppercase tracking-[0.14em]">Vol</span>
                              <span className="mt-1 block text-[var(--text-secondary)]">
                                {Math.round(signal.volumeKrw24h / 1_000_000_000).toLocaleString()}B KRW
                              </span>
                            </span>
                            <span>
                              <span className="block uppercase tracking-[0.14em]">Risk</span>
                              <span className="mt-1 block text-[var(--text-secondary)]">
                                {Math.round(signal.stopLoss).toLocaleString()} KRW
                              </span>
                            </span>
                          </div>
                          <span className="inline-flex items-center gap-1 font-[family-name:var(--font-mono)] text-xs uppercase tracking-[0.14em] text-[var(--text-secondary)] group-hover:text-white">
                            Open Signal
                            <ArrowUpRight size={14} />
                          </span>
                        </div>
                      </article>
                    </Link>
                  </AnimatedSignalItem>
                );
              })}
            </div>
          </AnimatedSignalList>
        </div>

        <AnimatedSidebar>
          <aside className="space-y-5 lg:sticky lg:top-28 lg:self-start">
            <Card hover={false}>
              <CardHeader>
                <SectionKicker>Buckets</SectionKicker>
              </CardHeader>
              <CardBody className="space-y-4">
                {(["daytrade", "swing", "position"] as const).map((key) => (
                  <div key={key}>
                    <div className="flex items-center gap-2">
                      <Badge variant={bucketMeta[key].variant}>{bucketMeta[key].label}</Badge>
                    </div>
                    <DataTable className="mt-2">
                      {buckets[key].length ? (
                        buckets[key].map((signal) => <CompactSignalRow key={signal.market} signal={signal} />)
                      ) : (
                        <p className="py-2 text-xs text-[var(--text-muted)]">후보 없음</p>
                      )}
                    </DataTable>
                  </div>
                ))}
              </CardBody>
            </Card>

            <Card hover={false}>
              <CardHeader>
                <SectionKicker>Workspace</SectionKicker>
              </CardHeader>
              <CardBody className="space-y-3">
                {[
                  { href: "/research", label: "Research Desk", text: "Four Pillars 검색/AI 합성 근거 보기" },
                  { href: "/prices", label: "Prices", text: "Upbit 티커 정렬·필터 테이블" },
                  { href: "/chat", label: "Chat", text: "시장 질문을 AI 리서치 에이전트에 전달" },
                ].map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="group flex items-start justify-between gap-3 border-t border-[var(--rule)] pt-3 first:border-t-0 first:pt-0"
                  >
                    <span>
                      <span className="block text-sm font-semibold text-[var(--text-primary)]">{item.label}</span>
                      <span className="mt-1 block text-xs leading-5 text-[var(--text-muted)]">{item.text}</span>
                    </span>
                    <ListFilter size={15} className="mt-0.5 shrink-0 text-[var(--text-muted)] group-hover:text-white" />
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
