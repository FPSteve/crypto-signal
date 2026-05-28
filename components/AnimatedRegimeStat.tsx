"use client";

import { AnimatedNumber } from "@/components/ui/AnimatedNumber";

type AnimatedRegimeStatProps = {
  label: string;
  value: number | string | null | undefined;
};

export function AnimatedRegimeStat({ label, value }: AnimatedRegimeStatProps) {
  return (
    <div className="min-w-[5.5rem] rounded-[var(--radius-sm)] bg-white/[0.03] px-4 py-3">
      <p className="text-[var(--text-muted)] text-xs">{label}</p>
      <p className="mt-1 font-semibold tabular-nums text-[var(--text-primary)] font-[family-name:var(--font-geist-mono)]">
        {typeof value === "number" ? (
          <>
            <AnimatedNumber
              value={value}
              format={(n) => `${n.toFixed(1)}`}
              duration={0.8}
            />
            %
          </>
        ) : (
          value ?? "n/a"
        )}
      </p>
    </div>
  );
}
