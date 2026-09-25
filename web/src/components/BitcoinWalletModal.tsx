"use client";

import type {BitcoinWalletOption} from "@/lib/bitcoin-wallet";

const FEATURED = new Set([
  "unisat",
  "okx",
  "xverse",
  "leather",
  "magicEden",
  "binance",
  "bitget",
  "onekey",
  "ctrl",
  "oyl",
  "metamask",
  "phantom",
]);

export function BitcoinWalletModal({
  open,
  wallets,
  busy,
  error,
  onClose,
  onSelect,
  onExternal,
}: {
  open: boolean;
  wallets: BitcoinWalletOption[];
  busy: string | null;
  error?: string | null;
  onClose: () => void;
  onSelect: (id: string) => void;
  onExternal: () => void;
}) {
  if (!open) return null;

  const ordered = [...wallets].sort((a, b) => {
    const af = FEATURED.has(a.id) ? 0 : 1;
    const bf = FEATURED.has(b.id) ? 0 : 1;
    return af - bf || a.name.localeCompare(b.name);
  });

  return (
    <div className="fixed inset-0 z-[100] flex items-end justify-center bg-[#07090c]/80 p-0 backdrop-blur-sm sm:items-center sm:p-5">
      <button
        type="button"
        aria-label="Close wallet selector"
        className="absolute inset-0"
        onClick={onClose}
      />
      <section className="relative z-10 max-h-[88svh] w-full max-w-xl overflow-y-auto border border-white/10 bg-[#101318] text-[#edf0f2] shadow-2xl">
        <header className="sticky top-0 z-10 flex items-start justify-between gap-5 border-b border-white/10 bg-[#101318]/95 p-5 backdrop-blur">
          <div>
            <p className="font-[family-name:var(--font-mono)] text-[9px] tracking-[0.24em] text-[#d98248] uppercase">
              Bitcoin signer / mainnet
            </p>
            <h2 className="mt-2 font-[family-name:var(--font-display)] text-2xl font-700">
              Select wallet
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="grid h-9 w-9 place-items-center border border-white/10 text-white/50 transition hover:border-white/30 hover:text-white"
          >
            ×
          </button>
        </header>

        <div className="grid grid-cols-2 gap-px bg-white/10 sm:grid-cols-3">
          {ordered.map((wallet, index) => (
            <button
              key={wallet.id}
              type="button"
              disabled={Boolean(busy)}
              onClick={() => onSelect(wallet.id)}
              className="group min-h-28 bg-[#101318] p-4 text-left transition hover:bg-[#171b21] disabled:opacity-45"
            >
              <span className="grid h-8 w-8 place-items-center border border-white/10 bg-white/[0.03] font-[family-name:var(--font-display)] text-xs text-[#d98248] group-hover:border-[#d98248]/60">
                {wallet.icon ? (
                  // Connector icons are bundled data URIs or extension-owned URLs.
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={wallet.icon}
                    alt=""
                    className="h-5 w-5 object-contain"
                  />
                ) : (
                  wallet.name.slice(0, 2).toUpperCase()
                )}
              </span>
              <span className="mt-4 block text-sm text-white/85">
                {wallet.name}
              </span>
              <span className="mt-1 block font-[family-name:var(--font-mono)] text-[9px] text-white/30">
                {busy === wallet.id
                  ? "CONNECTING…"
                  : String(index + 1).padStart(2, "0")}
              </span>
            </button>
          ))}
        </div>

        <button
          type="button"
          onClick={onExternal}
          className="flex w-full items-center justify-between gap-5 border-t border-white/10 p-5 text-left transition hover:bg-white/[0.03]"
        >
          <div>
            <span className="text-sm text-white/90">Any other BTC wallet</span>
            <span className="mt-1 block font-[family-name:var(--font-mono)] text-[9px] text-white/35">
              Sparrow · BlueWallet · Trust · any BIP-21 wallet
            </span>
          </div>
          <span className="text-[#d98248]">→</span>
        </button>
        {error && (
          <p className="border-t border-[#d98248]/25 bg-[#d98248]/[0.06] px-5 py-3 font-[family-name:var(--font-mono)] text-[10px] leading-relaxed text-[#e4a174]">
            {error}
          </p>
        )}
      </section>
    </div>
  );
}
