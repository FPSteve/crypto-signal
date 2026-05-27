export type ResearchMatch = {
  symbol: string;
  slug: string;
  title: string;
  url: string;
  status: "candidate";
};

const KNOWN_SLUGS: Record<string, string> = {
  AAVE: "aave",
  ARB: "arbitrum",
  AVAX: "avalanche",
  BTC: "bitcoin",
  ETH: "ethereum",
  LINK: "chainlink",
  NEAR: "near-protocol",
  ONDO: "ondo-finance",
  OP: "optimism",
  RENDER: "render-network",
  SOL: "solana",
  SUI: "sui",
  WLD: "worldcoin",
};

export function findResearch(symbol: string): ResearchMatch | null {
  const normalized = symbol.toUpperCase();
  const slug = KNOWN_SLUGS[normalized] ?? normalized.toLowerCase();

  return {
    symbol: normalized,
    slug,
    title: `${normalized} Four Pillars Research`,
    url: `https://research.4pillars.io/en/research/${slug}`,
    status: "candidate",
  };
}
