"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowDown, ArrowUp, ArrowUpDown, Search } from "lucide-react";

export type PriceTableRow = {
  market: string;
  symbol: string;
  name?: string;
  tradePrice: number;
  signedChangeRate: number;
  signedChangePrice: number;
  accTradePrice24h: number;
  accTradeVolume24h: number;
  highPrice: number;
  lowPrice: number;
};

type SortKey = "volume" | "change" | "price" | "spread";
type SortDirection = "asc" | "desc";

const sortOptions: Array<{ key: SortKey; label: string }> = [
  { key: "volume", label: "거래대금" },
  { key: "change", label: "등락률" },
  { key: "price", label: "가격" },
  { key: "spread", label: "변동폭" },
];

function formatKrw(value: number) {
  if (value >= 1_000_000_000) return `${(value / 1_000_000_000).toFixed(1)}B`;
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return Math.round(value).toLocaleString();
  return value.toLocaleString(undefined, { maximumFractionDigits: 4 });
}

function formatPercent(value: number) {
  const percent = value * 100;
  return `${percent >= 0 ? "+" : ""}${percent.toFixed(2)}%`;
}

function spreadPercent(row: PriceTableRow) {
  if (!row.lowPrice) return 0;
  return ((row.highPrice - row.lowPrice) / row.lowPrice) * 100;
}

function sortValue(row: PriceTableRow, key: SortKey) {
  if (key === "volume") return row.accTradePrice24h;
  if (key === "change") return row.signedChangeRate;
  if (key === "price") return row.tradePrice;
  return spreadPercent(row);
}

export function PricesTable({ rows }: { rows: PriceTableRow[] }) {
  const [query, setQuery] = useState("");
  const [sortKey, setSortKey] = useState<SortKey>("volume");
  const [direction, setDirection] = useState<SortDirection>("desc");

  const filteredRows = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    return rows
      .filter((row) => {
        if (!normalized) return true;
        return (
          row.symbol.toLowerCase().includes(normalized) ||
          row.market.toLowerCase().includes(normalized) ||
          (row.name ?? "").toLowerCase().includes(normalized)
        );
      })
      .sort((a, b) => {
        const diff = sortValue(a, sortKey) - sortValue(b, sortKey);
        return direction === "asc" ? diff : -diff;
      });
  }, [direction, query, rows, sortKey]);

  const handleSort = (key: SortKey) => {
    if (key === sortKey) {
      setDirection((current) => (current === "asc" ? "desc" : "asc"));
      return;
    }
    setSortKey(key);
    setDirection("desc");
  };

  return (
    <section className="overflow-hidden rounded-[var(--radius-lg)] border border-[var(--rule)] bg-[var(--bg-card)]">
      <div className="grid gap-3 border-b border-[var(--rule)] p-4 lg:grid-cols-[1fr_auto] lg:items-center">
        <label className="flex min-h-11 items-center gap-3 rounded-[var(--radius-md)] border border-[var(--rule)] bg-[var(--bg-base)] px-3 text-sm text-[var(--text-secondary)]">
          <Search size={16} className="shrink-0 text-[var(--text-muted)]" />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="심볼, 마켓, 한글명 검색"
            className="min-w-0 flex-1 bg-transparent py-3 text-[var(--text-primary)] outline-none placeholder:text-[var(--text-muted)]"
          />
        </label>

        <div className="flex flex-wrap gap-2">
          {sortOptions.map((option) => {
            const active = option.key === sortKey;
            const Icon = active ? (direction === "asc" ? ArrowUp : ArrowDown) : ArrowUpDown;
            return (
              <button
                key={option.key}
                type="button"
                aria-pressed={active}
                onClick={() => handleSort(option.key)}
                className={`inline-flex h-10 items-center gap-1.5 rounded-[var(--radius-sm)] border px-3 text-xs font-semibold transition-colors ${
                  active
                    ? "border-[var(--text-primary)] text-[var(--text-primary)]"
                    : "border-[var(--rule)] text-[var(--text-muted)] hover:text-[var(--text-secondary)]"
                }`}
              >
                <Icon size={13} />
                {option.label}
              </button>
            );
          })}
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[58rem] border-collapse text-sm">
          <thead>
            <tr className="border-b border-[var(--rule)] font-[family-name:var(--font-mono)] text-[11px] uppercase tracking-[0.14em] text-[var(--text-muted)]">
              <th className="px-4 py-3 text-left font-semibold">Rank</th>
              <th className="px-4 py-3 text-left font-semibold">Market</th>
              <th className="px-4 py-3 text-right font-semibold">Price</th>
              <th className="px-4 py-3 text-right font-semibold">24h</th>
              <th className="px-4 py-3 text-right font-semibold">Spread</th>
              <th className="px-4 py-3 text-right font-semibold">Volume KRW</th>
              <th className="px-4 py-3 text-right font-semibold">Volume Coin</th>
            </tr>
          </thead>
          <tbody>
            {filteredRows.map((row, index) => {
              const positive = row.signedChangeRate >= 0;
              return (
                <tr key={row.market} className="border-b border-[var(--rule)] last:border-b-0 hover:bg-white/[0.025]">
                  <td className="px-4 py-3 font-[family-name:var(--font-mono)] text-xs text-[var(--text-muted)]">
                    #{index + 1}
                  </td>
                  <td className="px-4 py-3">
                    <Link href={`/coin/${row.symbol}`} className="group inline-flex flex-col">
                      <span className="font-semibold text-[var(--text-primary)] group-hover:text-white">{row.symbol}</span>
                      <span className="text-xs text-[var(--text-muted)]">{row.name ?? row.market}</span>
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-right font-[family-name:var(--font-mono)] tabular-nums text-[var(--text-primary)]">
                    {formatKrw(row.tradePrice)}
                  </td>
                  <td
                    className={`px-4 py-3 text-right font-[family-name:var(--font-mono)] tabular-nums ${
                      positive ? "text-[var(--accent-bull)]" : "text-[var(--accent-bear)]"
                    }`}
                  >
                    {formatPercent(row.signedChangeRate)}
                  </td>
                  <td className="px-4 py-3 text-right font-[family-name:var(--font-mono)] tabular-nums text-[var(--text-secondary)]">
                    {spreadPercent(row).toFixed(2)}%
                  </td>
                  <td className="px-4 py-3 text-right font-[family-name:var(--font-mono)] tabular-nums text-[var(--text-secondary)]">
                    {formatKrw(row.accTradePrice24h)}
                  </td>
                  <td className="px-4 py-3 text-right font-[family-name:var(--font-mono)] tabular-nums text-[var(--text-muted)]">
                    {formatKrw(row.accTradeVolume24h)}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {filteredRows.length === 0 && (
        <div className="px-4 py-12 text-center text-sm text-[var(--text-muted)]">검색 결과가 없습니다.</div>
      )}
    </section>
  );
}
