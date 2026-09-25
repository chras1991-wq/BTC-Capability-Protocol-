"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { CapCard } from "@/components/CapCard";
import type { Capability } from "@/lib/types";
import { formatBtc, MINT_FEE_BTC, WALLET_MINT_CAP_BTC } from "@/lib/protocol";
import { useWallet } from "@/lib/wallet";

export default function MePage() {
  const { address, connectDemo } = useWallet();
  const [caps, setCaps] = useState<Capability[]>([]);
  const [spent, setSpent] = useState(0);
  const [loading, setLoading] = useState(false);

  const load = useCallback(async () => {
    if (!address) {
      setCaps([]);
      return;
    }
    setLoading(true);
    try {
      const [capsRes, walletRes] = await Promise.all([
        fetch(`/api/caps?owner=${encodeURIComponent(address)}`),
        fetch(`/api/wallet/${encodeURIComponent(address)}`),
      ]);
      const capsData = await capsRes.json();
      const walletData = await walletRes.json();
      setCaps(capsData.caps ?? []);
      setSpent(walletData.mintedFeeSats ?? 0);
    } finally {
      setLoading(false);
    }
  }, [address]);

  useEffect(() => {
    void load();
  }, [load]);

  if (!address) {
    return (
      <main className="mx-auto w-full max-w-xl flex-1 px-5 py-16 text-center">
        <h1 className="font-[family-name:var(--font-display)] text-3xl font-700">
          Vault
        </h1>
        <button
          type="button"
          onClick={connectDemo}
          className="mt-8 bg-[var(--ink)] px-5 py-3 text-sm text-[var(--mist)]"
        >
          Connect
        </button>
      </main>
    );
  }

  return (
    <main className="mx-auto w-full max-w-2xl flex-1 px-5 py-10 md:px-8 md:py-14">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-[family-name:var(--font-display)] text-4xl font-700">
            Vault
          </h1>
          <p className="mt-3 font-[family-name:var(--font-mono)] text-xs text-[var(--ink-soft)]/60 break-all">
            {address}
          </p>
        </div>
        <Link
          href="/mint"
          className="bg-[var(--copper)] px-4 py-2 text-sm text-[var(--mist)]"
        >
          Mint
        </Link>
      </div>

      <dl className="mt-8 grid grid-cols-3 gap-4 border-t border-[var(--line)] pt-6 font-[family-name:var(--font-mono)] text-sm">
        <div>
          <dt className="text-xs text-[var(--ink-soft)]/55">Minted</dt>
          <dd className="mt-1 text-lg">{caps.length}</dd>
        </div>
        <div>
          <dt className="text-xs text-[var(--ink-soft)]/55">Spent</dt>
          <dd className="mt-1 text-lg">{formatBtc(spent)}</dd>
        </div>
        <div>
          <dt className="text-xs text-[var(--ink-soft)]/55">Cap</dt>
          <dd className="mt-1 text-lg">{WALLET_MINT_CAP_BTC}</dd>
        </div>
      </dl>

      <div className="mt-6">
        {loading && <p className="text-sm text-[var(--ink-soft)]/60">Loading…</p>}
        {!loading && caps.length === 0 && (
          <p className="border-t border-[var(--line)] py-10 text-sm text-[var(--ink-soft)]/60">
            Empty · mint {MINT_FEE_BTC} BTC
          </p>
        )}
        {caps.map((cap) => (
          <CapCard key={cap.id} cap={cap} />
        ))}
      </div>
    </main>
  );
}
