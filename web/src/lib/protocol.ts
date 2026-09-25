/** Protocol constants — sats */

export const MINT_FEE_SATS = 5_000; // 0.00005 BTC ≈ $4
export const WALLET_MINT_CAP_SATS = 1_000_000; // 0.01 BTC per wallet

export const MINT_FEE_BTC = 0.00005;
export const WALLET_MINT_CAP_BTC = 0.01;
export const TREASURY_ADDRESS =
  process.env.NEXT_PUBLIC_TREASURY_ADDRESS ??
  "bc1p6r2ve3qnwuyxen6pphzgkdwn8h8wdz8fyl4yd46duvgdnv3uq0dqjxrnwv";

export const CAPABILITY_TYPES = [
  { id: "ln", label: "Lightning" },
  { id: "mm", label: "Market-making" },
  { id: "collateral", label: "Collateral" },
  { id: "option", label: "Option" },
] as const;

export type CapabilityTypeId = (typeof CAPABILITY_TYPES)[number]["id"];

export const TENOR_PRESETS = [7, 30, 90] as const;

export function formatBtc(sats: number, digits = 8): string {
  return `${(sats / 1e8).toFixed(digits)} BTC`;
}

export function maxMintsPerWallet(): number {
  return Math.floor(WALLET_MINT_CAP_SATS / MINT_FEE_SATS);
}
