export const EXECUTION_ORDER_COUNT = 21_000;
export const MIN_EXECUTION_PRICE_CENTS = 500;
export const MAX_EXECUTION_PRICE_CENTS = 2_000;

export const EXECUTION_DOMAINS = [
  {id: "na", label: "North America", latencyMs: 42},
  {id: "nordic", label: "Nordic", latencyMs: 58},
  {id: "latam", label: "Latin America", latencyMs: 86},
  {id: "central-asia", label: "Central Asia", latencyMs: 104},
  {id: "east-asia", label: "East Asia", latencyMs: 72},
  {id: "oceania", label: "Oceania", latencyMs: 118},
  {id: "distributed", label: "Distributed", latencyMs: 95},
] as const;

export const EXECUTION_WINDOWS = [
  {minutes: 10, label: "10 min"},
  {minutes: 30, label: "30 min"},
  {minutes: 60, label: "1 hour"},
  {minutes: 180, label: "3 hours"},
  {minutes: 360, label: "6 hours"},
  {minutes: 1_440, label: "24 hours"},
] as const;

export const EXECUTION_CLASSES = [
  {
    id: "priority",
    label: "Priority Lane",
    function: "Reserved SHA-256 bandwidth with priority work admission",
    accounting: "work-verified",
  },
  {
    id: "dedicated",
    label: "Dedicated Lane",
    function: "Isolated execution stream routed to a declared endpoint",
    accounting: "window-reserved",
  },
  {
    id: "burst",
    label: "Elastic Burst",
    function: "Time-bounded capacity burst with a constrained activation window",
    accounting: "capacity-metered",
  },
  {
    id: "continuity",
    label: "Continuity Route",
    function: "Dual-endpoint execution policy with automatic route failover",
    accounting: "redundant-execution",
  },
  {
    id: "proof",
    label: "Proof Window",
    function: "Telemetry-scoped capacity verification and performance evidence",
    accounting: "proof-only",
  },
] as const;

export type ExecutionOrderStatus =
  | "awaiting-attestation"
  | "verified"
  | "leased";

export interface ExecutionOrder {
  id: string;
  ordinal: number;
  origin: "operator";
  priceCents: number;
  capacityTh: number;
  durationMinutes: number;
  durationLabel: string;
  executionClass: (typeof EXECUTION_CLASSES)[number]["id"];
  classLabel: string;
  function: string;
  routingDomain: (typeof EXECUTION_DOMAINS)[number]["id"];
  domainLabel: string;
  targetLatencyMs: number;
  energyEnvelopeJTh: number;
  activationWindowMinutes: number;
  minimumProofUnits: number;
  transportVersion: "V1" | "V2";
  accountingPolicy: (typeof EXECUTION_CLASSES)[number]["accounting"];
  telemetry: "summary" | "workstream" | "full-window";
  status: ExecutionOrderStatus;
  capacityProof: null;
}

function positiveMod(value: number, modulus: number): number {
  return ((value % modulus) + modulus) % modulus;
}

export function executionOrderId(ordinal: number): string {
  return `ROOT-${String(ordinal).padStart(5, "0")}`;
}

export function parseExecutionOrderId(id: string): number | null {
  const match = /^ROOT-(\d{5})$/i.exec(id);
  if (!match) return null;
  const ordinal = Number(match[1]);
  return ordinal >= 1 && ordinal <= EXECUTION_ORDER_COUNT ? ordinal : null;
}

export function getExecutionOrder(ordinal: number): ExecutionOrder {
  if (
    !Number.isInteger(ordinal) ||
    ordinal < 1 ||
    ordinal > EXECUTION_ORDER_COUNT
  ) {
    throw new RangeError("execution order ordinal out of range");
  }

  const index = ordinal - 1;
  const domain = EXECUTION_DOMAINS[index % EXECUTION_DOMAINS.length];
  const window =
    EXECUTION_WINDOWS[
      Math.floor(index / EXECUTION_DOMAINS.length) % EXECUTION_WINDOWS.length
    ];
  const executionClass =
    EXECUTION_CLASSES[
      Math.floor(
        index / (EXECUTION_DOMAINS.length * EXECUTION_WINDOWS.length),
      ) % EXECUTION_CLASSES.length
    ];
  const lot =
    Math.floor(
      index /
        (EXECUTION_DOMAINS.length *
          EXECUTION_WINDOWS.length *
          EXECUTION_CLASSES.length),
    ) + 1;
  const priceCents =
    MIN_EXECUTION_PRICE_CENTS +
    positiveMod(
      index * 37,
      MAX_EXECUTION_PRICE_CENTS - MIN_EXECUTION_PRICE_CENTS + 1,
    );

  return {
    id: executionOrderId(ordinal),
    ordinal,
    origin: "operator",
    priceCents,
    capacityTh: 1 + positiveMod(index * 17 + lot * 11, 250),
    durationMinutes: window.minutes,
    durationLabel: window.label,
    executionClass: executionClass.id,
    classLabel: executionClass.label,
    function: executionClass.function,
    routingDomain: domain.id,
    domainLabel: domain.label,
    targetLatencyMs: domain.latencyMs + positiveMod(lot * 7, 29),
    energyEnvelopeJTh: 15 + positiveMod(index * 13, 171) / 10,
    activationWindowMinutes: [5, 15, 30, 60][positiveMod(index + lot, 4)],
    minimumProofUnits: 8 + positiveMod(index * 19, 493),
    transportVersion: positiveMod(index, 3) === 0 ? "V2" : "V1",
    accountingPolicy: executionClass.accounting,
    telemetry: (["summary", "workstream", "full-window"] as const)[
      positiveMod(index + lot, 3)
    ],
    status: "awaiting-attestation",
    capacityProof: null,
  };
}

export function formatUsd(cents: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
  }).format(cents / 100);
}

export function listExecutionOrders(input: {
  page?: number;
  pageSize?: number;
  domain?: string;
  executionClass?: string;
  duration?: number;
  maxPriceCents?: number;
  query?: string;
}): {orders: ExecutionOrder[]; total: number; page: number; pageSize: number} {
  const pageSize = Math.min(60, Math.max(1, Math.floor(input.pageSize ?? 24)));
  const page = Math.max(1, Math.floor(input.page ?? 1));
  const needle = input.query?.trim().toUpperCase();
  const directOrdinal = needle ? parseExecutionOrderId(needle) : null;

  if (needle && directOrdinal == null) {
    return {orders: [], total: 0, page, pageSize};
  }

  const orders: ExecutionOrder[] = [];
  let total = 0;
  const first = directOrdinal ?? 1;
  const last = directOrdinal ?? EXECUTION_ORDER_COUNT;

  for (let ordinal = first; ordinal <= last; ordinal += 1) {
    const order = getExecutionOrder(ordinal);
    if (input.domain && order.routingDomain !== input.domain) continue;
    if (
      input.executionClass &&
      order.executionClass !== input.executionClass
    ) {
      continue;
    }
    if (input.duration && order.durationMinutes !== input.duration) continue;
    if (input.maxPriceCents && order.priceCents > input.maxPriceCents) continue;

    const start = (page - 1) * pageSize;
    if (total >= start && orders.length < pageSize) orders.push(order);
    total += 1;
  }

  return {orders, total, page, pageSize};
}
