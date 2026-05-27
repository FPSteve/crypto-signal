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
        현재는 `/en/research/[slug]` 패턴 기반 후보 링크입니다. 다음 단계에서 크롤링/검색 검증을 붙여 실제 존재 여부와 요약을 분리합니다.
      </p>
      <a
        href={research.url}
        target="_blank"
        rel="noreferrer"
        className="mt-4 inline-flex items-center gap-2 rounded-md bg-white px-3 py-2 text-sm font-medium text-black transition hover:bg-gray-200"
      >
        리서치 열기
        <ExternalLink size={15} />
      </a>
    </section>
  );
}
