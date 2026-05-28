"use client";

import type { ReactNode } from "react";
import { FadeIn } from "@/components/ui/FadeIn";
import { AnimatedNumber } from "@/components/ui/AnimatedNumber";

export function AnimatedCoinHeader({ children }: { children: ReactNode }) {
  return <FadeIn delay={0} direction="up">{children}</FadeIn>;
}

export function AnimatedCoinChart({ children }: { children: ReactNode }) {
  return <FadeIn delay={0.15} direction="up">{children}</FadeIn>;
}

export function AnimatedCoinSidebar({ children }: { children: ReactNode }) {
  return <FadeIn delay={0.25} direction="right">{children}</FadeIn>;
}

export function AnimatedScore({ value }: { value: number }) {
  return (
    <AnimatedNumber
      value={value}
      format={(n) => String(Math.round(n))}
      duration={0.8}
    />
  );
}

export function AnimatedPrice({ value }: { value: number }) {
  return (
    <AnimatedNumber
      value={value}
      format={(n) => Math.round(n).toLocaleString()}
      duration={0.8}
    />
  );
}

export function AnimatedChange({ value }: { value: number }) {
  return (
    <AnimatedNumber
      value={value}
      format={(n) => `${n.toFixed(1)}%`}
      duration={0.8}
    />
  );
}
