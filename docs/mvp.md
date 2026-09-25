# MVP Spec — Lightning Liquidity Capability

First wedge: **lease Lightning inbound/outbound liquidity capability** against a Taproot vault—without transferring ownership of the BTC.

## Why this wedge

- Real demand today (LSPs pay for inbound liquidity).
- Encodable with today’s Bitcoin + Lightning tooling.
- Clear rent metric → seeds the Capability Rate narrative.
- Scoped ops: open/adjust channel within templates; no arbitrary send.

## User stories

1. **Alice (owner)** locks 5 BTC in a ROOT vault with 90-day recovery, publishes a Liquidity Capability for 2 BTC of channel capacity, max loss 0.02 BTC, asking rent 0.01 BTC.
2. **Bob (LSP)** buys the capability, co-signs channel opens only to allowlisted peers / templates, earns routing fees.
3. At expiry (or earlier mutual close), channels wind down; residual ≥ 5 BTC − δ returns under Alice’s exclusive control.

## Technical slice

```
Components
├── vault-cli        create / inspect / recover vaults
├── cap-compiler     Π templates → PSBT / MuSig2 sessions
├── enforcer         policy signer (housed by ROOT or federated)
├── marketplace-api  list / bid / settle rents in BTC
└── desk-ui          owner + LSP dashboards
```

### Vault paths (simplified)

- `recover(owner)` after `CSV`
- `cap_ln(holder, enforcer)` — MuSig2; outputs constrained to channel funding templates + change to vault
- `cooperative_close` — both parties + enforcer

## Success metrics (90 days)

- ≥ 50 BTC notional capabilities created by non-team owners.
- ≥ 10 BTC actively leased to independent LSPs.
- Zero principal loss outside declared δ.
- Published weekly Lightning Capability Rate from cleared deals.

## Explicit non-goals for MVP

- Capability AMM (use RFQ / fixed ask).
- BitVM enforcement.
- Option / MM capabilities.
- Token, points, or emission campaigns.

## Code in this repo

See [`mvp/`](../mvp) for a TypeScript sketch of capability objects, BCR calculation, and policy compilation to a descriptive spend graph (regtest wiring comes next).
