import { buildSignal, summarizeRegime } from "./signal-engine";
import { findResearch } from "./four-pillars";
import { getDayCandles, getTopKrwTickers } from "./upbit";

export type ChatMessage = {
  role: "user" | "assistant";
  content: string;
};

// ---------------------------------------------------------------------------
// Context builder — fetches live signal data and assembles the system prompt
// ---------------------------------------------------------------------------

async function buildContext() {
  const tickers = await getTopKrwTickers(12);
  const signals = await Promise.all(
    tickers.slice(0, 8).map(async (ticker) => {
      const candles = await getDayCandles(ticker.market, 220);
      return buildSignal(ticker, candles);
    }),
  );
  const btcCandles = await getDayCandles("KRW-BTC", 220);
  const regime = summarizeRegime(btcCandles);
  const sorted = signals.sort((a, b) => b.score - a.score);

  const signalSummary = sorted
    .map((s) => {
      const research = findResearch(s.symbol);
      return [
        `${s.symbol} (${s.name ?? s.market})`,
        `  가격: ${s.price.toLocaleString()}원 | 24h: ${s.change24h > 0 ? "+" : ""}${s.change24h}%`,
        `  버킷: ${s.bucket} | 스코어: ${s.score}/100`,
        `  RSI14: ${s.metrics.rsi14 ?? "n/a"} | EMA20>${s.metrics.above20 ? "가격" : "미만"}`,
        `  7d: ${s.metrics.change7d ?? "n/a"}% | 30d: ${s.metrics.change30d ?? "n/a"}%`,
        `  추세: ${s.metrics.trendUp ? "EMA20>50>200 상승" : "확인필요"}`,
        `  손절: ${s.stopLoss.toLocaleString()}원`,
        `  테시스: ${s.thesis}`,
        `  Four Pillars: ${research.url}`,
      ].join("\n");
    })
    .join("\n\n");

  return { regime, signalSummary, signalCount: sorted.length };
}

export async function buildSystemPrompt(): Promise<string> {
  const { regime, signalSummary, signalCount } = await buildContext();

  return `당신은 한국어를 사용하는 크립토 헤지펀드 시니어 리서치 애널리스트입니다.
Upbit KRW 마켓을 전문으로 분석하며, 매크로 레짐, 기술적 지표, 온체인 데이터, Four Pillars 리서치를 종합합니다.

## 현재 시장 레짐
- 판정: ${regime.label}
- BTC 구조: ${regime.structure}
- 7일 변동: ${regime.change7d ?? "n/a"}% | 30일 변동: ${regime.change30d ?? "n/a"}%
- 참고: ${regime.note}

## 실시간 시그널 (거래대금 상위 ${signalCount}종목)
${signalSummary}

## 행동 규칙
1. 투자 조언이 아닌 리서치 보조 의견만 제공합니다. 반드시 면책 조항을 포함하세요.
2. 구체적인 매수/매도 주문 금액이나 타이밍을 지시하지 않습니다.
3. 데이터에 기반한 분석만 하고, 확인되지 않은 정보는 "확인 필요"로 표시합니다.
4. 사용자가 특정 코인을 물어보면 위 시그널 데이터에서 해당 코인을 찾아 분석합니다.
5. 한국어로 답변하되, 코인 심볼(BTC, ETH 등)은 영어 그대로 사용합니다.
6. 답변은 구조적이고 간결하게, 핵심 수치를 포함합니다.
7. 리스크 관리를 항상 강조합니다.`;
}

// ---------------------------------------------------------------------------
// Streaming via Anthropic Messages API (Tier 2)
// ---------------------------------------------------------------------------

