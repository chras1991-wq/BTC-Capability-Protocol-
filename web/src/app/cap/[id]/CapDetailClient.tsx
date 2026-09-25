"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import type { Capability } from "@/lib/types";
import { typeLabel } from "@/lib/types";
import { formatBtc, TENOR_PRESETS } from "@/lib/protocol";
import { useWallet } from "@/lib/wallet";

export default function CapDetailPage() {
  const params = useParams<{ id: string }>();
  const search = useSearchParams();
  const router = useRouter();
  const { address, connectDemo } = useWallet();
  const [cap, setCap] = useState<Capability | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [rentBtc, setRentBtc] = useState("0.0001");
  const [tenor, setTenor] = useState(30);
  const [drawdown, setDrawdown] = useState(50);
  const showLeasePanel = search.get("lease") === "1";

  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/caps/${encodeURIComponent(params.id)}`);
      if (!res.ok) {
        setCap(null);
        return;
      }
      const data = await res.json();
      setCap(data.capability ?? null);
    } finally {
      setLoading(false);
    }
  }, [params.id]);

  useEffect(() => {
    void load();
  }, [load]);

  const isOwner =
    !!address && !!cap && address.toLowerCase() === cap.owner.toLowerCase();

  async function onList() {
    if (!address || !cap) return;
    setBusy(true);
    setError(null);
    try {
      const rentSats = Math.round(parseFloat(rentBtc) * 1e8);
      const res = await fetch("/api/lease", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "list",
          id: cap.id,
          owner: address,
          rentSats,
          tenorDays: tenor,
          maxDrawdownBps: drawdown,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "list failed");
      setCap(data.capability);
      router.replace(`/cap/${cap.id}`);
    } catch (e) {
      setError(e instanceof Error ? e.message : "list failed");
    } finally {
      setBusy(false);
    }
  }

  async function onTake() {
    if (!address) {
      connectDemo();
      return;
    }
    if (!cap) return;
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/lease", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "take",
          id: cap.id,
          lessee: address,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "lease failed");
      setCap(data.capability);
    } catch (e) {
      setError(e instanceof Error ? e.message : "lease failed");
    } finally {
      setBusy(false);
    }
  }

  if (loading) {
    return (
      <main className="mx-auto max-w-xl px-5 py-16 text-sm text-[var(--ink-soft)]/60">
        Loading…
      </main>
    );
  }

  if (!cap) {
    return (
      <main className="mx-auto max-w-xl px-5 py-16">
        <p className="text-sm text-[var(--ink-soft)]/60">Not found</p>
        <Link href="/market" className="mt-4 inline-block text-sm text-[var(--copper-deep)]">
          Capability market
        </Link>
      </main>
    );
  }

  return (
    <main className="mx-auto w-full max-w-xl flex-1 px-5 py-10 md:px-8 md:py-14">
      <p className="font-[family-name:var(--font-mono)] text-xs text-[var(--ink-soft)]/55">
        {cap.id}
      </p>
      <h1 className="mt-2 font-[family-name:var(--font-display)] text-4xl font-700">
        {typeLabel(cap.type)}
      </h1>
      <p className="mt-3 font-[family-name:var(--font-mono)] text-sm uppercase text-[var(--copper-deep)]">
        {cap.status}
      </p>

      <dl className="mt-8 space-y-3 border-t border-[var(--line)] pt-6 font-[family-name:var(--font-mono)] text-sm">
        <div className="flex justify-between gap-4">
          <dt className="text-[var(--ink-soft)]/55">Seal</dt>
          <dd>single-use</dd>
        </div>
        <div className="flex justify-between gap-4">
          <dt className="text-[var(--ink-soft)]/55">Enforcer</dt>
          <dd>MuSig2</dd>
        </div>
        <div className="flex justify-between gap-4">
          <dt className="text-[var(--ink-soft)]/55">Owner</dt>
          <dd className="truncate max-w-[60%]">{cap.owner}</dd>
        </div>
        {cap.rentSats != null && (
          <div className="flex justify-between gap-4">
            <dt className="text-[var(--ink-soft)]/55">Rent</dt>
            <dd>{formatBtc(cap.rentSats)}</dd>
          </div>
        )}
        {cap.tenorDays != null && (
          <div className="flex justify-between gap-4">
            <dt className="text-[var(--ink-soft)]/55">Tenor</dt>
            <dd>{cap.tenorDays}d</dd>
          </div>
        )}
        {cap.maxDrawdownBps != null && (
          <div className="flex justify-between gap-4">
            <dt className="text-[var(--ink-soft)]/55">Max DD</dt>
            <dd>{(cap.maxDrawdownBps / 100).toFixed(2)}%</dd>
          </div>
        )}
        {cap.lessee && (
          <div className="flex justify-between gap-4">
            <dt className="text-[var(--ink-soft)]/55">Lessee</dt>
            <dd className="truncate max-w-[60%]">{cap.lessee}</dd>
          </div>
        )}
      </dl>

      {error && (
        <p className="mt-6 text-sm text-red-700" role="alert">
          {error}
        </p>
      )}

      {/* Immediate lease after mint */}
      {isOwner && (cap.status === "ready" || showLeasePanel) && cap.status !== "leased" && (
        <section className="mt-10 border-t border-[var(--line)] pt-8">
          <h2 className="font-[family-name:var(--font-display)] text-2xl font-600">
            Open execution window
          </h2>
          <p className="mt-2 font-[family-name:var(--font-mono)] text-xs text-[var(--ink-soft)]/55">
            Publish Π terms · transferable CAP
          </p>
          <div className="mt-6 space-y-4">
            <label className="block">
              <span className="font-[family-name:var(--font-mono)] text-xs text-[var(--ink-soft)]/55">
                ρ RENT (BTC)
              </span>
              <input
                value={rentBtc}
                onChange={(e) => setRentBtc(e.target.value)}
                className="mt-2 w-full border border-[var(--line)] bg-transparent px-3 py-2 font-[family-name:var(--font-mono)]"
              />
            </label>
            <div>
              <span className="font-[family-name:var(--font-mono)] text-xs text-[var(--ink-soft)]/55">
                T TENOR
              </span>
              <div className="mt-2 flex gap-2">
                {TENOR_PRESETS.map((d) => (
                  <button
                    key={d}
                    type="button"
                    onClick={() => setTenor(d)}
                    className={`border px-3 py-2 text-sm ${
                      tenor === d
                        ? "border-[var(--copper)]"
                        : "border-[var(--line)]"
                    }`}
                  >
                    {d}d
                  </button>
                ))}
              </div>
            </div>
            <label className="block">
              <span className="font-[family-name:var(--font-mono)] text-xs text-[var(--ink-soft)]/55">
                δ MAX DRAWDOWN (BPS)
              </span>
              <input
                type="number"
                value={drawdown}
                onChange={(e) => setDrawdown(Number(e.target.value))}
                className="mt-2 w-full border border-[var(--line)] bg-transparent px-3 py-2 font-[family-name:var(--font-mono)]"
              />
            </label>
            <button
              type="button"
              disabled={busy}
              onClick={() => void onList()}
              className="w-full bg-[var(--ink)] py-3.5 text-sm font-600 text-[var(--mist)] disabled:opacity-40"
            >
              {busy ? "Publishing…" : "Publish to market"}
            </button>
          </div>
        </section>
      )}

      {!isOwner && cap.status === "listed" && (
        <button
          type="button"
          disabled={busy}
          onClick={() => void onTake()}
          className="mt-10 w-full bg-[var(--copper)] py-3.5 text-sm font-600 text-[var(--mist)] disabled:opacity-40"
        >
          {busy ? "Binding…" : `Bind capability · ${formatBtc(cap.rentSats ?? 0)}`}
        </button>
      )}
    </main>
  );
}
