import { DocShell } from "@/components/DocShell";

export default function BusinessPage() {
  return (
    <DocShell title="Business Model & Cold Start">
      <h2>How ROOT makes money</h2>
      <p>All revenue in BTC. No gas-token theater.</p>
      <ul>
        <li>
          <strong>Marketplace fee</strong> — bps on cleared capability rent
          (primary listing + secondary transfer).
        </li>
        <li>
          <strong>Enforcer / policy SaaS</strong> — hosted MuSig2 policy
          signing for owners who do not run their own enforcer set; priced per
          vault or per notional.
        </li>
        <li>
          <strong>Compiler &amp; audit tooling</strong> — enterprise desk
          licenses for large holders / LSPs / funds.
        </li>
        <li>
          <strong>Data</strong> — Bitcoin Capability Rate indices and
          anonymized segment feeds (later).
        </li>
      </ul>
      <p>
        Seed principle: take rate on real usage. Do not subsidize APY with an
        issued token.
      </p>

      <h2>Cold start</h2>
      <h3>Supply: BTC that refuses to move</h3>
      <p>
        Target long-horizon holders, family offices, miners with idle treasury,
        and Lightning-native whales who already understand channel leasing.
      </p>
      <h3>Demand: LSPs first</h3>
      <p>
        Start with a handful of design-partner LSPs. Manually match first
        leases. Publish transparent rent prints to seed BCR.
      </p>
      <h3>Bootstrap loop</h3>
      <pre>{`owners list caps → LSPs lease → rent prints published
        → BCR credible → more owners list → standardized products
        → AMM for vanilla strips`}</pre>

      <h2>Go-to-market sequence</h2>
      <ol>
        <li>Private design partners (5–10 counterparties).</li>
        <li>Public RFQ board + weekly rate note.</li>
        <li>Self-serve vault creation for LN liquidity caps.</li>
        <li>Expand schemas: collateral attestation → covered options.</li>
        <li>Only after PMF: governance discussion (if needed).</li>
      </ol>

      <h2>What not to do</h2>
      <ul>
        <li>Launch a ROOT token to bootstrap TVL.</li>
        <li>Bridge principal to an alt-L1 “for composability.”</li>
        <li>Market as “BTCFi yield” without naming the risk budget δ.</li>
        <li>Boil the ocean with BitVM before V1 leases clear.</li>
      </ul>

      <h2>Seed use of funds ($1–3M)</h2>
      <ul>
        <li>~45% protocol engineering (vault, compiler, enforcer).</li>
        <li>~20% Lightning / marketplace integration.</li>
        <li>~15% security review &amp; formal methods.</li>
        <li>~10% design partners &amp; BD.</li>
        <li>~10% ops / runway buffer.</li>
      </ul>
    </DocShell>
  );
}
