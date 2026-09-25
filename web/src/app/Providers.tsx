"use client";

import {PrivyProvider} from "@privy-io/react-auth";

const appId =
  process.env.NEXT_PUBLIC_PRIVY_APP_ID ?? "cmt9hky9c01is0cjoiw60nprw";

export function Providers({children}: {children: React.ReactNode}) {
  return (
    <PrivyProvider
      appId={appId}
      config={{
        loginMethods: ["email", "google"],
        appearance: {
          theme: "dark",
          accentColor: "#d37a3e",
          logo: "/icon.svg",
          showWalletLoginFirst: false,
          walletChainType: "ethereum-only",
        },
        embeddedWallets: {
          ethereum: {
            createOnLogin: "users-without-wallets",
          },
        },
      }}
    >
      {children}
    </PrivyProvider>
  );
}
