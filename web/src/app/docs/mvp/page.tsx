import { DocShell } from "@/components/DocShell";

export default function MvpPage() {
  return (
    <DocShell title="MVP Spec — Lightning Liquidity Capability">
      <p>
        First wedge: <strong>lease Lightning inbound/outbound liquidity
        capability</strong> against a Taproot vault—without transferring
        ownership of the BTC.
      </p>

      <h2>Why this wedge</h2>
      <ul>
        <li>Real demand today (LSPs pay for inbound liquidity).</li>
        <li>Encodable with today’s Bitcoin + Lightning tooling.</li>
        <li>Clear rent metric → seeds the Capability Rate narrative.</li>
        <li>Scoped ops: open/adjust channel within templates; no arbitrary send.</li>
      </ul>

      <h2>User stories</h2>
      <ol>
        <li>
          <strong>Alice (owner)</strong> locks 5 BTC in a ROOT vault with 90-day
          recovery, publishes a Liquidity Capability for 2 BTC of channel
          capacity, max loss 0.02 BTC, asking rent 0.01 BTC.
        </li>
        <li>
          <strong>Bob (LSP)</strong> buys the capability, co-signs channel
          opens only to allowlisted peers / templates, earns routing fees.
        </li>
        <li>
          At expiry (or earlier mutual close), channels wind down; residual
          ≥ 5 BTC − δ returns under Alice’s exclusive control.
        </li>
      </ol>

      <h2>Technical slice</h2>
      <pre>{`Components
├── vault-cli        create / inspect / recover vaults
├── cap-compiler     Π templates → PSBT / MuSig2 sessions
├── enforcer         policy signer (housed by ROOT or federated)
├── marketplace-api  list / bid / settle rents in BTC
└── desk-ui          owner + LSP dashboards`}</pre>

      <h3>Vault paths (simplified)</h3>
      <ul>
        <li>
          <code>recover(owner)</code> after <code>CSV</code>
        </li>
        <li>
          <code>cap_ln(holder, enforcer)</code> — MuSig2; outputs constrained
          to channel funding templates + change to vault
        </li>
        <li>
          <code>cooperative_close</code> — both parties + enforcer
        </li>
      </ul>

      <h2>Success metrics (90 days)</h2>
      <ul>
        <li>≥ 50 BTC notional capabilities created by non-team owners.</li>
        <li>≥ 10 BTC actively leased to independent LSPs.</li>
        <li>Zero principal loss outside declared δ.</li>
        <li>Published weekly Lightning Capability Rate from cleared deals.</li>
      </ul>

      <h2>Explicit non-goals for MVP</h2>
      <ul>
        <li>Capability AMM (use RFQ / fixed ask).</li>
        <li>BitVM enforcement.</li>
        <li>Option / MM capabilities.</li>
        <li>Token, points, or emission campaigns.</li>
      </ul>

      <h2>Demo path in this repo</h2>
      <p>
        The marketing site and docs establish brand + protocol surface. Next
        engineering milestone: <code>vault-cli</code> skeleton that compiles a
        toy two-path Taproot policy (recover + cosigned template) on regtest.
      </p>
    </DocShell>
  );
}
