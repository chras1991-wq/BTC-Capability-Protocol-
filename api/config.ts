import type { VercelRequest, VercelResponse } from '@vercel/node'

export default function handler(_request: VercelRequest, response: VercelResponse) {
  response.setHeader('Cache-Control', 'public, max-age=60, s-maxage=300')
  response.status(200).json({
    name: 'Genesis Canary Pass',
    supply: 2_100,
    priceSats: 47_619,
    maxProceedsSats: 99_999_900,
    minted: 0,
    reserved: 0,
    available: 2_100,
    paymentMode: 'offline',
    issuerFingerprint: 'pending-production-key',
  })
}
