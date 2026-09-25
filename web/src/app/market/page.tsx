"use client";

import { useEffect, useState } from "react";
import { CapCard } from "@/components/CapCard";
import type { Capability } from "@/lib/types";

export default function MarketPage() {
  const [caps, setCaps] = useState<Capability[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/caps?status=listed");
        const data = await res.json();
        if (!cancelled) setCaps(data.caps ?? []);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <main className="mx-auto w-full max-w-2xl flex-1 px-5 py-10 md:px-8 md:py-14">
      <p className="font-[family-name:var(--font-mono)] text-[11px] tracking-[0.18em] text-[var(--copper)] uppercase">
        Secondary
      </p>
      <h1 className="mt-2 font-[family-name:var(--font-display)] text-4xl font-700">
        Capability market
      </h1>
      <p className="mt-3 font-[family-name:var(--font-mono)] text-sm text-[var(--ink-soft)]/65">
        Open CAP-UTXOs · transferable execution rights
      </p>

      <div className="mt-10">
        {loading && (
          <p className="text-sm text-[var(--ink-soft)]/60">Syncing…</p>
        )}
        {!loading && caps.length === 0 && (
          <p className="border-t border-[var(--line)] py-10 font-[family-name:var(--font-mono)] text-sm text-[var(--ink-soft)]/55">
            market.depth = 0
          </p>
        )}
        {caps.map((cap) => (
          <CapCard key={cap.id} cap={cap} />
        ))}
      </div>
    </main>
  );
}
