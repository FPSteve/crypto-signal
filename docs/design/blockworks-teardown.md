# Blockworks Visual Teardown → crypto-signal Gap List

Owner: Design Lead · Date: 2026-05-29 (rev. 4 — + motion section §9, stale-premise corrections §10) · Channel: #upbit-fourpillars-project
Method: live browser/computed-style teardown of `https://blockworks.com/` homepage +
design-system CSS extraction. **Canonical source domain is `https://blockworks.com/` only.**
Blockworks is built on Chakra UI; tokens are exposed as `--chakra-colors-*` /
`--chakra-fontSizes-*` CSS vars. `/prices` was reachable by browser and direct fetch;
article/listing density outside the homepage still needs browser verification if it becomes scope.
Compared against current repo tokens: `app/globals.css` + `app/layout.tsx` @ commit `908243f`
plus this rev. 3 EngLead correction.

> Truth note (§7.0 of parity spec): this is a **source teardown**, not a prod parity PASS.
> No live crypto-signal URL was re-verified in this run. Implementation + live verify is a
> separate handoff.
>
> ⚠️ **Stale-claim correction (rev. 3):** the earlier framing "crypto-signal엔 amethyst 브랜드
> 액센트가 아예 없음 = 최대 갭" is **factually wrong against shipped `908243f`**. Current
> `app/globals.css` already has `--accent-brand: #a855f7` (amethyst-400) and the DEC-007 pass
> already warmed the dark base to `#1a1a1a`/`#202020`, softened radius to 6–12px, and added a
> `--focus-ring`. The **real** remaining gap is (1) the **light-default theme + light-mode
> amethyst-500 `#6633ff`** Blockworks ships, and (2) the display typography needs to stay
> **geometric sans**, not serif. §2/§3/§5 below are corrected to current shipped state.

---

## 1. Typography

Live browser snapshot (1440x900, 2026-05-29): homepage H1 uses `milling`, 76px, 600,
98.8px line-height. Body/root uses `Soehne`; many data cards/headings compute as `Inter`.
Telemetry/mono assets include `Fragment Mono`. CSS also exposes Tiempos/Soehne assets for
content surfaces, but the homepage hero is not serif.

| Role | Blockworks (actual) | crypto-signal @ `908243f` | Gap |
|---|---|---|---|
| Display/headline | **Milling** custom geometric sans, 600, 76px live H1 | `--font-display` now maps to Geist (license-safe geometric sans substitute) | ⚠️ License-safe substitute, not exact proprietary face. Keep heavy sans; do not use serif. |
| Body / UI | **Soehne** root/body; **Inter** appears in many Chakra cards/headings | Geist Sans | ✅ Acceptable local substitute. |
| Mono / data labels | **Fragment Mono**, xs/sm telemetry | Geist Mono | ⚠️ Fragment Mono is lighter/editorial; Geist Mono is acceptable but heavier. |
| Caption | 0.625–0.875rem (xs–sm), 300 light | not formalized | ❌ No light-weight caption tier; current UI uses one weight band. |

**Core gap:** Blockworks' identity is a **geometric display sans + data/UI sans/mono system**.
The old serif recommendation is wrong for the current live site. Local parity should use
Geist heavy for display, Geist for UI, and Geist Mono for telemetry.

---

## 2. Color tokens

Blockworks = **light-default + dark-alt** dual theme (Chakra `_light`/`_dark` semantic tokens).
Brand ramp (rev. 2 raw): amethyst-500 `#6633ff` (light brand) · subtle `#ededff` · emphasis
`#9f9aff` · amethyst-400 `#a855f7` (dark brand).

