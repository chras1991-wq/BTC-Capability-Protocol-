/** Core types for ROOT V1 capability objects (spec-level, not consensus code). */

export type Sats = bigint;

export type AllowedOp =
  | "ln_open_channel"
  | "ln_adjust_channel"
  | "swap_bounded"
  | "collateral_attest"
  | "option_collateral";

export interface Vault {
  id: string;
  value: Sats;
  ownerPk: string;
  recoveryBlocks: number;
}

export interface Capability {
  id: string;
  vaultId: string;
  holderPk: string;
  ops: AllowedOp[];
  startHeight: number;
  endHeight: number;
  /** Max drawdown in sats the holder may impose on residual. */
  maxDrawdown: Sats;
  /** Prepaid rent in sats paid to owner. */
  rent: Sats;
  transferable: boolean;
}

export interface ClearedLease {
  capability: Capability;
  underlyingValue: Sats;
  /** Tenor in days for annualization. */
  tenorDays: number;
}

export interface SpendPath {
  name: string;
  keys: string[];
  locktimeBlocks?: number;
  constraint: string;
}

/**
 * Compile a descriptive V1 policy graph for a vault + single LN capability.
 * Real deployments emit PSBTs / MuSig2 sessions; this returns an auditable sketch.
 */
export function compileLnVaultPolicy(
  vault: Vault,
  cap: Capability,
  enforcerPk: string,
): SpendPath[] {
  if (cap.vaultId !== vault.id) {
    throw new Error("capability vault mismatch");
  }
  if (!cap.ops.includes("ln_open_channel")) {
    throw new Error("LN capability requires ln_open_channel");
  }
  if (cap.maxDrawdown > vault.value) {
    throw new Error("maxDrawdown exceeds vault value");
  }

  return [
    {
      name: "recover_owner",
      keys: [vault.ownerPk],
      locktimeBlocks: vault.recoveryBlocks,
      constraint: "unilateral owner spend after CSV; cancels live caps",
    },
    {
      name: "cap_ln_exercise",
      keys: [cap.holderPk, enforcerPk],
      constraint: `MuSig2; funding outputs ⊆ LN templates; residual ≥ ${vault.value - cap.maxDrawdown}n sats to vault`,
    },
    {
      name: "cooperative_close",
      keys: [vault.ownerPk, cap.holderPk, enforcerPk],
      constraint: "wind-down channels; return residual to owner cold path",
    },
  ];
}

/**
 * Bitcoin Capability Rate for a segment of cleared leases (annualized).
 * BCR_s = avg_i (ρ_i / v_i) * (365 / T_i)
 */
export function bitcoinCapabilityRate(leases: ClearedLease[]): number {
  if (leases.length === 0) return 0;
  let sum = 0;
  for (const lease of leases) {
    if (lease.underlyingValue <= 0n || lease.tenorDays <= 0) {
      throw new Error("invalid lease notionals");
    }
    const rentRatio =
      Number(lease.capability.rent) / Number(lease.underlyingValue);
    sum += rentRatio * (365 / lease.tenorDays);
  }
  return sum / leases.length;
}

export function formatBtc(sats: Sats): string {
  return `${(Number(sats) / 1e8).toFixed(8)} BTC`;
}
