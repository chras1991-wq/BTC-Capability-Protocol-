"use client";

import {useEffect, useState} from "react";

type Stats = {
  minted: number;
  listed: number;
  leased: number;
};

export function ProtocolStatus() {
  const [stats, setStats] = useState<Stats | null>(null);

  useEffect(() => {
    void fetch("/api/stats", {cache: "no-store"})
      .then((response) => response.json())
      .then(setStats)
      .catch(() => setStats(null));
  }, []);

  return (
    <section className="border-t border-white/10 bg-[#0b0d10] px-5 py-14 text-[#e9ecef] md:px-10 md:py-20">
      <div className="mx-auto max-w-6xl">
        <div className="grid gap-10 lg:grid-cols-[1fr_1.5fr]">
          <div>
            <p className="font-[family-name:var(--font-mono)] text-[10px] tracking-[0.24em] text-[#da8247] uppercase">
              Deployment state / 01
            </p>
            <h2 className="mt-4 font-[family-name:var(--font-display)] text-3xl font-700">
              What exists now.
            </h2>
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-white/45">
              No synthetic TVL. No generated yield. Registry counters below
              come from this deployment.
            </p>
          </div>

          <div className="grid border-l border-t border-white/10 sm:grid-cols-3">
            {[
              ["CAP records", stats?.minted ?? "—"],
              ["Open intents", stats?.listed ?? "—"],
              ["Bound records", stats?.leased ?? "—"],
            ].map(([label, value], index) => (
              <div
                key={label}
                className="min-h-36 border-b border-r border-white/10 p-5"
              >
                <p className="font-[family-name:var(--font-mono)] text-[10px] text-white/35">
                  0{index + 1}
                </p>
                <p className="mt-6 font-[family-name:var(--font-display)] text-4xl font-700">
                  {value}
                </p>
                <p className="mt-2 font-[family-name:var(--font-mono)] text-[10px] tracking-wide text-white/40 uppercase">
                  {label}
                </p>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-12 grid border-l border-t border-white/10 md:grid-cols-3">
          {[
            ["Identity", "Privy", "LIVE"],
            ["Capability registry", "Off-chain alpha", "LIVE"],
            ["Bitcoin enforcement", "PSBT / covenant path", "RESEARCH"],
          ].map(([layer, implementation, status]) => (
            <div
              key={layer}
              className="border-b border-r border-white/10 p-5 font-[family-name:var(--font-mono)]"
            >
              <div className="flex items-center justify-between gap-3">
                <span className="text-[10px] text-white/35">{layer}</span>
                <span
                  className={`text-[9px] tracking-[0.16em] ${
                    status === "LIVE" ? "text-[#7dad94]" : "text-[#da8247]"
                  }`}
                >
                  {status}
                </span>
              </div>
              <p className="mt-8 text-xs text-white/75">{implementation}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
