export type ResearchStatus = "verified" | "search-fallback";

export type ResearchSource = "anthropic-web-search" | "local-claude-bridge" | "search-url-fallback";

export type ResearchConfidence = "high" | "medium" | "low";

export type ResearchDisplayMode = "ai-synthesis" | "fallback";

export type ResearchMatch = {
  symbol: string;
  title: string;
  url: string;
  searchUrl: string;
  summary: string;
  displayMode: ResearchDisplayMode;
  originalLanguage: "en" | "ko" | "unknown";
  thesis: string | null;
  keyPoints: string[];
  risks: string[];
  confidence: ResearchConfidence;
  query: string;
  status: ResearchStatus;
  source: ResearchSource;
  foundAt: string;
};

type ResearchCandidate = Partial<
  Pick<ResearchMatch, "title" | "url" | "summary" | "originalLanguage" | "thesis" | "keyPoints" | "risks" | "confidence">
> & {
  symbol?: string;
  symbols?: string[];
  tags?: string[];
  language?: ResearchMatch["originalLanguage"];
};

type AnthropicTextBlock = {
  type: "text";
  text?: string;
  citations?: Array<{ type?: string; url?: string; title?: string; cited_text?: string }>;
};

type AnthropicSearchResult = {
  type: "web_search_tool_result";
  content?: Array<{ type?: string; url?: string; title?: string; page_age?: string }> | { type?: string; error_code?: string };
};

type AnthropicPayload = {
  content?: Array<AnthropicTextBlock | AnthropicSearchResult | { type: string }>;
};

type AnthropicContentBlock = NonNullable<AnthropicPayload["content"]>[number];

const COIN_NAMES: Record<string, string> = {
  AAVE: "Aave",
  ARB: "Arbitrum",
  AVAX: "Avalanche",
  BTC: "Bitcoin",
  ETH: "Ethereum",
  LINK: "Chainlink",
  NEAR: "NEAR Protocol",
  ONDO: "Ondo Finance",
  OP: "Optimism",
  RENDER: "Render Network",
  SOL: "Solana",
  SUI: "Sui",
  WLD: "Worldcoin",
};

const DEFAULT_BRIDGE_TIMEOUT_MS = 8_000;
const DEFAULT_ANTHROPIC_TIMEOUT_MS = 20_000;

function boundedTimeoutMs(value: string | undefined, fallback: number, max: number) {
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed <= 0) return fallback;
  return Math.min(parsed, max);
}

function normalizeSymbol(symbol: string) {
  return symbol.trim().toUpperCase().replace(/^KRW-/, "");
}

function coinNameFor(symbol: string) {
  return COIN_NAMES[symbol] ?? symbol;
}

export function buildResearchQuery(symbol: string) {
  const normalized = normalizeSymbol(symbol);
  const coinName = coinNameFor(normalized);
  return `site:research.4pillars.io/en/research OR site:4pillars.io/en/research "${coinName}" ${normalized} "Four Pillars"`;
}

function googleSearchUrl(query: string) {
  return `https://www.google.com/search?q=${encodeURIComponent(query)}`;
}

function nowIso() {
  return new Date().toISOString();
}

export function findResearch(symbol: string): ResearchMatch {
  const normalized = normalizeSymbol(symbol);
  const coinName = coinNameFor(normalized);
  const query = buildResearchQuery(normalized);

  return {
    symbol: normalized,
    title: `${coinName} Four Pillars 리서치 검색`,
    url: `https://research.4pillars.io/en/search?q=${encodeURIComponent(normalized.toLowerCase())}`,
    searchUrl: googleSearchUrl(query),
    summary: "Four Pillars 공식 검색 기반 리서치 후보입니다. 전용 콘텐츠 API 없이 검색/AI 합성 경로를 정식 동작으로 사용합니다.",
    displayMode: "fallback",
    originalLanguage: "unknown",
    thesis: null,
    keyPoints: [],
    risks: [],
    confidence: "low",
    query,
    status: "search-fallback",
    source: "search-url-fallback",
    foundAt: nowIso(),
  };
}

function extractJson(text: string) {
  const match = text.match(/\{[\s\S]*\}/);
  if (!match) return null;

  try {
    return JSON.parse(match[0]) as ResearchCandidate;
  } catch {
    return null;
  }
}

