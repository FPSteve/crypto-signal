import { ema, percentChange, rsi } from "./indicators";
import { findResearch } from "./four-pillars";
import type { CandlePoint, UpbitTicker } from "./upbit";
import { toSymbol } from "./upbit";

export type SignalBucket = "daytrade" | "swing" | "position";

export type SignalMetrics = {
  ema20: number;
  ema50: number;
  ema200: number;
  rsi14: number | null;
  change7d: number | null;
  change30d: number | null;
  trendUp: boolean;
  above20: boolean;
};

export type CoinSignal = {
  market: string;
  symbol: string;
  name?: string;
  bucket: SignalBucket;
  score: number;
  price: number;
  change24h: number;
  volumeKrw24h: number;
  stopLoss: number;
  thesis: string;
  signals: string[];
  metrics: SignalMetrics;
};

export type MarketRegime = ReturnType<typeof summarizeRegime>;

export type BucketReport = {
  bucket: SignalBucket;
  label: string;
  symbols: string[];
  rationale: string;
  riskRule: string;
  fourPillarsContext: string;
};

export type DailySignalReport = {
  asOf: string;
  engine: "claude" | "deterministic-fallback";
  model: string;
  summary: string;
  disclaimer: string;
  regime: MarketRegime;
  buckets: Record<SignalBucket, BucketReport>;
  signals: CoinSignal[];
};

function classifyBucket(change7d: number | null, rsi14: number | null, trendUp: boolean): SignalBucket {
  if ((change7d ?? 0) > 8 && (rsi14 ?? 50) > 58) return "daytrade";
  if (trendUp && (rsi14 ?? 50) < 70) return "position";
  return "swing";
}

export function buildSignal(ticker: UpbitTicker & { name?: string }, candles: CandlePoint[]): CoinSignal {
  const ema20 = ema(candles, 20).at(-1)?.value ?? ticker.trade_price;
  const ema50 = ema(candles, 50).at(-1)?.value ?? ticker.trade_price;
  const ema200 = ema(candles, 200).at(-1)?.value ?? ema50;
  const rsi14 = rsi(candles);
  const change7d = percentChange(candles, 7);
  const change30d = percentChange(candles, 30);
  const trendUp = ema20 > ema50 && ema50 >= ema200;
  const above20 = ticker.trade_price > ema20;
  const volumeScore = Math.min(20, Math.log10(Math.max(ticker.acc_trade_price_24h, 1)) * 2);

  let score = 20 + volumeScore;
  if (above20) score += 10;
  if (trendUp) score += 20;
  if ((change7d ?? 0) > 5) score += 12;
  if ((change30d ?? 0) > 10) score += 10;
  if ((rsi14 ?? 50) >= 45 && (rsi14 ?? 50) <= 68) score += 8;
  if ((rsi14 ?? 50) > 78) score -= 15;

  const bucket = classifyBucket(change7d, rsi14, trendUp);
  const stopLoss = Math.min(ema20, ticker.low_price);
  const metrics = {
    ema20,
    ema50,
    ema200,
    rsi14,
    change7d,
    change30d,
    trendUp,
    above20,
  };
  const signals = [
    `24h ${ticker.signed_change_rate >= 0 ? "+" : ""}${(ticker.signed_change_rate * 100).toFixed(1)}%`,
    `7d ${change7d === null ? "n/a" : `${change7d > 0 ? "+" : ""}${change7d}%`}`,
    `RSI ${rsi14 ?? "n/a"}`,
    trendUp ? "EMA 20>50 구조" : above20 ? "가격 EMA20 상회" : "추세 확인 필요",
  ];

  return {
    market: ticker.market,
    symbol: toSymbol(ticker.market),
    name: ticker.name,
    bucket,
    score: Math.max(0, Math.min(100, Math.round(score))),
    price: ticker.trade_price,
    change24h: Number((ticker.signed_change_rate * 100).toFixed(2)),
    volumeKrw24h: ticker.acc_trade_price_24h,
    stopLoss,
    thesis:
      trendUp
        ? `${toSymbol(ticker.market)}는 단기 EMA가 중기선 위에 있어 포지션 후보로 추적할 만합니다.`
        : `${toSymbol(ticker.market)}는 거래대금과 단기 모멘텀을 우선 확인하는 전술 후보입니다.`,
    signals,
    metrics,
  };
}

