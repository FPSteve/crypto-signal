import type { ReactNode } from "react";

type CardProps = {
  children: ReactNode;
  className?: string;
  glow?: "bull" | "bear" | false;
  hover?: boolean;
};

export function Card({ children, className = "", glow = false, hover = true }: CardProps) {
  return (
    <div
      className={[
        "rounded-[var(--radius-md)] border border-[var(--glass-border)] bg-[var(--bg-card)]",
        "backdrop-blur-sm transition-all",
        hover && "hover:bg-[var(--bg-card-hover)] hover:border-white/10 hover:shadow-[var(--shadow-md)]",
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
  return <div className={`px-5 py-4 border-b border-[var(--glass-border)] ${className}`}>{children}</div>;
}

export function CardBody({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <div className={`px-5 py-4 ${className}`}>{children}</div>;
}
