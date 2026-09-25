import { NextResponse } from "next/server";
import { z } from "zod";
import { listForLease, ProtocolError, takeLease } from "@/lib/store";
import {requirePrivyUser} from "@/lib/auth";

export const dynamic = "force-dynamic";

const listSchema = z.object({
  action: z.literal("list"),
  id: z.string().min(3),
  rentSats: z.number().int().positive(),
  tenorDays: z.number().int().positive().max(365),
  maxDrawdownBps: z.number().int().min(0).max(5000),
});

const takeSchema = z.object({
  action: z.literal("take"),
  id: z.string().min(3),
});

export async function POST(req: Request) {
  try {
    const json = await req.json();
    const userId = await requirePrivyUser(req);
    if (json.action === "list") {
      const body = listSchema.parse(json);
      const cap = await listForLease({...body, owner: userId});
      return NextResponse.json({ capability: cap });
    }
    if (json.action === "take") {
      const body = takeSchema.parse(json);
      const cap = await takeLease({...body, lessee: userId});
      return NextResponse.json({ capability: cap });
    }
    return NextResponse.json({ error: "unknown action" }, { status: 400 });
  } catch (err) {
    if (err instanceof ProtocolError) {
      return NextResponse.json({ error: err.message }, { status: err.status });
    }
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: "invalid request" }, { status: 400 });
    }
    console.error(err);
    return NextResponse.json({ error: "lease failed" }, { status: 500 });
  }
}
