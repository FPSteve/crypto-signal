# P1 — Blockworks-Parity Editorial Terminal Shell

Owner: Product Reframer · Date: 2026-05-29 · Channel: #upbit-fourpillars-project
Track: P1 (separate from P0-2 BTC dominance). Do not couple to P0-2.

## 1. Reframe — what "blockworks와 똑같은 구조" actually means here

Blockworks is a media+analytics company; we are a signal/research product. We cannot
match content *types* (newsroom articles, podcasts, video) without a content source we
do not have. So parity = **IA / chrome / visual-density parity**, populated by **our
existing data** (Upbit signals + Four Pillars research + CMC dominance). No new external
data source. This honors Namwoong's "신규 소스 0" guardrail (only BTC dominance reopened).

Parity target = the *editorial-terminal shell*: tabbed nav, command-palette search,
light/dark theme, live price ticker, full-media multi-column layout.

## 2. Scope cut — priority order (each slice independently shippable)

### P1-A — Global chrome: tabbed nav IA + live price ticker  [HIGHEST]
Replace flat header with Blockworks-style persistent chrome.
- Tabbed top nav. Tabs map ONLY to real destinations we can populate:
  `Signals (/)`, `Research (Four Pillars CTA hub)`, `Prices (Upbit KRW table)`,
  `Chat (/chat)`. No stub/coming-soon tabs (see open Q1).
- Live price ticker bar (horizontal marquee) under nav, from existing
  `getTopKrwTickers`. Top markets + signed % , bull/bear color.
- Source: Upbit only (already wired). New external source = 0.

### P1-B — ⌘K command palette / search  [HIGH]
- ⌘K (and `/` focus) opens palette. Searches markets/coins (existing ticker list)
  + nav destinations. Enter routes to `/coin/[symbol]` or tab.
- No backend; client filter over already-fetched market list.

### P1-C — Light/dark theme toggle  [MEDIUM]
- Header toggle; persists to localStorage; respects `prefers-color-scheme`.
- Requires a light-theme token set parallel to current dark `var(--*)` tokens.
- Design owns token values; Eng owns the theme-provider wiring.

### P1-D — Full-media editorial layout  [MEDIUM, GATED]
- Magazine grid: hero Lead Story (exists) + 2–3 secondary story cards + section
  modules (Buckets, Top Volume, Regime) reflowed to Blockworks card density.
- GATED on open Q3 (media assets). If no images, ship typographic/chart-density
  version only — no fabricated imagery.

## 3. Explicit cuts (NOT in P1 — push to P2+)
- Real editorial content (articles, podcasts, video, author bylines) — needs CMS/content
  source. Out until a content-source decision exists.
- Any new external data feed (news API, DefiLlama, social) — violates source guardrail.
- Investor-relations / Events / Company tabs — no underlying data, would be empty stubs.
- Server-side full-text search — client filter is sufficient at current data size.

## 4. Acceptance criteria

P1-A
- AC-A1: Persistent tabbed nav renders on every route; active tab is visually marked.
- AC-A2: Each tab routes to a destination with real content (no empty/stub page).
- AC-A3: Ticker bar shows ≥8 markets with signed % and bull/bear color, sourced from Upbit.
- AC-A4: Mobile collapses nav to hamburger; ticker remains horizontally scrollable.
- AC-A5: No new external data source added (Upbit/CMC/Four Pillars only).

P1-B
- AC-B1: ⌘K (mac) / Ctrl+K (win) opens palette; Esc closes; results keyboard-navigable.
- AC-B2: Typing a symbol filters markets; Enter routes to `/coin/[symbol]`.
- AC-B3: Palette is client-only; no added network call on open.

P1-C
- AC-C1: Toggle switches light/dark; choice persists across reload (localStorage).
- AC-C2: First load with no stored pref follows `prefers-color-scheme`.
- AC-C3: Both themes pass contrast (text vs bg ≥ WCAG AA) on metric grid + tables.

P1-D
- AC-D1: Desktop ≥3-column magazine grid; hero + secondaries + modules, no overflow.
- AC-D2: Mobile single-column reflow, no horizontal overflow, no card overlap.
- AC-D3: No fabricated/stock imagery unless an asset source is approved (Q3).

Cross-cutting (all slices)
- AC-X1: `npm run lint` + `npm run build` pass.
- AC-X2: Playwright desktop (1440) + mobile (390) — console/page error 0, overflow 0.
- AC-X3: P0-1 + P0-2 metric grid unchanged in behavior (regression-clean).

## 5. Open product questions (block P1-D / shape P1-A) — for Namwoong/CEO
- Q1 (P1-A): Tabs only for destinations with real content, or stub "coming soon" tabs
  to visually match Blockworks' wider nav? Recommend: real-content-only.
- Q2 (P1-C): Is light theme required for parity (Blockworks defaults light), or is
  dark-only terminal acceptable for v1? Recommend: ship dark first, light in P1-C follow.
