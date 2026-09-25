import type { Capability, RootStore } from "./types";
import { MINT_FEE_SATS, WALLET_MINT_CAP_SATS } from "./protocol";

const MEMORY_KEY = "__ROOT_PROTOCOL_STORE__";
const REDIS_KEY = "root:store:v1";

type MemorySlot = { data: RootStore };

function emptyStore(): RootStore {
  return { caps: [], walletFees: {}, usedTxids: [] };
}

function normalizeStore(data: RootStore): RootStore {
  return {
    caps: data.caps ?? [],
    walletFees: data.walletFees ?? {},
    usedTxids: data.usedTxids ?? [],
  };
}

function memory(): MemorySlot {
  const g = globalThis as typeof globalThis & { [MEMORY_KEY]?: MemorySlot };
  if (!g[MEMORY_KEY]) g[MEMORY_KEY] = { data: emptyStore() };
  return g[MEMORY_KEY];
}

export function redisConfigured(): boolean {
  return Boolean(
    process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN,
  );
}

async function redisGet(): Promise<RootStore | null> {
  if (!redisConfigured()) return null;
  const res = await fetch(
    `${process.env.UPSTASH_REDIS_REST_URL}/get/${REDIS_KEY}`,
    {
      headers: { Authorization: `Bearer ${process.env.UPSTASH_REDIS_REST_TOKEN}` },
      cache: "no-store",
    },
  );
  if (!res.ok) return null;
  const json = (await res.json()) as { result?: string | null };
  if (!json.result) return null;
  try {
    return normalizeStore(JSON.parse(json.result) as RootStore);
  } catch {
    return null;
  }
}

async function redisSet(data: RootStore): Promise<void> {
  if (!redisConfigured()) return;
  await fetch(`${process.env.UPSTASH_REDIS_REST_URL}/set/${REDIS_KEY}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.UPSTASH_REDIS_REST_TOKEN}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });
}

async function loadStore(): Promise<RootStore> {
  const fromRedis = await redisGet();
  if (fromRedis) {
    memory().data = fromRedis;
    return fromRedis;
  }
  return memory().data;
}

async function saveStore(data: RootStore): Promise<void> {
  memory().data = data;
  await redisSet(data);
  if (!process.env.VERCEL) {
    try {
      const { promises: fs } = await import("fs");
      const path = await import("path");
      const file = path.join(process.cwd(), ".data", "store.json");
      await fs.mkdir(path.dirname(file), { recursive: true });
      await fs.writeFile(file, JSON.stringify(data, null, 2), "utf8");
    } catch {
      /* ignore local persist errors */
    }
  }
}

export async function getStore(): Promise<RootStore> {
  if (!process.env.VERCEL && memory().data.caps.length === 0) {
    try {
      const { promises: fs } = await import("fs");
      const path = await import("path");
      const file = path.join(process.cwd(), ".data", "store.json");
      const raw = await fs.readFile(file, "utf8");
      memory().data = normalizeStore(JSON.parse(raw) as RootStore);
    } catch {
      /* no local file */
    }
  }
  return loadStore();
}

export async function listCaps(): Promise<Capability[]> {
  const store = await getStore();
  return [...store.caps].sort((a, b) => b.mintedAt - a.mintedAt);
}

export async function getCap(id: string): Promise<Capability | undefined> {
  const store = await getStore();
  return store.caps.find((c) => c.id === id);
}

export async function walletMintedFee(address: string): Promise<number> {
  const store = await getStore();
  return store.walletFees[address.toLowerCase()] ?? 0;
}

export class ProtocolError extends Error {
  status: number;
  constructor(message: string, status = 400) {
    super(message);
    this.status = status;
  }
}

export async function mintCapability(input: {
  owner: string;
  payerAddress: string;
  paymentTxid: string;
  type: Capability["type"];
  id: string;
}): Promise<Capability> {
  const owner = input.owner.trim();
  if (!owner) throw new ProtocolError("wallet required");

  const store = await getStore();
  const key = input.payerAddress.toLowerCase();
  const spent = store.walletFees[key] ?? 0;
  const fee = MINT_FEE_SATS;
  const capLimit = WALLET_MINT_CAP_SATS;

  if (spent + fee > capLimit) {
    throw new ProtocolError("wallet mint cap reached (0.01 BTC)");
  }
  const txid = input.paymentTxid.toLowerCase();
  if (store.usedTxids.includes(txid)) {
    throw new ProtocolError("payment transaction already consumed", 409);
  }

  const capability: Capability = {
    id: input.id,
    owner,
    type: input.type,
    mintedAt: Date.now(),
    mintFeeSats: fee,
    paymentTxid: txid,
    payerAddress: input.payerAddress,
    status: "ready",
  };

  const next: RootStore = {
    caps: [capability, ...store.caps],
    walletFees: { ...store.walletFees, [key]: spent + fee },
    usedTxids: [...store.usedTxids, txid],
  };
  await saveStore(next);
  return capability;
}

export async function listForLease(input: {
  id: string;
  owner: string;
  rentSats: number;
  tenorDays: number;
  maxDrawdownBps: number;
}): Promise<Capability> {
  const store = await getStore();
  const idx = store.caps.findIndex((c) => c.id === input.id);
  if (idx < 0) throw new ProtocolError("capability not found", 404);
  const cap = { ...store.caps[idx] };
  if (cap.owner.toLowerCase() !== input.owner.toLowerCase()) {
    throw new ProtocolError("not owner", 403);
  }
  if (cap.status === "leased") throw new ProtocolError("already leased");
  if (input.rentSats <= 0) throw new ProtocolError("rent required");
  if (input.tenorDays <= 0) throw new ProtocolError("tenor required");

  cap.rentSats = input.rentSats;
  cap.tenorDays = input.tenorDays;
  cap.maxDrawdownBps = input.maxDrawdownBps;
  cap.listedAt = Date.now();
  cap.status = "listed";

  const caps = [...store.caps];
  caps[idx] = cap;
  await saveStore({ ...store, caps });
  return cap;
}

export async function takeLease(input: {
  id: string;
  lessee: string;
}): Promise<Capability> {
  const store = await getStore();
  const idx = store.caps.findIndex((c) => c.id === input.id);
  if (idx < 0) throw new ProtocolError("capability not found", 404);
  const cap = { ...store.caps[idx] };
  if (cap.status !== "listed") throw new ProtocolError("not listed");
  if (cap.owner.toLowerCase() === input.lessee.toLowerCase()) {
    throw new ProtocolError("cannot lease own capability");
  }

  const days = cap.tenorDays ?? 30;
  cap.lessee = input.lessee;
  cap.leasedAt = Date.now();
  cap.leaseEndsAt = Date.now() + days * 86_400_000;
  cap.status = "leased";

  const caps = [...store.caps];
  caps[idx] = cap;
  await saveStore({ ...store, caps });
  return cap;
}

export async function protocolStats() {
  const store = await getStore();
  return {
    minted: store.caps.length,
    listed: store.caps.filter((c) => c.status === "listed").length,
    leased: store.caps.filter((c) => c.status === "leased").length,
    mintFeeSats: MINT_FEE_SATS,
    walletCapSats: WALLET_MINT_CAP_SATS,
  };
}
