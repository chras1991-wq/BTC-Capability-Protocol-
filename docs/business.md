# Business Model & Cold Start

## How ROOT makes money

All revenue in BTC. No gas-token theater.

- **Marketplace fee** — bps on cleared capability rent (primary listing + secondary transfer).
- **Enforcer / policy SaaS** — hosted MuSig2 policy signing for owners who do not run their own enforcer set; priced per vault or per notional.
- **Compiler & audit tooling** — enterprise desk licenses for large holders / LSPs / funds.
- **Data** — Bitcoin Capability Rate indices and anonymized segment feeds (later).

Seed principle: take rate on real usage. Do not subsidize APY with an issued token.

## Cold start

### Supply: BTC that refuses to move

Target long-horizon holders, family offices, miners with idle treasury, and Lightning-native whales who already understand channel leasing.

### Demand: LSPs first

Start with a handful of design-partner LSPs. Manually match first leases. Publish transparent rent prints to seed BCR.

### Bootstrap loop

```
owners list caps → LSPs lease → rent prints published
      → BCR credible → more owners list → standardized products
      → AMM for vanilla strips
```

## Go-to-market sequence

1. Private design partners (5–10 counterparties).
2. Public RFQ board + weekly rate note.
3. Self-serve vault creation for LN liquidity caps.
4. Expand schemas: collateral attestation → covered options.
5. Only after PMF: governance discussion (if needed).

## What not to do

- Launch a ROOT token to bootstrap TVL.
- Bridge principal to an alt-L1 “for composability.”
- Market as “BTCFi yield” without naming the risk budget δ.
- Boil the ocean with BitVM before V1 leases clear.

## Seed use of funds ($1–3M)

- ~45% protocol engineering (vault, compiler, enforcer).
- ~20% Lightning / marketplace integration.
- ~15% security review & formal methods.
- ~10% design partners & BD.
- ~10% ops / runway buffer.
