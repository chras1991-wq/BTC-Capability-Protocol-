"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

export type WalletKind = "unisat" | "okx" | "demo" | null;

type WalletContextValue = {
  address: string | null;
  kind: WalletKind;
  connecting: boolean;
  connectDemo: () => void;
  connectUnisat: () => Promise<void>;
  connectOkx: () => Promise<void>;
  disconnect: () => void;
  shortAddress: string | null;
};

const WalletContext = createContext<WalletContextValue | null>(null);

const STORAGE_KEY = "root.wallet.v1";

function shorten(addr: string): string {
  if (addr.length < 12) return addr;
  return `${addr.slice(0, 6)}…${addr.slice(-4)}`;
}

function randomDemoAddress(): string {
  const hex = Array.from(crypto.getRandomValues(new Uint8Array(16)))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
  return `bc1q${hex}`;
}

export function WalletProvider({ children }: { children: ReactNode }) {
  const [address, setAddress] = useState<string | null>(null);
  const [kind, setKind] = useState<WalletKind>(null);
  const [connecting, setConnecting] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw) as { address: string; kind: WalletKind };
      if (parsed.address) {
        setAddress(parsed.address);
        setKind(parsed.kind);
      }
    } catch {
      /* ignore */
    }
  }, []);

  const persist = useCallback((addr: string | null, k: WalletKind) => {
    setAddress(addr);
    setKind(k);
    if (!addr) {
      localStorage.removeItem(STORAGE_KEY);
      return;
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ address: addr, kind: k }));
  }, []);

  const connectDemo = useCallback(() => {
    persist(randomDemoAddress(), "demo");
  }, [persist]);

  const connectUnisat = useCallback(async () => {
    setConnecting(true);
    try {
      const provider = (
        window as unknown as {
          unisat?: { requestAccounts: () => Promise<string[]> };
        }
      ).unisat;
      if (!provider) {
        throw new Error("Unisat not found");
      }
      const accounts = await provider.requestAccounts();
      if (!accounts[0]) throw new Error("no account");
      persist(accounts[0], "unisat");
    } finally {
      setConnecting(false);
    }
  }, [persist]);

  const connectOkx = useCallback(async () => {
    setConnecting(true);
    try {
      const provider = (
        window as unknown as {
          okxwallet?: { bitcoin?: { connect: () => Promise<{ address: string }> } };
        }
      ).okxwallet?.bitcoin;
      if (!provider) throw new Error("OKX Wallet not found");
      const res = await provider.connect();
      persist(res.address, "okx");
    } finally {
      setConnecting(false);
    }
  }, [persist]);

  const disconnect = useCallback(() => persist(null, null), [persist]);

  const value = useMemo(
    () => ({
      address,
      kind,
      connecting,
      connectDemo,
      connectUnisat,
      connectOkx,
      disconnect,
      shortAddress: address ? shorten(address) : null,
    }),
    [
      address,
      kind,
      connecting,
      connectDemo,
      connectUnisat,
      connectOkx,
      disconnect,
    ],
  );

  return (
    <WalletContext.Provider value={value}>{children}</WalletContext.Provider>
  );
}

export function useWallet(): WalletContextValue {
  const ctx = useContext(WalletContext);
  if (!ctx) throw new Error("useWallet outside provider");
  return ctx;
}