| Token | Blockworks light | Blockworks dark | crypto-signal @ `908243f` (dark-only) | Gap |
|---|---|---|---|---|
| BG base | `#f4f4f4` | `#1a1a1a` (warm neutral gray) | `#1a1a1a` (`app/globals.css`) | ✅ **Dark base now matches** (DEC-007 warmed from old `#0e0f12`). ❌ No light theme. |
| Panel/surface | `#fafafa` | `#202020` | `#202020` (`app/globals.css`) | ✅ **Matches** (was `#16181c`). ❌ No light surface. |
| Text primary | `#1a1a1a` | `#f4f4f4` | `#f2f3f5` | ✅ Close. |
| Text muted | `#7c7c7c` | `#cccccc` | `#8f8f8f` | ⚠️ Muted tier is dimmer than BW `#cccccc`; secondary text matches closer. |
| Accent (brand) | `#6633ff` amethyst-500 | `#a855f7` amethyst-400 | `#a855f7` (`app/globals.css`) | ✅ **Dark brand matches BW dark exactly.** ❌ Missing the light-mode `#6633ff` + subtle `#ededff`/emphasis `#9f9aff` ramp. |
| Border / rule | `#e6e6e6` | `#2a2a2a` | `#262a30` | ✅ Dark border close. |
| Bull/success | `#17ba7c` | `#17ba7c` | `#17ba7c` | ✅ **Exact match.** |
| Bear/error | `#f0384a` | `#f0384a` | `#f0384a` | ✅ **Exact match.** |

**Core gap (corrected):** the dark theme is now **token-accurate to Blockworks dark** (base
`#1a1a1a`, panel `#202020`, brand `#a855f7`, bull/bear exact). The **only** real color gap is
the **missing light-default theme** — BW ships light first (bg `#f4f4f4`, brand amethyst-500
`#6633ff`, subtle `#ededff`, emphasis `#9f9aff`, muted `#7c7c7c`). "amethyst 아예 없음"은 사실이
아님 — 우리는 BW의 **dark** amethyst를 이미 보유, 빠진 건 **light** amethyst-500 ramp뿐.

---

## 3. Layout / spacing / density

Raw Chakra layout values (rev. 2 fetch): header `62px` / pad `0 1.5rem` / logo `160px`;
card radius `0.5rem` (lg) · min-h `74px` · padding `1rem` · border `1px`; hero min-h `50vh`
(max `600px`) · display `3.75rem` · line-height `1.3`; grid `6col @sm(640)` / `5col @md(768)`
· gap `0.75rem`; radius scale `xs 2px → 2xl 16px`.

| Aspect | Blockworks | crypto-signal @ `908243f` | Gap |
|---|---|---|---|
| Card padding | `1rem` (16px) | `--space-md: 16px` | ✅ Aligns. |
| Card radius | `0.5rem` (lg, 8px); scale xs 2px→2xl 16px | `--radius-sm..xl` = 6/8/10/12px (`app/globals.css`) | ✅ **Now aligned** (DEC-007 softened from old 2–8px). |
| Card min-height | `74px` | `--card-min-h: 74px` (Release-confirmed) | ✅ **Now enforced.** |
| Grid columns | 6col @sm(640) / 5col @md(768), gap `0.75rem` | story grid ≥2 col (DEC-006) | ⚠️ BW packs denser (5–6); ours tops at 2–3. Consider 3–4 for data grids. |
| Spacing rhythm | 0.25rem steps, gaps 0.5–1.5rem | 4/8/16/24/32/48 scale | ✅ Compatible scale. |
| Logo width | `160px` | (verify GlobalChrome) | ⚠️ Pin logo slot ~160px. |
| Hero | min-h `50vh` (max 600px), display `3.75rem`, lh `1.3` | (verify lead story block) | ⚠️ Set lead-story hero to these raw values. |
| Header height | **62px fixed**, 1.5rem horiz pad, border-bottom | (Release: topbar 62px / 24px confirmed) | ✅ **Matches** (topbar 62px; ticker wrapper adds to 96px). |

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
| Link hover | mixed: nav suppresses underline; content links use color/underline recipes | transparent underline + 3px offset exists in `globals.css` | ✅ Present where links opt in; nav-style links intentionally suppress underline. |
| Button hover | bg opacity → 0.8 shift | ad-hoc `--bg-card-hover` | ⚠️ Inconsistent token. |
| Transition range | 50ms–500ms | 150/250/400ms | ✅ Compatible. |
| Focus ring | **1px solid amethyst** (Chakra default ring) | `--focus-ring: 2px solid var(--accent-brand)` (`app/globals.css`) | ✅ **Formalized** (DEC-007). ⚠️ BW raw = 1px; ours 2px — tighten to 1px for exact parity (minor). |
| Pulse/anim | 2s ease-out loop | shimmer/score-fill present | ✅ OK. |

---

## 6. Verification gaps (honest boundaries)

- Homepage and `/prices` were reachable in this EngLead run. Article/research listing pages
  still need a dedicated browser pass before making route-level parity claims.
