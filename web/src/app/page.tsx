import Link from "next/link";
import { HeroVisual } from "@/components/HeroVisual";
import {ProtocolStatus} from "@/components/ProtocolStatus";

export default function HomePage() {
  return (
    <main className="relative flex-1">
      <section className="relative min-h-[100svh] grain">
        <HeroVisual />
        <div className="relative z-10 flex min-h-[100svh] flex-col justify-end px-5 pb-14 pt-28 md:px-10 md:pb-16 lg:max-w-[52%] lg:justify-center lg:pb-0">
          <p className="animate-rise font-[family-name:var(--font-mono)] text-[11px] tracking-[0.22em] text-[var(--copper-bright)] uppercase">
            Bitcoin Hashrate Rights Layer
          </p>
          <p className="animate-rise mt-3 font-[family-name:var(--font-display)] text-[clamp(4.2rem,13vw,8.5rem)] font-800 leading-[0.85] tracking-[-0.04em] text-[var(--mist)]">
            ROOT
          </p>
          <h1 className="animate-rise-delay-1 mt-5 max-w-md font-[family-name:var(--font-display)] text-[clamp(1.45rem,3vw,2.1rem)] font-600 leading-tight text-[var(--mist)]">
            Route the work. Verify every share.
          </h1>
          <p className="animate-rise-delay-2 mt-6 font-[family-name:var(--font-mono)] text-[12px] leading-relaxed text-[var(--mist)]/60 md:text-[13px]">
            <span className="block">SHA-256 leases · Stratum policy · signed telemetry</span>
            <span className="mt-1 block">21,000 deterministic execution specifications</span>
          </p>
          <div className="animate-rise-delay-2 mt-8 flex flex-wrap gap-3">
            <Link
              href="/market"
              className="bg-[var(--copper)] px-5 py-3 text-sm font-600 text-[var(--mist)] transition hover:bg-[var(--copper-bright)]"
            >
              Explore hashrate
            </Link>
            <Link
              href="/market"
              className="border border-[var(--mist)]/30 px-5 py-3 text-sm text-[var(--mist)] transition hover:border-[var(--mist)]"
            >
              Order matrix
            </Link>
          </div>
        </div>
      </section>

      <ProtocolStatus />

      <section className="border-t border-[var(--line)] bg-[var(--ink)] px-5 py-16 text-[var(--mist)] md:px-10 md:py-20">
        <div className="mx-auto grid max-w-5xl gap-10 md:grid-cols-[0.9fr_1.1fr] md:gap-14">
          <div>
            <p className="font-[family-name:var(--font-mono)] text-[11px] tracking-[0.18em] text-[var(--copper-bright)] uppercase">
              Primitive / HRC
            </p>
            <h2 className="mt-3 font-[family-name:var(--font-display)] text-2xl font-700 md:text-3xl">
              Hashrate capability
            </h2>
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-[var(--mist)]/55">
              Time-bounded SHA-256 execution authority with explicit routing,
              accounting and telemetry constraints.
            </p>
          </div>
          <pre className="overflow-x-auto border border-[var(--mist)]/12 bg-[#0c0f13] p-5 font-[family-name:var(--font-mono)] text-[12px] leading-relaxed text-[var(--mist)]/80 md:text-[13px]">
{`Lease(H, T, Π)
├─ source    → miner attestation
├─ route     → Stratum V1 / V2
├─ measure   → accepted-share stream
├─ settle    → PPS / FPPS / coinbase
└─ expire    → deterministic cutoff

Π := { H, T, pool, latency, J/TH }`}
          </pre>
        </div>
      </section>

      <section className="border-t border-[var(--line)] px-5 py-16 md:px-10 md:py-20">
        <div className="mx-auto max-w-5xl">
          <p className="font-[family-name:var(--font-mono)] text-[11px] tracking-[0.18em] text-[var(--copper)] uppercase">
              Verification stack
          </p>
          <div className="mt-8 grid gap-0 border-t border-[var(--line)] md:grid-cols-3">
            {[
              {
                v: "01",
                t: "Supply attestation",
                d: "Miner identity · endpoint challenge · signed machine profile",
              },
              {
                v: "02",
                t: "Share telemetry",
                d: "Stratum jobs · accepted shares · rolling hashrate EMA",
              },
              {
                v: "03",
                t: "Lease settlement",
                d: "Window proof · route policy · Bitcoin mainnet payment",
              },
            ].map((row) => (
              <article
                key={row.v}
                className="border-b border-[var(--line)] py-8 md:border-b-0 md:border-r md:px-6 md:py-8 md:first:pl-0 md:last:border-r-0 md:last:pr-0"
              >
                <p className="font-[family-name:var(--font-mono)] text-xs text-[var(--copper)]">
                  {row.v}
                </p>
                <h3 className="mt-2 font-[family-name:var(--font-display)] text-lg font-600">
                  {row.t}
                </h3>
                <p className="mt-3 font-[family-name:var(--font-mono)] text-[12px] leading-relaxed text-[var(--ink-soft)]/65">
                  {row.d}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="border-t border-[var(--line)] bg-[color-mix(in_srgb,var(--sage)_7%,var(--paper))] px-5 py-14 md:px-10">
        <div className="mx-auto flex max-w-5xl flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="font-[family-name:var(--font-mono)] text-[11px] tracking-[0.18em] text-[var(--sage)] uppercase">
              Market integrity
            </p>
            <h2 className="mt-2 font-[family-name:var(--font-display)] text-2xl font-700">
              Supply before settlement.
            </h2>
          </div>
          <dl className="grid grid-cols-2 gap-x-8 gap-y-3 font-[family-name:var(--font-mono)] text-sm sm:grid-cols-4">
            {[
              ["Catalog", "21,000"],
              ["Verified", "0"],
              ["Settlement", "BTC L1"],
              ["Algorithm", "SHA-256"],
            ].map(([k, v]) => (
              <div key={k}>
                <dt className="text-[11px] text-[var(--ink-soft)]/50">{k}</dt>
                <dd className="mt-1 text-[var(--copper-deep)]">{v}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>
    </main>
  );
}
