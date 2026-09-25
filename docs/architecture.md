# Protocol Architecture

ROOT (Bitcoin Capability Protocol) separates **ownership** of a BTC UTXO from **execution rights** over that UTXO. The unit of commerce is a capability—not a wrapped asset and not a custodial deposit.

## 1. System roles

- **Owner** — holds recovery / ownership keys; creates and prices capabilities; receives rent in BTC.
- **Capability holder** — may exercise a narrow spend graph for a bounded window; may transfer the capability itself.
- **Enforcer set** — MuSig2 cosigners, DLC oracles, or BitVM challengers that make rule violations unprofitable or impossible.
- **Marketplace** — discovers capability rents; settles fees in BTC; does not take custody of principal.

## 2. Vault UTXO

A ROOT vault is a Taproot output whose internal key / script tree encodes:

```
Vault = {
  value:        sats,
  owner_pk:     X-only pubkey,
  recovery_csv: relative/absolute locktime,
  caps:         Capability[],
  policy_hash:  commitment to allowed spend templates
}
```

Spend paths always terminate in states that preserve owner residual claim except within explicitly authorized loss bounds.

## 3. Capability object

```
Capability = {
  id:            CapId,          // single-use seal / outpoint commitment
  underlying:    VaultRef,
  holder:        pk | script,
  ops:           AllowedOp[],    // e.g. LN open, swap, attest
  window:        [t0, t1],
  max_drawdown:  sats | bps,
  transfer:      transferable | soulbound,
  rent:          PaymentTerms     // prepaid / streaming / auction
}
```

Capabilities are themselves transferable claims (CSV-backed or client-side validated), creating a secondary market without moving the underlying vault coins.

## 4. Enforcement graph (V1)

V1 does not require a soft fork. Enforcement is a combination of:

1. **Presigned transaction DAGs** — every authorized mutation is a signed template with fixed outputs and fee policy.
2. **MuSig2 / multiparty control** — capability holder + policy enforcer must co-sign; enforcer only signs policy-valid spends.
3. **Timelock recovery** — after `t1`, owner unilaterally spends to cold ownership path.
4. **Adaptor / DLC conditions** — price or event predicates for collateral and option capabilities.
5. **Client-side validation** — capability history and transfer proofs validated off-chain; Bitcoin anchors seals (RGB-style single-use seals).

## 5. Trust model by generation

### V1 — interactive covenants

Honest-majority or honest-one among designated enforcers for live operations; owner always recovers after timeout even if enforcers halt. Cap: limited op set, high operational coordination.

### V2 — BitVM / BitVMX

Complex predicates checked by optimistic challenge games. Expands `AllowedOp` to programmatic constraints (drawdown monitors, allowlists) without soft fork—at the cost of challenge latency and bond design.

### V3 — consensus covenants (e.g. BIP-443 CCV)

State-carrying UTXOs with on-chain enforcement of successor constraints. ROOT becomes a native Capability OS; marketplace and wallets remain the product surface.

## 6. Non-goals

- Issuing a speculative protocol token at genesis.
- Wrapping BTC onto another chain as the primary path.
- General-purpose smart contracts that take full custody.
- Replacing Lightning, Ark, or RGB—ROOT composes with them.

## 7. Position vs adjacent stacks

- **RGB** — private assets & contracts on seals; ROOT focuses on rights over BTC principal itself.
- **Ark** — VTXO liquidity/scalability; ROOT can lease liquidity capabilities into Ark/Lightning topologies.
- **BitVM** — verifiable compute & bridges; ROOT uses it as an enforcement backend for rich capabilities.
- **BIP-443** — draft covenant primitive; ROOT is the application/permission layer that would light up if CCV lands.
