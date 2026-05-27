import { NextResponse } from "next/server";
import { getDayCandles, getTopKrwTickers, toKrwMarket } from "@/lib/upbit";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const symbol = searchParams.get("symbol");

  if (symbol) {
    const candles = await getDayCandles(toKrwMarket(symbol), 220);
    return NextResponse.json({ symbol: symbol.toUpperCase(), candles });
  }

  const tickers = await getTopKrwTickers(Number(searchParams.get("limit") ?? 20));
  return NextResponse.json({ tickers });
}
