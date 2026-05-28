export type ResearchStatus = "verified" | "search-fallback";

export type ResearchSource = "anthropic-web-search" | "local-claude-bridge" | "search-url-fallback";

export type ResearchMatch = {
  symbol: string;
  title: string;
  url: string;
  searchUrl: string;
  summary: string;
  query: string;
  status: ResearchStatus;
  source: ResearchSource;
  foundAt: string;
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
    url: googleSearchUrl(query),
    searchUrl: googleSearchUrl(query),
    summary: "검증된 직접 아티클 URL은 /api/research 런타임 검색으로 확인합니다.",
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
    return JSON.parse(match[0]) as Partial<Pick<ResearchMatch, "title" | "url" | "summary">>;
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

function normalizeVerifiedResearch(
  symbol: string,
  query: string,
  source: Exclude<ResearchSource, "search-url-fallback">,
  candidate: Partial<Pick<ResearchMatch, "title" | "url" | "summary">>,
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

  return {
    symbol: normalized,
    title,
    url,
    searchUrl: googleSearchUrl(query),
    summary,
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
  const timeout = setTimeout(() => controller.abort(), Number(process.env.FOUR_PILLARS_BRIDGE_TIMEOUT_MS ?? 180_000));

  try {
    const res = await fetch(new URL("/api/research", bridgeUrl), {
      method: "POST",
      headers: {
        "content-type": "application/json",
        ...(bridgeToken ? { "x-crypto-ai-token": bridgeToken } : {}),
      },
      body: JSON.stringify({ symbol, query }),
      signal: controller.signal,
      cache: "no-store",
    });
    if (!res.ok) return null;

    const payload = (await res.json()) as Partial<ResearchMatch>;
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
  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "anthropic-version": "2023-06-01",
      "content-type": "application/json",
      "x-api-key": apiKey,
    },
    body: JSON.stringify({
      model,
      max_tokens: 900,
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
        "Find Four Pillars crypto research articles. Return only compact JSON with title, url, and summary. Prefer direct article pages over generic listing/search pages.",
      messages: [
        {
          role: "user",
          content: JSON.stringify({
            task: "Search the web for the most relevant Four Pillars research article for this crypto asset.",
            symbol: normalized,
            coinName: coinNameFor(normalized),
            query,
            outputShape: { title: "string", url: "https://...", summary: "1 Korean sentence" },
          }),
        },
      ],
    }),
    next: { revalidate: 60 * 60 * 6 },
  });

  if (!res.ok) return null;
  const payload = (await res.json()) as AnthropicPayload;
  return researchFromAnthropicPayload(symbol, query, payload);
}

export async function findVerifiedResearch(symbol: string): Promise<ResearchMatch> {
  const normalized = normalizeSymbol(symbol);
  const query = buildResearchQuery(normalized);
  return (await findViaLocalBridge(normalized, query)) ?? (await findViaAnthropicWebSearch(normalized, query)) ?? findResearch(normalized);
}
