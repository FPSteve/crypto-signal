# Design Spec — Editorial Research Desk Redesign

Owner: Design Lead (@Design) · Date: 2026-05-29 · Status: v2 — live-site calibrated
Surfaces: `/` (dashboard) and `/coin/[symbol]` (detail)
Reference: `https://blockworks.com/` layout / typography / color / information hierarchy

> IP note: we reference Blockworks' *design language* (modular data-forward IA,
> restrained palette, monospace telemetry, strong type hierarchy). We do NOT copy
> their proprietary logo, illustrations, copy, brand purple, or font licenses
> (Milling display / Fragment Mono are proprietary). This spec adopts the genre
> conventions with license-safe substitutes and our own accent.

---

## 0. LIVE-SITE CALIBRATION (v2 — supersedes v1 token values)

I inspected `https://blockworks.com/` directly. The v1 "editorial / serif" read was
**wrong genre**. The real site is **geometric sans + monospace telemetry,
light-mode-first**, not a serif newsroom. v2 corrects this. Where v1 conflicts with
this section, **§0 wins**.

### 0.1 What blockworks actually is (extracted from live site)
- **Type**: body/UI = Inter (sans). Display = a custom geometric sans ("Milling").
  Metadata/labels/numbers = monospace ("Fragment Mono"), often UPPERCASE, xs.
  **No serif anywhere.** → Drop `Source Serif 4`.
- **Palette (light-first, with dark parity)**:
  - bg `#f4f4f4` / dark `#1a1a1a`; panel `#fafafa` / `#202020`; border `#e6e6e6` / `#2a2a2a`
  - text `#1a1a1a` / `#f4f4f4`; muted `#585858` / `#a8a8a8`; subtle `#7c7c7c` / `#cccccc`
  - brand accent `#6633ff` (amethyst); success `#17ba7c`; danger `#f0384a`; warn `#f79009`
- **Radius**: tiny — `2px` (l1) / `4px` (l2) / `6px` (l3). Pills `9999px` for tags only.
- **Borders**: flat 1px solid, 2px emphasis. **No glow, no glass, no gradient.**
- **Layout**: fixed 62px masthead, max container ~1920px, 5–6 col grid, 12px gaps,
  metric cards ~74px min-height (mono label + large value), 1–2px horizontal dividers.
- **Mood**: institutional-clean, technical, high-contrast, telemetry-styled.

### 0.2 License-safe substitution map (implement these exact values)
| Role | Blockworks (proprietary) | We use (license-safe) |
|------|--------------------------|------------------------|
| Display | Milling | `Geist` (already loaded) at heavy weight, tight tracking |
| Body/UI | Inter | `Geist` |
| Mono telemetry | Fragment Mono | `Geist Mono` (already loaded) |
| Brand accent | `#6633ff` amethyst | **our own** — see 0.3 (do NOT ship their purple) |

### 0.3 Corrected token values for `app/globals.css` (replace v1 §2 table)
Keep token **names** (components already consume them). Default to dark parity since
our product is dark-first, but lift contrast to blockworks levels:
```
--bg-base:#0e0f12; --bg-raised:#16181c; --bg-card:#16181c; --bg-card-hover:#1c1f24;
--rule:#262a30;            /* flat 1px, no alpha-white */
--text-primary:#f2f3f5; --text-secondary:#9aa1ad; --text-muted:#6b727e;
--accent-brand:#7b5cff;   /* our amethyst-adjacent, NOT blockworks #6633ff */
--accent-brand-bg:rgba(123,92,255,0.12);
--accent-bull:#17ba7c; --accent-bull-bg:rgba(23,186,124,0.12);
--accent-bear:#f0384a; --accent-bear-bg:rgba(240,56,74,0.12);
--radius-sm:2px; --radius-md:4px; --radius-lg:6px; --radius-xl:8px;
--shadow-glow-bull:none; --shadow-glow-bear:none;
```
**DELETE** from `globals.css` (still present on disk, must go):
- `--accent-brand:#e8543f` coral-orange and `--gradient-*` vars
- `.glass`, `.glass:hover`, `.gradient-border` + `::before`, `.animate-pulse-glow`,
  `@keyframes pulse-glow`, `@keyframes float`
- Any `backdrop-filter` usage → replace with flat `background:var(--bg-card)` + `1px solid var(--rule)`.

### 0.4 `app/layout.tsx` correction
- Remove `Source_Serif_4` import + `--font-serif` variable + `${sourceSerif.variable}`.
- Headlines use `Geist` heavy (`font-weight:700`, `letter-spacing:-0.02em`).
- Apply `Geist Mono` UPPERCASE xs to all kickers/labels/numeric readouts (regime
  strip, score tags, table headers, timestamps).

