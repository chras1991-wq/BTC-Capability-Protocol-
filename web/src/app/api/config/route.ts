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
  const hashrateProvider = Boolean(
    process.env.HASHRATE_PROVIDER_URL &&
      process.env.HASHRATE_PROVIDER_TOKEN &&
      process.env.HASHRATE_SUPPLIER_ID,
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
    hashrateMarket: {
      catalogSize: 21_000,
      supplierGenerated: true,
      hashrateProvider,
      settlementNetwork: "bitcoin-mainnet",
      minimumOrderSats: 5_000,
      checkoutEnabled: auth && durableStore && hashrateProvider,
    },
  });
}
