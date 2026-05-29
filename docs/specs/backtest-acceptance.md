# Backtest Acceptance Criteria (P2)

Status: Backlog (non-blocking). Owner: Product. Implements: validation evidence for `lib/backtest.ts`.
Date: 2026-05-29. Channel: #upbit-fourpillars-project.

## Why this exists
시그널 점수가 실제 예측력이 있는지 증명할 acceptance 증거가 없다. 현재 `runBacktest()`는 메트릭을
계산하지만, "이 전략에 엣지가 있다"를 판정할 합격선이 정의돼 있지 않다. 이 문서는 그 합격선과
검증 절차를 정의한다. (실제 가치 = Four Pillars 리서치 + 시그널이 무작위/buy-and-hold보다 낫다는 근거)

## 현 구현 갭 (acceptance 전에 닫아야 함)
1. 거래비용 0 가정 — Upbit 왕복 수수료(~0.1%)·슬리피지 미반영 → winRate 과대.
2. 벤치마크 부재 — buy-and-hold 대비 초과수익 비교 없음.
3. `avgRR` 왜곡 — 손실 0건일 때 `avgLoss=1` 디폴트(backtest.ts:147)로 RR 부풀려짐.
4. Sharpe 연율화 임의 — `Math.sqrt(52)` 하드코딩(backtest.ts:166), 실제 거래 빈도 불일치.
5. 표본 유의성 — <10건 경고만(backtest.ts:168), acceptance 차단 기준 없음.
6. 아웃오브샘플 없음 — 단일 심볼·단일 기간 인샘플 리플레이뿐.

## Acceptance Criteria

### AC-1 비용 반영
- 진입/청산 각각 수수료 + 슬리피지를 `returnPct`에서 차감한다 (기본 왕복 0.1%, 파라미터화).
- 합격: 비용 반영 후에도 메트릭이 계산되고, 비용 전/후 winRate가 결과에 둘 다 노출된다.

### AC-2 벤치마크 대비 초과수익
- 동일 기간 buy-and-hold 수익률을 함께 산출한다.
- 합격: 전략 누적수익 - buy-and-hold 누적수익 = `alpha`가 결과에 포함되고, alpha > 0 인 심볼이
  검증 대상 상위 8개 중 최소 4개 이상.

### AC-3 표본 충분성 (차단 기준)
- 청산 거래(win+loss) < 20건이면 결과를 `inconclusive`로 표기하고 합격 판정에서 제외.
- 합격: sampleSize ≥ 20 인 심볼만 통계 판정에 포함된다.

### AC-4 메트릭 정직성
- `avgRR`은 손실 0건일 때 디폴트 1 대신 `null`/`"n/a"` 반환 (왜곡 제거).
- Sharpe 연율화 계수는 실제 평균 보유일 기반으로 동적 계산하거나, 미연율 raw Sharpe를 같이 노출.
- 합격: 손실 0건 케이스에서 avgRR이 숫자로 부풀려지지 않는다.

### AC-5 엣지 합격선 (상위 8개 심볼 종합)
- winRate(비용 후) ≥ 0.50 AND avgRR ≥ 1.2 AND maxDrawdown ≤ 25% AND alpha > 0.
- 위 4개를 모두 만족하면 `PASS`, 1개라도 미달이면 `REVIEW`, sampleSize 미달이면 `INCONCLUSIVE`.

### AC-6 재현성
- 동일 입력(심볼·기간·캔들)으로 두 번 실행 시 메트릭이 동일해야 한다 (결정론).
- 합격: 두 실행 결과 diff 0.

## Out of scope (이번 acceptance 아님)
- 워크포워드/롤링 윈도우 최적화, 멀티 전략 비교, 실시간 페이퍼 트레이딩.
- 위는 P3+ 후속.

## Handoff readiness
- 구현 owner: @EngLead (backtest.ts 비용/벤치마크/표본 차단 추가).
- 검증 owner: @QAEvals (AC-1~AC-6 acceptance 증거 수집).
- P0(prod chat env)·P1(reasoning 고도화)이 먼저이며 이 작업은 그 뒤 착수.
