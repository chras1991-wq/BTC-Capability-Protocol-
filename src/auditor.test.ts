import { address as btcAddress } from 'bitcoinjs-lib'
import { describe, expect, it } from 'vitest'
import { classifyAddress, evaluate, type MempoolAddress } from './auditor'

const emptyStats = {
  funded_txo_count: 0,
  funded_txo_sum: 0,
  spent_txo_count: 0,
  spent_txo_sum: 0,
  tx_count: 0,
}

const generatorX = Uint8Array.from(
  '79be667ef9dcbbac55a06295ce870b07029bfcdb2dce28d959f2815b16f81798'
    .match(/../g)!
    .map((byte) => Number.parseInt(byte, 16)),
)

function chain(overrides: Partial<typeof emptyStats>): MempoolAddress {
  return {
    address: 'test',
    chain_stats: { ...emptyStats, ...overrides },
    mempool_stats: emptyStats,
  }
}

describe('Bitcoin script classification', () => {
  it('recognizes a legacy public-key-hash address', () => {
    expect(classifyAddress('1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa').type).toBe('P2PKH')
  })

  it('recognizes a taproot output with a visible output key', () => {
    const taproot = btcAddress.toBech32(generatorX, 1, 'bc')
    expect(classifyAddress(taproot)).toMatchObject({
      type: 'P2TR',
      publicKeyState: 'output-key-visible',
    })
  })

  it('rejects malformed addresses', () => {
    expect(() => classifyAddress('bc1-not-an-address')).toThrow(/Invalid/)
  })
})

describe('quantum exposure policy', () => {
  const p2pkh = classifyAddress('1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa')

  it('keeps an unspent P2PKH public key hash shielded', () => {
    const result = evaluate(
      'address',
      'mainnet',
      p2pkh,
      chain({ funded_txo_count: 1, funded_txo_sum: 50_000, tx_count: 1 }),
      [{ txid: 'a', vout: 0, value: 50_000, status: { confirmed: true } }],
    )
    expect(result.exposure).toBe('shielded')
    expect(result.publicKeyRevealed).toBe(false)
    expect(result.score).toBe(18)
  })

  it('flags reused P2PKH funds after a spend reveals the public key', () => {
    const result = evaluate(
      'address',
      'mainnet',
      p2pkh,
      chain({
        funded_txo_count: 2,
        funded_txo_sum: 100_000,
        spent_txo_count: 1,
        spent_txo_sum: 40_000,
        tx_count: 2,
      }),
      [{ txid: 'b', vout: 1, value: 60_000, status: { confirmed: true } }],
    )
    expect(result.exposure).toBe('exposed')
    expect(result.balance).toBe(60_000)
    expect(result.score).toBe(96)
  })

  it('flags funded taproot outputs without requiring a spend', () => {
    const taprootAddress = btcAddress.toBech32(generatorX, 1, 'bc')
    const result = evaluate(
      taprootAddress,
      'mainnet',
      classifyAddress(taprootAddress),
      chain({ funded_txo_count: 1, funded_txo_sum: 21_000, tx_count: 1 }),
      [{ txid: 'c', vout: 0, value: 21_000, status: { confirmed: false } }],
    )
    expect(result.exposure).toBe('exposed')
    expect(result.score).toBe(88)
  })
})
