import {NextResponse} from "next/server";
import {serverAuthConfigured} from "@/lib/auth";
import {redisConfigured} from "@/lib/store";
import {
  MINT_FEE_SATS,
  TREASURY_ADDRESS,
  WALLET_MINT_CAP_SATS,
} from "@/lib/protocol";

export const dynamic = "force-dynamic";

export async function GET() {
  const auth = serverAuthConfigured();
  const durableStore = redisConfigured();
  const executionProvider = Boolean(
    process.env.EXECUTION_PROVIDER_URL &&
      process.env.EXECUTION_PROVIDER_TOKEN &&
      process.env.EXECUTION_OPERATOR_ID,
  );
  return NextResponse.json({
    network: "bitcoin-mainnet",
    treasuryAddress: TREASURY_ADDRESS,
    issuanceFeeSats: MINT_FEE_SATS,
    walletCapSats: WALLET_MINT_CAP_SATS,
    auth,
    durableStore,
    issuanceEnabled: auth && durableStore,
    verifier: "mempool.space",
    executionMarket: {
      catalogSize: 21_000,
      operatorOriginated: true,
      executionProvider,
      settlementNetwork: "bitcoin-mainnet",
      minimumOrderSats: 5_000,
      checkoutEnabled: auth && durableStore && executionProvider,
    },
  });
}
