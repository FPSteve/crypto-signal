import Link from "next/link";
import { ArrowUpRight, BarChart3 } from "lucide-react";
import type { CoinSignal } from "@/lib/signal-engine";
import { findResearch } from "@/lib/four-pillars";

const bucketLabel: Record<CoinSignal["bucket"], string> = {
  daytrade: "데이트레이드",
  swing: "스윙",
  position: "포지션",
};

export function SignalCard({ signal, rank }: { signal: CoinSignal; rank: number }) {
  const research = findResearch(signal.symbol);

  return (
    <article className="group grid gap-4 border-b border-white/10 py-5 transition-colors hover:bg-white/[0.02] sm:grid-cols-[4rem_1fr_8rem] sm:px-3">
      <div className="flex items-center gap-3 sm:block">
        <span className="text-sm text-gray-500">#{rank}</span>
        <div className="mt-0 sm:mt-2">
          <p className="text-xl font-semibold text-white">{signal.symbol}</p>
          <p className="text-xs text-gray-500">{signal.name ?? signal.market}</p>
        </div>
      </div>
      <div>
        <div className="flex flex-wrap items-center gap-2">
          <span className="rounded bg-white/10 px-2 py-1 text-xs font-medium text-gray-200">{bucketLabel[signal.bucket]}</span>
          {signal.signals.map((item) => (
            <span key={item} className="text-xs text-gray-500">
              {item}
            </span>
          ))}
        </div>
        <p className="mt-3 text-sm leading-6 text-gray-300">{signal.thesis}</p>
        <div className="mt-3 flex flex-wrap gap-3 text-xs text-gray-500">
          <span>손절 기준 {Math.round(signal.stopLoss).toLocaleString()} KRW</span>
          <span>24h 거래대금 {Math.round(signal.volumeKrw24h / 1_000_000_000).toLocaleString()}B KRW</span>
          {research && (
            <a href={research.url} target="_blank" rel="noreferrer" className="underline underline-offset-2 hover:text-gray-300">
              Four Pillars 리서치
            </a>
          )}
        </div>
      </div>
      <div className="flex items-center justify-between gap-3 sm:block sm:text-right">
        <div>
          <p className="text-xs text-gray-500">Score</p>
          <p className="mt-1 text-3xl font-semibold text-white">{signal.score}</p>
        </div>
        <Link
          href={`/coin/${signal.symbol}`}
          className="inline-flex h-10 w-10 items-center justify-center rounded-md border border-white/10 text-gray-300 transition hover:border-white/25 hover:text-white sm:mt-4"
          aria-label={`${signal.symbol} 상세 보기`}
        >
          <ArrowUpRight size={18} />
        </Link>
      </div>
    </article>
  );
}

export function CompactSignalRow({ signal }: { signal: CoinSignal }) {
  return (
    <Link
      href={`/coin/${signal.symbol}`}
      className="flex items-center justify-between border-b border-white/10 py-3 text-sm transition hover:text-white"
    >
      <span className="flex items-center gap-2 text-gray-300">
        <BarChart3 size={15} />
        {signal.symbol}
      </span>
      <span className="text-gray-500">{signal.score}</span>
    </Link>
  );
}