- Chakra semantic tokens (`_light`/`_dark` pairs) confirmed at design-system level; per-component
  Chakra recipe overrides (e.g. card hover elevation, nav active state) not extracted — headless.
- Custom faces (Milling, Fragment Mono) are **licensed/proprietary** — we cannot ship them.
  Parity must use license-safe substitutes: Geist heavy display, Geist UI, Geist Mono telemetry.
- No live crypto-signal prod URL re-verified this run (per §7.0 — out of scope for teardown).

---

## 7. Priority recommendation — reopen §7.7 CUT items?

The parity spec §7.7 CUT light theme / typo-scale / density as "low investor value cosmetics."
The teardown shows that judgment was **half right**: the *cosmetics* (⌘K palette, magazine
imagery) are genuinely low-value, but **two CUT items are actually identity-critical**, not
cosmetic — without them the product cannot read as Blockworks at all.

**Status update (rev. 2):** items 2 & 3 from rev. 1 **already shipped in DEC-007 `908243f`** —
warm dark base `#1a1a1a`/`#202020`, radius 6–12px, 74px card floor, `--focus-ring` token, brand
amethyst `#a855f7`. So the dark-mode identity gap is largely closed. What genuinely remains:

**REOPEN — top priority (identity-critical, NOT yet done):**
1. **Increase structural data density.** Mirror the live homepage rhythm: 5 compact metric
   cards, 4 chart/data modules, then a wider sector/comparison table. Use existing
   Upbit/Four Pillars data only.
2. **Tighten dark muted + focus ring to BW raw** (`#8f8f8f`/`#cccccc` tiers, focus ring 2px→1px).
   Cheap polish toward exact parity.

**Keep CUT (low investor value — §7.7 was right):**
- ⌘K command palette (P1-B), magazine imagery (P1-D / no fabricated assets).

**Conditional (defer, not drop):**
- **Light-default theme** (P1-C): Blockworks ships light first (bg `#f4f4f4`, brand amethyst-500
  `#6633ff`, subtle `#ededff`, emphasis `#9f9aff`, muted `#7c7c7c`). True parity wants it, but
  it's a full second token-set + theme provider. Recommend **after** item 1 lands. This is now
  the single largest remaining gap — but it's an additive build, not a correction of dark mode.

**Net (corrected):** dark-mode token parity is largely **shipped**, and this rev. 3 correction
keeps display typography geometric sans instead of serif. The largest remaining scope item is
the **light-default theme**, but the highest investor-value work is denser research/data modules.

---

## 8. Implementation handoff scope (for @EngLead)

**Already done in `908243f` (do NOT redo):** warm dark base `#1a1a1a`/`#202020`, radius 6–12px,
`--card-min-h: 74px`, `--focus-ring`, `--accent-brand #a855f7`, header 62px/24px.

**Remaining work:**
1. **Keep display geometric sans:** `app/layout.tsx` should load Geist + Geist Mono only.
   `app/globals.css` maps `--font-display`/`--font-heading` to Geist. Do not reintroduce
   serif display fonts in this parity track.
2. **Polish to BW raw (P1, minor):** dark muted tiers toward `#cccccc`; focus ring 2px→1px.
3. **Increase module density:** add chart/data rows and sector-style comparison tables using
   existing Upbit/Four Pillars data.

**Deferred (additive, decision needed):** light-default theme (P1-C) — full `_light` token set
(bg `#f4f4f4`, brand `#6633ff`, subtle `#ededff`, emphasis `#9f9aff`, muted `#7c7c7c`) + theme
provider. ⌘K (P1-B), imagery (P1-D) stay CUT.

---

## 9. Motion teardown (rev. 4 — Design, 2026-05-29)

> 🔄 **rev. 6 supersession (Design, 2026-05-31):** §9.1 below originally specced **"No video, no
> WebGL"** (CSS gradient drift only) — that CSS/DOM motion layer is now **shipped + GREEN in prod**.
> Namwoong then asked for real hero **video/imagery** ("좋은 비디오 영상"), and CEO approved adding a
> video asset layer (Coverr/Mixkit/Pexels abstract dark loops). The video layer does **not** replace
> the shipped CSS drift — it sits behind it as the §9 imagery parity (`img/canvas/video=0` closeout).
> Full video asset spec → **`docs/design/p9-hero-video-imagery-spec.md`**. The "No video" line in
> §9.1 is superseded for the imagery track; keep the CSS drift as the reduced-motion / no-video
> fallback.

