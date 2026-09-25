import Link from "next/link";
import { RootMark } from "@/components/RootMark";

const DOCS = [
  {
    href: "/studio",
    title: "Capability Studio",
    blurb: "Interactive sketch of a lease: notional, tenor, drawdown, rent, and implied Capability Rate.",
  },
  {
    href: "/docs/architecture",
    title: "Protocol Architecture",
    blurb: "Vault model, capability objects, enforcement graph, and trust assumptions across V1–V3.",
  },
  {
    href: "/docs/whitepaper",
    title: "Whitepaper Core",
    blurb: "Formal definitions, capability pricing, Bitcoin Capability Rate, and risk bounds.",
  },
  {
    href: "/docs/mvp",
    title: "MVP Spec",
    blurb: "First shippable surface: Lightning liquidity leasing with recovery timelock.",
  },
  {
    href: "/docs/business",
    title: "Business & Cold Start",
    blurb: "Revenue in BTC, wedge market, bootstrap loop, and what not to do at seed.",
  },
  {
    href: "/docs/pitch",
    title: "Pitch Narrative",
    blurb: "Deck story arc for a $1–3M seed: problem, wedge, why now, ask.",
  },
];

export default function DocsIndexPage() {
  return (
    <main className="mx-auto min-h-full max-w-3xl px-5 py-16 md:px-8">
      <Link
        href="/"
        className="mb-10 inline-flex items-center gap-2 text-[var(--ink-soft)] transition hover:text-[var(--copper)]"
      >
        <RootMark className="h-5 w-5" />
        <span className="font-[family-name:var(--font-display)] font-700">
          ROOT
        </span>
      </Link>
      <h1 className="font-[family-name:var(--font-display)] text-4xl font-700">
        Documentation
      </h1>
      <p className="mt-4 text-lg text-[var(--ink-soft)]">
        Protocol specs and company materials for the Bitcoin Capability
        Protocol.
      </p>
      <ul className="mt-12 space-y-0 border-t border-[var(--line)]">
        {DOCS.map((doc) => (
          <li key={doc.href} className="border-b border-[var(--line)] py-7">
            <Link href={doc.href} className="group block">
              <h2 className="font-[family-name:var(--font-display)] text-xl font-600 group-hover:text-[var(--copper)]">
                {doc.title}
              </h2>
              <p className="mt-2 text-[var(--ink-soft)]">{doc.blurb}</p>
            </Link>
          </li>
        ))}
      </ul>
    </main>
  );
}
