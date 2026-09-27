import path from 'node:path'
import express, { type Request } from 'express'
import helmet from 'helmet'
import { rateLimit } from 'express-rate-limit'
import { z } from 'zod'
import {
  MAX_PROCEEDS_SATS,
  PASS_PRICE_SATS,
  PASS_SUPPLY,
  type Config,
} from './config'
import { CredentialSigner, type SignedPass } from './credentials'
import { PassDatabase, type OrderRecord } from './db'
import {
  BtcPayPayments,
  MockPayments,
  type PaymentProvider,
  verifyWebhook,
} from './payments'

interface RawRequest extends Request {
  rawBody?: Buffer
}

const holderSchema = z.object({
  holder: z.string().trim().min(3).max(120).regex(/^[^\u0000-\u001f<>]+$/, 'Holder ID contains forbidden characters'),
})

function publicOrder(order: OrderRecord) {
  return {
    id: order.id,
    holder: order.holder,
    status: order.status,
    checkoutUrl: order.checkout_url,
    expiresAt: order.expires_at,
    serial: order.serial,
    credential: order.credential ? JSON.parse(order.credential) : null,
  }
}

export interface AppDependencies {
  config: Config
  database?: PassDatabase
  signer?: CredentialSigner
  payments?: PaymentProvider
}

export function createApp(dependencies: AppDependencies) {
  const { config } = dependencies
  const database = dependencies.database ?? new PassDatabase(config.DATABASE_PATH)
  const signer = dependencies.signer ?? new CredentialSigner(config.SIGNING_KEY_PATH)
  const payments = dependencies.payments ?? (
    config.PAYMENT_MODE === 'btcpay' ? new BtcPayPayments(config) : new MockPayments()
  )

  const app = express()
  app.disable('x-powered-by')
  app.set('trust proxy', 1)
  app.use(helmet({
    contentSecurityPolicy: config.NODE_ENV === 'production' ? undefined : false,
    crossOriginEmbedderPolicy: false,
  }))
  app.use(express.json({
    limit: '64kb',
    verify: (request: RawRequest, _response, buffer) => {
      request.rawBody = Buffer.from(buffer)
    },
  }))

  const limiter = rateLimit({
    windowMs: 60_000,
    limit: config.NODE_ENV === 'test' ? 10_000 : 60,
    standardHeaders: 'draft-8',
    legacyHeaders: false,
  })
  app.use('/api', limiter)

  app.get('/api/config', (_request, response) => {
    const stats = database.stats()
    response.json({
      name: 'Genesis Canary Pass',
      supply: PASS_SUPPLY,
      priceSats: PASS_PRICE_SATS,
      maxProceedsSats: MAX_PROCEEDS_SATS,
      minted: stats.minted,
      reserved: stats.reserved,
      available: PASS_SUPPLY - stats.minted - stats.reserved,
      paymentMode: config.PAYMENT_MODE,
      issuerFingerprint: signer.fingerprint,
    })
  })

  app.post('/api/orders', async (request, response, next) => {
    try {
      const { holder } = holderSchema.parse(request.body)
      const order = database.reserve(holder)
      if (!order) return response.status(409).json({ error: 'GENESIS_SUPPLY_EXHAUSTED' })
      try {
        const invoice = await payments.createInvoice(order.id)
        database.attachInvoice(order.id, invoice.id, invoice.checkoutUrl)
        return response.status(201).json(publicOrder(database.get(order.id)!))
      } catch (error) {
        database.removeCreating(order.id)
        throw error
      }
    } catch (error) {
      next(error)
    }
  })

  app.get('/api/orders/:id', (request, response) => {
    database.expire()
    const order = database.get(request.params.id)
    if (!order) return response.status(404).json({ error: 'ORDER_NOT_FOUND' })
    return response.json(publicOrder(order))
  })

  app.post('/api/webhooks/btcpay', async (request: RawRequest, response, next) => {
    try {
      if (config.PAYMENT_MODE !== 'btcpay') return response.status(404).end()
      if (!verifyWebhook(
        request.rawBody ?? Buffer.alloc(0),
        request.header('BTCPay-Sig'),
        config.BTCPAY_WEBHOOK_SECRET!,
      )) return response.status(401).json({ error: 'INVALID_WEBHOOK_SIGNATURE' })

      const payload = request.body as { type?: string; invoiceId?: string }
      if (payload.type !== 'InvoiceSettled' || !payload.invoiceId) return response.status(200).json({ ignored: true })
      const order = database.getByInvoice(payload.invoiceId)
      if (!order) return response.status(200).json({ ignored: true })

      const invoice = await payments.getInvoice(payload.invoiceId)
      const expectedAmount = (PASS_PRICE_SATS / 100_000_000).toFixed(8)
      if (
        invoice.status !== 'Settled'
        || invoice.currency !== 'BTC'
        || Number(invoice.amount).toFixed(8) !== expectedAmount
      ) return response.status(422).json({ error: 'INVOICE_MISMATCH' })

      const issued = database.issue(order.id, (serial, record) => (
        JSON.stringify(signer.issue(serial, record))
      ))
      return response.json({ accepted: true, serial: issued.serial })
    } catch (error) {
      next(error)
    }
  })

  app.post('/api/orders/:id/mock-settle', async (request, response, next) => {
    try {
      if (config.PAYMENT_MODE !== 'mock' || config.NODE_ENV === 'production') return response.status(404).end()
      const order = database.get(request.params.id)
      if (!order) return response.status(404).json({ error: 'ORDER_NOT_FOUND' })
      const issued = database.issue(order.id, (serial, record) => JSON.stringify(signer.issue(serial, record)))
      return response.json(publicOrder(issued))
    } catch (error) {
      next(error)
    }
  })

  app.post('/api/verify', (request, response) => {
    const pass = request.body as SignedPass
    try {
      const valid = signer.verify(pass)
      response.status(valid ? 200 : 422).json({
        valid,
        fingerprint: signer.fingerprint,
        serial: valid ? pass.claims.serial : null,
      })
    } catch {
      response.status(422).json({ valid: false, fingerprint: signer.fingerprint, serial: null })
    }
  })

  if (config.NODE_ENV === 'production') {
    const dist = path.resolve('dist')
    app.use(express.static(dist, { index: false, maxAge: '1y', immutable: true }))
    app.get('*path', (_request, response) => response.sendFile(path.join(dist, 'index.html')))
  }

  app.use((
    error: unknown,
    _request: express.Request,
    response: express.Response,
    _next: express.NextFunction,
  ) => {
    if (error instanceof z.ZodError) {
      return response.status(400).json({ error: 'INVALID_REQUEST', details: error.issues })
    }
    console.error(error)
    return response.status(500).json({ error: 'INTERNAL_ERROR' })
  })

  return { app, database, signer }
}
