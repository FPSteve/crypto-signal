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

Candidate clip URLs are now curated in §9.6, but **download files are still not asserted**.
Before download, run this pass (WebFetch or manual browser):
1. Open each candidate page, confirm the download-button license string is free-commercial.
2. Record exact source resolution + file size.
3. Confirm the clip is genuinely dark/abstract per §9.1.
4. Only then download + encode per §9.4.

Reject any Mixkit page where the visible download label says **Restricted License** or
**Personal Use only**. Several visually strong 3D tunnel clips fall into that bucket, so they are
not acceptable unless a commercial Envato license is intentionally purchased.

Do not claim "§9 imagery shipped" until: clips encoded under budget, `public/hero/` populated, hero
renders the video on a built/deployed page, and a prod canary confirms `video > 0` + poster fallback
+ reduced-motion path. That ship/PASS call is @Release's after a real deploy.

## 9.6 — Curated candidate table (Design pass, 2026-05-31)

Decision: use **Pexels-first** for this implementation pass. The exact Pexels pages expose "Free to
use" in-page and the Pexels License allows free use, modification, and no attribution. Coverr remains
a valid source pool, but current search results mix native stock with iStock/AI/recreate inventory,
so it needs a manual clip-level pass before it beats the Pexels candidates. Mixkit is a backup only
when the exact clip page says **Mixkit Stock Video Free License**; restricted/personal-use clips are
rejected.

| Clip title | Source | Page URL | Res | License | Why it fits |
|---|---|---|---|---|---|
| **Abstract 3D Network Structure Animation** | Pexels / Nicola Narracci | https://www.pexels.com/video/abstract-3d-network-structure-animation-35004655/ | Page labels royalty-free 4K/HD; exact download size TBD | Pexels License; page shows "Free to use" | **Primary pick.** Best semantic fit: nodes, mesh, network/data structure. Dark/futuristic without literal crypto. Add 55-65% scrim and amethyst tint if frame is too blue. |
| **Seamless loop of abstract glowing particles floating in a dark space** | Pexels / Colin Jones | https://www.pexels.com/video/abstract-glittering-particles-dark-background-35286672/ | Page labels royalty-free 4K/HD; exact download size TBD | Pexels License; page shows "Free to use" | **Primary alternate.** Explicit seamless-loop language, dark particle field, low narrative baggage. Strongest candidate if network clip feels too "tech SaaS." |
| **Elegant Abstract Black Spheres on Dark Background** | Pexels / Nicola Narracci | https://www.pexels.com/video/elegant-abstract-black-spheres-on-dark-background-34541366/ | Page labels royalty-free 4K/HD; exact download size TBD | Pexels License; page shows "Free to use" | **Fallback.** Premium/quiet, very dark, least distracting behind text. Less data-specific, but safest for readability and compression. |

## 9.7 — Source evidence captured in this Design run

- Pexels candidate pages showed `Free download` and `Free to use` labels for the three selected
  clips above.
- Pexels License states photos/videos are free to use, attribution is not required, and modification
  is allowed: https://www.pexels.com/license/
- Mixkit's general free video pool is acceptable only for pages under the **Stock Video Free
  License**. During this pass, multiple strong-looking Mixkit 3D/tunnel pages were rejected because
  their free download was **Restricted License / Personal Use only**.
- Coverr remains a good pool; its library pages state royalty-free commercial use and no attribution,
  but this pass did not lock a single native Coverr clip URL because search results mixed iStock and
  AI/recreate inventory.

## 9.8 — EngLead handoff recommendation

1. Start with candidate 1. If visual QA says it competes with the existing CSS/DOM hero motion, switch
   to candidate 2.
2. Download the smallest 1080p/4K source available, trim to 8-12s, then encode WebM/MP4/poster per
   §9.4.
3. If neither primary compresses under budget (`<=600KB` desktop, `<=350KB` mobile), use candidate 3.
4. Do not use Mixkit restricted/personal-use tunnel clips unless CEO explicitly buys a commercial
   license.

## 9.9 — EngLead implementation evidence (2026-05-31)

Implemented with candidate 1: **Pexels / Nicola Narracci — Abstract 3D Network Structure Animation**.

Source verification:
- Page URL: https://www.pexels.com/video/abstract-3d-network-structure-animation-35004655/
- Download URL resolved from the Pexels `Free download` action:
  `https://videos.pexels.com/video-files/35004655/14829557_1920_1080_30fps.mp4`
- Source metadata: 1920x1080, 30fps, 10.00s, 6,889,473 bytes.
- License evidence: Pexels page labels the clip `Free to use`; Pexels Help Center states Pexels
  photos/videos are free for personal and commercial use without attribution.

Encoded self-hosted assets:
- `public/hero/hero-network-1080.webm` — VP9, 1920x1080, 18fps, 8.00s, 514,028 bytes.
- `public/hero/hero-network-1080.mp4` — H.264 High/yuv420p, 1920x1080, 18fps, 8.00s, 562,985 bytes.
- `public/hero/hero-network-720.webm` — VP9, 1280x720, 18fps, 8.00s, 279,813 bytes.
- `public/hero/hero-network-720.mp4` — H.264 High/yuv420p, 1280x720, 18fps, 8.00s, 256,563 bytes.
- `public/hero/hero-network-poster.webp` — 1920x1080, 38,862 bytes.

Runtime implementation:
- `HeroVideoLayer` is self-hosted and decorative (`aria-hidden=true`).
- Desktop clients receive only 1080 sources; mobile clients receive only 720 sources.
- `prefers-reduced-motion: reduce` and `navigator.connection.saveData` render poster-only with no
  `<video>` node.
- IntersectionObserver pauses playback when the hero leaves view.
- Video load failure removes the video layer so the existing CSS/DOM hero motion remains the fallback.
