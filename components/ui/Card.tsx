import type { ReactNode } from "react";

type CardProps = {
  children: ReactNode;
  className?: string;
  glow?: "bull" | "bear" | false;
  hover?: boolean;
  flush?: boolean;
  id?: string;
};

export function Card({ children, className = "", glow = false, hover = true, flush = false, id }: CardProps) {
  return (
    <div
      id={id}
      className={[
        "rounded-[var(--radius-md)] border border-[var(--rule)] bg-[var(--bg-card)]",
        "transition-colors",
        flush && "overflow-hidden",
        hover && "hover:bg-[var(--bg-card-hover)] hover:border-white/15",
        glow === "bull" && "glow-bull",
        glow === "bear" && "glow-bear",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      style={{ transitionDuration: "var(--duration-normal)", transitionTimingFunction: "var(--ease-out)" }}
    >
      {children}
    </div>
  );
}

export function CardHeader({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <div className={`border-b border-[var(--rule)] px-5 py-4 ${className}`}>{children}</div>;
}

export function CardBody({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <div className={`px-5 py-4 ${className}`}>{children}</div>;
}
