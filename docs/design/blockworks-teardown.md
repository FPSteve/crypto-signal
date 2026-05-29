# Blockworks Visual Teardown → crypto-signal Gap List

Owner: Design Lead · Date: 2026-05-29 · Channel: #upbit-fourpillars-project
Method: live WebFetch teardown of `blockworks.com` (redirect from blockworks.co, 308) homepage
DOM/computed-style extraction. `/news` returned 403 (Cloudflare) — listing density inferred
from homepage modules + recorded as a verification gap (see §6).
Compared against current repo tokens: `app/globals.css` @ commit `d43c547`.

> Truth note (§7.0 of parity spec): this is a **source teardown**, not a prod parity PASS.
> No live crypto-signal URL was re-verified in this run. Implementation + live verify is a
> separate handoff.

---

## 1. Typography

| Role | Blockworks (actual) | crypto-signal (current) | Gap |
|---|---|---|---|
| Display/headline | **Milling** (custom serif-display), 600 semibold, 2.5rem–8rem (5xl–8xl) | Geist Sans, same weight everywhere | ❌ No editorial display face. Geist is a neutral UI sans → reads "dashboard," not "publication." |
| Body / heading | **Inter**, 400, 0.875–1rem | Geist Sans | ⚠️ Acceptable substitute, but no contrast against headline face. |
| Mono / data labels | **Fragment Mono**, 300 light, sm | Geist Mono | ⚠️ Fragment Mono is lighter/editorial; Geist Mono reads heavier. Minor. |
| Caption | 0.625–0.875rem (xs–sm), 300 light | not formalized | ❌ No light-weight caption tier; current UI uses one weight band. |

**Core gap:** Blockworks' identity is the **two-face system** — a distinctive display face
(Milling) against Inter body. We have a single neutral sans at one weight band. This is the
#1 reason the UI reads as "editorial-skinned dashboard" rather than Blockworks.

---

## 2. Color tokens

| Token | Blockworks light | Blockworks dark | crypto-signal (dark-only) | Gap |
|---|---|---|---|---|
| BG base | `#f4f4f4` | `#1a1a1a` (warm neutral gray) | `#0e0f12` (cold near-black, blue-ish) | ❌ No light theme. Dark base is **colder/darker** than BW's `#1a1a1a`. |
| Panel/surface | `#fafafa` | `#202020` | `#16181c` | ⚠️ Ours is darker + cooler than BW `#202020`. |
| Text primary | `#1a1a1a` | `#f4f4f4` | `#f2f3f5` | ✅ Close. |
| Text muted | `#383838` | `#cccccc` | `#9aa1ad` | ⚠️ Ours is dimmer/cooler than BW `#cccccc`. |
| Accent (brand) | `#6633ff` amethyst-500 | `#a855f7` amethyst-400 | `#7b5cff` | ⚠️ Same amethyst family, different hue/lightness. BW light=`#6633ff`, dark=`#a855f7`; ours is a single `#7b5cff`. |
| Border / rule | `#e6e6e6` | `#2a2a2a` | `#262a30` | ✅ Dark border close. |
| Bull/success | `#17ba7c` | `#17ba7c` | `#17ba7c` | ✅ **Exact match.** |
| Bear/error | `#f0384a` | `#f0384a` | `#f0384a` | ✅ **Exact match.** |

**Core gap:** (a) **light theme entirely missing** — Blockworks defaults light; (b) our dark
base is colder/bluer than BW's warm neutral gray. Bull/bear already match exactly (good — keep).

---

## 3. Layout / spacing / density

| Aspect | Blockworks | crypto-signal | Gap |
|---|---|---|---|
| Container max | 1920px (3xl) | (check page wrappers) | ⚠️ Verify; BW goes very wide. |
| Card padding | `--card-padding: 1rem` (16px) | `--space-md: 16px` available | ✅ Aligns. |
| Card radius | 0.375–0.75rem (6–12px) | 2–8px (`--radius-sm..xl`) | ❌ Ours is **sharper/tighter**. BW cards are softer (6–12px). |
| Card min-height | 74px | not enforced | ⚠️ No density floor → uneven card rhythm. |
| Grid columns | responsive 1–6 col | story grid ≥2 col (DEC-006) | ⚠️ BW packs denser (up to 6); ours tops at 2–3. |
| Spacing rhythm | 0.25rem steps, gaps 0.5–1.5rem | 4/8/16/24/32/48 scale | ✅ Compatible scale. |
| Header height | **62px fixed**, 1.5rem horiz pad, border-bottom | (verify GlobalChrome) | ⚠️ Pin to 62px + 24px horiz for parity. |

