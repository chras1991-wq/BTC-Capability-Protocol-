import { DocShell } from "@/components/DocShell";

export default function ArchitecturePage() {
  return (
    <DocShell title="Protocol Architecture">
      <p>
        ROOT (Bitcoin Capability Protocol) separates <strong>ownership</strong>{" "}
        of a BTC UTXO from <strong>execution rights</strong> over that UTXO.
        The unit of commerce is a capability—not a wrapped asset and not a
        custodial deposit.
      </p>

      <h2>1. System roles</h2>
      <ul>
        <li>
          <strong>Owner</strong> — holds recovery / ownership keys; creates and
          prices capabilities; receives rent in BTC.
        </li>
        <li>
          <strong>Capability holder</strong> — may exercise a narrow spend
          graph for a bounded window; may transfer the capability itself.
        </li>
        <li>
          <strong>Enforcer set</strong> — MuSig2 cosigners, DLC oracles, or
          BitVM challengers that make rule violations unprofitable or
          impossible.
        </li>
        <li>
          <strong>Marketplace</strong> — discovers capability rents; settles
          fees in BTC; does not take custody of principal.
        </li>
      </ul>

      <h2>2. Vault UTXO</h2>
      <p>
        A ROOT vault is a Taproot output whose internal key / script tree
        encodes:
      </p>
      <pre>{`Vault = {
  value:        sats,
  owner_pk:     X-only pubkey,
  recovery_csv: relative/absolute locktime,
  caps:         Capability[],
  policy_hash:  commitment to allowed spend templates
}`}</pre>
      <p>
        Spend paths always terminate in states that preserve owner residual
        claim except within explicitly authorized loss bounds.
      </p>

      <h2>3. Capability object</h2>
      <pre>{`Capability = {
  id:            CapId,          // single-use seal / outpoint commitment
  underlying:    VaultRef,
  holder:        pk | script,
  ops:           AllowedOp[],    // e.g. LN open, swap, attest
  window:        [t0, t1],
  max_drawdown:  sats | bps,
  transfer:      transferable | soulbound,
  rent:          PaymentTerms     // prepaid / streaming / auction
}`}</pre>
      <p>
        Capabilities are themselves transferable claims (CSV-backed or
        client-side validated), creating a secondary market without moving the
        underlying vault coins.
      </p>

      <h2>4. Enforcement graph (V1)</h2>
      <p>V1 does not require a soft fork. Enforcement is a combination of:</p>
      <ol>
        <li>
          <strong>Presigned transaction DAGs</strong> — every authorized
          mutation is a signed template with fixed outputs and fee policy.
        </li>
        <li>
          <strong>MuSig2 / multiparty control</strong> — capability holder +
          policy enforcer must co-sign; enforcer only signs policy-valid
          spends.
        </li>
        <li>
          <strong>Timelock recovery</strong> — after <code>t1</code>, owner
          unilaterally spends to cold ownership path.
        </li>
        <li>
          <strong>Adaptor / DLC conditions</strong> — price or event predicates
          for collateral and option capabilities.
        </li>
        <li>
          <strong>Client-side validation</strong> — capability history and
          transfer proofs validated off-chain; Bitcoin anchors seals (RGB-style
          single-use seals).
        </li>
      </ol>

      <h2>5. Trust model by generation</h2>
      <h3>V1 — interactive covenants</h3>
      <p>
        Honest-majority or honest-one among designated enforcers for live
        operations; owner always recovers after timeout even if enforcers halt.
        Cap: limited op set, high operational coordination.
      </p>
      <h3>V2 — BitVM / BitVMX</h3>
      <p>
        Complex predicates checked by optimistic challenge games. Expands
        <code>AllowedOp</code> to programmatic constraints (drawdown
        monitors, allowlists) without soft fork—at the cost of challenge
        latency and bond design.
      </p>
      <h3>V3 — consensus covenants (e.g. BIP-443 CCV)</h3>
      <p>
        State-carrying UTXOs with on-chain enforcement of successor
        constraints. ROOT becomes a native Capability OS; marketplace and
        wallets remain the product surface.
      </p>

      <h2>6. Non-goals</h2>
      <ul>
        <li>Issuing a speculative protocol token at genesis.</li>
        <li>Wrapping BTC onto another chain as the primary path.</li>
        <li>General-purpose smart contracts that take full custody.</li>
        <li>Replacing Lightning, Ark, or RGB—ROOT composes with them.</li>
      </ul>

      <h2>7. Position vs adjacent stacks</h2>
      <ul>
        <li>
          <strong>RGB</strong> — private assets &amp; contracts on seals; ROOT
          focuses on rights over BTC principal itself.
        </li>
        <li>
          <strong>Ark</strong> — VTXO liquidity/scalability; ROOT can lease
          liquidity capabilities into Ark/Lightning topologies.
        </li>
        <li>
          <strong>BitVM</strong> — verifiable compute &amp; bridges; ROOT uses
          it as an enforcement backend for rich capabilities.
        </li>
        <li>
          <strong>BIP-443</strong> — draft covenant primitive; ROOT is the
          application/permission layer that would light up if CCV lands.
        </li>
      </ul>
    </DocShell>
  );
}
