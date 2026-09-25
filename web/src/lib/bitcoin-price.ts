type MempoolPrices = {
  time: number;
  USD: number;
};

export type BitcoinQuote = {
  usdCents: number;
  btcUsd: number;
  amountSats: number;
  quotedAt: number;
  expiresAt: number;
  settlementNetwork: "bitcoin-mainnet";
  source: "mempool.space";
};

export async function quoteUsdCentsInSats(usdCents: number): Promise<BitcoinQuote> {
  if (!Number.isInteger(usdCents) || usdCents <= 0) {
    throw new Error("invalid USD reference value");
  }

  const response = await fetch("https://mempool.space/api/v1/prices", {
    cache: "no-store",
    signal: AbortSignal.timeout(5_000),
  });
  if (!response.ok) throw new Error("BTC/USD quote unavailable");

  const prices = (await response.json()) as MempoolPrices;
  if (!Number.isFinite(prices.USD) || prices.USD <= 0) {
    throw new Error("invalid BTC/USD quote");
  }

  const quotedAt = Date.now();
  return {
    usdCents,
    btcUsd: prices.USD,
    amountSats: Math.max(
      5_000,
      Math.ceil((usdCents / 100 / prices.USD) * 100_000_000),
    ),
    quotedAt,
    expiresAt: quotedAt + 60_000,
    settlementNetwork: "bitcoin-mainnet",
    source: "mempool.space",
  };
}
