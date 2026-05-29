import { createServer, type IncomingMessage, type ServerResponse } from "node:http";
import { spawn } from "node:child_process";

const CLAUDE_CLI = process.env.CLAUDE_CLI_PATH ?? "claude";
const port = Number(process.env.PORT ?? 8788);
const token = process.env.CRYPTO_AI_RELAY_TOKEN?.trim();
const allowedOrigins = parseAllowedOrigins(process.env.CRYPTO_ALLOWED_ORIGINS);
const rateLimitWindowMs = Number(process.env.RATE_LIMIT_WINDOW_MS ?? 60_000);
const rateLimitMax = Number(process.env.RATE_LIMIT_MAX ?? 30);
const rateBuckets = new Map<string, { count: number; resetAt: number }>();

type ChatRequest = {
  system?: string;
  messages?: Array<{ role: "user" | "assistant"; content: string }>;
};

type ResearchRequest = {
  symbol?: string;
  query?: string;
  outputContract?: unknown;
  constraints?: string[];
};

const server = createServer(async (request, response) => {
  try {
    if (request.url === "/healthz" && request.method === "GET") {
      sendJson(response, 200, { ok: true });
      return;
    }

    // CORS preflight
    if (request.method === "OPTIONS") {
      if (!setCorsHeaders(request, response)) return;
      response.writeHead(204);
      response.end();
      return;
    }

    if (request.url === "/api/chat" && request.method === "POST") {
      if (!setCorsHeaders(request, response)) return;
      if (!isAuthorized(request)) {
        sendJson(response, 401, { error: "unauthorized" });
        return;
      }
      if (!consumeRateLimit(request)) {
        sendJson(response, 429, { error: "rate_limited" });
        return;
      }

      const payload = (await readJson(request)) as ChatRequest;
      await handleChat(payload, response);
      return;
    }

    if (request.url === "/api/research" && request.method === "POST") {
      if (!setCorsHeaders(request, response)) return;
      if (!isAuthorized(request)) {
        sendJson(response, 401, { error: "unauthorized" });
        return;
      }

      const payload = (await readJson(request)) as ResearchRequest;
      const symbol = payload.symbol?.trim().toUpperCase();
      const query = payload.query?.trim();

      if (!symbol || !query) {
        sendJson(response, 400, { error: "symbol_and_query_required" });
        return;
      }

      const research = await searchWithClaudeCli(symbol, query);
      sendJson(response, 200, research);
      return;
    }

    sendJson(response, 404, { error: "not_found" });
  } catch (error) {
    const message = error instanceof Error ? error.message : "internal_error";
    sendJson(response, 500, { error: message });
  }
});

server.listen(port, () => {
  console.log(`Crypto AI relay server listening on http://127.0.0.1:${port}`);
  console.log(`  /api/chat     — AI chat (SSE streaming via Claude CLI)`);
  console.log(`  /api/research — Four Pillars research lookup`);
  console.log(`  /healthz      — Health check`);
});

// ---------------------------------------------------------------------------
// Chat handler — streams SSE via Claude CLI
// ---------------------------------------------------------------------------

