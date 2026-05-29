import { Activity, ShieldAlert } from "lucide-react";
import type { summarizeRegime } from "@/lib/signal-engine";
import { Badge } from "@/components/ui/Badge";
import { SectionKicker } from "@/components/ui/SectionKicker";
import { AnimatedRegimeStat } from "@/components/AnimatedRegimeStat";

type MarketRegimeProps = {
  regime: ReturnType<typeof summarizeRegime>;
};

export function MarketRegime({ regime }: MarketRegimeProps) {
  const isBear = regime.label === "BEAR";

  return (
    <section className="border-b border-[var(--rule)] px-5 py-5 sm:px-8">
      <div className="mx-auto grid max-w-7xl gap-5 lg:grid-cols-[1fr_28rem] lg:items-center">
        <div className="flex items-start gap-4">
          <div
            className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-[var(--radius-md)] border ${
              isBear
                ? "border-[var(--accent-bear)]/25 bg-[var(--accent-bear-bg)] text-[var(--accent-bear)]"
                : "border-[var(--accent-bull)]/25 bg-[var(--accent-bull-bg)] text-[var(--accent-bull)]"
            }`}
          >
            {isBear ? <ShieldAlert size={18} /> : <Activity size={18} />}
          </div>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <SectionKicker>Market Regime</SectionKicker>
              <Badge variant={isBear ? "bear" : "bull"}>{regime.label}</Badge>
            </div>
            <h2 className="mt-1.5 text-2xl font-bold leading-tight tracking-[-0.02em] text-[var(--text-primary)]">
              BTC 기준 {regime.label}
            </h2>
            <p className="mt-1 max-w-3xl text-sm leading-6 text-[var(--text-secondary)]">{regime.note}</p>
          </div>
        </div>

        <div className="grid grid-cols-3 divide-x divide-[var(--rule)] border-y border-[var(--rule)] text-sm lg:border-y-0">
          <AnimatedRegimeStat label="7일" value={regime.change7d} />
          <AnimatedRegimeStat label="30일" value={regime.change30d} />
          <AnimatedRegimeStat label="구조" value={regime.structure} />
        </div>
      </div>
    </section>
  );
}
