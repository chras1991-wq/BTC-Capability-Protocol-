"use client";

import {useCallback, useMemo, useState} from "react";
import {MINT_FEE_SATS, TREASURY_ADDRESS} from "./protocol";
import {
  connect as connectBigmi,
  getConnectors,
  type Connector,
} from "@bigmi/client";
import {bitcoinWalletConfig} from "./bigmi";

type BitcoinProvider = {
  sendBitcoin?: (
    to: string,
    sats: number,
    options?: {feeRate?: number},
  ) => Promise<string>;
  request?: (
    method: string,
    params?: unknown,
  ) => Promise<{
    status?: string;
    result?: {txid?: string};
    error?: {message?: string};
  }>;
};

type PhantomBitcoinAccount = {
  address: string;
  purpose?: "payment" | "ordinals";
};

declare global {
  interface Window {
    phantom?: {
      bitcoin?: {
        requestAccounts: () => Promise<PhantomBitcoinAccount[]>;
      };
    };
  }
}

export type BitcoinWalletOption = {
  id: string;
  name: string;
  icon?: string;
};

type ConnectorWithProvider = Connector & {
  getInternalProvider?: () => Promise<BitcoinProvider>;
};

export function useBitcoinWallet() {
  const [connector, setConnector] = useState<Connector | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [selectedName, setSelectedName] = useState<string | null>(null);
  const [address, setAddress] = useState<string | null>(null);
  const [nativePayment, setNativePayment] = useState(false);

  const connectors = useMemo(() => getConnectors(bitcoinWalletConfig), []);
  const wallets = useMemo<BitcoinWalletOption[]>(
    () =>
      [
        ...connectors.map((item) => ({
          id: item.id,
          name: item.name,
          icon: item.icon,
        })),
        {id: "phantom", name: "Phantom"},
      ],
    [connectors],
  );

  const connect = useCallback(
    async (walletId: string) => {
      if (walletId === "phantom") {
        const provider = window.phantom?.bitcoin;
        if (!provider) throw new Error("Phantom Bitcoin wallet not detected");
        const accounts = await provider.requestAccounts();
        const payment =
          accounts.find((account) => account.purpose === "payment") ??
          accounts[0];
        if (!payment?.address) {
          throw new Error("Phantom payment address unavailable");
        }
        setConnector(null);
        setSelectedId("phantom");
        setSelectedName("Phantom");
        setAddress(payment.address);
        setNativePayment(false);
        return payment.address;
      }

      const selected = connectors.find((item) => item.id === walletId);
      if (!selected) throw new Error("Wallet connector unavailable");

      const result = await connectBigmi(bitcoinWalletConfig, {
        connector: selected,
      });
      const payment =
        result.accounts.find((account) => account.purpose === "payment") ??
        result.accounts[0];
      if (!payment?.address) {
        throw new Error("Bitcoin payment address unavailable");
      }

      const provider = await (
        selected as ConnectorWithProvider
      ).getInternalProvider?.();
      setConnector(selected);
      setSelectedId(selected.id);
      setSelectedName(selected.name);
      setAddress(payment.address);
      setNativePayment(Boolean(provider?.sendBitcoin || provider?.request));
      return payment.address;
    },
    [connectors],
  );

  const payIssuance = useCallback(async () => {
    if (!address) {
      throw new Error("Connect the Bitcoin signer first");
    }
    if (!connector) {
      throw new Error(
        "This wallet uses external BIP-21 payment for this release",
      );
    }
    const provider = await (
      connector as ConnectorWithProvider
    ).getInternalProvider?.();

    if (provider?.sendBitcoin) {
      return provider.sendBitcoin(TREASURY_ADDRESS, MINT_FEE_SATS);
    }
    if (provider?.request) {
      const response = await provider.request("sendTransfer", {
        recipients: [{address: TREASURY_ADDRESS, amount: MINT_FEE_SATS}],
      });
      if (response.result?.txid) return response.result.txid;
      if (response.error?.message) throw new Error(response.error.message);
    }
    throw new Error(
      "This wallet connected successfully but requires external payment",
    );
  }, [address, connector]);

  return {
    wallets,
    kind: selectedId,
    name: selectedName,
    address,
    nativePayment,
    connect,
    payIssuance,
  };
}
