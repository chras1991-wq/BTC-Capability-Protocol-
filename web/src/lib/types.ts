import { CAPABILITY_TYPES, type CapabilityTypeId } from "./protocol";

export type CapStatus = "ready" | "listed" | "leased";

export interface Capability {
  id: string;
  owner: string;
  type: CapabilityTypeId;
  mintedAt: number;
  mintFeeSats: number;
  paymentTxid?: string;
  payerAddress?: string;
  /** Lease terms — set on list */
  rentSats?: number;
  tenorDays?: number;
  maxDrawdownBps?: number;
  listedAt?: number;
  /** Active lease */
  lessee?: string;
  leasedAt?: number;
  leaseEndsAt?: number;
  status: CapStatus;
}

export interface WalletStats {
  address: string;
  mintedCount: number;
  mintedFeeSats: number;
  remainingFeeSats: number;
  maxFeeSats: number;
}

export interface RootStore {
  caps: Capability[];
  /** address → cumulative mint fees paid (sats) */
  walletFees: Record<string, number>;
  /** mainnet payment txids already consumed by an issuance */
  usedTxids: string[];
}

export function typeLabel(id: CapabilityTypeId): string {
  return CAPABILITY_TYPES.find((t) => t.id === id)?.label ?? id;
}
