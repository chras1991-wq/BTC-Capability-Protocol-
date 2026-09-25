import { NextResponse } from "next/server";
import { protocolStats } from "@/lib/store";

export const dynamic = "force-dynamic";

export async function GET() {
  const stats = await protocolStats();
  return NextResponse.json(stats);
}
