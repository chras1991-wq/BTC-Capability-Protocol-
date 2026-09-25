"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  CAPABILITY_TYPES,
  MINT_FEE_SATS,
  WALLET_MINT_CAP_SATS,
  formatBtc,
} from "@/lib/protocol";
import type { CapabilityTypeId } from "@/lib/protocol";
import { useWallet } from "@/lib/wallet";

type WalletInfo = {
  mintedFeeSats: number;
  remainingFeeSats: number;
  remainingMints: number;
};

const POLICY: Record<CapabilityTypeId, string[]> = {
  ln: ["ln_open_channel", "ln_adjust_channel", "cooperative_close"],
  mm: ["swap_bounded", "residual_to_vault", "max_drawdown_guard"],
  collateral: ["attest_balance", "oracle_lock", "release_on_settle"],
  option: ["underwrite_put", "expiry_csv", "assignment_path"],
};

export default function MintPage() {
  const { address, connect } = useWallet();
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

  const preview = useMemo(() => {
    const ops = POLICY[type];
    return `registry.record(CAP-INTENT)
  class       ${type}
  requested   { ${ops.join(", ")} }
  identity    Privy DID / embedded wallet
  settlement  not active
  custody     none`;
  }, [type]);

  async function onMint() {
    if (!address) {
      connect();
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
      if (!res.ok) throw new Error(data.error || "issue failed");
      router.push(`/cap/${data.capability.id}?lease=1`);
    } catch (e) {
      setError(e instanceof Error ? e.message : "issue failed");
    } finally {
      setBusy(false);
    }
  }

  const capped = walletInfo != null && walletInfo.remainingMints <= 0;
  const issued = walletInfo
    ? Math.floor(walletInfo.mintedFeeSats / MINT_FEE_SATS)
    : 0;
  const quota = Math.floor(WALLET_MINT_CAP_SATS / MINT_FEE_SATS);

  return (
    <main className="mx-auto w-full max-w-2xl flex-1 px-5 py-10 md:px-8 md:py-14">
      <p className="font-[family-name:var(--font-mono)] text-[11px] tracking-[0.18em] text-[var(--copper)] uppercase">
        Compiler
      </p>
      <h1 className="mt-2 font-[family-name:var(--font-display)] text-4xl font-700">
        Issue capability
      </h1>
      <p className="mt-3 max-w-md text-sm text-[var(--ink-soft)]/70">
        Register a signed capability intent. This alpha does not lock, move, or custody BTC.
      </p>

      <div className="mt-10 space-y-8 border-t border-[var(--line)] pt-8">
        <fieldset>
          <legend className="font-[family-name:var(--font-mono)] text-xs tracking-wide text-[var(--ink-soft)]/60">
            POLICY CLASS
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

        <pre className="overflow-x-auto border border-[var(--line)] bg-[#12151a] p-4 font-[family-name:var(--font-mono)] text-[12px] leading-relaxed text-[var(--mist)]/85">
          {preview}
        </pre>

        <dl className="grid grid-cols-2 gap-4 font-[family-name:var(--font-mono)] text-sm md:grid-cols-3">
          <div>
            <dt className="text-[11px] text-[var(--ink-soft)]/50">Record</dt>
            <dd className="mt-1">off-chain</dd>
          </div>
          <div>
            <dt className="text-[11px] text-[var(--ink-soft)]/50">Identity</dt>
            <dd className="mt-1">Privy</dd>
          </div>
          <div>
            <dt className="text-[11px] text-[var(--ink-soft)]/50">Quota</dt>
            <dd className="mt-1">
              {walletInfo ? `${issued} / ${quota}` : `— / ${quota}`}
            </dd>
          </div>
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
          className="w-full bg-[var(--ink)] py-3.5 text-sm font-600 text-[var(--mist)] transition hover:bg-[var(--ink-soft)] disabled:cursor-not-allowed disabled:opacity-40"
        >
          {!address
            ? "Connect wallet"
            : capped
              ? "Issuance quota exhausted"
              : busy
                ? "Compiling…"
                : "Sign & issue"}
        </button>

        <p className="font-[family-name:var(--font-mono)] text-[11px] text-[var(--ink-soft)]/40">
          issuance_cost {formatBtc(MINT_FEE_SATS)} · epoch_quota{" "}
          {formatBtc(WALLET_MINT_CAP_SATS)}
        </p>
      </div>
    </main>
  );
}
