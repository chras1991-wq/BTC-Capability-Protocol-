import assert from "node:assert/strict";
import { bitcoinCapabilityRate, compileLnVaultPolicy, type Capability, type Vault } from "./types.js";

const vault: Vault = {
  id: "v1",
  value: 100_000_000n,
  ownerPk: "o",
  recoveryBlocks: 144,
};

const cap: Capability = {
  id: "c1",
  vaultId: "v1",
  holderPk: "h",
  ops: ["ln_open_channel"],
  startHeight: 1,
  endHeight: 1000,
  maxDrawdown: 1_000_000n,
  rent: 500_000n,
  transferable: false,
};

const paths = compileLnVaultPolicy(vault, cap, "e");
assert.equal(paths.length, 3);
assert.ok(paths.some((p) => p.name === "recover_owner"));

const bcr = bitcoinCapabilityRate([
  { capability: cap, underlyingValue: 100_000_000n, tenorDays: 365 },
]);
assert.ok(Math.abs(bcr - 0.005) < 1e-12);

assert.throws(() =>
  compileLnVaultPolicy(vault, { ...cap, ops: ["swap_bounded"] }, "e"),
);

console.log("ok — bcr + policy compiler");