- Q3 (P1-D): Do we have/acquire imagery for full-media cards, or visual-density-only
  (typography + charts, no photos)? Recommend: density-only v1.

## 6. Sequencing
P1-A (start now, fully decidable) → P1-B → P1-C → P1-D (after Q3).
P1-A + P1-B need no product decision and respect the source guardrail.

---

## 7. IA-PARITY ACCEPTANCE CRITERIA (redefined 2026-05-29, supersedes §4 for parity judgment)

CEO finding (verified against live prod `dpl_Da2D9V...`): the §4 ACs are **surface-token
checks** (tab renders, ticker shows %, contrast). They cannot detect a "PASS" that is really
an editorial-skinned dashboard. Worse, the live prod is the **P0-2 cut and contains NO P1-A
chrome** — every P1-A "PASS" to date was worktree/screenshot-only and never shipped. §7 below
is the authoritative parity bar. A slice is NOT parity-PASS unless §7 passes **on the live
deployed URL**, not a worktree.

### 7.0 Truth gate (precondition for ANY parity claim)
- AC-T1: Parity verification runs against the **deployed production URL**, deployment hash
  recorded. Worktree/localhost screenshots are evidence of build, NOT of parity.
- AC-T2: The verifying agent pastes the deployment hash + the DOM selectors found, so a
  reviewer can confirm same-build. Mismatched build = automatic FAIL, not minor note.

### 7.1 "Story" definition (our data → editorial unit)
We have no articles. A **Story** = one signal rendered with full editorial anatomy:
headline (thesis), entity (symbol), **source attribution**, **timestamp**, **category**.
Parity is measured on Stories, not on rows.

### 7.2 Lead-story hierarchy  (replaces "hero renders")
- AC-IA1: Exactly ONE lead story, visually dominant. Lead headline type-size ≥ 1.8× the
  secondary-story headline size (measured px). A flat list where lead == rows = FAIL.
- AC-IA2: Lead carries: entity, thesis-as-headline, category chip, source attribution,
  timestamp, and one primary CTA. Missing any of the 5 = FAIL.

### 7.3 Story grid  (replaces "signal table renders")
- AC-IA2-G: Secondary stories render as a **multi-column card grid** (≥2 col desktop),
  NOT a single-line score table. ≥3 secondary stories visible above the fold (1440×900).
- AC-IA2-D: Each secondary card uses identical anatomy (headline, category, source, ts).
  A bare "rank / market / score" row does NOT satisfy this.

### 7.4 Byline / timestamp / category taxonomy  (the part most missing today)
- AC-IA3-SRC: Every story shows a **source attribution** drawn from real provenance —
  `Upbit signal-engine` and/or `Four Pillars research`. This is our byline.
- AC-IA3-TS: Every story shows a **timestamp / freshness** (candle close or revalidate
  time), not just a single global "updated UTC" in the metric grid.
- AC-IA3-CAT: Every story shows a **category taxonomy** chip from `bucket`
  (daytrade / swing / position) and/or regime. Categories must be filterable OR at minimum
  consistently labeled across lead + grid.

### 7.5 Content density  (replaces vibe judgment)
- AC-IA4: Home above-the-fold (1440×900) shows ≥ **5 distinct content modules**
  (lead + grid stories + ≥1 sidebar module), not 1 hero + 1 table.
- AC-IA5: Global chrome (4-tab nav + ticker marquee) present on the **deployed** page DOM,
  confirmed by selector, on every route.

### 7.6 Judgment rule for Design/QA
PASS requires **all** of 7.0 + every AC in the slice's scope, verified on the live URL with
recorded deployment hash + selectors. Any "looks similar / vibe parity" language without a
mapped AC ID is not an acceptance signal and must be logged as a minor note, never a PASS.

### 7.7 Scope-cut decision for this cycle (priority by user value)
The product VALUE here is "high-intelligence Four Pillars research helping crypto investors,"
NOT cosmetic Blockworks mimicry. Therefore:
- KEEP (P1-A): chrome + ticker (7.5 AC-IA5) — orientation/navigation, real user value.
- KEEP (re-spec): lead-story + story-grid + byline/ts/category (7.2–7.4) — this is what makes
  research *legible*, the actual product promise.
- CUT to P2: ⌘K palette (P1-B), light theme (P1-C), magazine imagery (P1-D). These are parity
  cosmetics with low investor value and can wait until 7.2–7.5 ship on prod.
- DROP: any AC that tests "resembles Blockworks" without a 7.x ID.

## 8. Decision needed from CEO/Namwoong
- D1: Confirm parity = **legible research IA on prod** (7.2–7.5), not visual mimicry. (Recommend YES.)
- D2: Confirm P1-B/C/D demoted to P2 so we ship 7.2–7.5 to prod first. (Recommend YES.)
- D3: Confirm the §7.0 truth gate (verify on live URL, record hash) is now mandatory for all
  Design/QA parity sign-offs. (Recommend YES — this is what prevents the next false PASS.)
