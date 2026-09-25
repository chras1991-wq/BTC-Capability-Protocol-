import Link from "next/link";
import { CapabilityTree } from "@/components/CapabilityTree";
import { RateTicker } from "@/components/RateTicker";
import { RootMark } from "@/components/RootMark";

const GENERATIONS = [
  {
    version: "V1",
    title: "Today’s Bitcoin",
    body: "Taproot, MuSig2, timelocks, presigned graphs, adaptor signatures, DLCs, and client-side validation. Ship narrow capabilities first: Lightning liquidity, collateral attestation, covered options.",
  },
  {
    version: "V2",
    title: "BitVM / BitVMX",
    body: "Covenant-like execution without a soft fork. Enforce richer predicates: max drawdown, price floors, allowed assets, timed principal return.",
  },
  {
    version: "V3",
    title: "Native covenants",
    body: "If Bitcoin gains primitives like BIP-443 CCV, ROOT becomes a Capability OS on state-carrying UTXOs—programmable capital at the base layer.",
  },
];

const CAPABILITIES = [
  {
    name: "Liquidity Capability",
    desc: "Lease channel or inventory depth. Principal stays in the owner vault; loss bounds are encoded in the spend graph.",
  },
  {
    name: "Collateral Capability",
    desc: "Prove BTC backing without transferring ownership. Attest bounded risk to lenders or underwriters.",
  },
  {
    name: "Market-Making Capability",
    desc: "Authorize swaps that must return ≥ principal − max loss, with residual control reverting to the owner.",
  },
  {
    name: "Option Capacity",
    desc: "Underwrite puts/calls against reserved BTC with explicit expiry and drawdown caps—tradable as CAP-UTXOs.",
  },
];

