export function ProtocolStatus() {
  return (
    <section className="border-t border-white/10 bg-[#0b0d10] px-5 py-14 text-[#e9ecef] md:px-10 md:py-20">
      <div className="mx-auto max-w-6xl">
        <div className="grid gap-10 lg:grid-cols-[1fr_1.5fr]">
          <div>
            <p className="font-[family-name:var(--font-mono)] text-[10px] tracking-[0.24em] text-[#da8247] uppercase">
              Market state / 01
            </p>
            <h2 className="mt-4 font-[family-name:var(--font-display)] text-3xl font-700">
              Contract matrix.
            </h2>
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-white/45">
              Deterministic order specifications are live. Executable inventory
              stays at zero until miners prove control of the advertised supply.
            </p>
          </div>

          <div className="grid border-l border-t border-white/10 sm:grid-cols-3">
            {[
              ["Order specs", "21,000"],
              ["Verified supply", "0"],
              ["Settled leases", "0"],
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
            ["Order compiler", "Deterministic HRC matrix", "LIVE"],
            ["Supply verifier", "Stratum challenge path", "RESEARCH"],
            ["Settlement rail", "Bitcoin Lightning", "RESEARCH"],
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