export function summarizeRegime(btcCandles: CandlePoint[]) {
  const last = btcCandles.at(-1);
  const ema50 = ema(btcCandles, 50).at(-1)?.value;
  const ema200 = ema(btcCandles, 200).at(-1)?.value;
  const change7d = percentChange(btcCandles, 7);
  const change30d = percentChange(btcCandles, 30);
  const bear = Boolean(last && ema50 && ema200 && last.close < ema50 && ema50 < ema200);

  return {
    label: bear ? "BEAR" : "SELECTIVE",
    change7d,
    change30d,
    structure: last && ema50 && ema200 ? `가격 ${last.close < ema50 ? "<" : ">"} EMA50 ${ema50 < ema200 ? "<" : ">"} EMA200` : "n/a",
    note: bear
      ? "시장 전체 베타보다 상대강도 강한 알트만 선별하는 구간입니다."
      : "BTC 구조가 완전 약세는 아니지만, 거래대금과 추세 확인이 우선입니다.",
  };
}

const bucketLabels: Record<SignalBucket, string> = {
  daytrade: "데이트레이드",
  swing: "스윙",
  position: "포지션",
};

const defaultRiskRules: Record<SignalBucket, string> = {
  daytrade: "진입 후 당일 저점 또는 EMA20 이탈 시 축소하고, 단기 과열 RSI 75 이상에서는 추격 매수를 금지합니다.",
  swing: "분할 진입만 허용하고, 7일 모멘텀이 음전환하거나 손절 기준을 종가로 이탈하면 포지션을 줄입니다.",
  position: "BTC 레짐이 BEAR로 유지되면 비중을 낮게 시작하고, EMA50 재이탈 또는 핵심 thesis 훼손 시 재평가합니다.",
};

function groupByBucket(signals: CoinSignal[]) {
  return {
    daytrade: signals.filter((signal) => signal.bucket === "daytrade"),
    swing: signals.filter((signal) => signal.bucket === "swing"),
    position: signals.filter((signal) => signal.bucket === "position"),
  } satisfies Record<SignalBucket, CoinSignal[]>;
}

function researchContextFor(signals: CoinSignal[]): string {
  const matches = signals
    .map((signal) => findResearch(signal.symbol))
    .filter((research): research is NonNullable<typeof research> => Boolean(research))
    .map((research) => `${research.symbol}: ${research.url}`);

  if (matches.length === 0) {
    return "Four Pillars 후보 리서치가 매칭되지 않았습니다.";
  }

  return `후보 리서치 링크: ${matches.join(", ")}`;
}

function fallbackBucketReport(bucket: SignalBucket, signals: CoinSignal[]): BucketReport {
  const symbols = signals.map((signal) => signal.symbol);
  const top = signals[0];
  const rationale = top
    ? `${symbols.join(", ")} 중심으로 점수, 거래대금, EMA/RSI 구조를 확인합니다. 최상위 후보 ${top.symbol}는 ${top.thesis}`
    : "현재 공개 Upbit 시세 기준으로 이 버킷에 강한 후보가 없습니다.";

  return {
    bucket,
    label: bucketLabels[bucket],
    symbols,
    rationale,
    riskRule: defaultRiskRules[bucket],
    fourPillarsContext: researchContextFor(signals),
  };
}

function buildFallbackReport(signals: CoinSignal[], regime: MarketRegime): DailySignalReport {
  const grouped = groupByBucket(signals);

  return {
    asOf: new Date().toISOString(),
    engine: "deterministic-fallback",
    model: "local-rules",
    summary: `${regime.label} 레짐에서는 거래대금 상위 종목을 버킷별로 나누고, 손절 기준과 Four Pillars 후보 리서치 확인을 우선합니다.`,
    disclaimer: "투자 조언이 아닌 리서치 보조 신호입니다. 실제 주문 전 별도 검증과 리스크 관리가 필요합니다.",
    regime,
    buckets: {
      daytrade: fallbackBucketReport("daytrade", grouped.daytrade),
      swing: fallbackBucketReport("swing", grouped.swing),
      position: fallbackBucketReport("position", grouped.position),
    },
    signals,
  };
}

