# ROOT — Bitcoin Capability Protocol

**Own the Bitcoin. Rent the power.**  
币属于你，能力可以出租。

ROOT separates **BTC ownership** from **execution rights**. Owners keep the coins; markets lease narrow UTXO capabilities (liquidity, collateral, market-making, option capacity). Rents settle in BTC. No protocol token at genesis.

## Repo layout

| Path | Purpose |
|------|---------|
| [`web/`](./web) | Brand site + protocol docs (Next.js) |
| [`docs/`](./docs) | Canonical markdown specs |
| [`mvp/`](./mvp) | V1 vault / capability compiler sketch (TypeScript) |

## Quick start (site)

```bash
cd web
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Documents

- [Architecture](./docs/architecture.md)
- [Whitepaper core](./docs/whitepaper-core.md)
- [MVP](./docs/mvp.md)
- [Business & cold start](./docs/business.md)
- [Pitch narrative](./docs/pitch.md)

## Brand

- **Name:** ROOT
- **Category:** Bitcoin Capability Protocol
- **Promise:** Lease the capability, not the coin.
- **Mark:** Vertical trunk with branching rights (ownership above, capabilities below)

## Principle

> Do not issue a token to invent a market. Let BTC owners create capabilities, let users buy them, enforce the rules, and earn in BTC. Governance—if ever—follows product-market fit.