function isFourPillarsResearchUrl(url: string) {
  try {
    const parsed = new URL(url);
    return parsed.hostname.endsWith("4pillars.io") && parsed.pathname.includes("/research");
  } catch {
    return false;
  }
}

function cleanText(value: unknown, maxLength: number) {
  if (typeof value !== "string") return "";
  return value.replace(/\s+/g, " ").trim().slice(0, maxLength);
}

function cleanList(value: unknown, maxItems: number, maxLength: number) {
  if (!Array.isArray(value)) return [];
  return value.map((item) => cleanText(item, maxLength)).filter(Boolean).slice(0, maxItems);
}

function normalizeConfidence(value: unknown): ResearchConfidence {
  return value === "high" || value === "medium" || value === "low" ? value : "medium";
}

function normalizeOriginalLanguage(value: unknown): ResearchMatch["originalLanguage"] {
  return value === "en" || value === "ko" ? value : "unknown";
}

function normalizeVerifiedResearch(
  symbol: string,
  query: string,
  source: Exclude<ResearchSource, "search-url-fallback">,
  candidate: ResearchCandidate,
): ResearchMatch | null {
  const normalized = normalizeSymbol(symbol);
  const url = typeof candidate.url === "string" ? candidate.url.trim() : "";
  if (!url || !isFourPillarsResearchUrl(url)) return null;

  const title =
    typeof candidate.title === "string" && candidate.title.trim()
      ? candidate.title.trim()
      : `${coinNameFor(normalized)} Four Pillars Research`;
  const summary =
    typeof candidate.summary === "string" && candidate.summary.trim()
      ? candidate.summary.trim()
      : "Four Pillars에서 검색된 관련 리서치입니다.";
  const thesis = cleanText(candidate.thesis, 420) || summary;
  const keyPoints = cleanList(candidate.keyPoints, 5, 180);
  const risks = cleanList(candidate.risks, 4, 180);

  return {
    symbol: normalized,
    title,
    url,
    searchUrl: googleSearchUrl(query),
    summary,
    displayMode: "ai-synthesis",
    originalLanguage: normalizeOriginalLanguage(candidate.originalLanguage ?? candidate.language),
    thesis,
    keyPoints,
    risks,
    confidence: normalizeConfidence(candidate.confidence),
    query,
    status: "verified",
    source,
    foundAt: nowIso(),
  };
}

function isAnthropicTextBlock(item: AnthropicContentBlock): item is AnthropicTextBlock {
  return item.type === "text" && "text" in item && typeof item.text === "string";
}

function isAnthropicSearchResult(item: AnthropicContentBlock): item is AnthropicSearchResult {
  return item.type === "web_search_tool_result";
}

function researchFromAnthropicPayload(symbol: string, query: string, payload: AnthropicPayload) {
  const text = payload.content?.find(isAnthropicTextBlock)?.text;
  const parsed = text ? extractJson(text) : null;
  const fromJson = parsed ? normalizeVerifiedResearch(symbol, query, "anthropic-web-search", parsed) : null;
  if (fromJson) return fromJson;

  for (const block of payload.content ?? []) {
    if (isAnthropicTextBlock(block)) {
      const citation = block.citations?.find((item) => item.url && isFourPillarsResearchUrl(item.url));
      if (citation?.url) {
        return normalizeVerifiedResearch(symbol, query, "anthropic-web-search", {
          title: citation.title,
          url: citation.url,
          summary: citation.cited_text,
        });
      }
    }

    if (isAnthropicSearchResult(block) && Array.isArray(block.content)) {
      const result = block.content.find((item) => item.url && isFourPillarsResearchUrl(item.url));
      if (result?.url) {
        return normalizeVerifiedResearch(symbol, query, "anthropic-web-search", {
          title: result.title,
          url: result.url,
        });
      }
    }
  }

  return null;
}

