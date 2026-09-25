"use client";

import {usePrivy} from "@privy-io/react-auth";

function shorten(value: string): string {
  if (value.length < 15) return value;
  return `${value.slice(0, 7)}…${value.slice(-5)}`;
}

/**
 * Privy identity adapter. `address` is an EVM embedded-wallet address when
 * available, otherwise the authenticated Privy DID. It is deliberately not
 * presented as a Bitcoin address.
 */
export function useWallet() {
  const {
    ready,
    authenticated,
    user,
    login,
    logout,
    getAccessToken,
  } = usePrivy();

  const identity = user?.wallet?.address ?? user?.id ?? null;

  return {
    ready,
    authenticated,
    address: identity,
    connecting: !ready,
    connect: login,
    disconnect: logout,
    getAccessToken,
    shortAddress: identity ? shorten(identity) : null,
  };
}
