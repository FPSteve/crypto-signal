# P2 — Route Split: Per-Page IA & Copy Spec

Owner: Design Lead · For: @EngLead implementation · Repo: `crypto-signal`
Context: nav was anchor-scroll (`/#research-desk`, `/#prices`) inside one home page. Splitting into 4 real routes, each with its own information structure. No shared "generic dashboard" layout — each page reads differently.

Principle: **one job per page.** Signals = 랭킹 보드, Research = 에디토리얼, Prices = 데이터 테이블, Chat = 대화. Don't replicate the home's mixed grid on every route.

---

## Nav contract (GlobalChrome.tsx)

Replace `navItems` hrefs and `getActiveTab` with pathname-based routing.

```ts
const navItems = [
  { label: "Signals",  href: "/",         match: "signals" },
  { label: "Research", href: "/research", match: "research" },
  { label: "Prices",   href: "/prices",   match: "prices" },
  { label: "Chat",     href: "/chat",     match: "chat" },
] as const;

function getActiveTab(pathname: string) {
  if (pathname.startsWith("/research")) return "research";
  if (pathname.startsWith("/prices"))   return "prices";
  if (pathname.startsWith("/chat"))     return "chat";
  if (pathname.startsWith("/coin"))     return "signals"; // detail rolls up to Signals
  return "signals";
}
```
- Drop the `#` branch in `NavItem` — all four are now `next/link` routes.
- Remove `hash` state + `hashchange` listener (lines 72, 77-82); `activeTab = getActiveTab(pathname)`.
- Keep ticker tape + logo as-is (global chrome stays).

---

## 1. Signals — `/` (slim ranking board)

Job: at-a-glance ranked decision board. Strip the embedded research-desk + prices-sidebar sections (those move out).

Layout hierarchy (top → bottom):
1. **Regime banner** — keep `MarketRegime` + `MarketMetricGrid` (already strong).
2. **Lead Story card** — keep top-1 signal hero, but cut the inline "Four Pillars 리서치" deep link to → `/research#<SYMBOL>` (not coin detail).
3. **Ranking board** — full-width, no sidebar. Convert grid into a **ranked list/board** with rank number, score, bucket chip, 24h, thesis one-liner. Denser than current 3-col cards: target a 2-col board on desktop where rank reads vertically (#1…#8).
4. **Bucket strip** — move the 3 buckets (데이트레이드/스윙/포지션) from the right aside to a **horizontal 3-column strip** below the board.

Removed from `/`: `#research-desk` wrapper, `#prices` Top Volume card (now own route).

Copy:
- Kicker: `DAILY RANKING`
- H1: `오늘의 KRW 시그널 랭킹`
- Sub: `거래대금 상위 종목을 EMA·RSI·7일 모멘텀으로 점수화해 순위로 정렬합니다.`
- Empty: `시그널을 불러오지 못했습니다. 잠시 후 다시 시도해 주세요.`

---

## 2. Research — `/research/page.tsx` (NEW, editorial desk)

Job: Four Pillars 리서치 풀뷰. Long-form editorial reading, NOT cards-in-a-grid. Use `findResearch(symbol)` per top symbol (server side, same `getDashboardData` source).

Layout hierarchy:
1. **Masthead** — editorial header, dateline (`UTC` updated), source-mode badge.
   - Badge text driven by `ResearchMatch.displayMode`: `ai-synthesis` → `AI 합성 리서치`, `fallback` → `검색 합성 리서치`. Confidence chip: `high/medium/low` → `신뢰도 높음/보통/낮음`.
2. **Lead research article** — top-ranked symbol, full `thesis` as large body, then structured blocks:
   - `투자 논거 (Thesis)` — paragraph
   - `리스크 (Risks)` — bulleted list from `risks`
   - `출처 (Sources)` — linked list from `sources` (open new tab, `rel="noopener"`)
3. **Research feed** — remaining top symbols as **stacked editorial entries** (symbol headline + thesis excerpt + risk count + "전체 보기" → anchor `#<SYMBOL>` on same page or `/coin/<SYMBOL>#research`). Single column, generous line-height — reads like a research letter, not a board.

Each entry gets `id={symbol}` so `/research#BTC` deep-links work (Signals lead card links here).

Mandatory disclosure line (keep DEC-005 honesty): footer note
`전용 콘텐츠 API 없이 검색·AI 합성 경로를 정식 동작으로 사용합니다.`

Copy:
- Kicker: `FOUR PILLARS DESK`
- H1: `포 필러스 리서치 데스크`
- Sub: `상위 종목별 투자 논거·리스크·출처를 한 화면에서 정독합니다.`
- Empty research: `해당 종목의 리서치를 합성하지 못했습니다.`

---

## 3. Prices — `/prices/page.tsx` (NEW, data table)

Job: 시세 정독/탐색. Deeper than the ticker tape — a real **sortable, filterable market table**. This is the only quantitative-dense surface.

Layout hierarchy:
1. **Header strip** — title + market summary stats (상승/하락 카운트, 24h 총 거래대금) reused from home metrics.
2. **Controls** — search input (symbol filter) + sort toggle (거래대금 / 변동률 / 가격). Client component for sort/filter state; data fetched server-side via `getTopKrwTickers(50)` then hydrated.
3. **Market table** — columns:
   `# · 심볼/이름 · 현재가(KRW) · 24h 변동률 · 거래대금(24h) · [상세]`
   - Right-align numeric cols, `tabular-nums`, mono font.
   - Color 변동률 with `--accent-bull/--accent-bear`.
   - Row → `/coin/<SYMBOL>`.
   - Sticky header row on scroll.

Pull a wider set than home (50 vs 8) so this page justifies its existence vs the tape.

Copy:
- Kicker: `UPBIT MARKETS`
- H1: `실시간 KRW 마켓 시세`
- Sub: `거래대금 상위 종목을 정렬·검색하며 깊게 살펴봅니다.`
- Empty: `시세를 불러오지 못했습니다 (Upbit 공개 API).`
- Sort labels: `거래대금순` / `변동률순` / `가격순`

---

## 4. Chat — `/chat` (keep)

No IA change. Already a real route with distinct conversational layout. Just confirm nav active state resolves via `getActiveTab` (`/chat` → chat). Leave content as-is.

---

## Cross-page consistency rules

- Each route owns ONE primary layout pattern (board / editorial / table / chat) — do not paste the home grid+aside everywhere.
- Shared atoms only: `GlobalChrome`, `SectionKicker`, `Card`, `Badge`, `ScoreTag`, color tokens. Reuse, don't fork.
- All deep links from Signals → Research go to `/research#<SYMBOL>`; Signals/Research/Prices → coin detail go to `/coin/<SYMBOL>`.
- Keep DEC-005 disclosure language anywhere research output is shown (no implied "official Four Pillars feed").
- Mobile: each page collapses to single column; Prices table → horizontal scroll with sticky symbol col.

## Acceptance (for QA)

- `/`, `/research`, `/prices`, `/chat` all return 200 and render distinct top-level structure (board vs article vs table vs chat).
- Nav highlights correct tab per pathname; no anchor-scroll nav remains.
- `/research#BTC` scrolls to BTC entry; Signals lead card links there.
- Prices sort/filter works client-side; rows link to coin detail.
- No "전용 콘텐츠 API"/원문 implication copy regression.
