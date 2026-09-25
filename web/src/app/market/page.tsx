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
      <h1 className="font-[family-name:var(--font-display)] text-4xl font-700">
        Lease
      </h1>
      <p className="mt-3 font-[family-name:var(--font-mono)] text-sm text-[var(--ink-soft)]/70">
        Listed capabilities
      </p>

      <div className="mt-10">
        {loading && (
          <p className="text-sm text-[var(--ink-soft)]/60">Loading…</p>
        )}
        {!loading && caps.length === 0 && (
          <p className="border-t border-[var(--line)] py-10 text-sm text-[var(--ink-soft)]/60">
            No listings yet.
          </p>
        )}
        {caps.map((cap) => (
          <CapCard key={cap.id} cap={cap} />
        ))}
      </div>
    </main>
  );
}
