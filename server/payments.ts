import { createHmac, timingSafeEqual } from 'node:crypto'
import { PASS_PRICE_SATS } from './config'
import type { Config } from './config'

export interface Invoice {
  id: string
  checkoutUrl: string
}

export interface InvoiceStatus {
  id: string
  status: string
  amount: string
  currency: string
  metadata?: { orderId?: string }
}

export interface PaymentProvider {
  createInvoice(orderId: string): Promise<Invoice>
  getInvoice(invoiceId: string): Promise<InvoiceStatus>
}

export class MockPayments implements PaymentProvider {
  async createInvoice(orderId: string): Promise<Invoice> {
    return { id: `mock-${orderId}`, checkoutUrl: `/mock-checkout/${orderId}` }
  }

  async getInvoice(invoiceId: string): Promise<InvoiceStatus> {
    return {
      id: invoiceId,
      status: 'Settled',
      amount: (PASS_PRICE_SATS / 100_000_000).toFixed(8),
      currency: 'BTC',
    }
  }
}

export class BtcPayPayments implements PaymentProvider {
  private readonly base: string

  constructor(private readonly config: Config) {
    this.base = config.BTCPAY_URL!.replace(/\/$/, '')
  }

  private async request<T>(path: string, init?: RequestInit): Promise<T> {
    const response = await fetch(`${this.base}${path}`, {
      ...init,
      headers: {
        Authorization: `token ${this.config.BTCPAY_API_KEY}`,
        'Content-Type': 'application/json',
        ...init?.headers,
      },
    })
    if (!response.ok) throw new Error(`BTCPay request failed (${response.status})`)
    return response.json() as Promise<T>
  }

  async createInvoice(orderId: string): Promise<Invoice> {
    const invoice = await this.request<{ id: string; checkoutLink: string }>(
      `/api/v1/stores/${this.config.BTCPAY_STORE_ID}/invoices`,
      {
        method: 'POST',
        body: JSON.stringify({
          amount: (PASS_PRICE_SATS / 100_000_000).toFixed(8),
          currency: 'BTC',
          metadata: { orderId, itemDesc: 'Genesis Canary Pass' },
          checkout: {
            expirationMinutes: 15,
            redirectURL: `${this.config.SITE_URL}/?order=${orderId}`,
            redirectAutomatically: true,
          },
        }),
      },
    )
    return { id: invoice.id, checkoutUrl: invoice.checkoutLink }
  }

  getInvoice(invoiceId: string): Promise<InvoiceStatus> {
    return this.request(`/api/v1/stores/${this.config.BTCPAY_STORE_ID}/invoices/${invoiceId}`)
  }
}

export function verifyWebhook(rawBody: Buffer, signature: string | undefined, secret: string): boolean {
  if (!signature?.startsWith('sha256=')) return false
  const supplied = Buffer.from(signature.slice(7), 'hex')
  const expected = createHmac('sha256', secret).update(rawBody).digest()
  return supplied.length === expected.length && timingSafeEqual(supplied, expected)
}
