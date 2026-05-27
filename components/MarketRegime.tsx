import { Activity, ShieldAlert } from "lucide-react";
import type { summarizeRegime } from "@/lib/signal-engine";

type MarketRegimeProps = {
  regime: ReturnType<typeof summarizeRegime>;
};

export function MarketRegime({ regime }: MarketRegimeProps) {
  const isBear = regime.label === "BEAR";

  return (
    <section className="border-b border-white/10 bg-[#101317] px-5 py-5 sm:px-8">
      <div className="mx-auto flex max-w-7xl flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-start gap-3">
          <div className={`mt-1 rounded-md p-2 ${isBear ? "bg-red-500/10 text-red-300" : "bg-emerald-500/10 text-emerald-300"}`}>
            {isBear ? <ShieldAlert size={20} /> : <Activity size={20} />}
          </div>
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.2em] text-gray-500">Market Regime</p>
            <h2 className="mt-1 text-2xl font-semibold text-white">BTC 기준 {regime.label}</h2>
            <p className="mt-1 max-w-3xl text-sm text-gray-400">{regime.note}</p>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-3 text-sm">
          <div className="min-w-24 border-l border-white/10 pl-4">
            <p className="text-gray-500">7일</p>
            <p className="mt-1 font-semibold text-white">{regime.change7d ?? "n/a"}%</p>
          </div>
          <div className="min-w-24 border-l border-white/10 pl-4">
            <p className="text-gray-500">30일</p>
            <p className="mt-1 font-semibold text-white">{regime.change30d ?? "n/a"}%</p>
          </div>
          <div className="min-w-32 border-l border-white/10 pl-4">
            <p className="text-gray-500">구조</p>
            <p className="mt-1 font-semibold text-white">{regime.structure}</p>
          </div>
        </div>
      </div>
    </section>
  );
}