async function handleChat(payload: ChatRequest, response: ServerResponse) {
  const systemPrompt = payload.system ?? "";
  const messages = Array.isArray(payload.messages) ? payload.messages : [];

  if (messages.length === 0) {
    sendJson(response, 400, { error: "messages_required" });
    return;
  }

  response.writeHead(200, {
    "Content-Type": "text/event-stream",
    "Cache-Control": "no-cache, no-transform",
    Connection: "keep-alive",
    "X-Accel-Buffering": "no",
  });
  response.flushHeaders();

  const encoder = (text: string) => response.write(text);
  const sendSSE = (data: string) => encoder(`data: ${data}\n\n`);

  try {
    await streamClaudeCliChat(systemPrompt, messages, (text) => {
      sendSSE(JSON.stringify({ text }));
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "AI 응답 생성 실패";
    sendSSE(JSON.stringify({ error: message }));
  } finally {
    sendSSE("[DONE]");
    response.end();
  }
}

function formatPromptFromMessages(
  messages: Array<{ role: string; content: string }>,
): string {
  const parts: string[] = [];

  for (const msg of messages.slice(0, -1)) {
    const label = msg.role === "user" ? "사용자" : "어시스턴트";
    parts.push(`[${label}]: ${msg.content}`);
  }

  const lastMsg = messages[messages.length - 1];
  if (lastMsg) {
    parts.push(lastMsg.content);
  }

  return parts.join("\n\n");
}

function streamClaudeCliChat(
  systemPrompt: string,
  messages: Array<{ role: string; content: string }>,
  onText: (text: string) => void,
): Promise<void> {
  return new Promise((resolve, reject) => {
    const prompt = formatPromptFromMessages(messages);
    const model = process.env.CLAUDE_MODEL ?? "sonnet";
    const timeoutMs = Number(process.env.CLAUDE_CODE_TIMEOUT_MS ?? 300_000);
    let settled = false;

    const child = spawn(
      CLAUDE_CLI,
      [
        "-p",
        prompt,
        "--output-format",
        "text",
        "--no-session-persistence",
        "--model",
        model,
        "--system-prompt",
        systemPrompt,
        "--allowedTools",
        "WebSearch,WebFetch,Read",
        "--dangerously-skip-permissions",
      ],
      {
        stdio: ["ignore", "pipe", "pipe"],
        env: { ...process.env, NO_COLOR: "1" },
      },
    );

    const timeout = setTimeout(() => {
      if (settled) return;
      settled = true;
      child.kill("SIGTERM");
      reject(new Error(`claude_cli_timeout_after_${timeoutMs}ms`));
    }, timeoutMs);

    child.stdout.on("data", (chunk: Buffer) => {
      const text = chunk.toString();
      if (text) onText(text);
    });

    let stderrOutput = "";
    child.stderr.on("data", (chunk: Buffer) => {
      stderrOutput += chunk.toString();
    });

    child.on("close", (code) => {
      if (settled) return;
      settled = true;
      clearTimeout(timeout);
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`claude_cli_exit_${code}: ${stderrOutput.slice(0, 500)}`));
      }
    });

    child.on("error", (err) => {
      if (settled) return;
      settled = true;
      clearTimeout(timeout);
      reject(new Error(`claude_cli_spawn_error: ${err.message}`));
    });
  });
}

// ---------------------------------------------------------------------------
// Research handler — single-shot Claude CLI for Four Pillars lookup
// ---------------------------------------------------------------------------

type ResearchResponse = {
  title: string;
  url: string;
  summary: string;
  displayMode?: "ai-synthesis";
  originalLanguage?: "en" | "ko" | "unknown";
  thesis?: string;
  keyPoints?: string[];
  risks?: string[];
  confidence?: "high" | "medium" | "low";
};

function searchWithClaudeCli(symbol: string, query: string) {
  return new Promise<ResearchResponse>((resolve, reject) => {
    const prompt = [
      `Symbol: ${symbol}`,
      `Search query: ${query}`,
      "Find the best matching Four Pillars research article for this crypto asset.",
      "Use web search/fetch. Prefer direct article URLs under research.4pillars.io/en/research over listing pages.",
      "Return an AI-synthesized research card only. Do not reproduce original article body text.",
      "Use thesis/keyPoints/risks for the synthesized interpretation and keep claims conservative when evidence is thin.",
      'Return strict JSON only: {"title":"...","url":"https://...","summary":"Korean one sentence","displayMode":"ai-synthesis","originalLanguage":"en|ko|unknown","thesis":"...","keyPoints":["..."],"risks":["..."],"confidence":"high|medium|low"}',
    ].join("\n");

    let settled = false;
    let stdout = "";
    let stderr = "";
    const timeoutMs = Number(process.env.CLAUDE_CODE_TIMEOUT_MS ?? 180_000);

    const child = spawn(
      CLAUDE_CLI,
      [
        "-p",
        prompt,
        "--output-format",
        "text",
        "--no-session-persistence",
        "--model",
        process.env.CLAUDE_MODEL ?? "sonnet",
        "--system-prompt",
        "You are a precise crypto research retrieval module. Never invent URLs. Return JSON only.",
        "--allowedTools",
        "WebSearch,WebFetch",
        "--dangerously-skip-permissions",
      ],
      {
        stdio: ["ignore", "pipe", "pipe"],
        env: { ...process.env, NO_COLOR: "1" },
      },
    );

    const timeout = setTimeout(() => {
      if (settled) return;
      settled = true;
      child.kill("SIGTERM");
      reject(new Error(`claude_cli_timeout_after_${timeoutMs}ms`));
    }, timeoutMs);

    child.stdout.on("data", (chunk: Buffer) => {
      stdout += chunk.toString();
    });

    child.stderr.on("data", (chunk: Buffer) => {
      stderr += chunk.toString();
    });

    child.on("close", (code) => {
      if (settled) return;
      settled = true;
      clearTimeout(timeout);

      if (code !== 0) {
        reject(new Error(`claude_cli_exit_${code}: ${stderr.slice(0, 500)}`));
        return;
      }

      try {
        const parsed = extractResearchJson(stdout);
        if (!parsed.title || !parsed.url || !parsed.summary) throw new Error("claude_response_incomplete_json");
        resolve(parsed);
      } catch (error) {
        reject(error);
      }
    });

    child.on("error", (error) => {
      if (settled) return;
      settled = true;
      clearTimeout(timeout);
      reject(error);
    });
  });
}

