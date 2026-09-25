"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { CapCard } from "@/components/CapCard";
import type { Capability } from "@/lib/types";
import { useWallet } from "@/lib/wallet";

export default function MePage() {
  const { address, connect } = useWallet();
  const [caps, setCaps] = useState<Capability[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!address) return;
    let cancelled = false;
    void fetch(`/api/caps?owner=${encodeURIComponent(address)}`)
      .then((response) => response.json())
      .then((data) => {
        if (!cancelled) setCaps(data.caps ?? []);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [address]);

  if (!address) {
    return (
      <main className="mx-auto w-full max-w-xl flex-1 px-5 py-16 text-center">
        <p className="font-[family-name:var(--font-mono)] text-[11px] tracking-[0.18em] text-[var(--copper)] uppercase">
          Custody
        </p>
        <h1 className="mt-2 font-[family-name:var(--font-display)] text-3xl font-700">
          Vault
        </h1>
        <button
          type="button"
          onClick={connect}
          className="mt-8 bg-[var(--ink)] px-5 py-3 text-sm text-[var(--mist)]"
        >
          Connect wallet
        </button>
      </main>
    );
  }

  return (
    <main className="mx-auto w-full max-w-2xl flex-1 px-5 py-10 md:px-8 md:py-14">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="font-[family-name:var(--font-mono)] text-[11px] tracking-[0.18em] text-[var(--copper)] uppercase">
            Custody
          </p>
          <h1 className="mt-2 font-[family-name:var(--font-display)] text-4xl font-700">
            Vault
          </h1>
          <p className="mt-3 font-[family-name:var(--font-mono)] text-xs text-[var(--ink-soft)]/55 break-all">
            {address}
          </p>
        </div>
        <Link
          href="/mint"
          className="bg-[var(--ink)] px-4 py-2 text-sm text-[var(--mist)]"
        >
          Issue
        </Link>
      </div>

      <dl className="mt-8 grid grid-cols-3 gap-4 border-t border-[var(--line)] pt-6 font-[family-name:var(--font-mono)] text-sm">
        <div>
          <dt className="text-[11px] text-[var(--ink-soft)]/50">Caps</dt>
          <dd className="mt-1 text-lg">{caps.length}</dd>
        </div>
        <div>
          <dt className="text-[11px] text-[var(--ink-soft)]/50">Listed</dt>
          <dd className="mt-1 text-lg">{caps.filter((c) => c.status === "listed").length}</dd>
        </div>
        <div>
          <dt className="text-[11px] text-[var(--ink-soft)]/50">Live</dt>
          <dd className="mt-1 text-lg">
            {caps.filter((c) => c.status !== "leased").length}
          </dd>
        </div>
      </dl>

      <div className="mt-6">
        {loading && <p className="text-sm text-[var(--ink-soft)]/60">Syncing…</p>}
        {!loading && caps.length === 0 && (
          <p className="border-t border-[var(--line)] py-10 font-[family-name:var(--font-mono)] text-sm text-[var(--ink-soft)]/55">
            vault.caps = []
          </p>
        )}
        {caps.map((cap) => (
          <CapCard key={cap.id} cap={cap} />
        ))}
      </div>
    </main>
  );
}