async function findViaLocalBridge(symbol: string, query: string) {
  // Try unified relay first, fall back to dedicated bridge
  const bridgeUrl = process.env.CRYPTO_AI_RELAY_URL?.trim() ?? process.env.FOUR_PILLARS_BRIDGE_URL?.trim();
  if (!bridgeUrl) return null;

  const bridgeToken = process.env.CRYPTO_AI_RELAY_TOKEN?.trim() ?? process.env.FOUR_PILLARS_BRIDGE_TOKEN?.trim();
  const controller = new AbortController();
  const timeout = setTimeout(
    () => controller.abort(),
    boundedTimeoutMs(process.env.FOUR_PILLARS_BRIDGE_TIMEOUT_MS, DEFAULT_BRIDGE_TIMEOUT_MS, 30_000),
  );

  try {
    const res = await fetch(new URL("/api/research", bridgeUrl), {
      method: "POST",
      headers: {
        "content-type": "application/json",
        ...(bridgeToken ? { "x-crypto-ai-token": bridgeToken } : {}),
      },
      body: JSON.stringify({
        symbol,
        query,
        outputContract: {
          title: "string",
          url: "direct Four Pillars research article URL",
          summary: "1 Korean sentence",
          displayMode: "ai-synthesis",
          originalLanguage: "en | ko | unknown",
          thesis: "2-3 Korean sentences explaining the investment thesis",
          keyPoints: ["3-5 Korean bullet strings"],
          risks: ["2-4 Korean risk strings"],
          confidence: "high | medium | low",
        },
        constraints: [
          "Return AI synthesis only; do not include original article body text.",
          "Prefer direct article URLs and include attribution by URL.",
        ],
      }),
      signal: controller.signal,
      cache: "no-store",
    });
    if (!res.ok) return null;

    const payload = (await res.json()) as ResearchCandidate;
    return normalizeVerifiedResearch(symbol, query, "local-claude-bridge", payload);
  } catch {
    return null;
  } finally {
    clearTimeout(timeout);
  }
}

async function findViaAnthropicWebSearch(symbol: string, query: string) {
  const apiKey = process.env.ANTHROPIC_API_KEY?.trim();
  if (!apiKey) return null;

  const normalized = normalizeSymbol(symbol);
  const model = process.env.CLAUDE_RESEARCH_MODEL ?? process.env.CLAUDE_MODEL ?? "claude-sonnet-4-5";
  const controller = new AbortController();
  const timeout = setTimeout(
    () => controller.abort(),
    boundedTimeoutMs(process.env.FOUR_PILLARS_ANTHROPIC_TIMEOUT_MS, DEFAULT_ANTHROPIC_TIMEOUT_MS, 30_000),
  );

  try {
    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "anthropic-version": "2023-06-01",
        "content-type": "application/json",
        "x-api-key": apiKey,
      },
      body: JSON.stringify({
        model,
        max_tokens: 1400,
        temperature: 0,
        tools: [
          {
            type: "web_search_20250305",
            name: "web_search",
            max_uses: 3,
            allowed_domains: ["4pillars.io", "research.4pillars.io"],
          },
        ],
        system:
          "Find Four Pillars crypto research articles and return only compact JSON for an AI-synthesized research card. Prefer direct article pages over generic listing/search pages. Do not include original article body text.",
        messages: [
          {
            role: "user",
            content: JSON.stringify({
              task: "Search the web for the most relevant Four Pillars research article for this crypto asset.",
              symbol: normalized,
              coinName: coinNameFor(normalized),
              query,
              outputShape: {
                title: "string",
                url: "https://...",
                summary: "1 Korean sentence",
                displayMode: "ai-synthesis",
                originalLanguage: "en | ko | unknown",
                thesis: "2-3 Korean sentences that explain the article's investment thesis",
                keyPoints: ["3-5 Korean bullet strings"],
                risks: ["2-4 Korean risk strings"],
                confidence: "high | medium | low",
              },
              constraints: [
                "Return AI synthesis only; do not include original article body text.",
                "Attribute the source by returning the original Four Pillars URL.",
                "If evidence is thin, set confidence to low and keep claims conservative.",
              ],
            }),
          },
        ],
      }),
      signal: controller.signal,
      next: { revalidate: 60 * 60 * 6 },
    });

    if (!res.ok) return null;
    const payload = (await res.json()) as AnthropicPayload;
    return researchFromAnthropicPayload(symbol, query, payload);
  } catch {
    return null;
  } finally {
    clearTimeout(timeout);
  }
}

export async function findVerifiedResearch(symbol: string): Promise<ResearchMatch> {
  const normalized = normalizeSymbol(symbol);
  const query = buildResearchQuery(normalized);
  return (
    (await findViaLocalBridge(normalized, query)) ??
    (await findViaAnthropicWebSearch(normalized, query)) ??
    findResearch(normalized)
  );
}
