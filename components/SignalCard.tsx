import Link from "next/link";
import { ArrowUpRight, BarChart3 } from "lucide-react";
import type { CoinSignal } from "@/lib/signal-engine";
import { findResearch } from "@/lib/four-pillars";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { ScoreRing } from "@/components/ui/ScoreRing";
import { ScoreTag } from "@/components/ui/ScoreTag";
import { MotionCard } from "@/components/ui/MotionWrappers";

const bucketLabel: Record<CoinSignal["bucket"], { text: string; variant: "bull" | "bear" | "brand" }> = {
  daytrade: { text: "데이트레이드", variant: "bear" },
  swing: { text: "스윙", variant: "brand" },
  position: { text: "포지션", variant: "bull" },
};

export function SignalCard({ signal, rank }: { signal: CoinSignal; rank: number }) {
  const research = findResearch(signal.symbol);
  const bucket = bucketLabel[signal.bucket];

  return (
    <MotionCard>
    <Card className="my-3 overflow-hidden" glow={signal.score >= 7 ? "bull" : false}>
      <article className="grid gap-4 p-5 sm:grid-cols-[4rem_1fr_4.5rem]">
        <div className="flex items-center gap-3 sm:flex-col sm:items-start">
          <span className="text-xs font-medium text-[var(--text-muted)] tabular-nums font-[family-name:var(--font-geist-mono)]">
            #{rank}
          </span>
          <div>
            <p className="text-xl font-semibold text-[var(--text-primary)]">{signal.symbol}</p>
            <p className="text-xs text-[var(--text-muted)]">{signal.name ?? signal.market}</p>
          </div>
        </div>

        <div>
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant={bucket.variant}>{bucket.text}</Badge>
            {signal.signals.map((item) => (
              <Badge key={item} variant="outline">{item}</Badge>
            ))}
          </div>
          <p className="mt-3 text-sm leading-6 text-[var(--text-secondary)]">{signal.thesis}</p>
          <div className="mt-3 flex flex-wrap gap-4 text-xs text-[var(--text-muted)]">
            <span className="tabular-nums font-[family-name:var(--font-geist-mono)]">
              손절 {Math.round(signal.stopLoss).toLocaleString()} KRW
            </span>
            <span className="tabular-nums font-[family-name:var(--font-geist-mono)]">
              24h {Math.round(signal.volumeKrw24h / 1_000_000_000).toLocaleString()}B KRW
            </span>
            {research && (
              <Link
                href={`/coin/${signal.symbol}#research`}
                className="text-[var(--accent-brand)] hover:text-[var(--accent-brand)]/80 underline underline-offset-2"
              >
                Four Pillars 리서치 보기
              </Link>
            )}
          </div>
        </div>

        <div className="flex items-center justify-between sm:flex-col sm:items-center sm:justify-start sm:gap-3">
          <ScoreRing score={signal.score} />
          <Link
            href={`/coin/${signal.symbol}`}
            className="inline-flex h-9 w-9 items-center justify-center rounded-[var(--radius-sm)] border border-[var(--rule)] text-[var(--text-secondary)] transition-all hover:border-white/20 hover:bg-white/[0.04] hover:text-white"
            style={{ transitionDuration: "var(--duration-fast)" }}
            aria-label={`${signal.symbol} 상세 보기`}
          >
            <ArrowUpRight size={16} />
          </Link>
        </div>
      </article>
    </Card>
    </MotionCard>
  );
}

export function SignalRow({ signal, rank }: { signal: CoinSignal; rank: number }) {
  const research = findResearch(signal.symbol);
  const bucket = bucketLabel[signal.bucket];

  return (
    <Link
      href={`/coin/${signal.symbol}`}
      className="group grid gap-4 border-b border-[var(--rule)] px-4 py-4 transition-colors hover:bg-white/[0.025] sm:grid-cols-[3rem_minmax(10rem,14rem)_1fr_auto] sm:items-center sm:px-5"
      style={{ transitionDuration: "var(--duration-fast)" }}
    >
      <span className="text-xs font-semibold tabular-nums text-[var(--text-muted)] font-[family-name:var(--font-geist-mono)]">
        #{rank}
      </span>

      <div className="min-w-0">
        <p className="text-lg font-semibold text-[var(--text-primary)]">{signal.symbol}</p>
        <p className="truncate text-xs text-[var(--text-muted)]">{signal.name ?? signal.market}</p>
      </div>

      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant={bucket.variant}>{bucket.text}</Badge>
          {research && <Badge variant="brand">Four Pillars</Badge>}
        </div>
        <p className="mt-2 text-xl font-bold leading-snug tracking-[-0.02em] text-[var(--text-primary)] group-hover:text-white">
          {signal.thesis}
        </p>
        <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-[var(--text-muted)]">
          <span className="tabular-nums font-[family-name:var(--font-geist-mono)]">
            손절 {Math.round(signal.stopLoss).toLocaleString()} KRW
          </span>
          <span className="tabular-nums font-[family-name:var(--font-geist-mono)]">
            24h {Math.round(signal.volumeKrw24h / 1_000_000_000).toLocaleString()}B KRW
          </span>
        </div>
      </div>

      <div className="flex items-center justify-between gap-3 sm:justify-end">
        <ScoreTag score={signal.score} />
        <span
          className="inline-flex h-9 w-9 items-center justify-center rounded-[var(--radius-sm)] border border-[var(--rule)] text-[var(--text-secondary)] transition-colors group-hover:border-white/20 group-hover:text-white"
          aria-hidden="true"
        >
          <ArrowUpRight size={16} />
        </span>
      </div>
    </Link>
  );
}

export function CompactSignalRow({ signal }: { signal: CoinSignal }) {
  return (
    <Link
      href={`/coin/${signal.symbol}`}
      className="group flex items-center justify-between border-b border-[var(--rule)] py-3 text-sm transition-colors hover:bg-white/[0.025]"
      style={{ transitionDuration: "var(--duration-fast)" }}
    >
      <span className="flex items-center gap-2 text-[var(--text-secondary)] group-hover:text-[var(--text-primary)]">
        <BarChart3 size={14} className="text-[var(--text-muted)]" />
        {signal.symbol}
      </span>
      <ScoreTag score={signal.score} className="min-w-10 py-0.5 text-xs" />
    </Link>
  );
}
