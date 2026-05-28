import { ExternalLink } from "lucide-react";
import type { ResearchMatch } from "@/lib/four-pillars";

export function ResearchEmbed({ research }: { research: ResearchMatch | null }) {
  if (!research) {
    return (
      <section className="border-t border-white/10 py-6">
        <p className="text-sm text-gray-500">Four Pillars 리서치 후보가 아직 없습니다.</p>
      </section>
    );
  }

  return (
    <section className="border-t border-white/10 py-6">
      <p className="text-xs font-medium uppercase tracking-[0.2em] text-gray-500">Four Pillars</p>
      <h2 className="mt-2 text-xl font-semibold text-white">{research.title}</h2>
      <p className="mt-2 text-sm leading-6 text-gray-400">
        {research.summary}
      </p>
      <div className="mt-4 flex flex-wrap gap-3">
        <a
          href={research.url}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-2 rounded-md bg-white px-3 py-2 text-sm font-medium text-black transition hover:bg-gray-200"
        >
          {research.status === "verified" ? "리서치 열기" : "AI 검색 실행"}
          <ExternalLink size={15} />
        </a>
        {research.status === "verified" && (
          <a
            href={research.searchUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 rounded-md border border-white/20 px-3 py-2 text-sm font-medium text-gray-300 transition hover:border-white/40 hover:text-white"
          >
            검색 근거
            <ExternalLink size={15} />
          </a>
        )}
      </div>
    </section>
  );
}
