"use client";

import {useCallback, useEffect, useState} from "react";
import {MINT_FEE_SATS, TREASURY_ADDRESS} from "./protocol";

type BitcoinProvider = {
  requestAccounts?: () => Promise<string[]>;
  getAccounts?: () => Promise<string[]>;
  connect?: () => Promise<{address?: string} | {address?: string}[]>;
  sendBitcoin: (
    to: string,
    sats: number,
    options?: {feeRate?: number},
  ) => Promise<string>;
};

declare global {
  interface Window {
    unisat?: BitcoinProvider;
    okxwallet?: {bitcoin?: BitcoinProvider};
  }
}

export type BitcoinSigner = "unisat" | "okx";

function findProvider(): {kind: BitcoinSigner; provider: BitcoinProvider} | null {
  if (window.unisat?.sendBitcoin) {
    return {kind: "unisat", provider: window.unisat};
  }
  if (window.okxwallet?.bitcoin?.sendBitcoin) {
    return {kind: "okx", provider: window.okxwallet.bitcoin};
  }
  return null;
}

export function useBitcoinWallet() {
  const [kind, setKind] = useState<BitcoinSigner | null>(null);
  const [address, setAddress] = useState<string | null>(null);
  const [available, setAvailable] = useState(false);

  useEffect(() => {
    setAvailable(Boolean(findProvider()));
  }, []);

  const connect = useCallback(async () => {
    const found = findProvider();
    if (!found) throw new Error("No supported Bitcoin signer detected");

    let accounts: string[] = [];
    if (found.provider.requestAccounts) {
      accounts = await found.provider.requestAccounts();
    } else if (found.provider.connect) {
      const result = await found.provider.connect();
      const first = Array.isArray(result) ? result[0] : result;
      if (first?.address) accounts = [first.address];
    } else if (found.provider.getAccounts) {
      accounts = await found.provider.getAccounts();
    }

    if (!accounts[0]) throw new Error("Bitcoin account unavailable");
    setKind(found.kind);
    setAddress(accounts[0]);
    return accounts[0];
  }, []);

  const payIssuance = useCallback(async () => {
    const found = findProvider();
    if (!found || found.kind !== kind || !address) {
      throw new Error("Connect the Bitcoin signer first");
    }
    return found.provider.sendBitcoin(TREASURY_ADDRESS, MINT_FEE_SATS);
  }, [address, kind]);

  return {available, kind, address, connect, payIssuance};
}
