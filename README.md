# ROOT Hashrate Market

**Route the work. Verify every share.**

ROOT exposes 21,000 deterministic SHA-256 lease specifications priced from
**$0.20 to $20.00**. Every order has a distinct compute amount, execution
window, route policy, region profile, efficiency ceiling, telemetry mode and
accounting policy.

The catalog is not presented as connected mining inventory. An order cannot
accept payment until the operator binds:

- control of the advertised Stratum endpoint;
- sufficient measured SHA-256 capacity;
- signed share telemetry for the lease window;
- a settlement rail appropriate for the amount.

All orders settle in BTC sats over Bitcoin Lightning. The USD values are pricing
references only. Sub-dollar orders are not suitable for individual Bitcoin
mainnet outputs; completed lease batches can be anchored to mainnet.

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
- `/api/hashrate/orders` — paginated deterministic catalog

## Deploy (Vercel)

1. Import this GitHub repo in Vercel
2. Set **Root Directory** to `web`
3. Add Upstash Redis env for durable claims:
   - `UPSTASH_REDIS_REST_URL`
   - `UPSTASH_REDIS_REST_TOKEN`
4. Add `PRIVY_APP_SECRET`
5. Add the operator hashrate provider and Lightning settlement credentials
6. Deploy

Or CLI:

```bash
cd web
npx vercel --prod
```

## Catalog model

See `web/src/lib/hashrate.ts`:

- fixed size: 21,000 order specifications;
- lease values: $0.20–$20.00;
- algorithm: SHA-256;
- functions: FPPS, PPS, solo, failover and benchmark routes;
- durations: 10 minutes through 24 hours;
- deterministic IDs: `HRC-00001` through `HRC-21000`.

Checkout is intentionally locked in this repository until a real operator
supply adapter and Lightning payment backend are configured. The previous
fixed-fee capability mint API remains only for legacy records and is no longer
linked from the product UI.
