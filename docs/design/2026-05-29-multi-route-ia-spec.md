# Multi-Route IA Spec — Signals / Research / Prices / Chat

owner: @Design · for: @EngLead · status: SPEC (구현 대기) · ref: DEC-006
cwd: `/Users/woongbotv2/Documents/woongvibecode/crypto-signal`

## 목표
앵커 스크롤(`/#research-desk`, `/#prices`)을 진짜 라우트로 분리하고, **4페이지가 서로 다른
정보 구조(IA)·레이아웃 위계**를 갖게 한다. 같은 카드 그리드를 4번 반복하지 않는다.

| Route | 정체성 | 지배 레이아웃 | 같으면 안 되는 이유 |
|---|---|---|---|
| `/` Signals | 랭킹 보드 (Ranking Board) | Lead Story + 순위 그리드 | "오늘 무엇을 볼까" 진입점 |
| `/research` Research | 에디토리얼 리서치 데스크 | 단일 컬럼 롱폼 리딩 | 읽는 페이지 (thesis/risks/sources) |
| `/prices` Prices | 데이터 테이블 | 정렬·필터 가능한 dense 테이블 | 훑는 페이지 (수치 스캔) |
| `/chat` Chat | 대화형 (기존 유지) | 채팅 스트림 | 변경 없음 |

각 페이지는 위계가 다르다: Signals=**서술형 카드**, Research=**장문 리딩**, Prices=**고밀도 수치**.

---

## 1. `/` — Signals (랭킹 보드로 슬림화)

기존 홈에서 **Top Volume(prices) 섹션 제거**(→ `/prices`로 이관). 시그널 랭킹에만 집중.

```
┌─ MarketRegime (유지) ──────────────────────────────┐
├─ MarketMetricGrid (유지) ──────────────────────────┤
├─ [메인 1fr]                       [사이드 22rem] ──┤
│  Kicker: "Today's Ranking"        ┌ Buckets (유지)┐│
│  H1: KRW 마켓 시그널 순위           │ 데이/스윙/포지 ││
│  ─ Lead Story (#1, 유지) ─         └──────────────┘│
│  ─ 순위 그리드 #2~#8 (유지) ─                        │
│     + 각 카드에 "리서치 보기"→/research#SYM 링크 추가 │
└─────────────────────────────────────────────────────┘
```

- 데이터: 기존 `getDashboardData()` 그대로. **변경**: `tickers` prop은 더 이상 본문에서 안 씀
  (GlobalChrome 티커테이프는 유지).
- 카피 변경: 메인 Kicker `Daily Signals`→`Today's Ranking`, H1 `KRW 마켓 상위 종목 분석`→
  `KRW 마켓 시그널 순위`. 우측 설명문 유지.
- 카드 푸터에 `/research#${symbol}` 딥링크 추가(리서치가 있는 종목만). 기존 `/coin/${symbol}#research`
  대신 신규 Research 페이지 앵커로 보냄.
- `id="research-desk"`, `id="prices"` 앵커는 **제거**(라우트로 대체).

## 2. `/research` — Research (에디토리얼 데스크, 신규)

장문 리딩 IA. 카드 그리드 금지 — **단일 컬럼, 넓은 행간, 큰 measure**.

```
┌─ Page Header ──────────────────────────────────────┐
│  Kicker: "Four Pillars Research Desk"               │
│  H1: 리서치 데스크                                   │
│  Lede: AI 합성·검색 리서치로 종목별 thesis·리스크·   │
│        근거를 정리합니다. (한 문장)                   │
├─ Mode Notice (status 배너) ────────────────────────┤
│  "AI 합성 / 검색 경로 — 원문 직접 제공 아님" 안내    │
├─ Research Entry (종목별 반복, 단일 컬럼) ──────────┤
│  ▍SYMBOL · 코인명          [confidence 배지] [source]│
│   thesis (font-heading, 큰 본문)                    │
│   ── Key Points ──        • keyPoints[]             │
│   ── Risks ──             • risks[] (bear 톤)       │
│   ── Sources ──           searchUrl 링크 + foundAt  │
│   → /coin/SYMBOL 상세 보기                           │
├─ (다음 종목 …) ────────────────────────────────────┤
└─────────────────────────────────────────────────────┘
```

- 데이터: 대시보드 signals 상위 8개 symbol에 대해 `findResearch(symbol)` (sync, 즉시 렌더).
  실데이터 검증 강화가 필요하면 `findVerifiedResearch` (async) — 단 8초 bridge 타임아웃 주의.
  **권장**: 페이지 SSR에서 `findResearch`로 즉시 렌더(빠름), 종목 상세에서 verified 사용.
