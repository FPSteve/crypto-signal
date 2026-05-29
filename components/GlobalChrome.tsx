"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, MessageSquare, X } from "lucide-react";

type ChromeTicker = {
  market: string;
  name?: string;
  trade_price: number;
  signed_change_rate: number;
};

const navItems = [
  { label: "Signals", href: "/", match: "signals" },
  { label: "Research", href: "/research", match: "research" },
  { label: "Prices", href: "/prices", match: "prices" },
  { label: "Chat", href: "/chat", match: "chat" },
] as const;

function formatKrw(value: number) {
  if (value >= 1_000_000) return `${Math.round(value / 1_000_000).toLocaleString()}M`;
  if (value >= 1_000) return `${Math.round(value / 1_000).toLocaleString()}K`;
  return Math.round(value).toLocaleString();
}

function formatSignedPercent(value: number) {
  const percent = value * 100;
  return `${percent >= 0 ? "+" : ""}${percent.toFixed(1)}%`;
}

function symbolFromMarket(market: string) {
  return market.replace("KRW-", "");
}

function getActiveTab(pathname: string) {
  if (pathname === "/chat") return "chat";
  if (pathname.startsWith("/research")) return "research";
  if (pathname.startsWith("/prices")) return "prices";
  return "signals";
}

export function GlobalChrome({ tickers }: { tickers: ChromeTicker[] }) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const activeTab = getActiveTab(pathname);
  const tickerTape = tickers.slice(0, 12);

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  return (
    <header className="sticky top-0 z-50 border-b border-[var(--rule)] bg-[var(--bg-base)]/95 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-5 py-3 sm:px-8">
        <Link href="/" className="font-[family-name:var(--font-display)] text-2xl font-bold leading-none text-[var(--text-primary)] sm:text-3xl">
          Signal Hub
        </Link>

        <nav className="hidden items-center gap-1 md:flex" aria-label="Primary">
          {navItems.map((item) => {
            const active = activeTab === item.match;
            return (
              <Link
                key={item.label}
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={`border-b px-3 py-2 text-xs font-semibold uppercase tracking-[0.14em] transition-colors ${
                  active
                    ? "border-[var(--text-primary)] text-[var(--text-primary)]"
                    : "border-transparent text-[var(--text-muted)] hover:text-[var(--text-secondary)]"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          <Link
            href="/chat"
            className="inline-flex h-8 items-center gap-1.5 rounded-[var(--radius-sm)] border border-[var(--rule)] px-3 text-xs font-medium text-[var(--text-primary)] transition-colors hover:bg-white/[0.04]"
          >
            <MessageSquare size={13} />
            AI 채팅
          </Link>
        </div>

        <button
          type="button"
          className="inline-flex h-9 w-9 items-center justify-center border border-[var(--rule)] text-[var(--text-primary)] md:hidden"
          onClick={() => setMobileOpen((open) => !open)}
          aria-label={mobileOpen ? "메뉴 닫기" : "메뉴 열기"}
          aria-expanded={mobileOpen}
        >
          {mobileOpen ? <X size={17} /> : <Menu size={17} />}
        </button>
      </div>

      {mobileOpen && (
        <nav className="border-t border-[var(--rule)] px-5 py-2 md:hidden" aria-label="Mobile primary">
          {navItems.map((item) => {
            const active = activeTab === item.match;
            return (
              <Link
                key={item.label}
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={`flex border-b py-3 text-sm font-semibold last:border-b-0 ${
                  active
                    ? "border-[var(--text-primary)] text-[var(--text-primary)]"
                    : "border-[var(--rule)] text-[var(--text-muted)]"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
      )}

      <div className="border-t border-[var(--rule)] bg-[var(--bg-raised)]/70">
        <div className="mx-auto max-w-7xl overflow-x-auto px-5 sm:px-8">
          <div className="ticker-track flex min-w-max items-center gap-7 py-2 md:animate-[ticker-marquee_42s_linear_infinite]">
            {[...tickerTape, ...tickerTape].map((ticker, index) => {
              const symbol = symbolFromMarket(ticker.market);
              const positive = ticker.signed_change_rate >= 0;
              return (
                <Link
                  key={`${ticker.market}-${index}`}
                  href={`/coin/${symbol}`}
                  className="flex shrink-0 items-baseline gap-2 font-[family-name:var(--font-mono)] text-xs"
                >
                  <span className="font-semibold text-[var(--text-primary)]">{symbol}</span>
                  <span className="text-[var(--text-muted)]">{formatKrw(ticker.trade_price)}</span>
                  <span className={positive ? "text-[var(--accent-bull)]" : "text-[var(--accent-bear)]"}>
                    {formatSignedPercent(ticker.signed_change_rate)}
                  </span>
                </Link>
              );
            })}
            {tickerTape.length === 0 && (
              <span className="py-1 font-[family-name:var(--font-mono)] text-xs text-[var(--text-muted)]">
                Upbit ticker unavailable
              </span>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
