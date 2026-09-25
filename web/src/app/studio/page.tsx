"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { RootMark } from "@/components/RootMark";

const OPS = [
  { id: "ln", label: "Lightning liquidity" },
  { id: "mm", label: "Market-making" },
  { id: "col", label: "Collateral attestation" },
  { id: "opt", label: "Option capacity" },
] as const;

export default function StudioPage() {
  const [btc, setBtc] = useState(10);
  const [leaseBtc, setLeaseBtc] = useState(3);
  const [days, setDays] = useState(30);
  const [drawdownBps, setDrawdownBps] = useState(50);
  const [rentBtc, setRentBtc] = useState(0.017);
  const [op, setOp] = useState<(typeof OPS)[number]["id"]>("ln");

  const annualized = useMemo(() => {
    if (leaseBtc <= 0 || days <= 0) return 0;
    return (rentBtc / leaseBtc) * (365 / days);
  }, [rentBtc, leaseBtc, days]);

  const residualMin = btc - (btc * drawdownBps) / 10_000;

  return (
    <main className="mx-auto min-h-full max-w-3xl px-5 py-16 md:px-8">
      <div className="mb-10 flex items-center justify-between">
        <Link href="/" className="inline-flex items-center gap-2">
          <RootMark className="h-5 w-5 text-[var(--copper)]" />
          <span className="font-[family-name:var(--font-display)] font-700">
            ROOT
          </span>
        </Link>
        <Link href="/docs/mvp" className="text-sm text-[var(--ink-soft)] hover:text-[var(--copper)]">
          MVP spec
        </Link>
      </div>

      <h1 className="font-[family-name:var(--font-display)] text-3xl font-700 md:text-4xl">
        Capability studio
      </h1>
      <p className="mt-4 max-w-xl text-[var(--ink-soft)]">
        Sketch a lease. Coins stay under ownership; only a narrow execution
        window is offered to the market. This UI is illustrative—enforcement
        lives in the vault spend graph.
      </p>

      <div className="mt-12 space-y-8 border-t border-[var(--line)] pt-10">
        <label className="block">
          <span className="font-[family-name:var(--font-mono)] text-xs tracking-wide text-[var(--ink-soft)]/70">
            VAULT SIZE (BTC)
          </span>
          <input
            type="range"
            min={1}
            max={1000}
            value={btc}
            onChange={(e) => setBtc(Number(e.target.value))}
            className="mt-3 w-full accent-[var(--copper)]"
          />
          <span className="mt-1 block font-[family-name:var(--font-display)] text-2xl">
            {btc} BTC
          </span>
        </label>

        <label className="block">
          <span className="font-[family-name:var(--font-mono)] text-xs tracking-wide text-[var(--ink-soft)]/70">
            CAPABILITY NOTIONAL (BTC)
          </span>
          <input
            type="range"
            min={0.1}
            max={btc}
            step={0.1}
            value={Math.min(leaseBtc, btc)}
            onChange={(e) => setLeaseBtc(Number(e.target.value))}
            className="mt-3 w-full accent-[var(--copper)]"
          />
          <span className="mt-1 block text-xl">{Math.min(leaseBtc, btc)} BTC</span>
        </label>

        <fieldset>
          <legend className="font-[family-name:var(--font-mono)] text-xs tracking-wide text-[var(--ink-soft)]/70">
            ALLOWED OPERATION
          </legend>
          <div className="mt-3 flex flex-wrap gap-2">
            {OPS.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setOp(item.id)}
                className={`border px-3 py-2 text-sm transition ${
                  op === item.id
                    ? "border-[var(--copper)] bg-[color-mix(in_srgb,var(--copper)_12%,transparent)]"
                    : "border-[var(--line)] hover:border-[var(--ink)]/30"
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
        </fieldset>

        <div className="grid gap-8 sm:grid-cols-3">
          <label className="block">
            <span className="font-[family-name:var(--font-mono)] text-xs text-[var(--ink-soft)]/70">
              TENOR (DAYS)
            </span>
            <input
              type="number"
              min={1}
              max={365}
              value={days}
              onChange={(e) => setDays(Number(e.target.value))}
              className="mt-2 w-full border border-[var(--line)] bg-transparent px-3 py-2"
            />
          </label>
          <label className="block">
            <span className="font-[family-name:var(--font-mono)] text-xs text-[var(--ink-soft)]/70">
              MAX DRAWDOWN (BPS)
            </span>
            <input
              type="number"
              min={0}
              max={1000}
              value={drawdownBps}
              onChange={(e) => setDrawdownBps(Number(e.target.value))}
              className="mt-2 w-full border border-[var(--line)] bg-transparent px-3 py-2"
            />
          </label>
          <label className="block">
            <span className="font-[family-name:var(--font-mono)] text-xs text-[var(--ink-soft)]/70">
              ASK RENT (BTC)
            </span>
            <input
              type="number"
              min={0}
              step={0.001}
              value={rentBtc}
              onChange={(e) => setRentBtc(Number(e.target.value))}
              className="mt-2 w-full border border-[var(--line)] bg-transparent px-3 py-2"
            />
          </label>
        </div>
      </div>

      <pre className="mt-12 overflow-x-auto border border-[var(--line)] bg-[#12151a] p-5 font-[family-name:var(--font-mono)] text-sm leading-relaxed text-[var(--mist)]">
{`${btc} BTC Vault
├── Ownership Right        → you (always)
├── Capability             → market · ${OPS.find((o) => o.id === op)?.label}
│     notional             ${Math.min(leaseBtc, btc)} BTC
│     window               ${days} days
│     max_drawdown         ${(drawdownBps / 100).toFixed(2)}%
│     ask_rent             ${rentBtc} BTC
│     residual_floor     ≥ ${residualMin.toFixed(4)} BTC
└── Recovery Right         → you after timeout

Implied Capability Rate ≈ ${(annualized * 100).toFixed(2)}% annualized
Holder cannot: send(${btc} BTC, holder_address)`}
      </pre>
    </main>
  );
}
