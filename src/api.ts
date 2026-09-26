export interface MintConfig {
  name: string
  supply: number
  priceSats: number
  maxProceedsSats: number
  minted: number
  reserved: number
  available: number
  paymentMode: 'mock' | 'btcpay'
  issuerFingerprint: string
}

export interface SignedPass {
  claims: {
    schema: string
    issuer: string
    name: string
    serial: number
    supply: number
    priceSats: number
    maxProceedsSats: number
    holder: string
    orderId: string
    issuedAt: string
    entitlements: string[]
  }
  proof: {
    algorithm: string
    publicKey: string
    fingerprint: string
    signature: string
  }
}

export interface MintOrder {
  id: string
  holder: string
  status: 'creating' | 'pending' | 'paid' | 'expired'
  checkoutUrl: string | null
  expiresAt: string
  serial: number | null
  credential: SignedPass | null
}

async function json<T>(url: string, init?: RequestInit): Promise<T> {
  const response = await fetch(url, {
    ...init,
    headers: { 'Content-Type': 'application/json', ...init?.headers },
  })
  const body = await response.json().catch(() => ({}))
  if (!response.ok) throw new Error(body.error ?? `REQUEST_FAILED_${response.status}`)
  return body as T
}

export const api = {
  config: () => json<MintConfig>('/api/config'),
  createOrder: (holder: string) => json<MintOrder>('/api/orders', {
    method: 'POST',
    body: JSON.stringify({ holder }),
  }),
  order: (id: string) => json<MintOrder>(`/api/orders/${encodeURIComponent(id)}`),
  mockSettle: (id: string) => json<MintOrder>(`/api/orders/${encodeURIComponent(id)}/mock-settle`, {
    method: 'POST',
  }),
  verify: (credential: SignedPass) => json<{ valid: boolean; serial: number | null }>('/api/verify', {
    method: 'POST',
    body: JSON.stringify(credential),
  }),
}
