type MarketMetric = {
  label: string;
  value: string;
  meta: string;
  tone?: "bull" | "bear" | "neutral";
};

type MarketMetricGridProps = {
  metrics: MarketMetric[];
};

export function MarketMetricGrid({ metrics }: MarketMetricGridProps) {
  return (
    <section className="border-b border-[var(--rule)] px-5 py-5 sm:px-8">
      <div className="mx-auto grid max-w-7xl grid-cols-1 divide-y divide-[var(--rule)] overflow-hidden rounded-[var(--radius-lg)] border border-[var(--rule)] bg-[var(--bg-card)] sm:grid-cols-2 sm:divide-x sm:divide-y-0 lg:grid-cols-6">
        {metrics.map((metric) => (
          <div key={metric.label} data-metric-item="true" className="min-h-28 px-4 py-4">
            <p className="font-[family-name:var(--font-mono)] text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--text-muted)]">
              {metric.label}
            </p>
            <p
              className={[
                "mt-4 font-[family-name:var(--font-heading)] text-2xl font-bold leading-none tabular-nums text-[var(--text-primary)]",
                metric.tone === "bull" && "text-[var(--accent-bull)]",
                metric.tone === "bear" && "text-[var(--accent-bear)]",
              ]
                .filter(Boolean)
                .join(" ")}
            >
              {metric.value}
            </p>
            <p className="mt-3 font-[family-name:var(--font-mono)] text-[11px] leading-5 text-[var(--text-muted)]">
              {metric.meta}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
