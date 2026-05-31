# DEC-007 §10 — Hero Motion + CandleChart Visual Pro Rework Spec

**CANONICAL SPEC for DEC-007 §10.** Supersedes and replaces the two earlier drafts
(`2026-05-31-hero-chart-pro-upgrade-spec.md`, `2026-05-31-hero-motion-candlechart-upgrade-spec.md`),
which were removed as redundant. This is the single source of truth EngLead implements against.

Owner: @Design · Implement: @EngLead · Date: 2026-05-31
Live verdict source: `https://crypto-signal-jet.vercel.app/` + `/coin/BTC`, desktop 1440 / mobile 390, captured this run (`/tmp/design-dec007-s10/*.png`), HTTP 200, console errors 0, HEAD `9f8b460`.
Blockworks side-by-side re-verified 2026-05-31 (this run): `/tmp/design-bw-parity/{ours,bw}-*.png`, all HTTP 200, console 0 — see §E.
Scope: frontend visual layer only. No data/API/Upbit/indicator-math changes.

---

## 0. Build-state reality (read before implementing — verified this run vs HEAD `9f8b460`)

`git diff --stat HEAD` shows 5 uncommitted files. Their §10 status is NOT uniform:

- **CandleChart (`components/CandleChart.tsx`) — section B is ALREADY DONE in the working tree, but uncommitted + undeployed.** Confirmed: working tree has `attributionLogo: false`, `localization.priceFormatter: formatKrwAxis` (억/만, 0-dec), horizontal-only grid, purple dashed crosshair w/ label chips, EMA50 demoted to `withAlpha(textMuted, 0.65)` lineWidth 1, and a floating mono header chip. `git show HEAD:components/CandleChart.tsx` has NONE of these. ⇒ **The live `/coin/BTC` screenshots (raw `170000000.00` axis + TradingView logo) are the OLD committed build, not current code.** Section B work is essentially complete; it needs commit + deploy + re-capture, not re-implementation. EngLead: verify B acceptance against the working tree, don't rewrite.
- **Hero motion (`components/HeroMotionGraphic.tsx` + `app/globals.css`) — section C is NOT done.** `hero-radar`/`hero-orbit` DOM (HeroMotionGraphic.tsx:48–57) and CSS (globals.css:150,155,317–422,657) are still present in the working tree. This is the real remaining P0.
- **`app/page.tsx`** has only minor edits (4 lines) — the headline-dominance work in **§F is NOT done** and is a new P0 add from the Blockworks side-by-side.

Net: §B ≈ done-uncommitted · §C + §F = remaining implementation · all 5 files + this canonical spec must land in one clean commit.

---

## A. Live verdict (honest, not parity)

### Hero motion (`components/HeroMotionGraphic.tsx` + globals.css `.hero-*`)
NOT editorial-premium. Reads as **generic fintech-dashboard decoration** — confirms DEC-007 "editorial-skinned ≠ visual parity".
Concrete failures seen live:
1. **Element overload** — orbit rings + radar sweep + signal-stack table + bar field all compete in one frame. No focal hierarchy; the eye has nowhere to land.
2. **Layout collision** — `.hero-bar-field` (bottom-right) visually overlaps `.hero-signal-stack`; bars sit on top of the table edge. Looks like a z-index accident, not composition.
3. **Cliché vocabulary** — concentric purple orbit rings + radar sweep = the most overused "crypto/AI" trope. Blockworks-grade hero is restrained typographic + data motion, not sci-fi radar.
4. **One-note purple** — every motion element is `--accent-brand` purple at varying alpha. No tonal range, so it flattens.

