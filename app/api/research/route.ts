import { NextResponse } from "next/server";
import { findResearch } from "@/lib/four-pillars";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const symbol = searchParams.get("symbol");

  if (!symbol) {
    return NextResponse.json({ error: "symbol is required" }, { status: 400 });
  }

  return NextResponse.json({ research: findResearch(symbol) });
}
