# ROOT

**Own the Bitcoin. Rent the power.**

Mint fee **0.00005 BTC** · Wallet mint cap **0.01 BTC** · Lease immediately after mint.

## App

```bash
cd web
npm install
npm run dev
```

- `/` — home
- `/mint` — mint capability
- `/market` — lease market
- `/me` — vault
- `/cap/[id]` — detail + lease now

## Deploy (Vercel)

1. Import this GitHub repo in Vercel
2. Set **Root Directory** to `web`
3. (Recommended) add Upstash Redis env:
   - `UPSTASH_REDIS_REST_URL`
   - `UPSTASH_REDIS_REST_TOKEN`
4. Deploy

Or CLI:

```bash
cd web
npx vercel --prod
```

## Protocol knobs

See `web/src/lib/protocol.ts`:

- `MINT_FEE_SATS = 5000` (0.00005 BTC)
- `WALLET_MINT_CAP_SATS = 1000000` (0.01 BTC)
