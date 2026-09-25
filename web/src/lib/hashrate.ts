export const HASHRATE_ORDER_COUNT = 21_000;
export const MIN_LEASE_PRICE_CENTS = 500;
export const MAX_LEASE_PRICE_CENTS = 2_000;

export const HASHRATE_REGIONS = [
  {id: "na", label: "North America", latencyMs: 42},
  {id: "nordic", label: "Nordics", latencyMs: 58},
  {id: "latam", label: "Latin America", latencyMs: 86},
  {id: "central-asia", label: "Central Asia", latencyMs: 104},
  {id: "east-asia", label: "East Asia", latencyMs: 72},
  {id: "oceania", label: "Oceania", latencyMs: 118},
  {id: "distributed", label: "Distributed", latencyMs: 95},
] as const;

export const HASHRATE_DURATIONS = [
  {minutes: 10, label: "10 min"},
  {minutes: 30, label: "30 min"},
  {minutes: 60, label: "1 hour"},
  {minutes: 180, label: "3 hours"},
  {minutes: 360, label: "6 hours"},
  {minutes: 1_440, label: "24 hours"},
] as const;

export const HASHRATE_MODES = [
  {
    id: "fpps",
    label: "FPPS Route",
    function: "Pool-directed shares with fee-inclusive accounting",
  },
  {
    id: "pps",
    label: "PPS Route",
    function: "Fixed share accounting against accepted work",
  },
  {
    id: "solo",
    label: "Solo Route",
    function: "Direct coinbase destination for solo block search",
  },
  {
    id: "failover",
    label: "Failover Route",
    function: "Primary and fallback Stratum endpoint policy",
  },
  {
    id: "benchmark",
    label: "Benchmark Window",
    function: "Telemetry-scoped ASIC performance verification",
  },
] as const;

export type HashrateOrderStatus = "awaiting-attestation" | "verified" | "leased";

export interface HashrateOrder {
  id: string;
  ordinal: number;
  origin: "operator";
  priceCents: number;
  hashrateTh: number;
  durationMinutes: number;
  durationLabel: string;
  mode: (typeof HASHRATE_MODES)[number]["id"];
  modeLabel: string;
  function: string;
  region: (typeof HASHRATE_REGIONS)[number]["id"];
  regionLabel: string;
  targetLatencyMs: number;
  efficiencyJTh: number;
  startWindowMinutes: number;
  minAcceptedShares: number;
  stratumVersion: "V1" | "V2";
  payoutPolicy: "FPPS" | "PPS" | "COINBASE" | "N/A";
  telemetry: "summary" | "share-stream" | "full-window";
  status: HashrateOrderStatus;
  supplyProof: null;
}

function positiveMod(value: number, modulus: number): number {
  return ((value % modulus) + modulus) % modulus;
}

export function orderId(ordinal: number): string {
  return `HRC-${String(ordinal).padStart(5, "0")}`;
}

export function parseOrderId(id: string): number | null {
  const match = /^HRC-(\d{5})$/i.exec(id);
  if (!match) return null;
  const ordinal = Number(match[1]);
  return ordinal >= 1 && ordinal <= HASHRATE_ORDER_COUNT ? ordinal : null;
}

export function getHashrateOrder(ordinal: number): HashrateOrder {
  if (!Number.isInteger(ordinal) || ordinal < 1 || ordinal > HASHRATE_ORDER_COUNT) {
    throw new RangeError("hashrate order ordinal out of range");
  }

  const index = ordinal - 1;
  const region = HASHRATE_REGIONS[index % HASHRATE_REGIONS.length];
  const duration =
    HASHRATE_DURATIONS[Math.floor(index / HASHRATE_REGIONS.length) % HASHRATE_DURATIONS.length];
  const mode =
    HASHRATE_MODES[
      Math.floor(index / (HASHRATE_REGIONS.length * HASHRATE_DURATIONS.length)) %
        HASHRATE_MODES.length
    ];
  const lot =
    Math.floor(
      index /
        (HASHRATE_REGIONS.length * HASHRATE_DURATIONS.length * HASHRATE_MODES.length),
    ) + 1;

  const priceCents =
    MIN_LEASE_PRICE_CENTS +
    positiveMod(index * 37, MAX_LEASE_PRICE_CENTS - MIN_LEASE_PRICE_CENTS + 1);
  const payoutPolicy =
    mode.id === "fpps"
      ? "FPPS"
      : mode.id === "pps" || mode.id === "failover"
        ? "PPS"
        : mode.id === "solo"
          ? "COINBASE"
          : "N/A";

  return {
    id: orderId(ordinal),
    ordinal,
    origin: "operator",
    priceCents,
    hashrateTh: 1 + positiveMod(index * 17 + lot * 11, 250),
    durationMinutes: duration.minutes,
    durationLabel: duration.label,
    mode: mode.id,
    modeLabel: mode.label,
    function: mode.function,
    region: region.id,
    regionLabel: region.label,
    targetLatencyMs: region.latencyMs + positiveMod(lot * 7, 29),
    efficiencyJTh: 15 + positiveMod(index * 13, 171) / 10,
    startWindowMinutes: [5, 15, 30, 60][positiveMod(index + lot, 4)],
    minAcceptedShares: 8 + positiveMod(index * 19, 493),
    stratumVersion: positiveMod(index, 3) === 0 ? "V2" : "V1",
    payoutPolicy,
    telemetry: (["summary", "share-stream", "full-window"] as const)[
      positiveMod(index + lot, 3)
    ],
    status: "awaiting-attestation",
    supplyProof: null,
  };
}

export function formatUsd(cents: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
  }).format(cents / 100);
}

export function listHashrateOrders(input: {
  page?: number;
  pageSize?: number;
  region?: string;
  mode?: string;
  duration?: number;
  maxPriceCents?: number;
  query?: string;
}): {orders: HashrateOrder[]; total: number; page: number; pageSize: number} {
  const pageSize = Math.min(60, Math.max(1, Math.floor(input.pageSize ?? 24)));
  const page = Math.max(1, Math.floor(input.page ?? 1));
  const needle = input.query?.trim().toUpperCase();
  const directOrdinal = needle ? parseOrderId(needle) : null;

  if (needle && directOrdinal == null) {
    return {orders: [], total: 0, page, pageSize};
  }

  const orders: HashrateOrder[] = [];
  let total = 0;
  const first = directOrdinal ?? 1;
  const last = directOrdinal ?? HASHRATE_ORDER_COUNT;

  for (let ordinal = first; ordinal <= last; ordinal += 1) {
    const order = getHashrateOrder(ordinal);
    if (input.region && order.region !== input.region) continue;
    if (input.mode && order.mode !== input.mode) continue;
    if (input.duration && order.durationMinutes !== input.duration) continue;
    if (input.maxPriceCents && order.priceCents > input.maxPriceCents) continue;

    const start = (page - 1) * pageSize;
    if (total >= start && orders.length < pageSize) orders.push(order);
    total += 1;
  }

  return {orders, total, page, pageSize};
}
