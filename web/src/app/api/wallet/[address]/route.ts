import { NextResponse } from "next/server";
import { MINT_FEE_SATS, WALLET_MINT_CAP_SATS } from "@/lib/protocol";
import { walletMintedFee } from "@/lib/store";

export const dynamic = "force-dynamic";

export async function GET(
  _req: Request,
  ctx: { params: Promise<{ address: string }> },
) {
  const { address } = await ctx.params;
  const spent = await walletMintedFee(address);
  const max = WALLET_MINT_CAP_SATS;
  const fee = MINT_FEE_SATS;
  return NextResponse.json({
    address,
    mintedFeeSats: spent,
    remainingFeeSats: Math.max(0, max - spent),
    maxFeeSats: max,
    mintFeeSats: fee,
    remainingMints: Math.floor(Math.max(0, max - spent) / fee),
  });
}
