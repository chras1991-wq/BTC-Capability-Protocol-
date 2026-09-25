"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { RootMark } from "./RootMark";
import { useWallet } from "@/lib/wallet";

const NAV = [
  { href: "/mint", label: "Mint" },
  { href: "/market", label: "Lease" },
  { href: "/me", label: "Vault" },
];

export function SiteHeader() {
  const pathname = usePathname();
  const home = pathname === "/";
  const { address, shortAddress, connecting, connectDemo, connectUnisat, connectOkx, disconnect } =
    useWallet();
  const [open, setOpen] = useState(false);

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

      <div className="relative">
        {address ? (
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
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
            onClick={() => setOpen((v) => !v)}
            disabled={connecting}
            className={`px-3 py-1.5 text-sm transition ${
              home
                ? "border border-[var(--mist)]/35 text-[var(--mist)] hover:border-[var(--mist)]"
                : "bg-[var(--ink)] text-[var(--mist)] hover:bg-[var(--ink-soft)]"
            }`}
          >
            Connect
          </button>
        )}

        {open && (
          <>
            <button
              type="button"
              className="fixed inset-0 z-40 cursor-default"
              aria-label="Close"
              onClick={() => setOpen(false)}
            />
            <div className="absolute right-0 z-50 mt-2 w-56 border border-[var(--line)] bg-[var(--paper)] p-2 text-[var(--ink)] shadow-lg">
              {address ? (
                <button
                  type="button"
                  className="w-full px-3 py-2 text-left text-sm hover:bg-[color-mix(in_srgb,var(--ink)_5%,transparent)]"
                  onClick={() => {
                    disconnect();
                    setOpen(false);
                  }}
                >
                  Disconnect
                </button>
              ) : (
                <>
                  <button
                    type="button"
                    className="w-full px-3 py-2 text-left text-sm hover:bg-[color-mix(in_srgb,var(--ink)_5%,transparent)]"
                    onClick={async () => {
                      try {
                        await connectUnisat();
                      } catch {
                        /* ignore */
                      }
                      setOpen(false);
                    }}
                  >
                    Unisat
                  </button>
                  <button
                    type="button"
                    className="w-full px-3 py-2 text-left text-sm hover:bg-[color-mix(in_srgb,var(--ink)_5%,transparent)]"
                    onClick={async () => {
                      try {
                        await connectOkx();
                      } catch {
                        /* ignore */
                      }
                      setOpen(false);
                    }}
                  >
                    OKX
                  </button>
                  <button
                    type="button"
                    className="w-full px-3 py-2 text-left text-sm hover:bg-[color-mix(in_srgb,var(--ink)_5%,transparent)]"
                    onClick={() => {
                      connectDemo();
                      setOpen(false);
                    }}
                  >
                    Demo wallet
                  </button>
                </>
              )}
            </div>
          </>
        )}
      </div>
    </header>
  );
}