function compactSignalForPrompt(signal: CoinSignal) {
  return {
    market: signal.market,
    symbol: signal.symbol,
    name: signal.name,
    bucket: signal.bucket,
    score: signal.score,
    price: signal.price,
    change24h: signal.change24h,
    volumeKrw24h: signal.volumeKrw24h,
    stopLoss: signal.stopLoss,
    thesis: signal.thesis,
    metrics: signal.metrics,
    fourPillars: findResearch(signal.symbol),
  };
}

function extractJson(text: string) {
  const match = text.match(/\{[\s\S]*\}/);
  if (!match) throw new Error("Claude response did not contain JSON.");
  return JSON.parse(match[0]) as Partial<Pick<DailySignalReport, "summary" | "buckets">>;
}

function normalizeBucketReport(bucket: SignalBucket, value: unknown, fallback: BucketReport): BucketReport {
  if (!value || typeof value !== "object") return fallback;
  const candidate = value as Partial<BucketReport>;

  return {
    bucket,
    label: bucketLabels[bucket],
    symbols: Array.isArray(candidate.symbols) ? candidate.symbols.map(String) : fallback.symbols,
    rationale: typeof candidate.rationale === "string" && candidate.rationale.trim() ? candidate.rationale : fallback.rationale,
    riskRule: typeof candidate.riskRule === "string" && candidate.riskRule.trim() ? candidate.riskRule : fallback.riskRule,
    fourPillarsContext:
      typeof candidate.fourPillarsContext === "string" && candidate.fourPillarsContext.trim()
        ? candidate.fourPillarsContext
        : fallback.fourPillarsContext,
  };
}

async function callClaudeDailyReport(signals: CoinSignal[], regime: MarketRegime, fallback: DailySignalReport) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return fallback;

  const model = process.env.CLAUDE_MODEL ?? "claude-sonnet-4-5";
  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "anthropic-version": "2023-06-01",
      "content-type": "application/json",
      "x-api-key": apiKey,
    },
    body: JSON.stringify({
      model,
      max_tokens: 1800,
      temperature: 0.2,
      system:
        "You are a crypto research engine for KRW Upbit markets. Return strict JSON only. Do not give order execution instructions. Treat Four Pillars links as candidate research context, not verified facts.",
      messages: [
        {
          role: "user",
          content: JSON.stringify({
            task:
              "Create a daily signal report with exactly three bucket objects: daytrade, swing, position. Each bucket must include symbols, rationale, riskRule, and fourPillarsContext in Korean.",
            outputShape: {
              summary: "string",
              buckets: {
                daytrade: { symbols: ["string"], rationale: "string", riskRule: "string", fourPillarsContext: "string" },
                swing: { symbols: ["string"], rationale: "string", riskRule: "string", fourPillarsContext: "string" },
                position: { symbols: ["string"], rationale: "string", riskRule: "string", fourPillarsContext: "string" },
              },
            },
            regime,
            signals: signals.map(compactSignalForPrompt),
          }),
        },
      ],
    }),
    next: { revalidate: 60 * 60 },
  });

  if (!res.ok) {
    return fallback;
  }

  const payload = (await res.json()) as { content?: Array<{ type: string; text?: string }> };
  const text = payload.content?.find((item) => item.type === "text")?.text;
  if (!text) return fallback;

  try {
    const parsed = extractJson(text);
    return {
      ...fallback,
      engine: "claude" as const,
      model,
      summary: typeof parsed.summary === "string" && parsed.summary.trim() ? parsed.summary : fallback.summary,
      buckets: {
        daytrade: normalizeBucketReport("daytrade", parsed.buckets?.daytrade, fallback.buckets.daytrade),
        swing: normalizeBucketReport("swing", parsed.buckets?.swing, fallback.buckets.swing),
        position: normalizeBucketReport("position", parsed.buckets?.position, fallback.buckets.position),
      },
    };
  } catch {
    return fallback;
  }
}

export async function buildDailySignalReport(signals: CoinSignal[], regime: MarketRegime): Promise<DailySignalReport> {
  const fallback = buildFallbackReport(signals, regime);
  return callClaudeDailyReport(signals, regime, fallback);
}
