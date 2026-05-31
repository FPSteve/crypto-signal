import Link from "next/link";
import { ArrowUpRight, ListFilter } from "lucide-react";
import { HeroMotionGraphic, type HeroMotionSignal } from "@/components/HeroMotionGraphic";
import { HeroVideoLayer } from "@/components/HeroVideoLayer";
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
  const heroSignals: HeroMotionSignal[] = topSignals.slice(0, 5).map((signal) => ({
    symbol: signal.symbol,
    score: signal.score,
    change: formatSignedPercent(signal.change24h),
    tone: signal.change24h > 0 ? "bull" : signal.change24h < 0 ? "bear" : "neutral",
  }));
  const buckets = {
    daytrade: signals.filter((signal) => signal.bucket === "daytrade").slice(0, 3),
    swing: signals.filter((signal) => signal.bucket === "swing").slice(0, 3),
    position: signals.filter((signal) => signal.bucket === "position").slice(0, 3),
  };

  return (
    <main className="min-h-screen" style={{ background: "var(--bg-base)" }}>
      <section className="market-hero px-5 sm:px-8">
        <HeroVideoLayer />
        <div className="market-hero__inner mx-auto grid max-w-7xl gap-8 py-6 sm:py-12 lg:grid-cols-[minmax(0,0.95fr)_minmax(26rem,0.8fr)] lg:items-center lg:py-16">
          <AnimatedHeader>
            <div className="hero-copy-motion max-w-4xl">
              <SectionKicker rule>Signals</SectionKicker>
              <h1 className="mt-4 max-w-4xl font-[family-name:var(--font-display)] text-5xl font-semibold leading-[0.95] text-[var(--text-primary)] sm:text-7xl lg:text-[76px]">
                Crypto Signal Hub
              </h1>
              <p className="mt-5 max-w-2xl text-base leading-7 text-[var(--text-secondary)] sm:text-lg">
                Upbit KRW 마켓을 거래대금, 추세 구조, Four Pillars 리서치 근거로 압축해 지금 볼 후보만 먼저 띄웁니다.
              </p>

              {leadSignal && (
                <div className="mt-7 max-w-3xl border-y border-[var(--rule)] py-5">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge variant="brand">Lead Signal</Badge>
                    <Badge variant={leadSignal.change24h >= 0 ? "bull" : "bear"}>
                      24h {formatSignedPercent(leadSignal.change24h)}
                    </Badge>
                    <Badge variant={bucketMeta[leadSignal.bucket].variant}>{bucketMeta[leadSignal.bucket].label}</Badge>
                  </div>
                  <div className="mt-4 flex flex-wrap items-end gap-x-5 gap-y-2">
                    <Link
                      href={`/coin/${leadSignal.symbol}`}
                      className="font-[family-name:var(--font-display)] text-5xl font-semibold leading-none text-[var(--text-primary)] transition-colors hover:text-white sm:text-7xl"
                    >
                      {leadSignal.symbol}
                    </Link>
                    <span className="pb-1 font-[family-name:var(--font-mono)] text-xs text-[var(--text-muted)]">
                      SCORE {leadSignal.score} · {leadSignal.name ?? leadSignal.market}
                    </span>
                  </div>
                  <p className="mt-4 hidden max-w-3xl text-xl font-semibold leading-snug text-[var(--text-primary)] sm:block sm:text-2xl">
                    {leadSignal.thesis}
                  </p>
                  <div className="mt-5 flex flex-wrap gap-3">
                    <Link
                      href={`/coin/${leadSignal.symbol}`}
                      className="hero-primary-cta inline-flex h-10 items-center gap-2 rounded-[var(--radius-sm)] bg-[var(--text-primary)] px-4 font-[family-name:var(--font-mono)] text-xs font-semibold uppercase tracking-[0.14em] transition-colors hover:bg-white"
                    >
                      Open Signal
                      <ArrowUpRight size={15} />
                    </Link>
                    <Link
                      href="/research"
                      className="inline-flex h-10 items-center gap-2 rounded-[var(--radius-sm)] border border-[var(--rule)] px-4 font-[family-name:var(--font-mono)] text-xs font-semibold uppercase tracking-[0.14em] text-[var(--text-primary)] transition-colors hover:border-white/20 hover:bg-white/[0.04]"
                    >
                      Research Desk
                      <ArrowUpRight size={15} />
                    </Link>
                  </div>
                </div>
              )}
            </div>
          </AnimatedHeader>

          <HeroMotionGraphic regimeLabel={regime.label} signals={heroSignals} />
        </div>
      </section>

      <AnimatedRegimeSection>
        <MarketRegime regime={regime} />
      </AnimatedRegimeSection>

      <MarketMetricGrid metrics={marketMetrics} />

      <section className="mx-auto grid max-w-7xl gap-8 px-5 py-8 sm:px-8 lg:grid-cols-[1fr_22rem]">
        <div>
          <AnimatedHeader>
            <div className="flex items-end justify-between gap-4 pb-5">
              <div>
                <SectionKicker rule>Signal Board</SectionKicker>
                <h2 className="mt-3 font-[family-name:var(--font-display)] text-3xl font-semibold leading-tight text-[var(--text-primary)] sm:text-5xl">
                  KRW 마켓 랭킹
                </h2>
              </div>
              <p className="hidden max-w-xs text-right text-sm leading-6 text-[var(--text-secondary)] sm:block">
                거래대금 상위 종목을 EMA, RSI, MACD, ATR 기준으로 점수화합니다.
              </p>
            </div>
          </AnimatedHeader>

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
