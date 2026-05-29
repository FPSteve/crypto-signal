import type { ReactNode } from "react";

export function DataTable({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <div className={`divide-y divide-[var(--rule)] ${className}`}>{children}</div>;
}

export function DataRow({
  label,
  value,
  href,
  className = "",
}: {
  label: ReactNode;
  value: ReactNode;
  href?: string;
  className?: string;
}) {
  const content = (
    <>
      <span className="min-w-0 truncate text-[var(--text-secondary)]">{label}</span>
      <span className="shrink-0 text-right tabular-nums font-[family-name:var(--font-geist-mono)] text-[var(--text-primary)]">
        {value}
      </span>
    </>
  );

  const classes = `flex items-center justify-between gap-4 py-3 text-sm transition-colors ${className}`;

  if (href) {
    return (
      <a href={href} className={`${classes} hover:bg-white/[0.025]`}>
        {content}
      </a>
    );
  }

  return <div className={classes}>{content}</div>;
}
