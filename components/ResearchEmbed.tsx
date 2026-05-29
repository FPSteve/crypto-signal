"use client";

import { ExternalLink, Search } from "lucide-react";
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

  return (
    <section className="border-t border-[var(--rule)] py-6">
      <SectionKicker>Four Pillars Research</SectionKicker>

      <div className="mt-4 rounded-[var(--radius-md)] border border-[var(--rule)] bg-[var(--bg-card)] p-5">
        <div className="flex items-start gap-3">
          <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-[var(--radius-md)] border border-[var(--rule)] bg-white/[0.03] text-[var(--text-secondary)]">
            <Search size={17} />
          </div>
          <div className="min-w-0">
            <h2 className="text-xl font-bold leading-tight tracking-[-0.02em] text-[var(--text-primary)]">{research.title}</h2>
            <p className="mt-2 text-sm leading-6 text-[var(--text-secondary)]">{research.summary}</p>
            <p className="mt-3 break-all text-xs text-[var(--text-muted)]">{searchUrl}</p>
          </div>
        </div>

        <a
          href={searchUrl}
          target="_blank"
          rel="noreferrer"
          className="mt-5 inline-flex items-center gap-2 rounded-[var(--radius-sm)] bg-[var(--accent-brand)] px-3 py-2 text-sm font-medium text-white transition hover:brightness-110"
        >
          Four Pillars 검색 결과 열기
          <ExternalLink size={15} />
        </a>
      </div>
    </section>
  );
}
