import os from 'node:os'
import path from 'node:path'
import { randomUUID } from 'node:crypto'
import request from 'supertest'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { createApp } from './app'
import { loadConfig, MAX_PROCEEDS_SATS, PASS_PRICE_SATS } from './config'
import { PassDatabase } from './db'
import { MockPayments } from './payments'

describe('Genesis Canary Pass issuer', () => {
  let database: PassDatabase
  let app: ReturnType<typeof createApp>['app']

  beforeEach(() => {
    database = new PassDatabase(':memory:')
    const config = loadConfig({
      NODE_ENV: 'test',
      PAYMENT_MODE: 'mock',
      DATABASE_PATH: ':memory:',
      SIGNING_KEY_PATH: path.join(os.tmpdir(), `hourglass-${randomUUID()}.pem`),
      SITE_URL: 'http://localhost:5173',
    })
    app = createApp({ config, database, payments: new MockPayments() }).app
  })

  afterEach(() => database.close())

  it('publishes a hard proceeds ceiling below one bitcoin', async () => {
    const response = await request(app).get('/api/config').expect(200)
    expect(response.body.priceSats).toBe(PASS_PRICE_SATS)
    expect(response.body.maxProceedsSats).toBe(MAX_PROCEEDS_SATS)
    expect(response.body.maxProceedsSats).toBeLessThanOrEqual(100_000_000)
    expect(response.body.supply).toBe(2_100)
  })

  it('reserves, settles, signs, and verifies a pass', async () => {
    const created = await request(app)
      .post('/api/orders')
      .send({ holder: 'npub1-genesis-holder' })
      .expect(201)

    expect(created.body.status).toBe('pending')
    expect(created.body.credential).toBeNull()

    const settled = await request(app)
      .post(`/api/orders/${created.body.id}/mock-settle`)
      .expect(200)

    expect(settled.body.status).toBe('paid')
    expect(settled.body.serial).toBe(1)
    expect(settled.body.credential.claims.maxProceedsSats).toBe(99_999_900)

    const verified = await request(app)
      .post('/api/verify')
      .send(settled.body.credential)
      .expect(200)
    expect(verified.body).toMatchObject({ valid: true, serial: 1 })
  })

  it('makes settlement idempotent', async () => {
    const created = await request(app).post('/api/orders').send({ holder: 'holder-001' }).expect(201)
    const first = await request(app).post(`/api/orders/${created.body.id}/mock-settle`).expect(200)
    const second = await request(app).post(`/api/orders/${created.body.id}/mock-settle`).expect(200)
    expect(second.body.serial).toBe(first.body.serial)
    expect(database.stats().minted).toBe(1)
  })

  it('rejects unsafe holder labels', async () => {
    await request(app).post('/api/orders').send({ holder: '<script>alert(1)</script>' }).expect(400)
  })

  it('rejects a modified credential', async () => {
    const created = await request(app).post('/api/orders').send({ holder: 'holder-002' }).expect(201)
    const settled = await request(app).post(`/api/orders/${created.body.id}/mock-settle`).expect(200)
    settled.body.credential.claims.holder = 'attacker'
    const response = await request(app).post('/api/verify').send(settled.body.credential).expect(422)
    expect(response.body.valid).toBe(false)
  })
})
