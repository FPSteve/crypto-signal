"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ArrowUp, Loader2, MessageSquare, Trash2 } from "lucide-react";

type Message = {
  id: string;
  role: "user" | "assistant";
  content: string;
};

function uid() {
  return Math.random().toString(36).slice(2, 10) + Date.now().toString(36);
}

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const abortRef = useRef<AbortController | null>(null);

  const scrollToBottom = useCallback(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  // Auto-resize textarea
  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
    const el = e.target;
    el.style.height = "auto";
    el.style.height = Math.min(el.scrollHeight, 200) + "px";
  };

  const sendMessage = async () => {
    const text = input.trim();
    if (!text || isStreaming) return;

    const userMsg: Message = { id: uid(), role: "user", content: text };
    const assistantMsg: Message = { id: uid(), role: "assistant", content: "" };

    setMessages((prev) => [...prev, userMsg, assistantMsg]);
    setInput("");
    setIsStreaming(true);

    // Reset textarea height
    if (inputRef.current) {
      inputRef.current.style.height = "auto";
    }

    const apiMessages = [...messages, userMsg].map((m) => ({
      role: m.role,
      content: m.content,
    }));

    const controller = new AbortController();
    abortRef.current = controller;

    try {
      const res = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: apiMessages }),
        signal: controller.signal,
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: "요청 실패" }));
        setMessages((prev) =>
          prev.map((m) =>
            m.id === assistantMsg.id
              ? { ...m, content: `오류: ${err.error ?? res.statusText}` }
              : m,
          ),
        );
        setIsStreaming(false);
        return;
      }

      const reader = res.body?.getReader();
      if (!reader) throw new Error("No reader");

      const decoder = new TextDecoder();
      let buffer = "";
      let accumulated = "";

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
            const parsed = JSON.parse(data) as { text?: string; error?: string };
            if (parsed.error) {
              accumulated += `\n\n[오류: ${parsed.error}]`;
            } else if (parsed.text) {
              accumulated += parsed.text;
            }
          } catch {
            // skip
          }
        }

        setMessages((prev) =>
          prev.map((m) =>
            m.id === assistantMsg.id ? { ...m, content: accumulated } : m,
          ),
        );
      }
    } catch (err) {
      if ((err as Error).name !== "AbortError") {
        setMessages((prev) =>
          prev.map((m) =>
            m.id === assistantMsg.id
              ? { ...m, content: `오류: ${(err as Error).message}` }
              : m,
          ),
        );
      }
    } finally {
      setIsStreaming(false);
      abortRef.current = null;
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const clearChat = () => {
    if (isStreaming) {
      abortRef.current?.abort();
    }
    setMessages([]);
    setInput("");
  };

  return (
    <main className="flex min-h-[calc(100dvh-7rem)] flex-col bg-[#080a0d]">
      {/* Header */}
      <header className="shrink-0 border-b border-white/10 px-4 py-3 sm:px-6">
        <div className="mx-auto flex max-w-3xl items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="text-sm text-gray-500 transition-colors hover:text-gray-300"
            >
              Signal Hub
            </Link>
            <span className="text-gray-700">/</span>
            <div className="flex items-center gap-2">
              <MessageSquare size={16} className="text-emerald-400" />
              <h1 className="text-sm font-semibold text-white">AI 리서치 채팅</h1>
            </div>
          </div>
          <button
            onClick={clearChat}
            className="flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs text-gray-500 transition-colors hover:bg-white/5 hover:text-gray-300"
            title="대화 초기화"
          >
            <Trash2 size={13} />
            초기화
          </button>
        </div>
      </header>

      {/* Messages area */}
      <div className="flex-1 overflow-y-auto">
        <div className="mx-auto max-w-3xl px-4 py-6 sm:px-6">
          {messages.length === 0 && (
            <EmptyState onSuggestion={(text) => { setInput(text); inputRef.current?.focus(); }} />
          )}

          {messages.map((msg) => (
            <MessageBubble key={msg.id} message={msg} isStreaming={isStreaming && msg === messages.at(-1) && msg.role === "assistant"} />
          ))}
          <div ref={bottomRef} />
        </div>
      </div>

      {/* Input bar */}
      <div className="shrink-0 border-t border-white/10 bg-[#080a0d] px-4 pb-4 pt-3 sm:px-6">
        <div className="mx-auto max-w-3xl">
          <div className="relative flex items-end rounded-xl border border-white/10 bg-white/[0.03] focus-within:border-white/20">
            <textarea
              ref={inputRef}
              value={input}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              placeholder="시장 분석, 종목 질문, 전략 상담..."
              rows={1}
              className="flex-1 resize-none bg-transparent px-4 py-3 text-sm text-white placeholder-gray-600 outline-none"
              disabled={isStreaming}
            />
            <button
              onClick={sendMessage}
              disabled={!input.trim() || isStreaming}
              className="m-1.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-emerald-500 text-black transition-opacity disabled:opacity-30"
            >
              {isStreaming ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <ArrowUp size={16} />
              )}
            </button>
          </div>
          <p className="mt-2 text-center text-[11px] text-gray-600">
            투자 조언이 아닌 리서치 보조입니다. 실제 투자 전 반드시 별도 검증하세요.
          </p>
        </div>
      </div>
    </main>
  );
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function EmptyState({ onSuggestion }: { onSuggestion: (text: string) => void }) {
  const suggestions = [
    "현재 시장 레짐과 상위 종목 분석해줘",
    "BTC 기술적 분석 부탁해",
    "데이트레이드 후보 추천해줘",
    "리스크 관리 전략 알려줘",
  ];

  return (
    <div className="flex flex-col items-center justify-center py-20">
      <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-500/10">
        <MessageSquare size={28} className="text-emerald-400" />
      </div>
      <h2 className="text-lg font-semibold text-white">크립토 리서치 에이전트</h2>
      <p className="mt-2 max-w-md text-center text-sm text-gray-500">
        Upbit KRW 마켓 실시간 시그널과 Four Pillars 리서치를 기반으로 분석합니다.
      </p>
      <div className="mt-8 grid w-full max-w-md grid-cols-1 gap-2 sm:grid-cols-2">
        {suggestions.map((text) => (
          <button
            key={text}
            onClick={() => onSuggestion(text)}
            className="rounded-lg border border-white/10 bg-white/[0.02] px-4 py-3 text-left text-sm text-gray-400 transition-colors hover:border-white/20 hover:bg-white/[0.05] hover:text-gray-200"
          >
            {text}
          </button>
        ))}
      </div>
    </div>
  );
}

function MessageBubble({
  message,
  isStreaming,
}: {
  message: Message;
  isStreaming: boolean;
}) {
  const isUser = message.role === "user";

  return (
    <div className={`mb-4 flex ${isUser ? "justify-end" : "justify-start"}`}>
      <div
        className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
          isUser
            ? "bg-emerald-500/15 text-emerald-50"
            : "bg-white/[0.04] text-gray-200"
        }`}
      >
        {message.content ? (
          <div className="whitespace-pre-wrap break-words">{message.content}</div>
        ) : isStreaming ? (
          <div className="flex items-center gap-2 text-gray-500">
            <Loader2 size={14} className="animate-spin" />
            분석 중...
          </div>
        ) : null}
        {isStreaming && message.content && (
          <span className="ml-0.5 inline-block h-4 w-0.5 animate-pulse bg-gray-400" />
        )}
      </div>
    </div>
  );
}
