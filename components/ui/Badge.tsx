import type { ReactNode } from "react";

type BadgeVariant = "default" | "bull" | "bear" | "blue" | "outline";

const variantStyles: Record<BadgeVariant, string> = {
  default: "bg-white/[0.06] text-[var(--text-secondary)] border-transparent",
  bull: "bg-[var(--accent-bull-bg)] text-[var(--accent-bull)] border-[var(--accent-bull)]/20",
  bear: "bg-[var(--accent-bear-bg)] text-[var(--accent-bear)] border-[var(--accent-bear)]/20",
  blue: "bg-[var(--accent-blue-bg)] text-[var(--accent-blue)] border-[var(--accent-blue)]/20",
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
      className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-[11px] font-medium tracking-wide ${variantStyles[variant]} ${className}`}
    >
      {children}
    </span>
  );
}
