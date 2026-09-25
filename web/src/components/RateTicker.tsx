const RATES = [
  { label: "BTC Liquidity Rate", value: "2.8%" },
  { label: "BTC Collateral Rate", value: "1.7%" },
  { label: "BTC Lightning Rate", value: "3.4%" },
  { label: "BTC Option Capacity", value: "5.6%" },
  { label: "BTC Market-Making", value: "4.1%" },
];

export function RateTicker() {
  const items = [...RATES, ...RATES];
  return (
    <div className="overflow-hidden border-y border-[var(--line)] bg-[color-mix(in_srgb,var(--ink)_4%,transparent)] py-3">
      <div
        className="flex w-max gap-10 whitespace-nowrap"
        style={{ animation: "rate-scroll 32s linear infinite" }}
      >
        {items.map((rate, i) => (
          <div
            key={`${rate.label}-${i}`}
            className="flex items-baseline gap-3 px-2 font-[family-name:var(--font-mono)] text-sm"
          >
            <span className="text-[var(--ink-soft)]/70">{rate.label}</span>
            <span className="text-[var(--copper-deep)]">{rate.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
