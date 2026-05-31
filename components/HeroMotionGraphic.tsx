"use client";

import { useEffect, useState, type CSSProperties } from "react";
import { useReducedMotion } from "framer-motion";

export type HeroMotionSignal = {
  symbol: string;
  score: number;
  change: string;
  tone: "bull" | "bear" | "neutral";
};

type CSSVars = CSSProperties & Record<`--${string}`, string | number>;

type HeroMotionGraphicProps = {
  regimeLabel: string;
  signals: HeroMotionSignal[];
};

const fallbackSignals: HeroMotionSignal[] = [
  { symbol: "BTC", score: 82, change: "+0.0%", tone: "neutral" },
  { symbol: "ETH", score: 74, change: "+0.0%", tone: "neutral" },
  { symbol: "SOL", score: 68, change: "+0.0%", tone: "neutral" },
  { symbol: "XRP", score: 61, change: "+0.0%", tone: "neutral" },
];

export function HeroMotionGraphic({ regimeLabel, signals }: HeroMotionGraphicProps) {
  const shouldReduceMotion = useReducedMotion();
  const [paused, setPaused] = useState(false);
  const visibleSignals = (signals.length ? signals : fallbackSignals).slice(0, 5);

  useEffect(() => {
    const syncPausedState = () => setPaused(Boolean(shouldReduceMotion || document.hidden));
    syncPausedState();
    document.addEventListener("visibilitychange", syncPausedState);
    return () => document.removeEventListener("visibilitychange", syncPausedState);
  }, [shouldReduceMotion]);

  useEffect(() => {
    const shouldPause = paused || Boolean(shouldReduceMotion);
    document.documentElement.toggleAttribute("data-motion-paused", shouldPause);
    return () => document.documentElement.removeAttribute("data-motion-paused");
  }, [paused, shouldReduceMotion]);

  return (
    <div className={`hero-motion-graphic ${paused ? "is-paused" : ""}`} aria-hidden="true">
      <div className="hero-motion-graphic__grid" />
      <div className="hero-orbit hero-orbit--outer" />
      <div className="hero-orbit hero-orbit--inner" />

      <div className="hero-radar">
        <div className="hero-radar__axis" />
        <div className="hero-radar__axis hero-radar__axis--vertical" />
        <div className="hero-radar__sweep" />
        <span className="hero-radar__dot hero-radar__dot--one" />
        <span className="hero-radar__dot hero-radar__dot--two" />
        <span className="hero-radar__dot hero-radar__dot--three" />
      </div>

      <div className="hero-signal-stack">
        <div className="hero-signal-stack__head">
          <span>{regimeLabel}</span>
          <span>LIVE MODEL</span>
        </div>
        {visibleSignals.map((signal, index) => (
          <div
            key={`${signal.symbol}-${index}`}
            className={`hero-signal-row hero-signal-row--${signal.tone}`}
            style={{ "--row-index": index } as CSSVars}
          >
            <span>{signal.symbol}</span>
            <span>{signal.change}</span>
            <span>{signal.score}</span>
          </div>
        ))}
      </div>

      <div className="hero-bar-field">
        {visibleSignals.map((signal, index) => (
          <span
            key={`${signal.symbol}-bar-${index}`}
            className={`hero-bar hero-bar--${signal.tone}`}
            style={{
              "--bar-height": `${Math.max(34, Math.min(96, signal.score))}%`,
              "--bar-index": index,
            } as CSSVars}
          />
        ))}
      </div>

      <div className="hero-data-rail hero-data-rail--one" />
      <div className="hero-data-rail hero-data-rail--two" />
    </div>
  );
}
