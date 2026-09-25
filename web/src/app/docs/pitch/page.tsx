import { DocShell } from "@/components/DocShell";

export default function PitchPage() {
  return (
    <DocShell title="Pitch Narrative — Seed Deck Story">
      <p>
        A 10-slide arc. Speak this sequence; put numbers and diagrams on the
        slides.
      </p>

      <h2>1. Cold open</h2>
      <p>
        “Millions of BTC sit idle because using them meant giving them away.
        ROOT lets owners rent the power without renting the coin.”
      </p>
      <p>
        Brand line on screen: <strong>Own the Bitcoin. Rent the power.</strong>
      </p>

      <h2>2. Problem</h2>
      <ul>
        <li>BTC ownership today is binary: self-custody or surrender control.</li>
        <li>DeFi on other chains requires wrapping / bridging / smart-contract custody.</li>
        <li>Long-term holders want capital efficiency without leaving Bitcoin.</li>
      </ul>

      <h2>3. Insight</h2>
      <p>
        Operating systems solved this with capability security. Bitcoin wallets
        still hand out root. Factor ownership from execution rights at the UTXO
        layer.
      </p>

      <h2>4. Product</h2>
      <p>
        UTXO Capability: who may do what, when, under which constraints.
        Capabilities trade. Markets discover Bitcoin Capability Rates.
      </p>

      <h2>5. Why now</h2>
      <ul>
        <li>Taproot + MuSig2 + DLCs mature enough for V1 interactive covenants.</li>
        <li>Client-side validation proven in production-adjacent stacks (RGB).</li>
        <li>BitVM/BitVMX path for richer enforcement.</li>
        <li>Covenant research (BIP-443) points to a V3 unlock.</li>
        <li>Product gap: nobody owns Bitcoin’s permission layer.</li>
      </ul>

      <h2>6. Wedge</h2>
      <p>
        Lightning liquidity leasing first—real buyers (LSPs), real rent, ship
        on today’s consensus.
      </p>

      <h2>7. Market</h2>
      <p>
        Not “next inscription token.” Address dormant BTC seeking non-custodial
        yield-like utility. Segment TAM by capability class (LN, collateral,
        MM, options capacity).
      </p>

      <h2>8. Business model</h2>
      <p>
        Marketplace bps + enforcer SaaS + tooling. Revenue in BTC. No token at
        genesis.
      </p>

      <h2>9. Traction plan</h2>
      <p>
        Design partners → RFQ prints → BCR publication → self-serve vaults →
        expand schemas.
      </p>

      <h2>10. Ask</h2>
      <p>
        $1–3M seed to ship V1 vault + LN capability marketplace, complete
        security review, and clear first 50+ BTC notional with external
        owners.
      </p>

      <h2>Appendix one-liners</h2>
      <ul>
        <li>Chinese brand echo: 币属于你，能力可以出租。</li>
        <li>Vs LEAF/CRC-20: they program tokens; ROOT programs BTC capital.</li>
        <li>Vs Eth DeFi: contracts take control; ROOT leases narrow APIs.</li>
      </ul>
    </DocShell>
  );
}
