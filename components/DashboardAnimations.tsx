"use client";

import type { ReactNode } from "react";
import { FadeIn, StaggerContainer, StaggerItem } from "@/components/ui/FadeIn";

export function AnimatedHeader({ children }: { children: ReactNode }) {
  return <FadeIn delay={0}>{children}</FadeIn>;
}

export function AnimatedRegimeSection({ children }: { children: ReactNode }) {
  return (
    <div className="relative">
      <FadeIn delay={0.1}>{children}</FadeIn>
    </div>
  );
}

export function AnimatedSignalList({ children }: { children: ReactNode }) {
  return <StaggerContainer>{children}</StaggerContainer>;
}

export function AnimatedSignalItem({ children }: { children: ReactNode }) {
  return <StaggerItem>{children}</StaggerItem>;
}

export function AnimatedSidebar({ children }: { children: ReactNode }) {
  return <FadeIn direction="right" delay={0.3}>{children}</FadeIn>;
}
