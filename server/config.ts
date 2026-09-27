import path from 'node:path'
import { z } from 'zod'

const schema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().int().positive().default(8787),
  DATABASE_PATH: z.string().default(path.resolve('data/hourglass.db')),
  SIGNING_KEY_PATH: z.string().default(path.resolve('data/hourglass-ed25519.pem')),
  SITE_URL: z.url().default('http://localhost:5173'),
  PAYMENT_MODE: z.enum(['mock', 'btcpay']).default('mock'),
  BTCPAY_URL: z.url().optional(),
  BTCPAY_STORE_ID: z.string().min(1).optional(),
  BTCPAY_API_KEY: z.string().min(1).optional(),
  BTCPAY_WEBHOOK_SECRET: z.string().min(16).optional(),
})

export type Config = z.infer<typeof schema>

export function loadConfig(source: NodeJS.ProcessEnv = process.env): Config {
  const config = schema.parse(source)
  if (config.PAYMENT_MODE === 'btcpay') {
    const missing = ['BTCPAY_URL', 'BTCPAY_STORE_ID', 'BTCPAY_API_KEY', 'BTCPAY_WEBHOOK_SECRET']
      .filter((key) => !config[key as keyof Config])
    if (missing.length) throw new Error(`BTCPay mode requires: ${missing.join(', ')}`)
  }
  if (config.NODE_ENV === 'production' && config.PAYMENT_MODE === 'mock') {
    throw new Error('PAYMENT_MODE=mock is forbidden in production')
  }
  return config
}

export const PASS_SUPPLY = 2_100
export const PASS_PRICE_SATS = 47_619
export const MAX_PROCEEDS_SATS = PASS_SUPPLY * PASS_PRICE_SATS
export const ORDER_TTL_MINUTES = 15
