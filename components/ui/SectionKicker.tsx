import type { ReactNode } from "react";

export function SectionKicker({
  children,
  className = "",
  rule = false,
}: {
  children: ReactNode;
  className?: string;
  rule?: boolean;
}) {
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <p className="shrink-0 text-xs font-semibold uppercase tracking-[0.2em] text-[var(--text-muted)] font-[family-name:var(--font-geist-mono)]">
        {children}
      </p>
      {rule && <span className="h-px flex-1 bg-[var(--rule)]" />}
    </div>
  );
}
