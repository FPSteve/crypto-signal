import { NextRequest, NextResponse } from "next/server";
import { buildSystemPrompt, streamChat, type ChatMessage, type ChatRelayContext } from "@/lib/ai-chat";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as {
      messages?: ChatMessage[];
      market?: string;
      symbol?: string;
      context?: unknown;
      data?: ChatRelayContext;
    };

    if (!Array.isArray(body.messages) || body.messages.length === 0) {
      return NextResponse.json({ error: "messages 배열이 필요합니다." }, { status: 400 });
    }

    // Validate message shapes
    for (const msg of body.messages) {
      if (!msg.role || !msg.content || typeof msg.content !== "string") {
        return NextResponse.json({ error: "잘못된 메시지 형식입니다." }, { status: 400 });
      }
      if (msg.role !== "user" && msg.role !== "assistant") {
        return NextResponse.json({ error: "role은 user 또는 assistant만 가능합니다." }, { status: 400 });
      }
    }

    // Build system prompt with live market context
    const systemPrompt = await buildSystemPrompt();

    const relayContext = normalizeRelayContext(body);

    // Stream the response
    const stream = await streamChat(systemPrompt, body.messages, relayContext);

    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache, no-transform",
        Connection: "keep-alive",
      },
    });
  } catch (err) {
    console.error("[ai/chat] Error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "내부 서버 오류" },
      { status: 500 },
    );
  }
}

function normalizeRelayContext(body: {
  market?: string;
  symbol?: string;
  context?: unknown;
  data?: ChatRelayContext;
}): ChatRelayContext {
  const data = isRecord(body.data) ? body.data : undefined;
  const bodyContext = isRecord(body.context) ? body.context : undefined;
  const dataContext = isRecord(data?.context) ? data.context : undefined;
  const context = mergeContext(bodyContext, dataContext, data);
  const signalSummary = isRecord(context?.signalSummary) ? context.signalSummary : undefined;
  const market = stringValue(body.market ?? data?.market ?? context?.market ?? signalSummary?.market);
  const symbol = stringValue(body.symbol ?? data?.symbol ?? context?.symbol ?? signalSummary?.symbol ?? market);

  return {
    ...(market ? { market } : {}),
    ...(symbol ? { symbol } : {}),
    ...(context ? { context } : {}),
  };
}

function mergeContext(...candidates: unknown[]) {
  const merged: Record<string, unknown> = {};

  for (const candidate of candidates) {
    const record = isRecord(candidate) ? candidate : undefined;
    if (!record) continue;

    const nested = isRecord(record.context) ? record.context : undefined;
    if (nested) Object.assign(merged, nested);

    for (const key of ["market", "symbol", "signalSummary", "selectionReasoning", "fourPillarsResearch"]) {
      if (record[key] !== undefined && merged[key] === undefined) merged[key] = record[key];
    }
  }

  return Object.keys(merged).length ? merged : undefined;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function stringValue(value: unknown) {
  return typeof value === "string" && value.trim() ? value.trim() : undefined;
}
