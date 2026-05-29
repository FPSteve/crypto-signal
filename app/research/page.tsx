import Link from "next/link";
import { ArrowUpRight, BookOpen, Search, ShieldAlert } from "lucide-react";
import { buildDailySignalReport } from "@/lib/signal-engine";
import { findResearch } from "@/lib/four-pillars";
import {
  bucketMeta,
  buildMarketMetrics,
  formatSignedPercent,
  getMarketDashboardData,
} from "@/lib/market-dashboard";
import { MarketMetricGrid } from "@/components/MarketMetricGrid";
import { Badge } from "@/components/ui/Badge";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { SectionKicker } from "@/components/ui/SectionKicker";
import { ScoreTag } from "@/components/ui/ScoreTag";

export const revalidate = 300;

export default async function ResearchPage() {
  const dashboard = await getMarketDashboardData();
  const { regime, signals } = dashboard;
  const report = await buildDailySignalReport(signals, regime);
  const marketMetrics = buildMarketMetrics({ ...dashboard, updatedAt: new Date() });
  const featuredSignals = signals.slice(0, 6).map((signal) => ({
    signal,
    research: findResearch(signal.symbol),
  }));
  const bucketReports = Object.values(report.buckets);
  const lead = featuredSignals[0];

  return (
    <main className="min-h-screen bg-[var(--bg-base)]">
      <section className="border-b border-[var(--rule)] px-5 py-8 sm:px-8">
        <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-[1fr_24rem] lg:items-end">
          <div>
            <SectionKicker rule>Research</SectionKicker>
            <h1 className="mt-4 max-w-4xl font-[family-name:var(--font-display)] text-4xl font-bold leading-tight text-[var(--text-primary)] sm:text-6xl">
              Four Pillars 리서치 데스크
            </h1>
            <p className="mt-5 max-w-3xl text-base leading-7 text-[var(--text-secondary)]">
              Upbit 상위 시그널을 기준으로 Four Pillars 검색 fallback, AI 버킷 요약, 기술적 리스크를 한 화면에서 검토합니다.
            </p>
          </div>

          <div className="rounded-[var(--radius-lg)] border border-[var(--rule)] bg-[var(--bg-card)] p-5">
            <div className="flex flex-wrap gap-2">
              <Badge variant={report.engine === "claude" ? "bull" : "outline"}>{report.engine}</Badge>
              <Badge variant="brand">{report.model}</Badge>
              <Badge variant={regime.regime === "bearish" ? "bear" : "bull"}>{regime.label}</Badge>
            </div>
            <p className="mt-4 text-sm leading-6 text-[var(--text-secondary)]">{report.summary}</p>
            <p className="mt-4 border-t border-[var(--rule)] pt-3 font-[family-name:var(--font-mono)] text-[11px] leading-5 text-[var(--text-muted)]">
              {report.disclaimer}
            </p>
          </div>
        </div>
      </section>

      <MarketMetricGrid metrics={marketMetrics} />

      <section className="mx-auto grid max-w-7xl gap-6 px-5 py-8 sm:px-8 lg:grid-cols-[1.2fr_0.8fr]">
        {lead && (
          <Card hover={false} className="overflow-hidden">
            <article className="grid gap-6 p-5 sm:p-6 lg:grid-cols-[1fr_9rem]">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant="brand">Lead Thesis</Badge>
                  <Badge variant={bucketMeta[lead.signal.bucket].variant}>{bucketMeta[lead.signal.bucket].label}</Badge>
                  <Badge variant={lead.signal.change24h >= 0 ? "bull" : "bear"}>
                    24h {formatSignedPercent(lead.signal.change24h)}
                  </Badge>
                </div>
                <div className="mt-5 flex flex-wrap items-end gap-3">
                  <h2 className="font-[family-name:var(--font-display)] text-5xl font-bold leading-none text-[var(--text-primary)] sm:text-7xl">
                    {lead.signal.symbol}
                  </h2>
                  <ScoreTag score={lead.signal.score} className="mb-1" />
                </div>
                <p className="mt-5 max-w-4xl font-[family-name:var(--font-display)] text-3xl font-semibold leading-snug text-[var(--text-primary)] sm:text-4xl">
                  {lead.signal.thesis}
                </p>
                <div className="mt-5 grid gap-3 text-sm text-[var(--text-secondary)] sm:grid-cols-3">
                  <span className="border-t border-[var(--rule)] pt-3">
                    RSI <b className="text-[var(--text-primary)]">{lead.signal.metrics.rsi14 ?? "n/a"}</b>
                  </span>
                  <span className="border-t border-[var(--rule)] pt-3">
                    7d <b className="text-[var(--text-primary)]">{formatSignedPercent(lead.signal.metrics.change7d)}</b>
                  </span>
                  <span className="border-t border-[var(--rule)] pt-3">
                    Stop <b className="text-[var(--text-primary)]">{Math.round(lead.signal.stopLoss).toLocaleString()} KRW</b>
                  </span>
                </div>
              </div>

              <Link
                href={lead.research.searchUrl}
                className="flex h-28 items-center justify-between rounded-[var(--radius-md)] border border-[var(--rule)] px-4 font-[family-name:var(--font-mono)] text-xs uppercase tracking-[0.14em] text-[var(--text-secondary)] transition-colors hover:border-white/20 hover:bg-white/[0.04] lg:h-full lg:flex-col lg:items-start"
                target="_blank"
                rel="noreferrer"
              >
                <span>Search Source</span>
                <ArrowUpRight size={18} />
              </Link>
            </article>
          </Card>
        )}

        <Card hover={false}>
          <CardHeader>
            <SectionKicker>Source Protocol</SectionKicker>
          </CardHeader>
          <CardBody className="space-y-4">
            {[
              { icon: BookOpen, label: "Four Pillars", text: "공식 원문 API가 없으면 검색 URL과 AI 합성 요약을 정식 경로로 사용합니다." },
              { icon: Search, label: "Fallback", text: "displayMode:fallback은 실패가 아니라 현재 릴리즈 범위의 정상 표시 상태입니다." },
              { icon: ShieldAlert, label: "Risk", text: "리서치는 주문 지시가 아니라 thesis와 손절 기준을 분리해 검토하는 보조 레이어입니다." },
            ].map((item) => (
              <div key={item.label} className="flex gap-3 border-t border-[var(--rule)] pt-4 first:border-t-0 first:pt-0">
                <item.icon size={17} className="mt-0.5 shrink-0 text-[var(--accent-brand)]" />
                <div>
                  <p className="text-sm font-semibold text-[var(--text-primary)]">{item.label}</p>
                  <p className="mt-1 text-sm leading-6 text-[var(--text-secondary)]">{item.text}</p>
                </div>
              </div>
            ))}
          </CardBody>
        </Card>
      </section>

      <section className="mx-auto max-w-7xl px-5 pb-8 sm:px-8">
        <SectionKicker rule>Bucket Notes</SectionKicker>
        <div className="mt-5 grid gap-4 lg:grid-cols-3">
          {bucketReports.map((bucket) => (
            <Card key={bucket.bucket} hover={false}>
              <CardHeader>
                <div className="flex items-center justify-between gap-3">
                  <Badge variant={bucketMeta[bucket.bucket].variant}>{bucket.label}</Badge>
                  <span className="font-[family-name:var(--font-mono)] text-xs text-[var(--text-muted)]">
                    {bucket.symbols.length || 0} symbols
                  </span>
                </div>
              </CardHeader>
              <CardBody>
                <p className="text-sm leading-6 text-[var(--text-secondary)]">{bucket.rationale}</p>
                <p className="mt-4 border-t border-[var(--rule)] pt-4 text-sm leading-6 text-[var(--text-secondary)]">
                  {bucket.riskRule}
                </p>
                <p className="mt-4 font-[family-name:var(--font-mono)] text-[11px] leading-5 text-[var(--text-muted)]">
                  {bucket.fourPillarsContext}
                </p>
              </CardBody>
            </Card>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 pb-12 sm:px-8">
        <SectionKicker rule>Symbol Dossiers</SectionKicker>
        <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {featuredSignals.map(({ signal, research }) => (
            <Card key={signal.market} hover={false} className="overflow-hidden">
              <article className="flex h-full flex-col p-5">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-[family-name:var(--font-mono)] text-xs text-[var(--text-muted)]">{signal.name ?? signal.market}</p>
                    <h3 className="mt-2 font-[family-name:var(--font-display)] text-3xl font-semibold text-[var(--text-primary)]">{signal.symbol}</h3>
                  </div>
                  <Badge variant={research.displayMode === "ai-synthesis" ? "bull" : "outline"}>{research.displayMode}</Badge>
                </div>
                <p className="mt-4 text-sm leading-6 text-[var(--text-secondary)]">{research.summary}</p>
                <div className="mt-4 space-y-2">
                  {signal.rationale.slice(0, 3).map((item) => (
                    <p key={item} className="border-l border-[var(--rule)] pl-3 text-sm leading-6 text-[var(--text-secondary)]">
                      {item}
                    </p>
                  ))}
                </div>
                <div className="mt-auto flex flex-wrap gap-3 pt-5">
                  <Link
                    href={`/coin/${signal.symbol}#research`}
                    className="editorial-link inline-flex items-center gap-1 text-sm font-semibold text-[var(--text-primary)] hover:text-white"
                  >
                    Detail
                    <ArrowUpRight size={14} />
                  </Link>
                  <Link
                    href={research.searchUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="editorial-link inline-flex items-center gap-1 text-sm font-semibold text-[var(--accent-brand)] hover:text-white"
                  >
                    Search
                    <ArrowUpRight size={14} />
                  </Link>
                </div>
              </article>
            </Card>
          ))}
        </div>
      </section>
    </main>
  );
}
