import Link from "next/link";
import { HeroVisual } from "@/components/HeroVisual";
import { MINT_FEE_BTC, WALLET_MINT_CAP_BTC } from "@/lib/protocol";

export default function HomePage() {
  return (
    <main className="relative flex-1">
      <section className="relative min-h-[100svh] grain">
        <HeroVisual />
        <div className="relative z-10 flex min-h-[100svh] flex-col justify-end px-5 pb-14 pt-28 md:px-10 md:pb-16 lg:max-w-[50%] lg:justify-center lg:pb-0">
          <p className="animate-rise font-[family-name:var(--font-display)] text-[clamp(4.2rem,13vw,8.5rem)] font-800 leading-[0.85] tracking-[-0.04em] text-[var(--mist)]">
            ROOT
          </p>
          <h1 className="animate-rise-delay-1 mt-5 max-w-md font-[family-name:var(--font-display)] text-[clamp(1.45rem,3vw,2.1rem)] font-600 leading-tight text-[var(--mist)]">
            Own the Bitcoin. Rent the power.
          </h1>
          <p className="animate-rise-delay-2 mt-6 font-[family-name:var(--font-mono)] text-sm text-[var(--mist)]/65">
            Mint {MINT_FEE_BTC} BTC · Cap {WALLET_MINT_CAP_BTC} BTC / wallet
          </p>
          <div className="animate-rise-delay-2 mt-8 flex flex-wrap gap-3">
            <Link
              href="/mint"
              className="bg-[var(--copper)] px-5 py-3 text-sm font-600 text-[var(--mist)] transition hover:bg-[var(--copper-bright)]"
            >
              Mint
            </Link>
            <Link
              href="/market"
              className="border border-[var(--mist)]/30 px-5 py-3 text-sm text-[var(--mist)] transition hover:border-[var(--mist)]"
            >
              Lease
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
