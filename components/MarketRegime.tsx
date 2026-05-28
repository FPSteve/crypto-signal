import { Activity, ShieldAlert } from "lucide-react";
import type { summarizeRegime } from "@/lib/signal-engine";
import { Card, CardBody } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { AnimatedRegimeStat } from "@/components/AnimatedRegimeStat";

type MarketRegimeProps = {
  regime: ReturnType<typeof summarizeRegime>;
};

export function MarketRegime({ regime }: MarketRegimeProps) {
  const isBear = regime.label === "BEAR";

  return (
    <section
      className="px-5 py-6 sm:px-8"
      style={{ background: "var(--gradient-hero)" }}
    >
      <div className="mx-auto max-w-7xl">
        <Card hover={false} glow={isBear ? "bear" : "bull"}>
          <CardBody className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-start gap-4">
              <div
                className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-[var(--radius-md)] ${
                  isBear ? "bg-[var(--accent-bear-bg)] text-[var(--accent-bear)]" : "bg-[var(--accent-bull-bg)] text-[var(--accent-bull)]"
                }`}
              >
                {isBear ? <ShieldAlert size={20} /> : <Activity size={20} />}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <p className="text-xs font-medium uppercase tracking-[0.2em] text-[var(--text-muted)]">
                    Market Regime
                  </p>
                  <Badge variant={isBear ? "bear" : "bull"}>{regime.label}</Badge>
                </div>
                <h2 className="mt-1.5 text-xl font-semibold text-[var(--text-primary)]">
                  BTC 기준 {regime.label}
                </h2>
                <p className="mt-1 max-w-3xl text-sm text-[var(--text-secondary)]">{regime.note}</p>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4 text-sm">
              <AnimatedRegimeStat label="7일" value={regime.change7d} />
              <AnimatedRegimeStat label="30일" value={regime.change30d} />
              <AnimatedRegimeStat label="구조" value={regime.structure} />
            </div>
          </CardBody>
        </Card>
      </div>
    </section>
  );
}