export default function HomePage() {
  return (
    <main className="relative flex-1 overflow-x-hidden">
      <header className="absolute inset-x-0 top-0 z-20 flex items-center justify-between px-5 py-5 md:px-10">
        <Link href="/" className="flex items-center gap-2 text-[var(--mist)]">
          <RootMark className="h-7 w-7" />
          <span className="font-[family-name:var(--font-display)] text-lg font-700 tracking-wide">
            ROOT
          </span>
        </Link>
        <nav className="flex items-center gap-6 text-sm text-[var(--mist)]/80">
          <a href="#protocol" className="hidden hover:text-[var(--mist)] sm:inline">
            Protocol
          </a>
          <a href="#market" className="hidden hover:text-[var(--mist)] sm:inline">
            Market
          </a>
          <Link
            href="/docs"
            className="rounded-sm border border-[var(--mist)]/25 px-3 py-1.5 text-[var(--mist)] transition hover:border-[var(--copper-bright)] hover:text-[var(--copper-bright)]"
          >
            Docs
          </Link>
        </nav>
      </header>

      {/* Hero: one composition — brand, one headline, one sentence, CTA, full-bleed visual */}
      <section className="relative min-h-[100svh] grain">
        <div className="absolute inset-0">
          <CapabilityTree />
        </div>
        <div className="relative z-10 flex min-h-[100svh] flex-col justify-end px-5 pb-16 pt-28 md:px-10 md:pb-20 lg:max-w-[52%] lg:justify-center lg:pb-0">
          <p className="animate-rise font-[family-name:var(--font-display)] text-[clamp(4.5rem,14vw,9.5rem)] font-800 leading-[0.85] tracking-[-0.04em] text-[var(--mist)]">
            ROOT
          </p>
          <h1 className="animate-rise-delay-1 mt-6 max-w-xl font-[family-name:var(--font-display)] text-[clamp(1.6rem,3.4vw,2.35rem)] font-600 leading-tight text-[var(--mist)]">
            Own the Bitcoin. Rent the power.
          </h1>
          <p className="animate-rise-delay-2 mt-4 max-w-md text-base leading-relaxed text-[var(--mist)]/75 md:text-lg">
            Separate ownership from execution. Lease narrow UTXO capabilities
            without transferring coins, wrapping BTC, or handing root keys to a
            protocol.
          </p>
          <div className="animate-rise-delay-3 mt-8 flex flex-wrap items-center gap-4">
            <Link
              href="/studio"
              className="bg-[var(--copper)] px-5 py-3 text-sm font-600 text-[var(--mist)] transition hover:bg-[var(--copper-bright)]"
            >
              Open capability studio
            </Link>
            <Link
              href="/docs/architecture"
              className="border border-[var(--mist)]/30 px-5 py-3 text-sm text-[var(--mist)]/90 transition hover:border-[var(--mist)]"
            >
              Architecture
            </Link>
          </div>
          <p className="mt-8 font-[family-name:var(--font-mono)] text-xs tracking-wide text-[var(--mist)]/45">
            币属于你，能力可以出租。
          </p>
        </div>
      </section>

      <RateTicker />

      <section id="primitive" className="px-5 py-20 md:px-10 md:py-28">
        <div className="mx-auto max-w-5xl">
          <p className="font-[family-name:var(--font-mono)] text-xs tracking-[0.2em] text-[var(--copper)] uppercase">
            The primitive
          </p>
          <h2 className="mt-4 max-w-3xl font-[family-name:var(--font-display)] text-3xl font-700 leading-tight md:text-5xl">
            Lease the capability, not the coin.
          </h2>
          <p className="mt-6 max-w-2xl text-lg leading-relaxed text-[var(--ink-soft)]">
            Today a UTXO is root access: whoever holds the key can send
            anywhere. ROOT turns that into capability security—who may do what,
            for how long, under which constraints, while ownership stays with
            the vault owner.
          </p>

          <div className="mt-14 grid gap-10 border-t border-[var(--line)] pt-10 md:grid-cols-2">
            <div>
              <p className="font-[family-name:var(--font-mono)] text-xs text-[var(--ink-soft)]/60">
                BEFORE
              </p>
              <p className="mt-3 font-[family-name:var(--font-display)] text-2xl font-600">
                Private key = root
              </p>
              <p className="mt-3 text-[var(--ink-soft)] leading-relaxed">
                Hold it yourself, or give control to a bridge, custodian, or
                contract. Capital either sleeps or leaves your ownership.
              </p>
            </div>
            <div>
              <p className="font-[family-name:var(--font-mono)] text-xs text-[var(--copper)]">
                AFTER
              </p>
              <p className="mt-3 font-[family-name:var(--font-display)] text-2xl font-600">
                Ownership ≠ execution
              </p>
              <p className="mt-3 text-[var(--ink-soft)] leading-relaxed">
                BTC private key remains ownership. A capability token is a
                narrow API: swap within bounds, attest collateral, provide
                Lightning liquidity—never{" "}
                <code className="font-[family-name:var(--font-mono)] text-sm text-[var(--copper-deep)]">
                  send(all, bob)
                </code>
                .
              </p>
            </div>
          </div>
        </div>
      </section>

      <section
        id="protocol"
        className="border-t border-[var(--line)] bg-[var(--ink)] px-5 py-20 text-[var(--mist)] md:px-10 md:py-28"
      >
        <div className="mx-auto max-w-5xl">
          <p className="font-[family-name:var(--font-mono)] text-xs tracking-[0.2em] text-[var(--copper-bright)] uppercase">
            UTXO Capability
          </p>
          <h2 className="mt-4 max-w-3xl font-[family-name:var(--font-display)] text-3xl font-700 md:text-4xl">
            Who. When. Under what rules. What may happen next.
          </h2>
          <pre className="mt-10 overflow-x-auto border border-[var(--mist)]/15 bg-[#0c0f13] p-6 font-[family-name:var(--font-mono)] text-sm leading-relaxed text-[var(--mist)]/85 md:text-[15px]">
{`10 BTC Taproot Vault
├── Ownership Right      → Alice (always)
├── Capability A         → Bob · market-making · 30d
│     spend graph must return
│     ≥ 10 BTC − max_loss + PnL
│     → Alice vault
├── Capability B         → collateral attestation
└── Recovery Right       → Alice after timeout`}
          </pre>
          <p className="mt-8 max-w-2xl text-[var(--mist)]/70 leading-relaxed">
            Bob can exercise Capability A. Bob cannot abscond with the
            principal. When the lease ends—or rules are violated—recovery
            returns full control to Alice.
          </p>
        </div>
      </section>

      <section id="market" className="px-5 py-20 md:px-10 md:py-28">
        <div className="mx-auto max-w-5xl">
          <p className="font-[family-name:var(--font-mono)] text-xs tracking-[0.2em] text-[var(--copper)] uppercase">
            Usage Rights Market
          </p>
          <h2 className="mt-4 max-w-3xl font-[family-name:var(--font-display)] text-3xl font-700 md:text-5xl">
            Idle BTC becomes productive capital—without leaving home.
          </h2>
          <p className="mt-6 max-w-2xl text-lg text-[var(--ink-soft)] leading-relaxed">
            Capabilities are assets. They can be created, priced, transferred,
            and composed. Markets discover a Bitcoin Capability Rate: real rent
            for real uses, paid in BTC—not APY from an emission schedule.
          </p>

          <ul className="mt-14 space-y-0 border-t border-[var(--line)]">
            {CAPABILITIES.map((cap) => (
              <li
                key={cap.name}
                className="grid gap-2 border-b border-[var(--line)] py-8 md:grid-cols-[minmax(0,0.4fr)_minmax(0,0.6fr)] md:gap-10"
              >
                <h3 className="font-[family-name:var(--font-display)] text-xl font-600 md:text-2xl">
                  {cap.name}
                </h3>
                <p className="text-[var(--ink-soft)] leading-relaxed">
                  {cap.desc}
                </p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="border-t border-[var(--line)] px-5 py-20 md:px-10 md:py-28">
        <div className="mx-auto max-w-5xl">
          <p className="font-[family-name:var(--font-mono)] text-xs tracking-[0.2em] text-[var(--copper)] uppercase">
            Roadmap generations
          </p>
          <h2 className="mt-4 font-[family-name:var(--font-display)] text-3xl font-700 md:text-4xl">
            Three layers. One permission model.
          </h2>
          <div className="mt-12 grid gap-8 md:grid-cols-3">
            {GENERATIONS.map((gen) => (
              <article key={gen.version} className="border-t-2 border-[var(--copper)] pt-6">
                <p className="font-[family-name:var(--font-mono)] text-sm text-[var(--copper)]">
                  {gen.version}
                </p>
                <h3 className="mt-2 font-[family-name:var(--font-display)] text-xl font-600">
                  {gen.title}
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-[var(--ink-soft)]">
                  {gen.body}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="border-t border-[var(--line)] bg-[color-mix(in_srgb,var(--sage)_8%,var(--paper))] px-5 py-20 md:px-10 md:py-28">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="font-[family-name:var(--font-display)] text-3xl font-700 md:text-4xl">
            Define Bitcoin’s permission layer.
          </h2>
          <p className="mx-auto mt-5 max-w-xl text-[var(--ink-soft)] leading-relaxed">
            RGB ships private assets. Ark scales VTXOs. BitVM verifies
            computation. ROOT answers a different question: who may exercise
            which rights over BTC that never leaves the owner.
          </p>
          <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
            <Link
              href="/docs"
              className="bg-[var(--ink)] px-5 py-3 text-sm font-600 text-[var(--mist)] transition hover:bg-[var(--ink-soft)]"
            >
              Open the docs
            </Link>
            <Link
              href="/docs/pitch"
              className="border border-[var(--ink)]/20 px-5 py-3 text-sm transition hover:border-[var(--copper)]"
            >
              Pitch narrative
            </Link>
          </div>
        </div>
      </section>

      <footer className="border-t border-[var(--line)] px-5 py-10 md:px-10">
        <div className="mx-auto flex max-w-5xl flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2 text-[var(--ink)]">
            <RootMark className="h-5 w-5 text-[var(--copper)]" />
            <span className="font-[family-name:var(--font-display)] font-700">
              ROOT
            </span>
            <span className="text-sm text-[var(--ink-soft)]/60">
              Bitcoin Capability Protocol
            </span>
          </div>
          <p className="text-sm text-[var(--ink-soft)]/50">
            No token at genesis. Revenue in BTC.
          </p>
        </div>
      </footer>
    </main>
  );
}
