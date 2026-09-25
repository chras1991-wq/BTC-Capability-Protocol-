import type { Metadata } from "next";
import { Syne, Figtree, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const display = Syne({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["600", "700", "800"],
});

const body = Figtree({
  variable: "--font-body",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

const mono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  weight: ["400", "500"],
});

export const metadata: Metadata = {
  title: "ROOT — Own the Bitcoin. Rent the power.",
  description:
    "ROOT is the Bitcoin Capability Protocol. Separate ownership from execution rights. Lease UTXO capabilities without transferring coins.",
  icons: {
    icon: "/icon.svg",
  },
  openGraph: {
    title: "ROOT — Own the Bitcoin. Rent the power.",
    description:
      "BTC stays yours. Rent narrow execution rights: liquidity, collateral, market-making, options capacity.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${display.variable} ${body.variable} ${mono.variable} h-full`}
    >
      <body className="min-h-full flex flex-col antialiased">{children}</body>
    </html>
  );
}
