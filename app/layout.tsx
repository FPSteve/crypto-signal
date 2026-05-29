import type { Metadata } from "next";
import { Geist, Geist_Mono, Noto_Serif_KR } from "next/font/google";
import { GlobalChrome } from "@/components/GlobalChrome";
import { getTopKrwTickers } from "@/lib/upbit";
import "./globals.css";

const geist = Geist({
  subsets: ["latin"],
  variable: "--font-geist",
});

const geistMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-geist-mono",
});

const display = Noto_Serif_KR({
  weight: ["500", "600", "700"],
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Crypto Signal Hub",
  description: "Upbit market signals with chart logic and Four Pillars research links.",
};

export const revalidate = 60;

async function getChromeTickers() {
  try {
    return await getTopKrwTickers(12);
  } catch {
    return [];
  }
}

export default async function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const tickers = await getChromeTickers();

  return (
    <html lang="ko" className={`${geist.variable} ${geistMono.variable} ${display.variable}`}>
      <body className="font-[family-name:var(--font-body)]">
        <GlobalChrome tickers={tickers} />
        {children}
      </body>
    </html>
  );
}
