"use client";

import {useEffect, useMemo, useState} from "react";
import {HashrateOrderCard} from "@/components/HashrateOrderCard";
import {
  HASHRATE_DURATIONS,
  HASHRATE_MODES,
  HASHRATE_REGIONS,
  type HashrateOrder,
} from "@/lib/hashrate";

type MarketResponse = {
  orders: HashrateOrder[];
  total: number;
  page: number;
  pageSize: number;
};

const PAGE_SIZE = 24;

export default function MarketPage() {
  const [orders, setOrders] = useState<HashrateOrder[]>([]);
  const [total, setTotal] = useState(21_000);
  const [page, setPage] = useState(1);
  const [region, setRegion] = useState("");
  const [mode, setMode] = useState("");
  const [duration, setDuration] = useState("");
  const [maxPrice, setMaxPrice] = useState("2000");
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);

  const search = useMemo(() => {
    const params = new URLSearchParams({
      page: String(page),
      pageSize: String(PAGE_SIZE),
      maxPriceCents: maxPrice,
    });
    if (region) params.set("region", region);
    if (mode) params.set("mode", mode);
    if (duration) params.set("duration", duration);
    if (query.trim()) params.set("query", query.trim());
    return params.toString();
  }, [duration, maxPrice, mode, page, query, region]);

  useEffect(() => {
    const controller = new AbortController();
    void fetch(`/api/hashrate/orders?${search}`, {
      cache: "no-store",
      signal: controller.signal,
    })
      .then((response) => response.json() as Promise<MarketResponse>)
      .then((data) => {
        setOrders(data.orders ?? []);
        setTotal(data.total ?? 0);
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });
    return () => controller.abort();
  }, [search]);

  function updateFilter(setter: (value: string) => void, value: string) {
    setLoading(true);
    setPage(1);
    setter(value);
  }

  const pageCount = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <main className="min-h-screen flex-1 bg-[#090b0e] text-[#e8ecef]">
      <section className="relative overflow-hidden border-b border-white/10 px-5 pb-12 pt-12 md:px-10 md:pb-16 md:pt-16">
        <div className="pointer-events-none absolute inset-0 opacity-40 [background-image:linear-gradient(rgba(255,255,255,.035)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.035)_1px,transparent_1px)] [background-size:36px_36px]" />
        <div className="relative mx-auto max-w-7xl">
          <div className="flex flex-col justify-between gap-10 lg:flex-row lg:items-end">
            <div>
              <p className="font-[family-name:var(--font-mono)] text-[10px] tracking-[0.24em] text-[#d4844a] uppercase">
                SHA-256 execution market / test catalog
              </p>
              <h1 className="mt-4 max-w-3xl font-[family-name:var(--font-display)] text-4xl font-750 leading-[0.98] tracking-[-0.025em] md:text-6xl">
                Hashrate, routed by contract.
              </h1>
              <p className="mt-5 max-w-2xl text-sm leading-relaxed text-white/48 md:text-base">
                21,000 deterministic lease specifications spanning route, duration,
                telemetry and settlement policy. Execution opens only after a miner
                binds signed supply proof.
              </p>
            </div>
            <dl className="grid min-w-[310px] grid-cols-3 border-l border-t border-white/10 font-[family-name:var(--font-mono)]">
              {[
                ["CATALOG", "21,000"],
                ["VERIFIED", "0"],
                ["RANGE", "$0.20—20"],
              ].map(([label, value]) => (
                <div key={label} className="border-b border-r border-white/10 p-4">
                  <dt className="text-[8px] tracking-wider text-white/25">{label}</dt>
                  <dd className="mt-3 text-sm text-white/80">{value}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </section>

      <section className="sticky top-0 z-20 border-b border-white/10 bg-[#090b0e]/95 px-5 py-4 backdrop-blur md:px-10">
        <div className="mx-auto grid max-w-7xl gap-2 sm:grid-cols-2 lg:grid-cols-[1.3fr_repeat(4,1fr)]">
          <input
            value={query}
            onChange={(event) => updateFilter(setQuery, event.target.value)}
            placeholder="ORDER ID / HRC-00001"
            className="h-10 border border-white/10 bg-white/[0.025] px-3 font-[family-name:var(--font-mono)] text-[10px] text-white outline-none placeholder:text-white/20 focus:border-[#d4844a]/60"
          />
          <select
            value={mode}
            onChange={(event) => updateFilter(setMode, event.target.value)}
            className="h-10 border border-white/10 bg-[#0e1115] px-3 font-[family-name:var(--font-mono)] text-[10px] text-white/70 outline-none"
          >
            <option value="">ALL FUNCTIONS</option>
            {HASHRATE_MODES.map((item) => (
              <option key={item.id} value={item.id}>{item.label.toUpperCase()}</option>
            ))}
          </select>
          <select
            value={region}
            onChange={(event) => updateFilter(setRegion, event.target.value)}
            className="h-10 border border-white/10 bg-[#0e1115] px-3 font-[family-name:var(--font-mono)] text-[10px] text-white/70 outline-none"
          >
            <option value="">ALL ROUTES</option>
            {HASHRATE_REGIONS.map((item) => (
              <option key={item.id} value={item.id}>{item.label.toUpperCase()}</option>
            ))}
          </select>
          <select
            value={duration}
            onChange={(event) => updateFilter(setDuration, event.target.value)}
            className="h-10 border border-white/10 bg-[#0e1115] px-3 font-[family-name:var(--font-mono)] text-[10px] text-white/70 outline-none"
          >
            <option value="">ALL WINDOWS</option>
            {HASHRATE_DURATIONS.map((item) => (
              <option key={item.minutes} value={item.minutes}>{item.label.toUpperCase()}</option>
            ))}
          </select>
          <select
            value={maxPrice}
            onChange={(event) => updateFilter(setMaxPrice, event.target.value)}
            className="h-10 border border-white/10 bg-[#0e1115] px-3 font-[family-name:var(--font-mono)] text-[10px] text-white/70 outline-none"
          >
            <option value="2000">UP TO $20</option>
            <option value="1000">UP TO $10</option>
            <option value="500">UP TO $5</option>
            <option value="100">UP TO $1</option>
          </select>
        </div>
      </section>

      <section className="px-5 py-8 md:px-10 md:py-12">
        <div className="mx-auto max-w-7xl">
          <div className="mb-5 flex items-center justify-between gap-4 font-[family-name:var(--font-mono)] text-[10px] text-white/35">
            <span>{total.toLocaleString()} MATCHING SPECIFICATIONS</span>
            <span>PAGE {page} / {pageCount}</span>
          </div>

          {loading ? (
            <div className="grid min-h-80 place-items-center border border-white/10 font-[family-name:var(--font-mono)] text-xs text-white/35">
              COMPILING ORDER MATRIX…
            </div>
          ) : orders.length ? (
            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
              {orders.map((order) => (
                <HashrateOrderCard key={order.id} order={order} />
              ))}
            </div>
          ) : (
            <div className="grid min-h-60 place-items-center border border-white/10 font-[family-name:var(--font-mono)] text-xs text-white/35">
              NO SPECIFICATION MATCH
            </div>
          )}

          <div className="mt-8 flex justify-end gap-2">
            <button
              type="button"
              disabled={page <= 1 || loading}
              onClick={() => {
                setLoading(true);
                setPage((value) => Math.max(1, value - 1));
              }}
              className="border border-white/10 px-5 py-2.5 font-[family-name:var(--font-mono)] text-[10px] text-white/65 disabled:opacity-25"
            >
              PREVIOUS
            </button>
            <button
              type="button"
              disabled={page >= pageCount || loading}
              onClick={() => {
                setLoading(true);
                setPage((value) => Math.min(pageCount, value + 1));
              }}
              className="border border-white/10 px-5 py-2.5 font-[family-name:var(--font-mono)] text-[10px] text-white/65 disabled:opacity-25"
            >
              NEXT
            </button>
          </div>

          <div className="mt-12 grid border border-[#d4844a]/25 bg-[#d4844a]/[0.045] p-5 md:grid-cols-[1fr_auto] md:items-center md:gap-10">
            <div>
              <p className="font-[family-name:var(--font-mono)] text-[9px] tracking-[0.18em] text-[#d4844a] uppercase">
                Execution gate
              </p>
              <p className="mt-2 max-w-3xl text-xs leading-relaxed text-white/45">
                Catalog values are contract parameters, not claims of connected mining
                inventory. Checkout remains locked until hashrate ownership, Stratum
                control and telemetry signing are verified.
              </p>
            </div>
            <span className="mt-4 font-[family-name:var(--font-mono)] text-[10px] text-white/30 md:mt-0">
              SETTLEMENT_DISABLED
            </span>
          </div>
        </div>
      </section>
    </main>
  );
}
