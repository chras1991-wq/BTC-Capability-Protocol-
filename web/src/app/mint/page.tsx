"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { CAPABILITY_TYPES, MINT_FEE_BTC, WALLET_MINT_CAP_BTC, formatBtc } from "@/lib/protocol";
import type { CapabilityTypeId } from "@/lib/protocol";
import { useWallet } from "@/lib/wallet";

type WalletInfo = {
  mintedFeeSats: number;
  remainingFeeSats: number;
  remainingMints: number;
};

export default function MintPage() {
  const { address, connectDemo } = useWallet();
  const router = useRouter();
  const [type, setType] = useState<CapabilityTypeId>("ln");
  const [walletInfo, setWalletInfo] = useState<WalletInfo | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    if (!address) {
      setWalletInfo(null);
      return;
    }
    const res = await fetch(`/api/wallet/${encodeURIComponent(address)}`);
    const data = (await res.json()) as WalletInfo;
    setWalletInfo(data);
  }, [address]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  async function onMint() {
    if (!address) {
      connectDemo();
      return;
    }
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/caps", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ owner: address, type }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "mint failed");
      router.push(`/cap/${data.capability.id}?lease=1`);
    } catch (e) {
      setError(e instanceof Error ? e.message : "mint failed");
    } finally {
      setBusy(false);
    }
  }

  const capped = walletInfo != null && walletInfo.remainingMints <= 0;

  return (
    <main className="mx-auto w-full max-w-xl flex-1 px-5 py-10 md:px-8 md:py-14">
      <h1 className="font-[family-name:var(--font-display)] text-4xl font-700">
        Mint
      </h1>
      <p className="mt-3 font-[family-name:var(--font-mono)] text-sm text-[var(--ink-soft)]/70">
        {MINT_FEE_BTC} BTC · live to lease
      </p>

      <div className="mt-10 space-y-8 border-t border-[var(--line)] pt-8">
        <fieldset>
          <legend className="font-[family-name:var(--font-mono)] text-xs tracking-wide text-[var(--ink-soft)]/60">
            TYPE
          </legend>
          <div className="mt-3 flex flex-wrap gap-2">
            {CAPABILITY_TYPES.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setType(item.id)}
                className={`border px-3 py-2 text-sm transition ${
                  type === item.id
                    ? "border-[var(--copper)] bg-[color-mix(in_srgb,var(--copper)_12%,transparent)]"
                    : "border-[var(--line)] hover:border-[var(--ink)]/25"
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
        </fieldset>

        <dl className="grid grid-cols-2 gap-4 font-[family-name:var(--font-mono)] text-sm">
          <div>
            <dt className="text-xs text-[var(--ink-soft)]/55">Fee</dt>
            <dd className="mt-1 text-lg text-[var(--ink)]">{MINT_FEE_BTC} BTC</dd>
          </div>
          <div>
            <dt className="text-xs text-[var(--ink-soft)]/55">Wallet cap</dt>
            <dd className="mt-1 text-lg text-[var(--ink)]">{WALLET_MINT_CAP_BTC} BTC</dd>
          </div>
          {walletInfo && (
            <>
              <div>
                <dt className="text-xs text-[var(--ink-soft)]/55">Used</dt>
                <dd className="mt-1">{formatBtc(walletInfo.mintedFeeSats)}</dd>
              </div>
              <div>
                <dt className="text-xs text-[var(--ink-soft)]/55">Left</dt>
                <dd className="mt-1">{walletInfo.remainingMints} mint</dd>
              </div>
            </>
          )}
        </dl>

        {error && (
          <p className="text-sm text-red-700" role="alert">
            {error}
          </p>
        )}

        <button
          type="button"
          disabled={busy || capped}
          onClick={() => void onMint()}
          className="w-full bg-[var(--copper)] py-3.5 text-sm font-600 text-[var(--mist)] transition hover:bg-[var(--copper-bright)] disabled:cursor-not-allowed disabled:opacity-40"
        >
          {!address
            ? "Connect to mint"
            : capped
              ? "Cap reached"
              : busy
                ? "Minting…"
                : `Mint · ${MINT_FEE_BTC} BTC`}
        </button>
      </div>
    </main>
  );
}
