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
            Bitcoin Capability Layer
          </p>
          <p className="animate-rise mt-3 font-[family-name:var(--font-display)] text-[clamp(4.2rem,13vw,8.5rem)] font-800 leading-[0.85] tracking-[-0.04em] text-[var(--mist)]">
            ROOT
          </p>
          <h1 className="animate-rise-delay-1 mt-5 max-w-md font-[family-name:var(--font-display)] text-[clamp(1.45rem,3vw,2.1rem)] font-600 leading-tight text-[var(--mist)]">
            Own the Bitcoin. Rent the power.
          </h1>
          <p className="animate-rise-delay-2 mt-6 font-[family-name:var(--font-mono)] text-[12px] leading-relaxed text-[var(--mist)]/60 md:text-[13px]">
            <span className="block">Privy identity · capability registry · policy intents</span>
            <span className="mt-1 block">Bitcoin enforcement path under active research</span>
          </p>
          <div className="animate-rise-delay-2 mt-8 flex flex-wrap gap-3">
            <Link
              href="/mint"
              className="bg-[var(--copper)] px-5 py-3 text-sm font-600 text-[var(--mist)] transition hover:bg-[var(--copper-bright)]"
            >
              Issue capability
            </Link>
            <Link
              href="/market"
              className="border border-[var(--mist)]/30 px-5 py-3 text-sm text-[var(--mist)] transition hover:border-[var(--mist)]"
            >
              Capability market
            </Link>
          </div>
        </div>
      </section>

      <ProtocolStatus />

      <section className="border-t border-[var(--line)] bg-[var(--ink)] px-5 py-16 text-[var(--mist)] md:px-10 md:py-20">
        <div className="mx-auto grid max-w-5xl gap-10 md:grid-cols-[0.9fr_1.1fr] md:gap-14">
          <div>
            <p className="font-[family-name:var(--font-mono)] text-[11px] tracking-[0.18em] text-[var(--copper-bright)] uppercase">
              Primitive
            </p>
            <h2 className="mt-3 font-[family-name:var(--font-display)] text-2xl font-700 md:text-3xl">
              UTXO Capability
            </h2>
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-[var(--mist)]/55">
              Proposed narrow spend authority over a Taproot vault. This is the
              protocol target—not a deployed Bitcoin covenant.
            </p>
          </div>
          <pre className="overflow-x-auto border border-[var(--mist)]/12 bg-[#0c0f13] p-5 font-[family-name:var(--font-mono)] text-[12px] leading-relaxed text-[var(--mist)]/80 md:text-[13px]">
{`Vault(v, O)
├─ own      → O  (CSV recovery)
├─ cap[Π]   → H  (MuSig2 · enforcer)
│   residual ≥ v − δ
└─ seal     → single-use · transferable

Π ∈ { ln_open, mm_swap, collateral, option }`}
          </pre>
        </div>
      </section>

      <section className="border-t border-[var(--line)] px-5 py-16 md:px-10 md:py-20">
        <div className="mx-auto max-w-5xl">
          <p className="font-[family-name:var(--font-mono)] text-[11px] tracking-[0.18em] text-[var(--copper)] uppercase">
            Stack
          </p>
          <div className="mt-8 grid gap-0 border-t border-[var(--line)] md:grid-cols-3">
            {[
              {
                v: "V1",
                t: "Interactive covenant",
                d: "Presigned DAG · adaptor · DLC · client-side seals",
              },
              {
                v: "V2",
                t: "BitVM / BitVMX",
                d: "Optimistic challenge · drawdown monitors · allowlists",
              },
              {
                v: "V3",
                t: "Native CCV",
                d: "State-carrying UTXO · BIP-443 class enforcement",
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
              Constraint
            </p>
            <h2 className="mt-2 font-[family-name:var(--font-display)] text-2xl font-700">
              Truth before throughput.
            </h2>
          </div>
          <dl className="grid grid-cols-2 gap-x-8 gap-y-3 font-[family-name:var(--font-mono)] text-sm sm:grid-cols-4">
            {[
              ["Identity", "Privy"],
              ["Registry", "Alpha"],
              ["Settlement", "None"],
              ["Custody", "None"],
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