export async function streamAnthropicChat(
  systemPrompt: string,
  messages: ChatMessage[],
): Promise<ReadableStream<Uint8Array>> {
  const apiKey = process.env.ANTHROPIC_API_KEY?.trim();
  if (!apiKey) throw new Error("ANTHROPIC_API_KEY not configured");

  const model = process.env.CLAUDE_CHAT_MODEL ?? process.env.CLAUDE_MODEL ?? "claude-sonnet-4-5";

  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "anthropic-version": "2023-06-01",
      "content-type": "application/json",
      "x-api-key": apiKey,
    },
    body: JSON.stringify({
      model,
      max_tokens: 2048,
      temperature: 0.3,
      stream: true,
      system: systemPrompt,
      messages: messages.map((m) => ({ role: m.role, content: m.content })),
    }),
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Anthropic API ${res.status}: ${body}`);
  }

  if (!res.body) throw new Error("No response body from Anthropic");

  // Transform SSE from Anthropic into our own text/event-stream
  return transformAnthropicStream(res.body);
}

function transformAnthropicStream(source: ReadableStream<Uint8Array>): ReadableStream<Uint8Array> {
  const encoder = new TextEncoder();
  const decoder = new TextDecoder();
  let buffer = "";

  return new ReadableStream<Uint8Array>({
    async start(controller) {
      const reader = source.getReader();

      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split("\n");
          buffer = lines.pop() ?? "";

          for (const line of lines) {
            if (!line.startsWith("data: ")) continue;
            const data = line.slice(6).trim();
            if (data === "[DONE]") continue;

            try {
              const event = JSON.parse(data);
              if (event.type === "content_block_delta" && event.delta?.type === "text_delta") {
                const text = event.delta.text;
                if (text) {
                  controller.enqueue(encoder.encode(`data: ${JSON.stringify({ text })}\n\n`));
                }
              } else if (event.type === "message_stop") {
                controller.enqueue(encoder.encode("data: [DONE]\n\n"));
              } else if (event.type === "error") {
                controller.enqueue(
                  encoder.encode(`data: ${JSON.stringify({ error: event.error?.message ?? "Unknown error" })}\n\n`),
                );
              }
            } catch {
              // skip unparseable lines
            }
          }
        }
      } catch (err) {
        controller.enqueue(
          encoder.encode(`data: ${JSON.stringify({ error: String(err) })}\n\n`),
        );
      } finally {
        controller.enqueue(encoder.encode("data: [DONE]\n\n"));
        controller.close();
      }
    },
  });
}

// ---------------------------------------------------------------------------
// Streaming via local Mac mini relay (Tier 1)
// ---------------------------------------------------------------------------

export async function streamRelayChat(
  systemPrompt: string,
  messages: ChatMessage[],
): Promise<ReadableStream<Uint8Array>> {
  const relayUrl = process.env.CRYPTO_AI_RELAY_URL?.trim();
  if (!relayUrl) throw new Error("CRYPTO_AI_RELAY_URL not configured");

  const token = process.env.CRYPTO_AI_RELAY_TOKEN?.trim();

  const res = await fetch(new URL("/api/chat", relayUrl), {
    method: "POST",
    headers: {
      "content-type": "application/json",
      ...(token ? { "x-crypto-ai-token": token } : {}),
    },
    body: JSON.stringify({ system: systemPrompt, messages }),
    cache: "no-store",
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Relay ${res.status}: ${body}`);
  }

  if (!res.body) throw new Error("No response body from relay");

  // Pass through — relay already sends text/event-stream
  return res.body;
}

// ---------------------------------------------------------------------------
// Unified chat handler: try Tier 1, fall back to Tier 2
// ---------------------------------------------------------------------------

export async function streamChat(
  systemPrompt: string,
  messages: ChatMessage[],
): Promise<ReadableStream<Uint8Array>> {
  // Tier 1: Local relay
  if (process.env.CRYPTO_AI_RELAY_URL?.trim()) {
    try {
      return await streamRelayChat(systemPrompt, messages);
    } catch {
      // fall through to Tier 2
    }
  }

  // Tier 2: Direct Anthropic API
  if (process.env.ANTHROPIC_API_KEY?.trim()) {
    return streamAnthropicChat(systemPrompt, messages);
  }

  // Neither configured
  const encoder = new TextEncoder();
  return new ReadableStream<Uint8Array>({
    start(controller) {
      controller.enqueue(
        encoder.encode(
          `data: ${JSON.stringify({ text: "AI 런타임이 설정되지 않았습니다. CRYPTO_AI_RELAY_URL 또는 ANTHROPIC_API_KEY 환경 변수를 설정해 주세요." })}\n\n`,
        ),
      );
      controller.enqueue(encoder.encode("data: [DONE]\n\n"));
      controller.close();
    },
  });
}
