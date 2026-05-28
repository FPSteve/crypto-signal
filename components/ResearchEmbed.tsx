"use client";

import { ExternalLink, Search } from "lucide-react";
import type { ResearchMatch } from "@/lib/four-pillars";

export function ResearchEmbed({ research }: { research: ResearchMatch | null }) {
  if (!research) {
    return (
      <section className="border-t border-white/10 py-6">
        <p className="text-sm text-gray-500">Four Pillars 리서치 후보가 아직 없습니다.</p>
      </section>
    );
  }

  const searchUrl = `https://research.4pillars.io/en/search?q=${encodeURIComponent(research.symbol.toLowerCase())}`;

  return (
    <section className="border-t border-white/10 py-6">
      <p className="text-xs font-medium uppercase tracking-[0.2em] text-gray-500">Four Pillars Research</p>

      <div className="mt-4 rounded-lg border border-white/10 bg-[#0c0f14] p-5">
        <div className="flex items-start gap-3">
          <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-md border border-white/10 bg-white/5 text-gray-300">
            <Search size={17} />
          </div>
          <div className="min-w-0">
            <h2 className="text-base font-semibold text-white">{research.title}</h2>
            <p className="mt-2 text-sm leading-6 text-gray-400">{research.summary}</p>
            <p className="mt-3 break-all text-xs text-gray-600">{searchUrl}</p>
          </div>
        </div>

        <a
          href={searchUrl}
          target="_blank"
          rel="noreferrer"
          className="mt-5 inline-flex items-center gap-2 rounded-md bg-white px-3 py-2 text-sm font-medium text-black transition hover:bg-gray-200"
        >
          Four Pillars 검색 결과 열기
          <ExternalLink size={15} />
        </a>
      </div>
    </section>
  );
}
