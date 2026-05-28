import { NextResponse } from "next/server";
import { findVerifiedResearch } from "@/lib/four-pillars";

export const runtime = "nodejs";
export const revalidate = 21600;

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const symbol = searchParams.get("symbol");

  if (!symbol) {
    return NextResponse.json({ error: "symbol is required" }, { status: 400 });
  }

  const research = await findVerifiedResearch(symbol);
  return NextResponse.json({ research });
}