function extractResearchJson(text: string) {
  const match = text.match(/\{[\s\S]*\}/);
  if (!match) throw new Error("claude_response_missing_json");
  return JSON.parse(match[0]) as ResearchResponse;
}

// ---------------------------------------------------------------------------
// Shared utilities
// ---------------------------------------------------------------------------

function setCorsHeaders(request: IncomingMessage, response: ServerResponse): boolean {
  const origin = request.headers.origin;
  if (!origin) return true;

  if (allowedOrigins.size > 0 && !allowedOrigins.has(origin)) {
    sendJson(response, 403, { error: "origin_not_allowed" });
    return false;
  }

  response.setHeader("Access-Control-Allow-Origin", origin);
  response.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  response.setHeader("Access-Control-Allow-Headers", "Content-Type, X-Crypto-AI-Token");
  response.setHeader("Vary", "Origin");
  return true;
}

function isAuthorized(request: IncomingMessage): boolean {
  if (!token) return true;
  return request.headers["x-crypto-ai-token"] === token;
}

function consumeRateLimit(request: IncomingMessage): boolean {
  const key = clientKey(request);
  const now = Date.now();
  const bucket = rateBuckets.get(key);

  if (!bucket || bucket.resetAt <= now) {
    rateBuckets.set(key, { count: 1, resetAt: now + rateLimitWindowMs });
    return true;
  }

  if (bucket.count >= rateLimitMax) return false;
  bucket.count += 1;
  return true;
}

function clientKey(request: IncomingMessage): string {
  const forwarded = request.headers["cf-connecting-ip"] ?? request.headers["x-forwarded-for"];
  const raw = Array.isArray(forwarded) ? forwarded[0] : forwarded;
  return raw?.split(",")[0]?.trim() || request.socket.remoteAddress || "unknown";
}

function readJson(request: IncomingMessage): Promise<unknown> {
  return new Promise((resolve, reject) => {
    let body = "";
    request.setEncoding("utf8");
    request.on("data", (chunk) => {
      body += chunk;
      if (body.length > 1_000_000) {
        reject(new Error("request_too_large"));
        request.destroy();
      }
    });
    request.on("end", () => {
      try {
        resolve(body ? JSON.parse(body) : {});
      } catch {
        reject(new Error("invalid_json"));
      }
    });
    request.on("error", reject);
  });
}

function sendJson(response: ServerResponse, status: number, payload: unknown) {
  response.writeHead(status, {
    "content-type": "application/json; charset=utf-8",
    "cache-control": "no-store",
  });
  response.end(JSON.stringify(payload));
}

function parseAllowedOrigins(value: string | undefined): Set<string> {
  return new Set(
    (value ?? "")
      .split(",")
      .map((origin) => origin.trim())
      .filter(Boolean),
  );
}
