"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  CAPABILITY_TYPES,
  MINT_FEE_SATS,
  TREASURY_ADDRESS,
  WALLET_MINT_CAP_SATS,
  formatBtc,
} from "@/lib/protocol";
import type { CapabilityTypeId } from "@/lib/protocol";
import { useWallet } from "@/lib/wallet";
import {useBitcoinWallet} from "@/lib/bitcoin-wallet";
import {BitcoinWalletModal} from "@/components/BitcoinWalletModal";

type WalletInfo = {
  mintedFeeSats: number;
  remainingFeeSats: number;
  remainingMints: number;
};

type RuntimeConfig = {
  issuanceEnabled: boolean;
  auth: boolean;
  durableStore: boolean;
};

const POLICY: Record<CapabilityTypeId, string[]> = {
  ln: ["ln_open_channel", "ln_adjust_channel", "cooperative_close"],
  mm: ["swap_bounded", "residual_to_vault", "max_drawdown_guard"],
  collateral: ["attest_balance", "oracle_lock", "release_on_settle"],
  option: ["underwrite_put", "expiry_csv", "assignment_path"],
};

export default function MintPage() {
  const {
    address: identity,
    authenticated,
    connect,
    getAccessToken,
  } = useWallet();
  const bitcoin = useBitcoinWallet();
  const router = useRouter();
  const [type, setType] = useState<CapabilityTypeId>("ln");
  const [walletInfo, setWalletInfo] = useState<WalletInfo | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [manual, setManual] = useState(false);
  const [manualAddress, setManualAddress] = useState("");
  const [paymentTxid, setPaymentTxid] = useState("");
  const [runtime, setRuntime] = useState<RuntimeConfig | null>(null);
  const [walletModal, setWalletModal] = useState(false);
  const [connectingWallet, setConnectingWallet] = useState<string | null>(null);

  const payerAddress = bitcoin.address ?? manualAddress.trim();

  useEffect(() => {
    if (!payerAddress) {
      return;
    }
    let cancelled = false;
    void fetch(`/api/wallet/${encodeURIComponent(payerAddress)}`)
      .then((response) => response.json() as Promise<WalletInfo>)
      .then((data) => {
        if (!cancelled) setWalletInfo(data);
      });
    return () => {
      cancelled = true;
    };
  }, [payerAddress]);

  useEffect(() => {
    void fetch("/api/config", {cache: "no-store"})
      .then((response) => response.json())
      .then(setRuntime)
      .catch(() =>
        setRuntime({issuanceEnabled: false, auth: false, durableStore: false}),
      );
  }, []);

  const preview = useMemo(() => {
    const ops = POLICY[type];
    return `registry.record(CAP-INTENT)
  class       ${type}
  requested   { ${ops.join(", ")} }
  identity    Privy DID / embedded wallet
  settlement  not active
  custody     none`;
  }, [type]);

  async function register(txid: string) {
    if (!identity || !payerAddress) return;
    const accessToken = await getAccessToken();
    const res = await fetch("/api/caps", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(accessToken ? {Authorization: `Bearer ${accessToken}`} : {}),
      },
      body: JSON.stringify({
        owner: identity,
        payerAddress,
        paymentTxid: txid,
        type,
      }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "issue failed");
    router.push(`/cap/${data.capability.id}?lease=1`);
  }

  async function onIssue() {
    if (!runtime?.issuanceEnabled) return;
    if (!authenticated) {
      connect();
      return;
    }
    if (!payerAddress) {
      setWalletModal(true);
      return;
    }
    if (bitcoin.address && !bitcoin.nativePayment && !manual) {
      setManual(true);
      return;
    }

    setBusy(true);
    setError(null);
    try {
      let txid = paymentTxid.trim();
      if (!manual) {
        txid = await bitcoin.payIssuance();
        setPaymentTxid(txid);
        await new Promise((resolve) => setTimeout(resolve, 1800));
      }
      if (!txid) throw new Error("transaction id required");
      await register(txid);
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
  const paymentUri = `bitcoin:${TREASURY_ADDRESS}?amount=0.00005`;

  async function connectBitcoin(walletId: string) {
    setConnectingWallet(walletId);
    setError(null);
    try {
      await bitcoin.connect(walletId);
      setWalletModal(false);
    } catch (e) {
      setError(
        e instanceof Error
          ? e.message
          : "Wallet unavailable. Install it or use external payment.",
      );
    } finally {
      setConnectingWallet(null);
    }
  }

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

        <div className="border border-[var(--line)] bg-white/35">
          <div className="flex items-center justify-between gap-4 border-b border-[var(--line)] px-4 py-3">
            <span className="font-[family-name:var(--font-mono)] text-[10px] tracking-wider text-[var(--ink-soft)]/50 uppercase">
              Bitcoin settlement
            </span>
            <span className="font-[family-name:var(--font-mono)] text-[10px] text-[var(--sage)]">
              MAINNET
            </span>
          </div>
          <div className="space-y-3 p-4 font-[family-name:var(--font-mono)] text-xs">
            <div className="flex justify-between gap-4">
              <span className="text-[var(--ink-soft)]/50">Output</span>
              <span>{MINT_FEE_SATS.toLocaleString()} sats</span>
            </div>
            <div className="flex justify-between gap-4">
              <span className="text-[var(--ink-soft)]/50">Treasury</span>
              <span className="max-w-[70%] truncate">{TREASURY_ADDRESS}</span>
            </div>
            <div className="flex justify-between gap-4">
              <span className="text-[var(--ink-soft)]/50">Signer</span>
              <span>
                {bitcoin.address
                  ? `${bitcoin.name} · ${bitcoin.address.slice(0, 8)}…`
                  : manual
                    ? "external"
                    : "not connected"}
              </span>
            </div>
          </div>
          {!bitcoin.address && !manual && (
            <button
              type="button"
              onClick={() => setWalletModal(true)}
              className="w-full border-t border-[var(--line)] px-4 py-3 text-left font-[family-name:var(--font-mono)] text-[10px] tracking-wider text-[var(--copper-deep)] uppercase transition hover:bg-black/[0.03]"
            >
              Select Bitcoin wallet →
            </button>
          )}
        </div>

        {manual && (
          <div className="space-y-4 border-l-2 border-[var(--copper)] pl-4">
            <p className="text-sm leading-relaxed text-[var(--ink-soft)]/70">
              Send exactly 5,000 sats to the treasury, then submit the
              propagated mainnet transaction.
            </p>
            <a
              href={paymentUri}
              className="inline-flex border border-[var(--copper)] px-3 py-2 font-[family-name:var(--font-mono)] text-[10px] tracking-wider text-[var(--copper-deep)] uppercase"
            >
              Open BIP-21 payment
            </a>
            <label className="block">
              <span className="font-[family-name:var(--font-mono)] text-[10px] text-[var(--ink-soft)]/50">
                PAYER ADDRESS
              </span>
              <input
                value={manualAddress}
                onChange={(event) => setManualAddress(event.target.value)}
                placeholder="bc1…"
                className="mt-2 w-full border border-[var(--line)] bg-transparent px-3 py-2 font-[family-name:var(--font-mono)] text-xs"
              />
            </label>
            <label className="block">
              <span className="font-[family-name:var(--font-mono)] text-[10px] text-[var(--ink-soft)]/50">
                PAYMENT TXID
              </span>
              <input
                value={paymentTxid}
                onChange={(event) => setPaymentTxid(event.target.value)}
                placeholder="64-character transaction id"
                className="mt-2 w-full border border-[var(--line)] bg-transparent px-3 py-2 font-[family-name:var(--font-mono)] text-xs"
              />
            </label>
          </div>
        )}

        <button
          type="button"
          disabled={busy || capped || !runtime?.issuanceEnabled}
          onClick={() => void onIssue()}
          className="w-full bg-[var(--ink)] py-3.5 text-sm font-600 text-[var(--mist)] transition hover:bg-[var(--ink-soft)] disabled:cursor-not-allowed disabled:opacity-40"
        >
          {!runtime?.issuanceEnabled
            ? "Mainnet issuance activation pending"
            : !authenticated
            ? "Authenticate with Privy"
            : !payerAddress
              ? "Select Bitcoin signer"
            : capped
              ? "Issuance quota exhausted"
              : busy
                ? "Verifying mainnet transaction…"
                : manual
                  ? "Verify payment & issue"
                  : "Pay 5,000 sats & issue"}
        </button>

        {runtime && !runtime.issuanceEnabled && (
          <div className="grid grid-cols-2 gap-px bg-[var(--line)] font-[family-name:var(--font-mono)] text-[10px]">
            <div className="bg-[var(--paper)] p-3">
              <span className="text-[var(--ink-soft)]/45">PRIVY VERIFY</span>
              <span className={`ml-2 ${runtime.auth ? "text-[var(--sage)]" : "text-[var(--copper-deep)]"}`}>
                {runtime.auth ? "READY" : "PENDING"}
              </span>
            </div>
            <div className="bg-[var(--paper)] p-3">
              <span className="text-[var(--ink-soft)]/45">DURABLE STORE</span>
              <span className={`ml-2 ${runtime.durableStore ? "text-[var(--sage)]" : "text-[var(--copper-deep)]"}`}>
                {runtime.durableStore ? "READY" : "PENDING"}
              </span>
            </div>
          </div>
        )}

        <p className="font-[family-name:var(--font-mono)] text-[11px] text-[var(--ink-soft)]/40">
          issuance_cost {formatBtc(MINT_FEE_SATS)} · epoch_quota{" "}
          {formatBtc(WALLET_MINT_CAP_SATS)}
        </p>
      </div>

      <BitcoinWalletModal
        open={walletModal}
        wallets={bitcoin.wallets}
        busy={connectingWallet}
        error={error}
        onClose={() => setWalletModal(false)}
        onSelect={(id) => void connectBitcoin(id)}
        onExternal={() => {
          setManual(true);
          setWalletModal(false);
        }}
      />
    </main>
  );
}