---

## 4. Chrome / nav / ticker

| Element | Blockworks | crypto-signal | Gap |
|---|---|---|---|
| Top nav | fixed 62px, panel bg, space-between flex, border-bottom 1px | tabbed nav (DEC-006, real routes) | ⚠️ IA present; pin exact height/pad/border. |
| Ticker | live price marquee | `ticker-marquee` keyframe + Upbit feed | ✅ Present. |
| Sticky behavior | header fixed top | verify | ⚠️ Confirm sticky on scroll. |

IA parity (tabs + ticker) is the part DEC-006 actually shipped — this layer is closest.

---

## 5. Interaction / motion

| Pattern | Blockworks | crypto-signal | Gap |
|---|---|---|---|
| Link hover | underline, 3px offset | `a { text-decoration:none }`, no offset rule | ❌ No editorial underline-on-hover. |
| Button hover | bg opacity → 0.8 shift | ad-hoc `--bg-card-hover` | ⚠️ Inconsistent token. |
| Transition range | 50ms–500ms | 150/250/400ms | ✅ Compatible. |
| Focus ring | 2px solid + 2px offset, brand color | not formalized | ❌ No standard focus-ring token (a11y gap). |
| Pulse/anim | 2s ease-out loop | shimmer/score-fill present | ✅ OK. |

---

## 6. Verification gaps (honest boundaries)

- `/news` + `/research` + `/prices` subpages: **403 Cloudflare** on direct fetch — listing
  card anatomy (image / byline / timestamp grid) inferred from homepage, NOT confirmed
  per-page. Needs a headless/browser pass to nail exact listing density.
- Custom faces (Milling, Fragment Mono) are **licensed/proprietary** — we cannot ship them.
  Parity must use closest **free** substitutes (display: a Fraunces/Newsreader-class face or
  similar editorial display; mono: keep Geist Mono or swap to a lighter free mono).
- No live crypto-signal prod URL re-verified this run (per §7.0 — out of scope for teardown).

---

## 7. Priority recommendation — reopen §7.7 CUT items?

The parity spec §7.7 CUT light theme / typo-scale / density as "low investor value cosmetics."
The teardown shows that judgment was **half right**: the *cosmetics* (⌘K palette, magazine
imagery) are genuinely low-value, but **two CUT items are actually identity-critical**, not
cosmetic — without them the product cannot read as Blockworks at all.

**Recommend REOPEN (high value, identity-critical):**
1. **Two-face typography** (display + Inter body, weight tiers). Single highest-impact change.
   Free substitutes only (Milling/Fragment are licensed). → reverses the "dashboard" read.
2. **Warm-neutral dark base + softer radius** (shift `#0e0f12`→`~#1a1a1a` warm, radius
   6–12px, 74px card-height floor). Low effort, large perceived-quality jump.
3. **Editorial micro-interactions** (link underline-on-hover 3px offset, standard 2px focus
   ring). Cheap, and the focus ring is also an a11y win.

**Keep CUT (low investor value — §7.7 was right):**
- ⌘K command palette (P1-B), magazine imagery (P1-D / no fabricated assets).

**Conditional (defer, not drop):**
- **Light theme** (P1-C): Blockworks defaults light, so true parity wants it — but it's a
  larger token-set + provider effort. Recommend **after** items 1–3 land, since 1–3 fix the
  identity gap in dark mode at a fraction of the cost.

**Net:** the cheapest path to "feels Blockworks-grade" is items 1–3 (type system + warm dark
base + micro-interactions), NOT a full light-theme build. This directly answers Namwoong's
"editorial-skinned dashboard" complaint at the identity layer.

---

## 8. Implementation handoff scope (for @EngLead)

1. `app/layout.tsx`: add free editorial display face (`next/font/google`, e.g. Fraunces or
   Newsreader) → `--font-display`; keep Geist for body/mono. Apply display face to lead/secondary
   story headlines only.
2. `app/globals.css`: warm the dark base (`--bg-base ~#1a1a1a`, `--bg-card ~#202020`), bump
   `--radius-md/lg` to 6–8px / 10–12px, add `--card-min-h: 74px`, `--focus-ring`, and a
   link-hover underline rule (3px offset).
3. Pin GlobalChrome header to 62px height + 24px horizontal padding + 1px bottom rule.
4. Headline type-scale tier so lead headline ≥1.8× secondary (already an AC-IA1 requirement).

Out of scope until decided: light theme (P1-C), ⌘K (P1-B), imagery (P1-D).