- `ResearchMatch` 필드 매핑:
  - `title`/`symbol` → 엔트리 헤더
  - `confidence` (high/medium/low) → 배지 색(high=bull, medium=brand, low=neutral)
  - `status`/`source`/`displayMode` → Mode Notice 및 엔트리 메타. `displayMode:"fallback"`는
    정상 상태이므로 에러처럼 보이지 않게 중립 톤. 카피: "검색/AI 합성 경로".
  - `thesis` → 리드 본문 (null이면 `summary` 폴백)
  - `keyPoints[]` → Key Points 리스트 (비면 섹션 숨김)
  - `risks[]` → Risks 리스트 (bear 톤, 비면 숨김)
  - `searchUrl` → Sources 외부 링크, `foundAt` → 타임스탬프
- 금지어 가드: "대표 권한 원문", "원문 직접" 류 노출 금지(DEC-005 scope-cut). "AI 합성/검색 리서치"로만.
- 재사용 컴포넌트: `Card`/`CardHeader`/`CardBody`, `Badge`, `SectionKicker`. 신규 `ResearchEntry`
  컴포넌트 1개 신설 권장(엔트리 반복용).

## 3. `/prices` — Prices (데이터 테이블, 신규)

고밀도 수치 스캔 IA. 서술형 카드 금지 — **정렬·필터 테이블**.

```
┌─ Page Header ──────────────────────────────────────┐
│  Kicker: "Upbit KRW Market"                         │
│  H1: 실시간 시세                                     │
│  meta: 업데이트 UTC · revalidate · n개 마켓          │
├─ Controls ─────────────────────────────────────────┤
│  [검색 input: 심볼] [정렬: 거래대금▼/등락률/가격]    │
├─ Table (monospace, tabular-nums, dense) ───────────┤
│  # │ SYMBOL │ 현재가 │ 24h % │ 24h 거래대금 │ 고가/저가│
│  1 │ BTC    │ ...    │ +2.1% │ ...B        │ ...     │
│  …  (상위 30~50개)                                   │
│  행 클릭 → /coin/SYMBOL                              │
└─────────────────────────────────────────────────────┘
```

- 데이터: `getTopKrwTickers(50)` (SSR). 정렬/검색은 클라이언트 컴포넌트로
  (`"use client"` 테이블 래퍼). 컬럼: `trade_price`, `signed_change_rate`,
  `acc_trade_price_24h`(거래대금), `high_price`/`low_price`.
- 등락률 색: bull/bear 토큰. 가격은 `tabular-nums` + mono 폰트로 정렬감.
- 정렬 기본: 거래대금 desc. 토글: 거래대금 / 등락률 / 가격 / 심볼.
- 검색: 심볼 substring 필터(클라이언트).
- 모바일: 컬럼 축약(현재가·등락률만), 고가/저가는 sm 이상에서 표시.
- 재사용: `SectionKicker`, `Badge`, 토큰. 신규 `PriceTable`(client) 1개 신설.
- 필드 확정(`lib/upbit.ts:10` `UpbitTicker`): `trade_price`, `signed_change_rate`,
  `acc_trade_price_24h`, `acc_trade_volume_24h`, `high_price`, `low_price`, `prev_closing_price`
  모두 존재 → 보강 불필요, 그대로 컬럼 바인딩.

## 4. `/chat` — 변경 없음

기존 유지. nav active 상태만 pathname 기반으로 정확히 잡히면 됨.

---

## GlobalChrome 변경 (components/GlobalChrome.tsx)

```diff
 const navItems = [
   { label: "Signals", href: "/", match: "signals" },
-  { label: "Research", href: "/#research-desk", match: "research" },
-  { label: "Prices", href: "/#prices", match: "prices" },
+  { label: "Research", href: "/research", match: "research" },
+  { label: "Prices", href: "/prices", match: "prices" },
   { label: "Chat", href: "/chat", match: "chat" },
 ] as const;
```

- `getActiveTab`을 **pathname 기반**으로 리팩터(hash 의존 제거):
  - `/chat`→chat, `/research`→research, `/prices`→prices, 그 외(`/`,`/coin/*`)→signals.
  - `hash` state·`hashchange` 리스너·`NavItem`의 `#` 분기 제거 가능(모두 실라우트라 `Link`로 통일).
- 4개 모두 `next/link` `Link` 사용 → prefetch + 클라 전환.

## 수용 기준 (QA 핸드오프용)
- `/`, `/research`, `/prices`, `/chat` 각 라우트 200, 서로 다른 H1/Kicker/레이아웃.
- nav 4개 클릭 시 active 밑줄이 현재 라우트와 일치(앵커 점프 아님).
- Research에 "원문 직접/대표 권한 원문" 금지어 0건, fallback이 에러톤 아님.
- Prices 정렬·검색 동작, 행 클릭 → /coin/SYMBOL.
- lint/build 통과. console error/overlay 0.
```
