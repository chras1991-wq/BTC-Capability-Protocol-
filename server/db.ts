import fs from 'node:fs'
import path from 'node:path'
import Database from 'better-sqlite3'
import { randomUUID } from 'node:crypto'
import { ORDER_TTL_MINUTES, PASS_SUPPLY } from './config'

export type OrderStatus = 'creating' | 'pending' | 'paid' | 'expired'

export interface OrderRecord {
  id: string
  holder: string
  status: OrderStatus
  invoice_id: string | null
  checkout_url: string | null
  expires_at: string
  created_at: string
  paid_at: string | null
  serial: number | null
  credential: string | null
}

export class PassDatabase {
  readonly db: Database.Database

  constructor(filename: string) {
    if (filename !== ':memory:') fs.mkdirSync(path.dirname(filename), { recursive: true })
    this.db = new Database(filename)
    this.db.pragma('journal_mode = WAL')
    this.db.pragma('foreign_keys = ON')
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS orders (
        id TEXT PRIMARY KEY,
        holder TEXT NOT NULL,
        status TEXT NOT NULL CHECK(status IN ('creating','pending','paid','expired')),
        invoice_id TEXT UNIQUE,
        checkout_url TEXT,
        expires_at TEXT NOT NULL,
        created_at TEXT NOT NULL,
        paid_at TEXT,
        serial INTEGER UNIQUE,
        credential TEXT
      );
      CREATE INDEX IF NOT EXISTS orders_status_expires ON orders(status, expires_at);
    `)
  }

  reserve(holder: string, now = new Date()): OrderRecord | null {
    const transaction = this.db.transaction(() => {
      this.expire(now)
      const active = this.db.prepare(
        `SELECT COUNT(*) AS count FROM orders WHERE status IN ('creating','pending','paid')`,
      ).get() as { count: number }
      if (active.count >= PASS_SUPPLY) return null

      const createdAt = now.toISOString()
      const expiresAt = new Date(now.getTime() + ORDER_TTL_MINUTES * 60_000).toISOString()
      const order: OrderRecord = {
        id: randomUUID(),
        holder,
        status: 'creating',
        invoice_id: null,
        checkout_url: null,
        expires_at: expiresAt,
        created_at: createdAt,
        paid_at: null,
        serial: null,
        credential: null,
      }
      this.db.prepare(`
        INSERT INTO orders (id, holder, status, expires_at, created_at)
        VALUES (@id, @holder, @status, @expires_at, @created_at)
      `).run(order)
      return order
    })
    return transaction()
  }

  attachInvoice(id: string, invoiceId: string, checkoutUrl: string): void {
    this.db.prepare(`
      UPDATE orders SET status = 'pending', invoice_id = ?, checkout_url = ?
      WHERE id = ? AND status = 'creating'
    `).run(invoiceId, checkoutUrl, id)
  }

  removeCreating(id: string): void {
    this.db.prepare(`DELETE FROM orders WHERE id = ? AND status = 'creating'`).run(id)
  }

  get(id: string): OrderRecord | undefined {
    return this.db.prepare(`SELECT * FROM orders WHERE id = ?`).get(id) as OrderRecord | undefined
  }

  getByInvoice(invoiceId: string): OrderRecord | undefined {
    return this.db.prepare(`SELECT * FROM orders WHERE invoice_id = ?`).get(invoiceId) as OrderRecord | undefined
  }

  issue(id: string, createCredential: (serial: number, order: OrderRecord) => string, now = new Date()): OrderRecord {
    const transaction = this.db.transaction(() => {
      const order = this.get(id)
      if (!order) throw new Error('Order not found')
      if (order.status === 'paid') return order
      if (order.status !== 'pending') throw new Error(`Cannot issue order in ${order.status} state`)

      const next = this.db.prepare(`SELECT COALESCE(MAX(serial), 0) + 1 AS serial FROM orders`).get() as { serial: number }
      if (next.serial > PASS_SUPPLY) throw new Error('Pass supply exhausted')
      const credential = createCredential(next.serial, order)
      this.db.prepare(`
        UPDATE orders
        SET status = 'paid', paid_at = ?, serial = ?, credential = ?
        WHERE id = ? AND status = 'pending'
      `).run(now.toISOString(), next.serial, credential, id)
      return this.get(id)!
    })
    return transaction()
  }

  expire(now = new Date()): void {
    this.db.prepare(`
      UPDATE orders SET status = 'expired'
      WHERE status IN ('creating','pending') AND expires_at <= ?
    `).run(now.toISOString())
  }

  stats(now = new Date()): { minted: number; reserved: number } {
    this.expire(now)
    const row = this.db.prepare(`
      SELECT
        SUM(CASE WHEN status = 'paid' THEN 1 ELSE 0 END) AS minted,
        SUM(CASE WHEN status IN ('creating','pending') THEN 1 ELSE 0 END) AS reserved
      FROM orders
    `).get() as { minted: number | null; reserved: number | null }
    return { minted: row.minted ?? 0, reserved: row.reserved ?? 0 }
  }

  close(): void {
    this.db.close()
  }
}