### CandleChart (`components/CandleChart.tsx`)
Reads as **raw lightweight-charts default**, not a trading desk.
Concrete failures seen live:
1. **TradingView "TV" attribution logo** visible bottom-left of the chart (desktop + mobile). Single biggest "not professional" tell — a third-party library watermark on our product surface.
2. **Price axis = raw `170000000.00`** — full integer + 2 decimals on a ₩100M price. Ugly, unreadable, screams default. Needs abbreviation (e.g. `1.7억` / `170M`) and 0 decimals.
3. **EMA50 = `--text-muted` (#8f8f8f)** renders near-white, visually competing with candle bodies and the EMA20. The "muted" line is louder than it should be.
4. **No chart chrome** — chart sits raw inside a bordered box. No OHLC/legend readout, no timeframe affordance, no header band. A pro desk frames the chart.
5. **Grid `rgba(255,255,255,0.04)`** — effectively invisible; combined with no axis styling it feels unfinished rather than minimal.

What is already green (keep): reduced-motion/visibility guard, brand candle colors (`--accent-bull/bear`), last-price dashed line, responsive resize observer, console 0.

---

## B. CandleChart spec (exact, EngLead-implementable)

All changes are in `components/CandleChart.tsx` `createChart(...)` options + a thin wrapper. Keep `ema()` math and series data untouched.

1. **Kill the TradingView logo.** Add to `layout`:
   ```ts
   layout: { ..., attributionLogo: false }
   ```
   (lightweight-charts v5 layout option.)

2. **Price axis formatter** — abbreviate KRW, 0 decimals. Add `localization.priceFormatter`:
   ```ts
   localization: {
     priceFormatter: (p: number) =>
       p >= 1e8 ? `${(p / 1e8).toFixed(p >= 1e9 ? 0 : 1)}억`
       : p >= 1e4 ? `${Math.round(p / 1e4).toLocaleString()}만`
       : Math.round(p).toLocaleString(),
   },
   ```
   Goal: `1.7억`, `1.4억`, `9,800만` — not `170000000.00`. (If team prefers `M/K` Latin, mirror the same thresholds.)

3. **EMA50 demotion** — change EMA50 color from `textMuted` to a true dim rule tone so it sits *behind* candles, and drop its weight:
   - color: `rgba(244,244,244,0.32)` (or new token `--chart-ema-slow`), `lineWidth: 1`.
   - EMA20 stays `--accent-brand`, `lineWidth: 2`.

4. **Grid + axis tokens** — make it a deliberate desk, not invisible:
   - `grid.horzLines.color: "rgba(255,255,255,0.05)"`, `grid.vertLines.color: "transparent"` (horizontal-only grid reads more editorial/financial).
   - `rightPriceScale.borderColor` and `timeScale.borderColor`: keep `--rule`. Add `rightPriceScale.scaleMargins: { top: 0.12, bottom: 0.12 }` so price label rows aren't clipped (the `170000000.00` was hugging the top edge).
   - `layout.fontFamily`: `var(--font-mono)` numbers axis → reads as a terminal. Pass the resolved mono token via the same `token()` helper.

5. **Crosshair upgrade** — keep `mode: 1` (magnet) but style it:
   ```ts
   crosshair: {
     mode: 1,
     vertLine: { color: "rgba(168,85,247,0.45)", width: 1, style: 2, labelBackgroundColor: "#a855f7" },
     horzLine: { color: "rgba(168,85,247,0.45)", width: 1, style: 2, labelBackgroundColor: "#a855f7" },
   }
   ```

6. **Chart chrome (wrapper, presentation only)** — wrap the `<div ref>` in a card with a header band:
   - Header row above canvas: left = `KRW-BTC · 1D`, right = small legend chips `● EMA20` (brand) `● EMA50` (dim). 11px mono, `--text-muted`, `padding: 10px 14px`, `border-bottom: 1px solid var(--rule)`.
   - Card = `bg-[var(--bg-card)] border-[var(--rule)] rounded-[var(--radius-lg)]`, canvas div loses its own border (header owns the frame).
   - This replaces the current bare bordered `<div>` at line 89. The existing `EMA20 EMA50 일봉 기준` text legend below the chart on `/coin/[symbol]` becomes redundant — fold it into the header chips.

7. **Acceptance (EngLead self-check before QA):** no TV logo; axis shows `억/만` abbreviated 0-dec; EMA50 visibly dimmer than candles; horizontal-only grid; crosshair purple dashed with label chips; header band present desktop+mobile; reduced-motion unaffected (chart has no motion); console 0; mobile 390 chart not clipped.

---

## C. Hero motion spec (exact, EngLead-implementable)

Direction: **subtract, then refine.** Goal = restrained editorial data-motion, one focal element, tonal depth. Kill the radar/orbit sci-fi trope.

1. **Remove** `.hero-orbit--outer`, `.hero-orbit--inner`, `.hero-radar` (+ axes, sweep, dots) from `HeroMotionGraphic.tsx` and their CSS. These are the cliché. (Keep keyframes only if reused below.)

2. **Keep + promote one focal motion: the bar field as a live "signal spectrum".**
   - Move `.hero-bar-field` to be the dominant right-side element (was a cramped 220px corner). New: `right: 0; bottom: 14%; top: 18%; width: min(46%, 360px);` so it's a tall column chart, not a footnote. `right: 0` is the verified no-overlap correction against the `54%` signal stack at desktop 1440.
   - Bars: keep score-driven height, but tonal range instead of mono-purple — bull `--accent-bull`, bear `--accent-bear`, neutral a **dim graphite** `linear-gradient(180deg, rgba(244,244,244,0.22), rgba(244,244,244,0.02))` (NOT purple). Brand purple reserved for at most ONE highlighted bar (top score).
   - Reduce pulse amplitude: `hero-bar-pulse` scaleY `0.88→1` (was `0.7→1`) — subtle breathing, not jitter.

3. **Keep the signal-stack table but make it the editorial anchor, no overlap.**
   - It already looks the most "Blockworks" (mono, ruled rows, backdrop blur). Give it room: `.hero-signal-stack { left: 0; top: 16%; bottom: auto; width: min(54%, 420px); }` — top-left anchored, bar column top-right. No collision.
   - Row reveal `hero-row-rise` stays (good editorial stagger).

4. **Replace orbit/radar with a quiet background field only:**
   - Keep `.hero-motion-graphic__grid` (the skewed grid) but drop opacity to `0.32` and remove the `skewY(-5deg)` → flat grid reads more editorial, less "HUD".
   - Add a single slow `hero-gradient-drift` radial behind everything at low alpha for depth (keyframe already exists, currently unused on this element — wire it to the container `::before`).

5. **Role split vs §9 hero video layer:** `HeroVideoLayer` (DEC-007 §9, shipped) is the *background* of the page hero. `HeroMotionGraphic` is the *right-column data panel* beside the headline. They must not both fight for "ambient motion" — so this graphic becomes **structured/data motion** (bars + table), video stays **ambient texture**. Document this so they read as foreground-data over background-texture, not two competing animations.

6. **Acceptance (EngLead self-check before QA):** no orbit rings / no radar sweep on live; bar column is the right-side focal element; signal table top-left with zero overlap; tonal range (bull/bear/graphite, ≤1 purple highlight); reduced-motion still freezes via existing `data-motion-paused` guard; desktop 1440 + mobile 390 no overflow; console 0.

---

## E. Blockworks live side-by-side delta (2026-05-31, this run)

Evidence: `/tmp/design-bw-parity/ours-home-desktop.png` vs `bw-home-desktop.png` (+ mobile, + `ours-coin-desktop.png`). Both live, HTTP 200, console 0. This answers Namwoong "blockworks랑 전혀 달라" with concrete, implementable deltas — NOT a pixel-copy mandate.

| Axis | Blockworks (live) | Ours (live) | Delta → action |
|---|---|---|---|
| **Headline dominance** | "Building trust in onchain capital markets." — ~80px, weight **700–800**, **all white**, leading ~0.95, occupies the full hero width; graphic sits *behind* it (full-bleed). It is unmistakably THE focal point. | "Crypto Signal Hub" — 76px but **weight 600**, first word "Crypto" in **muted gray**, capped to ~half-width by a 0.8fr graphic column beside it. Recessive. | **§F** — heaviest single tell. Bump to 700, kill gray first word, widen headline column, tighten tracking. |
| **Hero graphic philosophy** | ONE large restrained dotted 3D point-cloud terrain + a **mono telemetry caption** ("Core Density / Vertex Count / Contour Drift…") top-right. Editorial, monochrome, high-craft. | THREE competing widgets — orbit rings + radar sweep + LIVE MODEL table + bar field — low-contrast sci-fi noise, no focal hierarchy, bars overlap table. | **§C** (already specced) + adopt a BW-style mono "model readout" caption as the editorial replacement for the radar (see §F.5). |
| **Density / fold** | Hero → 5-KPI metric strip (value + sparkline each) → 4-col magazine content grid, all near the fold. Newspaper/terminal density. | Hero → single lead signal → large empty gap → MARKET REGIME. Low density, lots of dead vertical space. | **§G-density (P1)** — add a KPI/metric strip under the hero. Out of §10 P0 scope; logged for follow-up. |
| **Palette** | Near-black base, white type, **data-color** accents (green/red deltas, restrained purple/blue in charts). Multi-tonal. | Near-black base, but **one-note purple** dominates (brand tags, all motion elements purple). | **§C.2** tonal range (bull/bear/graphite, ≤1 purple highlight) + §F reserve purple for accent only. |
| **Ticker bar** | Dense, colored deltas, top. | Dense, colored deltas, top — **already close**. Keep. | none (green) |
| **Chart look** | (n/a on home) | raw lightweight-charts: TV logo + `170000000.00` axis live. | **§B** — already fixed in working tree; commit + deploy + re-capture. |

Coin-detail page note: `/coin/BTC` editorial bones are actually strong (COIN DETAIL eyebrow, big BTC headline, ruled SCORE/24H/PRICE strip, LOGIC ruled-row panel) — this is the closest-to-Blockworks surface we have. Only the chart drags it down, and §B already fixes that. Do not rework the coin page chrome.

---

## F. Headline + hero-column dominance spec (NEW P0 — from §E, EngLead-implementable)

File: `app/page.tsx` (hero H1 at ~L56–60 + grid at L52), tokens in `app/globals.css`.

1. **Weight 600 → 700.** Change H1 `font-semibold` → `font-bold`. BW's headline authority comes largely from weight. (Geist supports 700.)
2. **Kill the muted first word.** Both spans use `--text-primary`. Remove `text-[var(--text-muted)]` on the "Crypto" span — the gray word halves perceived headline mass.
   ```tsx
   <span className="block">Crypto</span>{" "}
   <span className="hero-headline-accent block text-[var(--text-primary)]">Signal Hub</span>
   ```
   (whole H1 already `text-[var(--text-primary)]`, so the inner override is the only change.)
3. **Scale + tracking.** `lg:text-[76px]` → `lg:text-[84px]`, add `tracking-[-0.02em]`, keep `leading-[0.95]`. Editorial display type runs tight.
4. **Widen the headline column** so the headline reads as the dominant object, not a 50/50 split. Grid L52:
   `lg:grid-cols-[minmax(0,0.95fr)_minmax(26rem,0.8fr)]` → `lg:grid-cols-[minmax(0,1.15fr)_minmax(22rem,0.7fr)]`. Headline gets more measure; the (subtracted) data panel becomes a confident secondary, matching BW's "copy dominant left, data secondary right."
5. **Editorial mono readout caption on the hero panel** (the BW telemetry-caption motif, replacing radar's sci-fi role). Inside `HeroMotionGraphic`, above/beside the signal stack, add a 10–11px `--font-mono`, `--text-muted` caption block of 3–4 live-ish lines, e.g. `MODEL · v4 SIGNAL ENGINE` / `UNIVERSE · KRW 312` / `REGIME · {regimeLabel}` / `UPDATED · {time}`. Right-aligned, ruled, low-contrast. This gives the panel editorial "data-desk" credibility instead of decorative orbit rings.
6. **Acceptance (EngLead self-check):** H1 weight 700, no gray first word, ≥84px desktop, headline column visibly wider than data panel; mono readout caption present on hero panel; desktop 1440 + mobile 390 no overflow/clip; reduced-motion unaffected; console 0.

---

## G. Consolidated implementable token table (single reference for all of §B/§C/§F)

Presentation-only. No new global tokens required except the two optional chart tokens noted.

### Hero motion (`HeroMotionGraphic.tsx` + `globals.css`)
| Item | Current (remove/change) | Target |
|---|---|---|
| `.hero-orbit--outer/--inner`, `@keyframes hero-orbit-spin` | present (cliché) | **DELETE** DOM (HeroMotionGraphic.tsx:48) + CSS (globals.css:336–362,150) |
| `.hero-radar` + `__axis/__sweep/__dot`, `@keyframes hero-radar-sweep` | present (cliché) | **DELETE** DOM (HeroMotionGraphic.tsx:50–57) + CSS (globals.css:155,365–422,657) |
| `.hero-bar-field` | cramped 220px corner, overlaps table | promote: `right:0; bottom:14%; top:18%; width:min(46%,360px)` |
| bar fill | mono `--accent-brand` | tonal: bull `--accent-bull` / bear `--accent-bear` / neutral graphite `linear-gradient(180deg, rgba(244,244,244,0.22), rgba(244,244,244,0.02))`; ≤1 purple highlight (top score) |
| `@keyframes hero-bar-pulse` | scaleY `0.7→1` | `0.88→1` (subtle) |
| `.hero-signal-stack` | overlaps bars | `left:0; top:16%; bottom:auto; width:min(54%,420px)` |
| mobile readout | 4-line caption can collide with stack | keep caption, compress to first 2 lines below 768px |
| `.hero-motion-graphic__grid` | `skewY(-5deg)`, higher opacity | flat (drop skew), opacity `0.32` |
| ambient depth | none / unused | wire existing `hero-gradient-drift` to container `::before`, low alpha |
| guards | `data-motion-paused`, reduced-motion | **keep unchanged** |

### Headline (`app/page.tsx`)
| Item | Current | Target |
|---|---|---|
| H1 weight | `font-semibold` (600) | `font-bold` (700) |
| first word color | `text-[var(--text-muted)]` | remove → `--text-primary` |
| H1 size / tracking | `lg:text-[76px]`, no tracking | `lg:text-[84px] tracking-[-0.02em]`, keep `leading-[0.95]` |
| hero grid cols (L52) | `minmax(0,0.95fr)_minmax(26rem,0.8fr)` | `minmax(0,1.15fr)_minmax(22rem,0.7fr)` |

### CandleChart (`components/CandleChart.tsx`) — verify only, already in working tree
| Item | Target (confirm present) |
|---|---|
| TradingView logo | `layout.attributionLogo: false` ✅ working tree |
| price axis | `localization.priceFormatter: formatKrwAxis` → `1.7억` / `9,800만`, 0–1 dec ✅ |
| grid | vert `visible:false`, horz `rgba(255,255,255,0.05)` ✅ |
| crosshair | mode 1, purple `rgba(168,85,247,0.45)` dashed, `labelBackgroundColor: --accent-brand` ✅ |
| EMA50 | `withAlpha(--text-muted, 0.65)`, lineWidth 1 (EMA20 brand lineWidth 2) ✅ |
| scale margins | right `{top:0.12, bottom:0.18}`, time `rightOffset:6, barSpacing:8` ✅ |
| header chip | floating mono `KRW-BTC · 일봉 · ●EMA20 ●EMA50` overlay ✅ |
| optional new token | `--chart-ema-slow: rgba(244,244,244,0.32)` if a named token is preferred over inline alpha (cosmetic) |

### Density strip (P1 — follow-up, not §10 P0)
BW-style 5-KPI metric strip under the hero (value + sparkline each). Logged for a separate spec; do not block §10 ship on it.

---

## D. Handoff

@EngLead implements **B (verify-only, already in working tree) + C + F** above. Lib/data/indicator code unchanged — presentation layer only.

Implementation order:
1. **§C** — delete `hero-radar`/`hero-orbit` DOM + CSS + their keyframes; promote bar-field + signal-stack per §G; flatten grid; wire gradient-drift `::before`.
2. **§F** — headline weight/color/scale/tracking + widen grid column + mono readout caption.
3. **§B** — confirm the working-tree chart options match §G (no rewrite expected).
4. Commit **all 5 files + this canonical spec** in one clean commit (untracked/uncommitted = origin-rebuild loss = the recurring source↔prod drift).

Verification gate after implement: `npm run lint` + `npm run build` green → local prod `/` + `/coin/BTC` smoke → Playwright desktop 1440 + mobile 390 → reduced-motion/saveData → `hero-radar`/`hero-orbit` grep **0** in code → chart axis/crosshair/grid + no TV logo → console 0. **Live parity/PASS claim only after deploy + named-URL re-capture** (current live = old build; do not cite live screenshots as evidence of §B until redeployed).

Side-by-side evidence (this verdict): `/tmp/design-dec007-s10/*.png` (prior) + `/tmp/design-bw-parity/{ours,bw}-{home,coin}-{desktop,mobile}.png` (this run, Blockworks delta).
