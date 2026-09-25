import {
  bitcoinCapabilityRate,
  compileLnVaultPolicy,
  formatBtc,
  type Capability,
  type ClearedLease,
  type Vault,
} from "./types.js";

const vault: Vault = {
  id: "vault-alice-001",
  value: 500_000_000n, // 5 BTC
  ownerPk: "xonly_alice",
  recoveryBlocks: 12960, // ~90 days
};

const cap: Capability = {
  id: "cap-ln-88421",
  vaultId: vault.id,
  holderPk: "xonly_bob_lsp",
  ops: ["ln_open_channel", "ln_adjust_channel"],
  startHeight: 850_000,
  endHeight: 850_000 + 12960,
  maxDrawdown: 2_000_000n, // 0.02 BTC
  rent: 1_000_000n, // 0.01 BTC
  transferable: true,
};

const paths = compileLnVaultPolicy(vault, cap, "xonly_enforcer");
const leases: ClearedLease[] = [
  { capability: cap, underlyingValue: 200_000_000n, tenorDays: 90 },
  {
    capability: {
      ...cap,
      id: "cap-ln-88422",
      rent: 1_500_000n,
      maxDrawdown: 3_000_000n,
    },
    underlyingValue: 300_000_000n,
    tenorDays: 60,
  },
];

const bcr = bitcoinCapabilityRate(leases);

console.log("ROOT MVP sketch — Lightning liquidity capability\n");
console.log(`Vault ${vault.id}: ${formatBtc(vault.value)}`);
console.log(`Capability ${cap.id}: rent ${formatBtc(cap.rent)}, δ ${formatBtc(cap.maxDrawdown)}`);
console.log("\nSpend paths:");
for (const p of paths) {
  console.log(`  - ${p.name}: keys=${p.keys.join("+")} | ${p.constraint}`);
}
console.log(`\nSample Lightning BCR (annualized): ${(bcr * 100).toFixed(2)}%`);
