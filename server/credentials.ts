import fs from 'node:fs'
import path from 'node:path'
import {
  createHash,
  createPrivateKey,
  createPublicKey,
  generateKeyPairSync,
  sign,
  verify,
  type KeyObject,
} from 'node:crypto'
import { MAX_PROCEEDS_SATS, PASS_PRICE_SATS, PASS_SUPPLY } from './config'
import type { OrderRecord } from './db'

export interface PassClaims {
  schema: 'hourglass.canary-pass.v1'
  issuer: 'Hourglass Network'
  name: 'Genesis Canary Pass'
  serial: number
  supply: number
  priceSats: number
  maxProceedsSats: number
  holder: string
  orderId: string
  issuedAt: string
  entitlements: readonly string[]
}

export interface SignedPass {
  claims: PassClaims
  proof: {
    algorithm: 'Ed25519'
    publicKey: string
    fingerprint: string
    signature: string
  }
}

function canonical(value: unknown): string {
  if (Array.isArray(value)) return `[${value.map(canonical).join(',')}]`
  if (value && typeof value === 'object') {
    return `{${Object.entries(value as Record<string, unknown>)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([key, child]) => `${JSON.stringify(key)}:${canonical(child)}`)
      .join(',')}}`
  }
  return JSON.stringify(value)
}

export class CredentialSigner {
  private readonly privateKey: KeyObject
  private readonly publicKey: KeyObject
  readonly publicKeyPem: string
  readonly fingerprint: string

  constructor(keyPath: string) {
    let privatePem: string
    if (fs.existsSync(keyPath)) {
      privatePem = fs.readFileSync(keyPath, 'utf8')
    } else {
      fs.mkdirSync(path.dirname(keyPath), { recursive: true })
      const pair = generateKeyPairSync('ed25519')
      privatePem = pair.privateKey.export({ type: 'pkcs8', format: 'pem' }).toString()
      fs.writeFileSync(keyPath, privatePem, { mode: 0o600 })
    }
    this.privateKey = createPrivateKey(privatePem)
    this.publicKey = createPublicKey(this.privateKey)
    this.publicKeyPem = this.publicKey.export({ type: 'spki', format: 'pem' }).toString()
    this.fingerprint = createHash('sha256')
      .update(this.publicKey.export({ type: 'spki', format: 'der' }))
      .digest('hex')
  }

  issue(serial: number, order: OrderRecord, issuedAt = new Date()): SignedPass {
    const claims: PassClaims = {
      schema: 'hourglass.canary-pass.v1',
      issuer: 'Hourglass Network',
      name: 'Genesis Canary Pass',
      serial,
      supply: PASS_SUPPLY,
      priceSats: PASS_PRICE_SATS,
      maxProceedsSats: MAX_PROCEEDS_SATS,
      holder: order.holder,
      orderId: order.id,
      issuedAt: issuedAt.toISOString(),
      entitlements: [
        '12-month Hourglass Pro access',
        '10 signed Q-SEAL audit credentials',
        'Q-DAY alert feed access',
        'Exposure API access',
        'Priority encrypted-exit pilot access',
      ],
    }
    const signature = sign(null, Buffer.from(canonical(claims)), this.privateKey).toString('base64url')
    return {
      claims,
      proof: {
        algorithm: 'Ed25519',
        publicKey: Buffer.from(
          this.publicKey.export({ type: 'spki', format: 'der' }),
        ).toString('base64url'),
        fingerprint: this.fingerprint,
        signature,
      },
    }
  }

  verify(pass: SignedPass): boolean {
    if (pass.proof.fingerprint !== this.fingerprint || pass.proof.algorithm !== 'Ed25519') return false
    return verify(
      null,
      Buffer.from(canonical(pass.claims)),
      this.publicKey,
      Buffer.from(pass.proof.signature, 'base64url'),
    )
  }
}