Added in response to Namwoong: "blockworks 첫 페이지 상단 막 모션 그래픽도 있는데 넌 이런거
못넣냐." DEC-007 visual-parity scope did not previously spec motion, so the homepage reads
static. This section tokenizes the top-of-page motion so @EngLead can implement in stages.

> ⚠️ **Verification boundary (per §6 convention):** Blockworks' exact hero motion is
> JS/canvas-driven and was **not** frame-captured in a headless run this pass. The values below
> are an editorial-finance motion *spec* calibrated to BW's observed pattern (subtle, slow,
> low-saturation), not an exact recording. Treat durations/easing as the design target;
> EngLead may refine against a live capture if one is run.

### 9.0 Existing motion assets (code-verified @ `908243f`, do NOT rebuild)

| Asset | Location | State |
|---|---|---|
| Live ticker marquee | `components/GlobalChrome.tsx:126` (`md:animate-[ticker-marquee_42s_linear_infinite]`) + `app/globals.css:134` keyframe + `:139` hover-pause | ✅ **Already shipped** — strengthen only (§9.3), do not rebuild. |
| Skeleton shimmer | `app/globals.css:129` `@keyframes shimmer` | ✅ Present. |
| Score-ring fill | `app/globals.css:124` `@keyframes score-fill` | ✅ Present. |
| Motion tokens | `app/globals.css:54-57` `--ease-out` + `--duration-fast/normal/slow` (150/250/400ms) | ✅ Reusable base — new motion should consume these, not invent new timings. |
| `prefers-reduced-motion` guard | **none in `app/` or `components/`** (grep: only in a `docs/specs` md) | ❌ **Gap.** Ticker/shimmer/score-fill currently run unconditionally. Any new motion + the existing three must be wrapped in a reduced-motion fallback (§9.4). |

### 9.1 Hero background motion — **P0**

| Property | Spec |
|---|---|
| Type | Slow amethyst→base gradient drift (CSS `background-position` or low-opacity layered radial). **No video, no WebGL** — keep it cheap + license-free. Use `--accent-brand #a855f7` (dark) at low alpha over `--bg-base #1a1a1a`. |
| Trigger | Auto on mount (above the fold); pause when tab hidden (`visibilitychange`) to save CPU. |
| Duration | 18–24s loop, `linear` or gentle `ease-in-out`. Slow enough to feel ambient, not animated. |
| Easing | `linear` for the loop; one-shot reveal uses `var(--ease-out)`. |
| Scope | Lead-story / hero block only (the §3 hero: min-h `50vh`, max 600px). Do not bleed into data grids. |
| reduced-motion | Freeze to a static gradient (first frame). No drift. |

### 9.2 Scroll reveal / parallax — **P1**

| Property | Spec |
|---|---|
| Type | Fade + 8–12px translateY rise on section entry (IntersectionObserver, `once: true`). Optional slow parallax on the hero gradient only (≤6% shift). |
| Trigger | Element enters viewport (threshold ~0.15). One-shot — no re-trigger on scroll-up. |
| Duration | 400–500ms (`--duration-slow` = 400ms). |
| Easing | `var(--ease-out)` (`cubic-bezier(0.16,1,0.3,1)`). |
| Scope | Section headers + metric/data card rows below the fold. Stagger siblings by ~60ms. |
| reduced-motion | Render final state immediately (no fade/translate). Content must never be hidden if JS/motion is off — default to visible, enhance with reveal. |

### 9.3 Live ticker marquee — **already shipped, strengthen only**

| Property | Current (`908243f`) | Strengthen target |
|---|---|---|
| Motion | `ticker-marquee` 42s linear infinite, `md:` only | OK. Confirm pause on `:hover` (`globals.css:139`) + add pause on focus-within for keyboard users. |
| Direction | translateX(0 → -50%), duplicated track | ✅ Correct seamless loop. |
| reduced-motion | none | ❌ Must stop the marquee (static row, horizontal scroll fallback already exists via `overflow-x-auto` at `GlobalChrome.tsx:125`). |

### 9.4 Required reduced-motion fallback (blocks all of §9)

`app/globals.css` must add a global guard. All loops (ticker, shimmer, score-fill) + new hero
drift / scroll reveal must respect it:

