import { Activity, Database, TimerReset } from "lucide-react";
import { getTopKrwTickers } from "@/lib/upbit";
import { PricesTable, type PriceTableRow } from "@/components/PricesTable";
import { Badge } from "@/components/ui/Badge";
import { SectionKicker } from "@/components/ui/SectionKicker";

export const revalidate = 60;

function formatSignedPercentFromRatio(value: number) {
  const percent = value * 100;
  return `${percent >= 0 ? "+" : ""}${percent.toFixed(2)}%`;
}

export default async function PricesPage() {
  const tickers = await getTopKrwTickers(50).catch(() => []);
  const rows: PriceTableRow[] = tickers.map((ticker) => ({
    market: ticker.market,
    symbol: ticker.market.replace("KRW-", ""),
    name: ticker.name,
    tradePrice: ticker.trade_price,
    signedChangeRate: ticker.signed_change_rate,
    signedChangePrice: ticker.signed_change_price,
    accTradePrice24h: ticker.acc_trade_price_24h,
    accTradeVolume24h: ticker.acc_trade_volume_24h,
    highPrice: ticker.high_price,
    lowPrice: ticker.low_price,
  }));
  const totalVolume = tickers.reduce((sum, ticker) => sum + ticker.acc_trade_price_24h, 0);
  const rising = tickers.filter((ticker) => ticker.signed_change_rate >= 0).length;
  const falling = tickers.length - rising;
  const averageChange = tickers.length
    ? tickers.reduce((sum, ticker) => sum + ticker.signed_change_rate, 0) / tickers.length
    : 0;

  const summaryItems = [
    {
      icon: Database,
      label: "Coverage",
      value: `${tickers.length} KRW markets`,
      meta: "Upbit public ticker endpoint",
    },
    {
      icon: Activity,
      label: "Breadth",
      value: `${rising}/${falling}`,
      meta: `평균 ${formatSignedPercentFromRatio(averageChange)}`,
    },
    {
      icon: TimerReset,
      label: "Refresh",
      value: "60s",
      meta: "route revalidate interval",
    },
  ];

  return (
    <main className="min-h-screen bg-[var(--bg-base)]">
      <section className="border-b border-[var(--rule)] px-5 py-8 sm:px-8">
        <div className="mx-auto max-w-7xl">
          <SectionKicker rule>Prices</SectionKicker>
          <div className="mt-5 grid gap-6 lg:grid-cols-[1fr_24rem] lg:items-end">
            <div>
              <h1 className="font-[family-name:var(--font-display)] text-4xl font-bold leading-tight text-[var(--text-primary)] sm:text-6xl">
                Upbit KRW 마켓 테이블
              </h1>
              <p className="mt-5 max-w-3xl text-base leading-7 text-[var(--text-secondary)]">
                거래대금 상위 KRW 마켓을 정렬·검색하면서 가격, 24시간 등락률, 일중 변동폭을 비교합니다.
              </p>
            </div>

            <div className="rounded-[var(--radius-lg)] border border-[var(--rule)] bg-[var(--bg-card)] p-5">
              <div className="flex flex-wrap gap-2">
                <Badge variant="brand">Top volume</Badge>
                <Badge variant={averageChange >= 0 ? "bull" : "bear"}>{formatSignedPercentFromRatio(averageChange)}</Badge>
              </div>
              <p className="mt-4 font-[family-name:var(--font-mono)] text-3xl font-bold text-[var(--text-primary)]">
                {Math.round(totalVolume / 1_000_000_000).toLocaleString()}B KRW
              </p>
              <p className="mt-2 text-sm text-[var(--text-muted)]">표시 종목 24h 거래대금 합산</p>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-4 px-5 py-6 sm:px-8 lg:grid-cols-3">
        {summaryItems.map((item) => (
          <div key={item.label} className="min-h-[var(--card-min-h)] rounded-[var(--radius-md)] border border-[var(--rule)] bg-[var(--bg-card)] p-5">
            <div className="flex items-center gap-2 text-[var(--text-muted)]">
              <item.icon size={16} />
              <p className="font-[family-name:var(--font-mono)] text-xs uppercase tracking-[0.14em]">{item.label}</p>
            </div>
            <p className="mt-4 text-2xl font-bold text-[var(--text-primary)]">{item.value}</p>
            <p className="mt-2 text-sm text-[var(--text-muted)]">{item.meta}</p>
          </div>
        ))}
      </section>

      <section className="mx-auto max-w-7xl px-5 pb-12 sm:px-8">
        <PricesTable rows={rows} />
      </section>
    </main>
  );
}
