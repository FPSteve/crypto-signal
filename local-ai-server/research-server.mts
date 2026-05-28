import { createServer, type IncomingMessage, type ServerResponse } from "node:http";
import { spawn } from "node:child_process";

const CLAUDE_CLI = process.env.CLAUDE_CLI_PATH ?? "claude";
const port = Number(process.env.PORT ?? 8788);
const token = process.env.FOUR_PILLARS_BRIDGE_TOKEN?.trim();
const timeoutMs = Number(process.env.CLAUDE_CODE_TIMEOUT_MS ?? 180_000);

type ResearchRequest = {
  symbol?: string;
  query?: string;
};

const server = createServer(async (request, response) => {
  try {
    if (request.url === "/healthz" && request.method === "GET") {
      sendJson(response, 200, { ok: true });
      return;
    }

    if (request.url === "/api/research" && request.method === "POST") {
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
  console.log(`Four Pillars research bridge listening on http://127.0.0.1:${port}`);
});

function isAuthorized(request: IncomingMessage) {
  if (!token) return true;
  return request.headers["x-research-token"] === token;
}

function readJson(request: IncomingMessage) {
  return new Promise<unknown>((resolve, reject) => {
    let body = "";
    request.on("data", (chunk) => {
      body += chunk.toString();
      if (body.length > 20_000) {
        request.destroy();
        reject(new Error("request_too_large"));
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

function extractJson(text: string) {
  const match = text.match(/\{[\s\S]*\}/);
  if (!match) throw new Error("claude_response_missing_json");
  return JSON.parse(match[0]) as { title?: string; url?: string; summary?: string };
}

function searchWithClaudeCli(symbol: string, query: string) {
  return new Promise<{ title: string; url: string; summary: string }>((resolve, reject) => {
    const prompt = [
      `Symbol: ${symbol}`,
      `Search query: ${query}`,
      "Find the best matching Four Pillars research article for this crypto asset.",
      "Use web search/fetch. Prefer direct article URLs under research.4pillars.io/en/research over listing pages.",
      'Return strict JSON only: {"title":"...","url":"https://...","summary":"Korean one sentence"}',
    ].join("\n");

    let settled = false;
    let stdout = "";
    let stderr = "";

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
        const parsed = extractJson(stdout);
        if (!parsed.title || !parsed.url || !parsed.summary) throw new Error("claude_response_incomplete_json");
        resolve({ title: parsed.title, url: parsed.url, summary: parsed.summary });
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