```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.001ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.001ms !important;
    scroll-behavior: auto !important;
  }
}
```

Scroll-reveal JS must also check `window.matchMedia('(prefers-reduced-motion: reduce)')` and
skip the observer (render content visible by default).

### 9.5 Implementation priority for @EngLead

1. **P0 — hero gradient drift** (`app/globals.css` keyframe consuming `--accent-brand`/`--bg-base` + apply to lead-story/hero block on `app/page.tsx`). Pure CSS.
2. **P0 — reduced-motion guard** (§9.4) — ship **with** the hero, not after. Non-negotiable a11y gate.
3. **P1 — scroll reveal** (IntersectionObserver util + section opt-in). Content-visible default.
4. **Polish — ticker** pause-on-focus + reduced-motion stop (small edit to existing marquee).

Keep amethyst/warm-dark/radius/focus/card-min-h + the existing ticker keyframe **untouched**
(§8). Motion must layer on top of `908243f`, not rewrite it.

---

## 10. ⚠️ Stale-premise corrections (rev. 4, code-verified @ `908243f`)

This pass corrects three claims in the inbound handoff/memory that are **false against shipped code**:

1. **"`docs/design/blockworks-teardown.md` 부재"** → **WRONG.** The file already exists (committed
   `d39991b` "Add Blockworks visual teardown"). This rev. 4 *appends* the motion section to it.
2. **"라이브 티커 미구현"** → **WRONG.** `GlobalChrome.tsx:126` already ships the marquee. Scope is
   *strengthen* (§9.3), not build.
3. **Font: "display face 미연결, layout.tsx에 Geist/Geist_Mono만 존재"** → **STALE (committed-only).**
   ~~committed `d39991b` had a `Noto_Serif_KR` import in `app/layout.tsx`~~ — but that import was
   **never consumed** (no html-className wire, no token reference = dead import), and committed
   `globals.css` had **no `--font-display` token at all** (headings inherited Geist body). `Newsreader`
   = **0 references repo-wide**. No serif display was ever actually wired.

## 11. ✅ DESIGN CALL — display face = geometric sans (Geist). RESOLVED. (rev. 5, code-verified @ `908243f`)

**The "sans vs serif display" open question (Product spec §9.2) is closed: SANS.** Decision owner: Design.

Code reality (verified this run, cwd `crypto-signal` @ `908243f`):
- `Newsreader`: **0 references** anywhere in the repo. The "Newsreader serif display" premise that
  propagated through memory + parity-spec §9.2 is a **phantom — it does not exist in code.**
- committed `layout.tsx`: `Noto_Serif_KR` = **dead import** (imported, never consumed).
- committed `globals.css`: **no `--font-display` token** → every `var(--font-display)` heading
  (`page.tsx`, `research/page.tsx`, `prices/page.tsx`, `MarketRegime.tsx`, `GlobalChrome.tsx`)
  resolved undefined → inherited Geist body. So **prod already renders Geist sans** for headings.
- **working tree (uncommitted `M`)**: `Noto_Serif_KR` dead import **removed**; `globals.css:15`
  `--font-display: var(--font-geist)` + `:16 --font-heading: var(--font-display)` added →
  display now **explicitly** Geist sans. This matches §1/§8. No contradiction remains.

**Decision:** keep **Geist** as the display/heading face (license-safe geometric-sans substitute for
Blockworks' proprietary grotesque). Do **not** introduce serif. The working-tree wiring is the
correct end state — it just needs to be **committed**.

**Real root cause of "글꼴 개병신" (corrected):** NOT a serif mistake. It is (a) committed/prod had
`--font-display` **undefined** so headings carried no distinct display weight/scale (flat vs body),
and (b) Geist is a **generic** sans that does not read as Blockworks. → Parity upgrade path below.

**Parity note (not blocking the sans call):** Geist satisfies "geometric sans, no serif" but is too
generic for true Blockworks visual parity. If full-parity typographic character is required, evaluate
a closer free grotesque for `--font-display` only (body stays Geist). This is a **font-swap follow-up**,
separate from the sans/serif resolution — flag to @Product for parity-spec AC, not a blocker for the
backbone commit.

> ⚠️ prod parity / PASS / ship 표현은 새 deploy + named URL canary 검증 전까지 금지.