### 0.5 Acceptance delta for v2
- `git grep -i "serif\|glass\|gradient-border\|pulse-glow\|#e8543f"` in `app/`,`components/` → **0 hits**.
- Masthead ≈62px, mono uppercase nav/labels, brand accent = our amethyst (not coral, not #6633ff).
- Numbers render in `Geist Mono` tabular; dividers 1px flat; corners ≤6px.
- Light/dark contrast AA on text vs bg.

### 0.6 Accent-blue decision
No fourth accent token. Info/CTA states use `--accent-brand` when emphasis is needed
and `--text-secondary` / `--rule` for neutral telemetry; bull/bear remain the only
non-brand semantic colors.

---

## 1. Design intent / problem with current UI

Current state (verified in code):
- `globals.css`: dark glassmorphism, emerald→cyan gradient accent, rounded cards
  (`--radius-lg: 16px`), glow shadows, `ScoreRing`.
- `/`: sticky glass header, `MarketRegime` band, 5 `SignalCard` rounded glass cards
  + sidebar (`Buckets`, `Top Volume`).
- `/coin/[symbol]`: hardcoded `#080a0d` bg, 3-up score/24h/price, candle chart +
  Logic/rationale/Research sidebar.

Problem: reads as a *generic crypto dashboard* — glow, gradients, rounded glass.
It signals "yet another signal app," not "a research desk you trust." Blockworks
reads as editorial intelligence: sharp grid, typographic authority, data tables
over decorative cards, color used only to mean something (bull/bear/regime).

Goal: make `crypto-signal` feel like a **research desk** — scannable, operational,
opinionated — without losing the existing signal-engine data model.

---

## 2. Moodboard (direction, in words)

| Axis | From (now) | To (target) |
|---|---|---|
| Mood | neon crypto, glassy | editorial newsroom, analyst terminal |
| Surface | translucent glass + glow | flat matte panels, hairline rules |
| Corners | soft 16px | sharp 4–6px, mostly square |
| Color | emerald→cyan gradient everywhere | near-mono base, ONE signal accent + bull/bear semantics |
| Type | single sans, medium weights | display serif headlines + grotesk/mono data |
| Decoration | glow, gradient borders | whitespace, dividers, kickers, rules |
| Data | cards | tables + ranked rows, tabular figures |
| Density | airy | tighter, information-forward above fold |

Texture keywords: paper-white text on near-black, hairline dividers, uppercase
kicker labels (already used — keep `tracking-[0.2em]`), generous column gutters,
no glow, no gradient fills on content.

---

## 3. Token deltas (`app/globals.css`)

Keep token *names* (low blast radius — components already consume them). Change values.

```
/* Surface — flatten, drop glass translucency on content panels */
--bg-base:        #0a0b0d;   /* was #060809 */
--bg-raised:      #111316;   /* matte panel, opaque */
--bg-card:        #0f1114;   /* OPAQUE, not rgba — kill glass on content */
--bg-card-hover:  #14171b;

/* Text — raise contrast, editorial */
--text-primary:   #f5f6f7;
--text-secondary: #a4abb6;
--text-muted:     #6b7280;

/* Accent — single brand accent (research), keep bull/bear semantic only */
--accent-brand:   #e8543f;   /* warm editorial signal accent (NEW) */
--accent-bull:    #2dd4a7;
--accent-bear:    #f0584a;

/* Radius — sharpen */
--radius-sm: 3px;
--radius-md: 4px;
--radius-lg: 6px;
--radius-xl: 8px;

/* Rules */
--rule: rgba(255,255,255,0.08);
```

Remove from *content* surfaces (keep utility classes defined, just stop applying):
- `--gradient-hero`, `--gradient-accent` fills, `.glow-bull/.glow-bear`,
  `.gradient-border` on cards. Glow is now reserved for nothing (or score=>9 only).

Typography (add to `layout.tsx` font setup, EngLead to wire `next/font`):
- Display/headline: a serif (e.g. `Newsreader` / `Source Serif 4`) → `--font-serif`.
- Body/UI: existing geist sans → `--font-sans`.
- Data/numbers: geist mono (already used) → keep `tabular-nums`.

---

## 4. Component map

Legend: KEEP = unchanged · EDIT = restyle, same API · NEW = add · RETIRE = stop using.

### Shared / `components/ui`
| Component | Action | Notes |
|---|---|---|
| `Card` | EDIT | opaque `--bg-card`, hairline border, no glow/gradient border. Add `flush` variant (no padding) for table panels. |
| `Badge` | EDIT | square-ish (`--radius-sm`), 11px uppercase, outline default; brand/bull/bear only. |
| `Button` | EDIT | primary = solid `--accent-brand`; secondary = ghost w/ hairline border. Remove gradient. |
| `ScoreRing` | EDIT→optional | de-emphasize. Default to a **numeric score chip** (`ScoreTag`, NEW) in rows/tables; keep ring only on coin detail hero. |
| `ScoreTag` | NEW | compact `[ 8.4 ]` mono chip, bg tinted by tier (≥7 bull / 4–6 muted / <4 bear). |
| `SectionKicker` | NEW | uppercase tracked label + optional rule, replaces repeated inline `<p class="uppercase tracking...">`. |
| `DataRow` / `DataTable` | NEW | hairline-separated rows w/ aligned mono numerics. Backbone of new IA. |
| `FadeIn`, `Motion*`, `*Animations` | KEEP | retune durations only; no layout change. |
| `AnimatedBackground` | RETIRE | drop decorative bg from content; editorial = flat. |

### Dashboard `/`
| Component | Action | Notes |
|---|---|---|
| Header | EDIT | masthead: serif wordmark "Signal Hub" + thin rule under, date/regime ticker right-aligned, `AI 채팅` as ghost button. Drop emerald logo tile. |
| `MarketRegime` | EDIT | full-width **regime strip** (banner row): BULL/BEAR label, key stats inline as `DataRow`s, no card glow. Reads like a market-status dateline. |
| `SignalCard` | EDIT→`SignalRow` | convert the top-5 from cards to a **ranked editorial table**: `#rank · symbol/name · thesis (lede) · bucket tag · score tag · → `. Headline thesis in serif, smaller. |
| Sidebar `Buckets` | EDIT | `SectionKicker` + `DataTable`; keep daytrade/swing/position. |
| Sidebar `Top Volume` | EDIT | `DataTable`, right-aligned signed % (bull/bear color). |

### Coin detail `/coin/[symbol]`
| Component | Action | Notes |
|---|---|---|
| bg | FIX | use `--bg-base` token (currently hardcoded `#080a0d`). |
| Hero header | EDIT | serif `{symbol}` masthead, kicker breadcrumb, 3-up stats become a hairline `DataRow` strip (Score=ScoreRing kept here, 24h, Price) with tabular mono. |
| `CandleChart` | KEEP | recolor series to new accents (EMA20 brand, EMA50 neutral muted); flat panel frame. |
| Logic / rationale | EDIT | `SectionKicker` headings, serif thesis, `DataRow` for signals + 손절. |
| `ResearchEmbed` | KEEP | already a direct-link CTA card (no iframe — locked decision). Restyle to editorial panel. |

No changes to `lib/*` (signal-engine, indicators, four-pillars) — pure presentation.

---

## 5. Expected flows

1. **Scan regime → pick signal**: land on `/` → regime strip answers "what's the
   market?" in one line → ranked signal table answers "what do I act on?" → click
   row → `/coin/[symbol]`.
2. **Validate a signal**: coin hero (score/price/24h) → Logic (why) → rationale
   (bullets) → Four Pillars research CTA (external authority).
3. **Ask AI**: `AI 채팅` ghost button in masthead → `/chat` (out of scope here).

Above-the-fold priority on `/`: regime strip → #1 & #2 ranked signals visible
without scroll on a laptop (1440×900).

---

## 6. UX / quality risks

- **R1 Contrast/AA**: `--text-muted #6b7280` on `--bg-base` ≈ borderline. Restrict
  muted to labels ≥12px, never body. QA to check WCAG AA on text.
- **R2 Glass removal regressions**: `Card` is opaque now; any layered/overlapping
  card that relied on translucency may look heavy. Audit `MarketRegime`, sidebar.
- **R3 Serif load/CLS**: add `display: swap` + preload; serif only on headlines to
  cap payload. Avoid layout shift on score/price numbers (mono is already fixed).
- **R4 Table on mobile**: `SignalRow` table must collapse to stacked rows < 640px
  (thesis under symbol, score/tag inline). Define mobile layout before build.
- **R5 Color semantics**: brand accent (`#e8543f`) is near bear-red — never use it
  for "down" data. Brand = CTA/wordmark/active only; bear-red = negative values.
- **R6 Motion**: keep `Animated*` but reduce to <250ms; editorial ≠ bouncy. Respect
  `prefers-reduced-motion`.

---

## 7. Build order (for EngLead)

1. Token swap in `globals.css` (§3) — visual baseline, low risk, reviewable diff.
2. `ui` primitives: `ScoreTag`, `SectionKicker`, `DataTable/DataRow` (NEW) + EDIT
   `Card`/`Badge`/`Button`. Unit-isolate; no page logic.
3. `/` masthead + regime strip + `SignalRow` table + sidebar tables.
4. `/coin/[symbol]` bg token fix + hero strip + section restyle + chart recolor.
5. Mobile pass (R4) + a11y pass (R1) → hand to @QAEvals.

Acceptance: visual hierarchy = regime → ranked signals → detail; no gradient/glow
on content; tabular numerics aligned; AA contrast on text; mobile table collapse;
lint + build green; no `lib/*` behavior change.
