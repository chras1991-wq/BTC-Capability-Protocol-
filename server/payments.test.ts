import { createHmac } from 'node:crypto'
import { describe, expect, it } from 'vitest'
import { verifyWebhook } from './payments'

describe('BTCPay webhook authentication', () => {
  it('accepts an authentic HMAC and rejects modified payloads', () => {
    const secret = 'a-secure-webhook-secret'
    const payload = Buffer.from('{"type":"InvoiceSettled","invoiceId":"inv-1"}')
    const signature = `sha256=${createHmac('sha256', secret).update(payload).digest('hex')}`
    expect(verifyWebhook(payload, signature, secret)).toBe(true)
    expect(verifyWebhook(Buffer.from('modified'), signature, secret)).toBe(false)
  })

  it('rejects malformed signatures without throwing', () => {
    expect(verifyWebhook(Buffer.from('{}'), 'bad', 'secret')).toBe(false)
    expect(verifyWebhook(Buffer.from('{}'), undefined, 'secret')).toBe(false)
  })
})
