import Link from "next/link";
import type { Capability } from "@/lib/types";
import { typeLabel } from "@/lib/types";
import { formatBtc } from "@/lib/protocol";

const statusTone: Record<Capability["status"], string> = {
  ready: "text-[var(--sage)]",
  listed: "text-[var(--copper-deep)]",
  leased: "text-[var(--ink-soft)]/60",
};

export function CapCard({ cap }: { cap: Capability }) {
  return (
    <Link
      href={`/cap/${cap.id}`}
      className="group block border-t border-[var(--line)] py-5 transition hover:border-[var(--copper)]"
    >
      <div className="flex flex-wrap items-baseline justify-between gap-3">
        <div>
          <p className="font-[family-name:var(--font-mono)] text-xs text-[var(--ink-soft)]/55">
            {cap.id}
          </p>
          <h3 className="mt-1 font-[family-name:var(--font-display)] text-xl font-600 group-hover:text-[var(--copper-deep)]">
            {typeLabel(cap.type)}
          </h3>
        </div>
        <p className={`font-[family-name:var(--font-mono)] text-xs uppercase ${statusTone[cap.status]}`}>
          {cap.status}
        </p>
      </div>
      <div className="mt-3 flex flex-wrap gap-x-6 gap-y-1 font-[family-name:var(--font-mono)] text-xs text-[var(--ink-soft)]/70">
        <span>mint {formatBtc(cap.mintFeeSats)}</span>
        {cap.rentSats != null && <span>rent {formatBtc(cap.rentSats)}</span>}
        {cap.tenorDays != null && <span>{cap.tenorDays}d</span>}
      </div>
    </Link>
  );
}
