"use client";

import { motion } from "framer-motion";

export function ScoreRing({ score, size = 56 }: { score: number; size?: number }) {
  const maxScore = score > 10 ? 100 : 10;
  const radius = (size - 6) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = Math.min(score / maxScore, 1);
  const dashOffset = circumference * (1 - progress);

  const color =
    score >= (maxScore === 100 ? 70 : 7)
      ? "var(--accent-bull)"
      : score >= (maxScore === 100 ? 40 : 4)
        ? "var(--accent-brand)"
        : "var(--accent-bear)";

  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="rgba(255,255,255,0.06)"
          strokeWidth={3}
        />
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={3}
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: dashOffset }}
          transition={{ duration: 1, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
        />
      </svg>
      <span
        className="absolute text-lg font-semibold tabular-nums font-[family-name:var(--font-geist-mono)]"
        style={{ color }}
      >
        {score}
      </span>
    </div>
  );
}
