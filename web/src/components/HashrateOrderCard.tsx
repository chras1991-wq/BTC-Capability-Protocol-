import Link from "next/link";
import type {HashrateOrder} from "@/lib/hashrate";
import {formatUsd} from "@/lib/hashrate";

export function HashrateOrderCard({order}: {order: HashrateOrder}) {
  return (
    <Link
      href={`/order/${order.id}`}
      className="group relative block min-h-64 border border-white/10 bg-[#0e1115] p-5 transition hover:-translate-y-0.5 hover:border-[#d4844a]/60 hover:bg-[#12161b]"
    >
      <div className="flex items-center justify-between gap-4 font-[family-name:var(--font-mono)] text-[9px] tracking-[0.14em] uppercase">
        <span className="text-white/35">{order.id}</span>
        <span className="text-[#d4844a]">Proof pending</span>
      </div>

      <div className="mt-8 flex items-end justify-between gap-4">
        <div>
          <p className="font-[family-name:var(--font-display)] text-3xl font-700 text-white">
            {order.hashrateTh}
            <span className="ml-1 text-sm font-500 text-white/40">TH/s</span>
          </p>
          <p className="mt-1 font-[family-name:var(--font-mono)] text-[10px] text-white/40">
            {order.durationLabel} · {order.modeLabel}
          </p>
        </div>
        <p className="font-[family-name:var(--font-display)] text-xl font-700 text-[#e6a06e]">
          {formatUsd(order.priceCents)}
          <span className="mt-1 block text-right font-[family-name:var(--font-mono)] text-[8px] font-400 tracking-wider text-white/25">
            BTC / LIGHTNING
          </span>
        </p>
      </div>

      <div className="mt-8 grid grid-cols-2 gap-px bg-white/10 font-[family-name:var(--font-mono)] text-[10px]">
        <div className="bg-[#0e1115] py-3 pr-3 group-hover:bg-[#12161b]">
          <span className="block text-white/25">ROUTE</span>
          <span className="mt-1 block text-white/65">{order.regionLabel}</span>
        </div>
        <div className="bg-[#0e1115] py-3 pl-3 group-hover:bg-[#12161b]">
          <span className="block text-white/25">STRATUM</span>
          <span className="mt-1 block text-white/65">{order.stratumVersion}</span>
        </div>
        <div className="bg-[#0e1115] py-3 pr-3 group-hover:bg-[#12161b]">
          <span className="block text-white/25">EFFICIENCY</span>
          <span className="mt-1 block text-white/65">{order.efficiencyJTh.toFixed(1)} J/TH</span>
        </div>
        <div className="bg-[#0e1115] py-3 pl-3 group-hover:bg-[#12161b]">
          <span className="block text-white/25">TELEMETRY</span>
          <span className="mt-1 block text-white/65">{order.telemetry}</span>
        </div>
      </div>

      <p className="mt-5 line-clamp-2 text-xs leading-relaxed text-white/38">
        {order.function}
      </p>
    </Link>
  );
}
