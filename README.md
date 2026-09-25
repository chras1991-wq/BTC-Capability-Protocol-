# ROOT — Bitcoin Execution Rights

**Own the infrastructure. Lease the execution.**

ROOT separates infrastructure ownership from narrow execution authority. It
exposes 21,000 deterministic Bitcoin capability contracts priced from **$5.00
to $20.00**. Every contract has a distinct bandwidth, execution window, route
policy, domain, energy envelope, telemetry mode and accounting policy.

An execution right cannot accept payment until the operator binds:

- control of the declared work endpoint;
- sufficient measured execution capacity;
- signed capacity telemetry for the contract window;
- a Bitcoin mainnet settlement address.

All orders settle directly in BTC sats on Bitcoin mainnet. The USD values are
60-second pricing references only, and every order uses a minimum 5,000-sat
output to remain practical on mainnet.

## App

```bash
cd web
npm install
npm run dev
```

- `/` — home
- `/market` — filterable 21,000-order contract matrix
- `/order/[id]` — complete lease specification and execution gate
- `/mint` — redirects to the market
- `/me` — authenticated account
- `/api/execution/orders` — paginated deterministic catalog

## Deploy (Vercel)

1. Import this GitHub repo in Vercel
2. Set **Root Directory** to `web`
3. Add Upstash Redis env for durable claims:
   - `UPSTASH_REDIS_REST_URL`
   - `UPSTASH_REDIS_REST_TOKEN`
4. Add `PRIVY_APP_SECRET`
5. Add the execution-capacity provider credentials
6. Deploy

Or CLI:

```bash
cd web
npx vercel --prod
```

## Catalog model

See `web/src/lib/execution.ts`:

- fixed size: 21,000 order specifications;
- lease values: $5.00–$20.00;
- algorithm: SHA-256;
- classes: priority, dedicated, burst, continuity and proof windows;
- durations: 10 minutes through 24 hours;
- deterministic IDs: `ROOT-00001` through `ROOT-21000`.

Checkout is intentionally locked until the operator capacity adapter is
configured. Settlement uses Bitcoin mainnet only. The previous
fixed-fee capability mint API remains only for legacy records and is no longer
linked from the product UI.
