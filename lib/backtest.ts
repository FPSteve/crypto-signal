import { ema, rsi, macd, atr } from "./indicators";
import type { CandlePoint } from "./upbit";

export type BacktestResult = {
  symbol: string;
  days: number;
  strategy: string;
  metrics: {
    winRate: number;
    avgRR: number;
    maxDrawdown: number;
    sharpe: number;
  };
  sampleSize: number;
  warnings: string[];
};

type Trade = {
  entryDate: string;
  entryPrice: number;
  exitDate: string;
  exitPrice: number;
  returnPct: number;
  hit: "win" | "loss" | "open";
};

/**
 * Phase 1 default strategy:
 * - Entry: score-like condition (EMA20 > EMA50, RSI in range, MACD bullish)
 * - Exit: 2x ATR stop loss OR +5% take profit OR 7-day max hold
 * - Replays over historical candles
 */
export function runBacktest(
  candles: CandlePoint[],
  symbol: string,
  days = 90,
): BacktestResult {
  const warnings: string[] = [];

  if (candles.length < 60) {
    return {
      symbol, days, strategy: "phase1-default",
      metrics: { winRate: 0, avgRR: 0, maxDrawdown: 0, sharpe: 0 },
      sampleSize: 0,
      warnings: ["캔들 데이터 부족 (최소 60개 필요)"],
    };
  }

  // Use last `days` candles for testing, everything before for warmup
  const testStart = Math.max(candles.length - days, 50);
  const trades: Trade[] = [];
  let inTrade = false;
  let entry: { date: string; price: number; atrVal: number; holdDays: number } | null = null;

  for (let i = testStart; i < candles.length; i++) {
    const slice = candles.slice(0, i + 1);
    const c = candles[i];

    if (inTrade && entry) {
      entry.holdDays++;
      const atrStop = entry.price - 2 * entry.atrVal;
      const takeProfit = entry.price * 1.05;

      if (c.low <= atrStop) {
        // Stop loss hit
        trades.push({
          entryDate: entry.date, entryPrice: entry.price,
          exitDate: c.time, exitPrice: atrStop,
          returnPct: ((atrStop - entry.price) / entry.price) * 100,
          hit: "loss",
        });
        inTrade = false;
        entry = null;
      } else if (c.high >= takeProfit) {
        // Take profit hit
        trades.push({
          entryDate: entry.date, entryPrice: entry.price,
          exitDate: c.time, exitPrice: takeProfit,
          returnPct: 5.0,
          hit: "win",
        });
        inTrade = false;
        entry = null;
      } else if (entry.holdDays >= 7) {
        // Max hold exit at close
        const ret = ((c.close - entry.price) / entry.price) * 100;
        trades.push({
          entryDate: entry.date, entryPrice: entry.price,
          exitDate: c.time, exitPrice: c.close,
          returnPct: ret,
          hit: ret > 0 ? "win" : "loss",
        });
        inTrade = false;
        entry = null;
      }
      continue;
    }

    // Check entry conditions
    const ema20 = ema(slice, 20).at(-1)?.value;
    const ema50 = ema(slice, 50).at(-1)?.value;
    const rsiVal = rsi(slice);
    const macdVal = macd(slice);
    const atrVal = atr(slice);

    if (!ema20 || !ema50 || !rsiVal || !macdVal || !atrVal) continue;

    const entrySignal =
      ema20 > ema50 &&
      rsiVal >= 40 && rsiVal <= 70 &&
      macdVal.trend === "bullish";

    if (entrySignal) {
      inTrade = true;
      entry = { date: c.time, price: c.close, atrVal, holdDays: 0 };
    }
  }

  // Close any open trade at last candle
  if (inTrade && entry) {
    const last = candles.at(-1)!;
    const ret = ((last.close - entry.price) / entry.price) * 100;
    trades.push({
      entryDate: entry.date, entryPrice: entry.price,
      exitDate: last.time, exitPrice: last.close,
      returnPct: ret,
      hit: "open",
    });
  }

  if (trades.length === 0) {
    return {
      symbol, days, strategy: "phase1-default",
      metrics: { winRate: 0, avgRR: 0, maxDrawdown: 0, sharpe: 0 },
      sampleSize: 0,
      warnings: ["기간 내 진입 조건 충족 트레이드 0건"],
    };
  }

  // Calculate metrics
  const wins = trades.filter((t) => t.hit === "win").length;
  const losses = trades.filter((t) => t.hit === "loss").length;
  const closed = wins + losses;
  const winRate = closed > 0 ? wins / closed : 0;

  const avgWin = wins > 0 ? trades.filter((t) => t.hit === "win").reduce((s, t) => s + t.returnPct, 0) / wins : 0;
  const avgLoss = losses > 0 ? Math.abs(trades.filter((t) => t.hit === "loss").reduce((s, t) => s + t.returnPct, 0) / losses) : 1;
  const avgRR = avgLoss > 0 ? avgWin / avgLoss : avgWin;

  // Max drawdown (sequential)
  let peak = 0;
  let maxDD = 0;
  let cumulative = 0;
  for (const t of trades) {
    cumulative += t.returnPct;
    if (cumulative > peak) peak = cumulative;
    const dd = peak - cumulative;
    if (dd > maxDD) maxDD = dd;
  }

  // Sharpe ratio (simple, daily returns -> annualized)
  const returns = trades.map((t) => t.returnPct);
  const meanRet = returns.reduce((a, b) => a + b, 0) / returns.length;
  const variance = returns.reduce((sum, r) => sum + (r - meanRet) ** 2, 0) / returns.length;
  const stdDev = Math.sqrt(variance);
  const sharpe = stdDev > 0 ? (meanRet / stdDev) * Math.sqrt(52) : 0; // annualized assuming ~weekly trades

  if (trades.length < 10) {
    warnings.push(`샘플 수 ${trades.length}건으로 통계적 유의성 낮음`);
  }

  return {
    symbol,
    days,
    strategy: "phase1-default",
    metrics: {
      winRate: Number(winRate.toFixed(3)),
      avgRR: Number(avgRR.toFixed(2)),
      maxDrawdown: Number(maxDD.toFixed(2)),
      sharpe: Number(sharpe.toFixed(2)),
    },
    sampleSize: trades.length,
    warnings,
  };
}
