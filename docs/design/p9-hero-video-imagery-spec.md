# §9 — Hero Video & Imagery Asset Spec (DEC-007 P0)

> Owner: @Design. Created 2026-05-31 to close the last DEC-007 open item: `img/canvas/video=0`.
> Companion to `docs/design/blockworks-teardown.md` §9 (Motion & Imagery Teardown).
> CSS/DOM hero motion is already GREEN in prod; this spec covers the remaining **video/imagery
> asset layer**, not the keyframe motion.
> This spec does NOT assert any specific clip is downloaded or licensed yet — final clip URLs must
> be verified (license + format + weight) before EngLead downloads. See §9.5 Verification Gate.

---

## 9.1 — Art Direction (what we are buying)

Blockworks §9 reads as **abstract data/3D motion**, not stock footage of coins or trading floors.
Hard rule: **no literal crypto imagery** (no Bitcoin coins, no candlestick screen recordings, no
"hacker in hoodie"). Those read cheap and off-brand.

Target aesthetic:
- Dark / near-black background that blends into the page `--bg`. The clip sits *under* lead-story
  copy, so it must be dark enough to keep overlaid white text at WCAG AA contrast.
- Abstract: dotted grids, particle fields, slow data-rail / network-node drift, soft gradient bloom,
  3D wireframe or mesh rotation. Slow, ambient, non-distracting (seamless loop, no hard cuts).
- Color: neutral/cool with at most a restrained amethyst (`#a855f7`) wash matching the token palette.
  No rainbow, no neon overload.
- Motion energy: LOW. It is a backdrop, not a showreel. Avoid fast pans/zooms — they cause motion
  sickness and fight the foreground CSS hero motion already shipped.

## 9.2 — Verified source entry points (license-clean)

CEO-approved curation pools. All allow commercial use; attribution varies — confirm per clip in §9.5.

| Source | Entry URL | License notes |
|---|---|---|
| Coverr | https://coverr.co/free-videos/abstract | Coverr License: free commercial, no attribution required. Confirm per clip. |
| Mixkit | https://mixkit.co/free-stock-video/abstract/ | Mixkit License: free commercial, no attribution; redistribution-as-stock prohibited (embedding OK). |
| Pexels Video | https://www.pexels.com/search/videos/abstract%20dark/ | Pexels License: free commercial, no attribution required. |
| Pixabay Video | https://pixabay.com/videos/search/abstract/ | Pixabay Content License: free commercial, no attribution. Backup pool. |
| Videvo | https://www.videvo.net/stock-video-footage/abstract/ | Mixed — only pick clips tagged "Videvo Standard / free". Skip "Editorial". |

Search terms inside each pool: `abstract dark`, `particles`, `network`, `data`, `grid`, `gradient`,
`wireframe`, `3d render dark`, `digital`. Avoid: `bitcoin`, `crypto`, `trading`, `stock market`.

## 9.3 — Selection rubric (pick 2, fallback 1)

Curate **2 primary candidates + 1 fallback**, scored against:
1. Darkness/contrast fit (text overlay readable) — pass/fail gate.
2. Loop-ability (seamless or near-seamless; <= ~15s clip preferred).
3. Source resolution >= 1920x1080 (we downscale, never upscale).
4. License = free commercial, no attribution OR attribution we can place in footer/credits.
5. Brand fit per §9.1 (abstract, not literal).

Deliverable of curation = the §9.6 table filled after the verification pass.

## 9.4 — Technical implementation contract (for @EngLead)

Encode every chosen clip into a dual-format, weight-capped, accessible hero `<video>`:

**Encoding targets**
- Two formats: **WebM (VP9)** primary + **MP4 (H.264 High, yuv420p)** fallback.
- Resolution: **1920x1080** master; ship a **1280x720** variant for mobile (mobile must not pull 1080p).
- Weight budget: **<= 600KB** desktop per format; **<= 350KB** for the 720p mobile variant. If a clip
  can't compress under budget at acceptable quality, reject it and use the fallback.
- Strip audio (`-an`). Loop length 8–15s.
- Poster: export one representative frame as **WebP** (`<= 60KB`) — LCP-safe first paint and the
  reduced-motion still.

**Suggested ffmpeg recipes** (EngLead tunes CRF for budget):
```
# WebM VP9, no audio, 1080p
ffmpeg -i src.mp4 -an -c:v libvpx-vp9 -crf 34 -b:v 0 -vf "scale=1920:-2" hero.webm
# MP4 H.264, faststart, yuv420p for Safari
ffmpeg -i src.mp4 -an -c:v libx264 -profile:v high -pix_fmt yuv420p -crf 26 -movflags +faststart -vf "scale=1920:-2" hero.mp4
# 720p mobile variants (repeat both with scale=1280:-2, tighter CRF)
# Poster frame -> WebP
ffmpeg -i src.mp4 -vf "select=eq(n\,30),scale=1920:-2" -frames:v 1 -c:v libwebp -quality 80 hero-poster.webp
```

**Markup contract**
```jsx
<video
  className="hero-video"
  autoPlay
  muted
  loop
  playsInline
  preload="metadata"
  poster="/hero/hero-poster.webp"
  aria-hidden="true"
>
  <source src="/hero/hero.webm" type="video/webm" />
  <source src="/hero/hero.mp4" type="video/mp4" />
</video>
```
- `aria-hidden="true"` — decorative only.
- Place behind copy with an overlay scrim (`::after` `rgba(11,11,13,0.55)`) so lead-story text keeps
  AA contrast regardless of frame.
- Files live under `public/hero/`. Self-hosted, no CDN (matches no-external-asset posture).

**Reduced-motion + perf fallback (REQUIRED)**
```css
@media (prefers-reduced-motion: reduce) {
  .hero-video { display: none; }
  .hero-poster-fallback { display: block; }
}
```
- `prefers-reduced-motion: reduce` -> no autoplay, show WebP poster only.
- Pause/teardown when hero scrolls out (IntersectionObserver) to save battery/CPU.
- Honor `navigator.connection.saveData` -> poster only.

## 9.5 — Verification gate (before download / ship)

Final clip URLs are NOT asserted here. Before download, run this pass (WebFetch or manual browser):
1. Open each candidate page, confirm the download-button license string is free-commercial.
2. Record exact source resolution + file size.
3. Confirm the clip is genuinely dark/abstract per §9.1.
4. Only then download + encode per §9.4.

Do not claim "§9 imagery shipped" until: clips encoded under budget, `public/hero/` populated, hero
renders the video on a built/deployed page, and a prod canary confirms `video > 0` + poster fallback
+ reduced-motion path. That ship/PASS call is @Release's after a real deploy.

## 9.6 — Curated candidate table (TO FILL after §9.5 pass)

| Clip title | Source | Page URL | Res | License | Why it fits |
|---|---|---|---|---|---|
| _pending verification pass_ | | | | | |
| _pending verification pass_ | | | | | |
| _fallback — pending_ | | | | | |
