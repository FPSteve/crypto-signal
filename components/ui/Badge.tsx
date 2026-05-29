import type { ReactNode } from "react";

type BadgeVariant = "default" | "brand" | "bull" | "bear" | "outline";

const variantStyles: Record<BadgeVariant, string> = {
  default: "bg-transparent text-[var(--text-secondary)] border-[var(--rule)]",
  brand: "bg-[var(--accent-brand-bg)] text-[var(--accent-brand)] border-[var(--accent-brand)]/20",
  bull: "bg-[var(--accent-bull-bg)] text-[var(--accent-bull)] border-[var(--accent-bull)]/20",
  bear: "bg-[var(--accent-bear-bg)] text-[var(--accent-bear)] border-[var(--accent-bear)]/20",
  outline: "bg-transparent text-[var(--text-secondary)] border-white/10",
};

export function Badge({
  children,
  variant = "default",
  className = "",
}: {
  children: ReactNode;
  variant?: BadgeVariant;
  className?: string;
}) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-[var(--radius-sm)] border px-2 py-0.5 text-[11px] font-semibold uppercase tracking-[0.08em] ${variantStyles[variant]} ${className}`}
    >
      {children}
    </span>
  );
}
