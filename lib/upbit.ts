const UPBIT_BASE_URL = "https://api.upbit.com/v1";

export type UpbitMarket = {
  market: string;
  korean_name: string;
  english_name: string;
  market_warning?: "NONE" | "CAUTION";
};

export type UpbitTicker = {
  market: string;
  trade_price: number;
  signed_change_rate: number;
  signed_change_price: number;
  acc_trade_price_24h: number;
  acc_trade_volume_24h: number;
  high_price: number;
  low_price: number;
  prev_closing_price: number;
};

export type UpbitDayCandle = {
  market: string;
  candle_date_time_utc: string;
  candle_date_time_kst: string;
  opening_price: number;
  high_price: number;
  low_price: number;
  trade_price: number;
  candle_acc_trade_price: number;
  candle_acc_trade_volume: number;
  timestamp: number;
};

export type CandlePoint = {
  time: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
};

async function upbitFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${UPBIT_BASE_URL}${path}`, {
    ...init,
    headers: {
      Accept: "application/json",
      ...(init?.headers ?? {}),
    },
    next: { revalidate: 60 },
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Upbit API error ${res.status}: ${body}`);
  }

  return res.json() as Promise<T>;
}

export async function getKrwMarkets(): Promise<UpbitMarket[]> {
  const markets = await upbitFetch<UpbitMarket[]>("/market/all?isDetails=true", {
    next: { revalidate: 60 * 60 },
  });
  return markets.filter((market) => market.market.startsWith("KRW-"));
}

export async function getTickers(markets: string[]): Promise<UpbitTicker[]> {
  if (markets.length === 0) return [];
  const tickers: UpbitTicker[] = [];

  for (let index = 0; index < markets.length; index += 100) {
    const chunk = markets.slice(index, index + 100);
    const data = await upbitFetch<UpbitTicker[]>(
      `/ticker?markets=${encodeURIComponent(chunk.join(","))}`,
      { next: { revalidate: 30 } },
    );
    tickers.push(...data);
  }

  return tickers;
}

export async function getTopKrwTickers(limit = 20): Promise<Array<UpbitTicker & { name?: string }>> {
  const markets = await getKrwMarkets();
  const names = new Map(markets.map((market) => [market.market, market.korean_name]));
  const tickers = await getTickers(markets.map((market) => market.market));

  return tickers
    .map((ticker) => ({ ...ticker, name: names.get(ticker.market) }))
    .sort((a, b) => b.acc_trade_price_24h - a.acc_trade_price_24h)
    .slice(0, limit);
}

export async function getDayCandles(market: string, count = 120): Promise<CandlePoint[]> {
  const candles = await upbitFetch<UpbitDayCandle[]>(
    `/candles/days?market=${encodeURIComponent(market)}&count=${count}`,
    { next: { revalidate: 60 * 5 } },
  );

  return candles
    .slice()
    .reverse()
    .map((candle) => ({
      time: candle.candle_date_time_kst.slice(0, 10),
      open: candle.opening_price,
      high: candle.high_price,
      low: candle.low_price,
      close: candle.trade_price,
      volume: candle.candle_acc_trade_volume,
    }));
}

export function toSymbol(market: string): string {
  return market.replace("KRW-", "");
}

export function toKrwMarket(symbol: string): string {
  const normalized = symbol.toUpperCase().replace(/^KRW-/, "");
  return `KRW-${normalized}`;
}
