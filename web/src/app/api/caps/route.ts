import { NextResponse } from "next/server";
import { nanoid } from "nanoid";
import { z } from "zod";
import { CAPABILITY_TYPES } from "@/lib/protocol";
import { listCaps, mintCapability, ProtocolError, walletMintedFee } from "@/lib/store";
import { MINT_FEE_SATS, WALLET_MINT_CAP_SATS } from "@/lib/protocol";

export const dynamic = "force-dynamic";

const mintSchema = z.object({
  owner: z.string().min(8).max(128),
  type: z.enum(
    CAPABILITY_TYPES.map((t) => t.id) as [
      (typeof CAPABILITY_TYPES)[number]["id"],
      ...(typeof CAPABILITY_TYPES)[number]["id"][],
    ],
  ),
});

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const owner = searchParams.get("owner");
  const status = searchParams.get("status");
  let caps = await listCaps();
  if (owner) {
    caps = caps.filter((c) => c.owner.toLowerCase() === owner.toLowerCase());
  }
  if (status) {
    caps = caps.filter((c) => c.status === status);
  }
  return NextResponse.json({ caps });
}

export async function POST(req: Request) {
  try {
    const body = mintSchema.parse(await req.json());
    const spent = await walletMintedFee(body.owner);
    const fee = MINT_FEE_SATS;
    const max = WALLET_MINT_CAP_SATS;
    if (spent + fee > max) {
      return NextResponse.json(
        { error: "wallet mint cap reached (0.01 BTC)" },
        { status: 400 },
      );
    }

    const cap = await mintCapability({
      owner: body.owner,
      type: body.type,
      id: `cap_${nanoid(10)}`,
    });

    return NextResponse.json({
      capability: cap,
      mintFeeSats: fee,
      wallet: {
        address: body.owner,
        mintedFeeSats: spent + fee,
        remainingFeeSats: max - spent - fee,
        maxFeeSats: max,
      },
    });
  } catch (err) {
    if (err instanceof ProtocolError) {
      return NextResponse.json({ error: err.message }, { status: err.status });
    }
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: "invalid request" }, { status: 400 });
    }
    console.error(err);
    return NextResponse.json({ error: "mint failed" }, { status: 500 });
  }
}
