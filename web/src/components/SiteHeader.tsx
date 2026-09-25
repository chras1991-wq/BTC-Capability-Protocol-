"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { RootMark } from "./RootMark";
import { useWallet } from "@/lib/wallet";

const NAV = [
  { href: "/mint", label: "Issue" },
  { href: "/market", label: "Market" },
  { href: "/me", label: "Vault" },
];

export function SiteHeader() {
  const pathname = usePathname();
  const home = pathname === "/";
  const { authenticated, shortAddress, connecting, connect, disconnect } =
    useWallet();

  const ink = home ? "text-[var(--mist)]" : "text-[var(--ink)]";
  const muted = home
    ? "text-[var(--mist)]/70 hover:text-[var(--mist)]"
    : "text-[var(--ink-soft)]/80 hover:text-[var(--ink)]";
  const active = home ? "text-[var(--copper-bright)]" : "text-[var(--copper-deep)]";

  return (
    <header
      className={`z-30 flex items-center justify-between gap-4 px-5 py-4 md:px-8 ${
        home
          ? "absolute inset-x-0 top-0 bg-transparent"
          : "relative border-b border-[var(--line)] bg-[var(--paper)]/95 backdrop-blur"
      }`}
    >
      <Link href="/" className={`flex items-center gap-2 ${ink}`}>
        <RootMark className={`h-6 w-6 ${home ? "text-[var(--copper-bright)]" : "text-[var(--copper)]"}`} />
        <span className="font-[family-name:var(--font-display)] text-lg font-700 tracking-wide">
          ROOT
        </span>
      </Link>

      <nav className="flex items-center gap-1">
        {NAV.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`px-2.5 py-1.5 text-sm transition sm:px-3 ${
                isActive ? active : muted
              }`}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div>
        {authenticated ? (
          <button
            type="button"
            onClick={() => void disconnect()}
            className={`border px-3 py-1.5 font-[family-name:var(--font-mono)] text-xs ${
              home
                ? "border-[var(--mist)]/30 text-[var(--mist)]"
                : "border-[var(--line)] bg-[var(--paper)] text-[var(--ink)]"
            }`}
          >
            {shortAddress}
          </button>
        ) : (
          <button
            type="button"
            onClick={connect}
            disabled={connecting}
            className={`px-3 py-1.5 text-sm transition ${
              home
                ? "border border-[var(--mist)]/35 text-[var(--mist)] hover:border-[var(--mist)]"
                : "bg-[var(--ink)] text-[var(--mist)] hover:bg-[var(--ink-soft)]"
            }`}
          >
            Sign in
          </button>
        )}
      </div>
    </header>
  );
}
