import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Crypto Signal Hub",
  description: "Upbit market signals with chart logic and Four Pillars research links.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  );
}
