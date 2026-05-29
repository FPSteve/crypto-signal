export function ScoreTag({ score, className = "" }: { score: number; className?: string }) {
  const isHundredScale = score > 10;
  const high = isHundredScale ? 70 : 7;
  const mid = isHundredScale ? 40 : 4;
  const tier =
    score >= high
      ? "border-[var(--accent-bull)]/30 bg-[var(--accent-bull-bg)] text-[var(--accent-bull)]"
      : score >= mid
        ? "border-[var(--accent-brand)]/30 bg-[var(--accent-brand-bg)] text-[var(--accent-brand)]"
        : "border-[var(--accent-bear)]/30 bg-[var(--accent-bear-bg)] text-[var(--accent-bear)]";
  const display = isHundredScale ? Math.round(score).toString() : score.toFixed(1);

  return (
    <span
      className={`inline-flex min-w-12 items-center justify-center rounded-[var(--radius-sm)] border px-2 py-1 text-sm font-semibold tabular-nums font-[family-name:var(--font-geist-mono)] ${tier} ${className}`}
    >
      {display}
    </span>
  );
}
