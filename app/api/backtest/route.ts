import { NextRequest, NextResponse } from "next/server";
import { runBacktest } from "@/lib/backtest";
import { getDayCandles, toKrwMarket } from "@/lib/upbit";

export async function GET(request: NextRequest) {
  const symbol = request.nextUrl.searchParams.get("symbol");
  const days = Math.min(Number(request.nextUrl.searchParams.get("days") ?? 90), 200);

  if (!symbol) {
    return NextResponse.json({ error: "symbol parameter required" }, { status: 400 });
  }

  const market = symbol.startsWith("KRW-") ? symbol : toKrwMarket(symbol);

  try {
    const candles = await getDayCandles(market, Math.max(days + 60, 220));
    const result = runBacktest(candles, symbol.replace("KRW-", ""), days);
    return NextResponse.json(result);
  } catch (err) {
    return NextResponse.json(
      { error: `Failed to run backtest: ${String(err)}` },
      { status: 500 },
    );
  }
}
