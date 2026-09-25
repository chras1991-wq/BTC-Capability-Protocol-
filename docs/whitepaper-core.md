# Whitepaper Core

This note captures the mathematical and economic core of ROOT. It is the spine a formal paper and investor memo can expand.

## 1. Definitions

Let `U` be a UTXO with value `v` sats under owner public key `O`.

A **capability** `C` is a tuple:

```
C = (U, H, Π, [t0, t1], δ, ρ)
```

- `H` — capability holder identity (key or script)
- `Π` — allowed policy: the set of authorized successor transactions / state transitions
- `[t0, t1]` — validity window
- `δ` — maximum drawdown (sats or bps of `v`)
- `ρ` — rent terms paid to `O`

**Safety invariant.** For every complete execution path under `Π`, residual value controlled by `O` at or before `t1` satisfies:

```
v_residual ≥ v − δ − fees_authorized
```

Unauthorized transitions (including `send(v, H)`) are not in `Π` and cannot be completed without violating the enforcement layer.

## 2. Ownership vs capability

```
Own(U)  = right to recover exclusive control after t1
        ∪ right to revoke unused caps per policy
Cap(U)  = right to execute Π within [t0, t1]
```

Classical Bitcoin conflates `Own` and `Cap` into a single private key. ROOT factors them.

## 3. Capability pricing

Let expected economic value of exercising `Π` over the window be `E[V_Π]`. A competitive rent satisfies:

```
ρ* ≈ f( E[V_Π], δ, σ, T, L )
```

- `δ` — risk budget granted to the holder
- `σ` — underlying volatility / utilization uncertainty
- `T = t1 − t0` — tenor
- `L` — liquidity / scarcity of similar caps

ROOT does not fix `ρ*`—markets discover it.

## 4. Bitcoin Capability Rate (BCR)

For a segment `s` (e.g. Lightning liquidity, option capacity):

```
BCR_s = (1 / |C_s|) Σ_i (ρ_i / v_i) · (365 / T_i)
```

BCR is an observable index of BTC usage demand—not a protocol emission APY.

## 5. Capability AMM (sketch)

Homogeneous capabilities (same `Π` class, similar `δ`, standardized tenors) can be pooled. Let pool reserves be capability-notional `N` and rent-numeraire BTC `R`:

```
ρ_marginal = ΔR  s.t.  (N − ΔN)(R + ΔR) = k
```

Heterogeneous / bespoke capabilities clear via RFQ or auction; standardized strips clear via AMM.

## 6. Risk decomposition

- **Policy risk** — bugs or underspecified `Π`
- **Enforcer liveness** — mitigated by owner CSV recovery
- **Enforcer honesty (V1)** — reduced via multiparty + bonds; largely replaced by challenge games in V2 / covenants in V3
- **Market risk within δ** — intentionally borne by owner as the leased risk budget
- **Capability counterparty** — holder may underperform economically but cannot exceed `δ` if enforcement holds

## 7. Settlement asset

All protocol fees and rents settle in BTC. Governance tokens—if ever introduced—follow proven product-market fit, not precede it.

## 8. Research agenda

1. Formal verification of V1 spend-graph compilers.
2. Standard capability schemas (LN, MM, collateral, covered option).
3. BitVMX wrappers for drawdown monitors.
4. CCV / covenant encoding of ROOT vault state machines.
5. BCR index methodology and oracle-free publication.
