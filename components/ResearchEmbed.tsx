"use client";

import { ExternalLink, FileText, Search, ShieldAlert } from "lucide-react";
import type { ResearchMatch } from "@/lib/four-pillars";
import { SectionKicker } from "@/components/ui/SectionKicker";

export function ResearchEmbed({ research }: { research: ResearchMatch | null }) {
  if (!research) {
    return (
      <section className="border-t border-[var(--rule)] py-6">
        <p className="text-sm text-[var(--text-muted)]">Four Pillars 리서치 후보가 아직 없습니다.</p>
      </section>
    );
  }

  const searchUrl = `https://research.4pillars.io/en/search?q=${encodeURIComponent(research.symbol.toLowerCase())}`;
  const sourceUrl = research.status === "verified" ? research.url : searchUrl;
  const hasInlineBrief = Boolean(research.thesis || research.keyPoints.length || research.risks.length);
  const confidenceLabel = {
    high: "높음",
    medium: "보통",
    low: "낮음",
  }[research.confidence];

  return (
    <section className="border-t border-[var(--rule)] py-6">
      <SectionKicker>Four Pillars Research</SectionKicker>

      <div className="mt-4 rounded-[var(--radius-md)] border border-[var(--rule)] bg-[var(--bg-card)] p-5">
        <div className="flex items-start gap-3">
          <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-[var(--radius-md)] border border-[var(--rule)] bg-white/[0.03] text-[var(--text-secondary)]">
            {hasInlineBrief ? <FileText size={17} /> : <Search size={17} />}
          </div>
          <div className="min-w-0">
            <h2 className="text-xl font-bold leading-tight tracking-[-0.02em] text-[var(--text-primary)]">{research.title}</h2>
            {hasInlineBrief ? (
              <div className="mt-2 flex flex-wrap items-center gap-2 font-[family-name:var(--font-mono)] text-[11px] uppercase tracking-[0.12em] text-[var(--text-muted)]">
                <span>AI 합성</span>
                <span className="h-1 w-1 rounded-full bg-[var(--text-muted)]" />
                <span>출처: Four Pillars</span>
                <span className="h-1 w-1 rounded-full bg-[var(--text-muted)]" />
                <span>신뢰도 {confidenceLabel}</span>
              </div>
            ) : (
              <div className="mt-2 flex flex-wrap items-center gap-2 font-[family-name:var(--font-mono)] text-[11px] uppercase tracking-[0.12em] text-[var(--text-muted)]">
                <span>검색 fallback</span>
                <span className="h-1 w-1 rounded-full bg-[var(--text-muted)]" />
                <span>출처 후보: Four Pillars</span>
              </div>
            )}
            <p className="mt-3 text-sm leading-6 text-[var(--text-secondary)]">{research.summary}</p>
          </div>
        </div>

        {hasInlineBrief ? (
          <div className="mt-5 space-y-5">
            {research.thesis && (
              <section>
                <h3 className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--text-muted)]">Thesis</h3>
                <p className="mt-2 text-base font-medium leading-7 text-[var(--text-primary)]">{research.thesis}</p>
              </section>
            )}

            {research.keyPoints.length > 0 && (
              <section>
                <h3 className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--text-muted)]">Key Points</h3>
                <ul className="mt-3 space-y-2">
                  {research.keyPoints.map((point) => (
                    <li key={point} className="flex items-start gap-2 text-sm leading-6 text-[var(--text-secondary)]">
                      <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--accent-brand)]" />
                      {point}
                    </li>
                  ))}
                </ul>
              </section>
            )}

            {research.risks.length > 0 && (
              <section>
                <h3 className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-[var(--text-muted)]">
                  <ShieldAlert size={13} />
                  Risks
                </h3>
                <ul className="mt-3 space-y-2">
                  {research.risks.map((risk) => (
                    <li key={risk} className="flex items-start gap-2 text-sm leading-6 text-[var(--text-secondary)]">
                      <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--accent-bear)]" />
                      {risk}
                    </li>
                  ))}
                </ul>
              </section>
            )}
          </div>
        ) : (
          <p className="mt-5 break-all text-xs text-[var(--text-muted)]">{searchUrl}</p>
        )}

        <a
          href={sourceUrl}
          target="_blank"
          rel="noreferrer"
          className="mt-5 inline-flex items-center gap-2 rounded-[var(--radius-sm)] bg-[var(--accent-brand)] px-3 py-2 text-sm font-medium text-white transition hover:brightness-110"
        >
          {research.status === "verified" ? "Four Pillars 리서치 열기" : "Four Pillars 검색 결과 열기"}
          <ExternalLink size={15} />
        </a>
      </div>
    </section>
  );
}
