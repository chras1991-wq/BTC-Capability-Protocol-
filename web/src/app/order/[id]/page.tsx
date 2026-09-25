import Link from "next/link";
import {notFound} from "next/navigation";
import {quoteUsdCentsInSats} from "@/lib/bitcoin-price";
import {formatUsd, getHashrateOrder, parseOrderId} from "@/lib/hashrate";

export default async function HashrateOrderPage({
  params,
}: {
  params: Promise<{id: string}>;
}) {
  const {id} = await params;
  const ordinal = parseOrderId(id);
  if (ordinal == null) notFound();
  const order = getHashrateOrder(ordinal);
  const quote = await quoteUsdCentsInSats(order.priceCents).catch(() => null);

  const rows = [
    ["Algorithm", "SHA-256"],
    ["Compute", `${order.hashrateTh} TH/s`],
    ["Window", order.durationLabel],
    ["Route policy", order.modeLabel],
    ["Region profile", order.regionLabel],
    ["Target latency", `≤ ${order.targetLatencyMs} ms`],
    ["Efficiency ceiling", `${order.efficiencyJTh.toFixed(1)} J/TH`],
    ["Stratum", order.stratumVersion],
    ["Accounting", order.payoutPolicy],
    ["Telemetry", order.telemetry],
    ["Accepted-share floor", String(order.minAcceptedShares)],
    ["Start window", `${order.startWindowMinutes} min`],
  ];

  return (
    <main className="min-h-screen flex-1 bg-[#090b0e] px-5 py-10 text-[#e8ecef] md:px-10 md:py-16">
      <div className="mx-auto max-w-5xl">
        <Link
          href="/market"
          className="font-[family-name:var(--font-mono)] text-[10px] tracking-[0.15em] text-white/35 uppercase hover:text-[#d4844a]"
        >
          ← Order matrix
        </Link>

        <div className="mt-10 grid gap-10 lg:grid-cols-[1fr_340px] lg:gap-16">
          <section>
            <div className="flex flex-wrap items-center gap-3 font-[family-name:var(--font-mono)] text-[9px] tracking-[0.16em] uppercase">
              <span className="text-[#d4844a]">{order.id}</span>
              <span className="h-px w-8 bg-white/15" />
              <span className="text-white/30">SHA-256 lease specification</span>
            </div>
            <h1 className="mt-6 font-[family-name:var(--font-display)] text-5xl font-750 leading-none md:text-7xl">
              {order.hashrateTh}
              <span className="ml-2 text-xl text-white/35 md:text-2xl">TH/s</span>
            </h1>
            <p className="mt-5 max-w-xl text-base leading-relaxed text-white/48">
              {order.function}. This specification defines the execution envelope;
              it does not represent connected supply until attestation completes.
            </p>

            <dl className="mt-10 grid border-l border-t border-white/10 sm:grid-cols-2">
              {rows.map(([label, value]) => (
                <div key={label} className="border-b border-r border-white/10 p-4">
                  <dt className="font-[family-name:var(--font-mono)] text-[9px] tracking-wider text-white/25 uppercase">
                    {label}
                  </dt>
                  <dd className="mt-3 font-[family-name:var(--font-mono)] text-xs text-white/75">
                    {value}
                  </dd>
                </div>
              ))}
            </dl>

            <div className="mt-10 border border-white/10 bg-[#0e1115] p-5">
              <p className="font-[family-name:var(--font-mono)] text-[9px] tracking-[0.18em] text-white/30 uppercase">
                Verification predicate
              </p>
              <pre className="mt-4 overflow-x-auto font-[family-name:var(--font-mono)] text-[11px] leading-relaxed text-white/60">
{`accept(order, proof) :=
  proof.stratum_control == valid
  ∧ proof.hashrate_ema ≥ ${order.hashrateTh} TH/s
  ∧ proof.efficiency ≤ ${order.efficiencyJTh.toFixed(1)} J/TH
  ∧ proof.route_latency ≤ ${order.targetLatencyMs} ms
  ∧ proof.window ≥ ${order.durationMinutes} min`}
              </pre>
            </div>
          </section>

          <aside className="h-fit border border-white/10 bg-[#0e1115] p-5 lg:sticky lg:top-24">
            <div className="flex items-end justify-between gap-4">
              <span className="font-[family-name:var(--font-mono)] text-[9px] text-white/30">
                LEASE VALUE
              </span>
              <span className="text-right">
                <span className="block font-[family-name:var(--font-display)] text-3xl font-750 text-[#e6a06e]">
                  {quote ? `${quote.amountSats.toLocaleString()} sats` : "Quote pending"}
                </span>
                <span className="mt-1 block font-[family-name:var(--font-mono)] text-[9px] text-white/28">
                  {formatUsd(order.priceCents)} REFERENCE
                </span>
              </span>
            </div>
            <div className="mt-5 border-y border-white/10 py-4 font-[family-name:var(--font-mono)] text-[10px]">
              <div className="flex justify-between gap-3">
                <span className="text-white/28">SUPPLY PROOF</span>
                <span className="text-[#d4844a]">MISSING</span>
              </div>
              <div className="mt-3 flex justify-between gap-3">
                <span className="text-white/28">SETTLEMENT</span>
                <span className="text-white/45">BTC MAINNET / LOCKED</span>
              </div>
            </div>
            <button
              type="button"
              disabled
              className="mt-5 w-full cursor-not-allowed border border-white/10 bg-white/[0.035] py-3.5 text-sm text-white/28"
            >
              Awaiting verified supply
            </button>
            <p className="mt-4 text-[11px] leading-relaxed text-white/30">
              No payment is accepted for an unattested contract. All leases settle
              directly in BTC sats on Bitcoin mainnet with a 5,000-sat minimum
              output. USD is a 60-second pricing reference only.
            </p>
          </aside>
        </div>
      </div>
    </main>
  );
}
