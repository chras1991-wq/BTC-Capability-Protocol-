import { NextResponse } from "next/server";
import { getCap } from "@/lib/store";

export const dynamic = "force-dynamic";

export async function GET(
  _req: Request,
  ctx: { params: Promise<{ id: string }> },
) {
  const { id } = await ctx.params;
  const cap = await getCap(id);
  if (!cap) return NextResponse.json({ error: "not found" }, { status: 404 });
  return NextResponse.json({ capability: cap });
}
