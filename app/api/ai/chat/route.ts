import { NextRequest, NextResponse } from "next/server";
import { buildSystemPrompt, streamChat, type ChatMessage } from "@/lib/ai-chat";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as { messages?: ChatMessage[] };

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

    // Stream the response
    const stream = await streamChat(systemPrompt, body.messages);

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
