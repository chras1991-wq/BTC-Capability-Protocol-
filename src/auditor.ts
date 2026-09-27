import { address as btcAddress, initEccLib, networks } from 'bitcoinjs-lib'
import * as ecc from 'tiny-secp256k1'

initEccLib(ecc)

export type NetworkName = 'mainnet' | 'testnet' | 'signet'
export type Exposure = 'exposed' | 'likely-exposed' | 'shielded' | 'empty'

export interface AddressStats {
  funded_txo_count: number
  funded_txo_sum: number
  spent_txo_count: number
  spent_txo_sum: number
  tx_count: number
}

export interface MempoolAddress {
  address: string
  chain_stats: AddressStats
  mempool_stats: AddressStats
}

export interface MempoolUtxo {
  txid: string
  vout: number
  value: number
  status: { confirmed: boolean; block_height?: number; block_time?: number }
}

export interface ScriptProfile {
  type: 'P2PKH' | 'P2SH' | 'P2WPKH' | 'P2WSH' | 'P2TR'
  publicKeyState: 'hidden' | 'output-key-visible' | 'script-hash'
  summary: string
}

export interface AuditResult {
  schema: 'hourglass.audit.v1'
  policyVersion: '2026.09'
  address: string
  network: NetworkName
  script: ScriptProfile
  exposure: Exposure
  score: number
  balance: number
  received: number
  spent: number
  transactionCount: number
  utxos: MempoolUtxo[]
  publicKeyRevealed: boolean
  findings: string[]
  actions: string[]
  source: string
  scannedAt: string
  caveat: string
}

const API_ROOT: Record<NetworkName, string> = {
  mainnet: 'https://mempool.space/api',
  testnet: 'https://mempool.space/testnet/api',
  signet: 'https://mempool.space/signet/api',
}

export function detectNetwork(value: string): NetworkName {
  const normalized = value.trim().toLowerCase()
  if (normalized.startsWith('tb1')) return 'testnet'
  if (normalized.startsWith('m') || normalized.startsWith('n') || normalized.startsWith('2')) {
    return 'testnet'
  }
  return 'mainnet'
}

export function classifyAddress(value: string, networkName = detectNetwork(value)): ScriptProfile {
  const network = networkName === 'mainnet' ? networks.bitcoin : networks.testnet
  let script: Uint8Array

  try {
    script = btcAddress.toOutputScript(value.trim(), network)
  } catch {
    throw new Error('Invalid address or network. Enter a standard mainnet or testnet Bitcoin address.')
  }

  const hex = Array.from(script, (byte) => byte.toString(16).padStart(2, '0')).join('')
  if (/^76a914[0-9a-f]{40}88ac$/.test(hex)) {
    return { type: 'P2PKH', publicKeyState: 'hidden', summary: 'Public-key hash; key hidden until the first spend' }
  }
  if (/^a914[0-9a-f]{40}87$/.test(hex)) {
    return { type: 'P2SH', publicKeyState: 'script-hash', summary: 'Script hash; redeem script usually appears when spent' }
  }
  if (/^0014[0-9a-f]{40}$/.test(hex)) {
    return { type: 'P2WPKH', publicKeyState: 'hidden', summary: 'Witness public-key hash; key hidden until the first spend' }
  }
  if (/^0020[0-9a-f]{64}$/.test(hex)) {
    return { type: 'P2WSH', publicKeyState: 'script-hash', summary: 'Witness script hash; witness script appears when spent' }
  }
  if (/^5120[0-9a-f]{64}$/.test(hex)) {
    return { type: 'P2TR', publicKeyState: 'output-key-visible', summary: 'Taproot output contains a visible x-only public key' }
  }
  throw new Error('This script type is not supported yet.')
}

function combineStats(a: AddressStats, b: AddressStats): AddressStats {
  return {
    funded_txo_count: a.funded_txo_count + b.funded_txo_count,
    funded_txo_sum: a.funded_txo_sum + b.funded_txo_sum,
    spent_txo_count: a.spent_txo_count + b.spent_txo_count,
    spent_txo_sum: a.spent_txo_sum + b.spent_txo_sum,
    tx_count: a.tx_count + b.tx_count,
  }
}

export function evaluate(
  target: string,
  network: NetworkName,
  script: ScriptProfile,
  data: MempoolAddress,
  utxos: MempoolUtxo[],
  now = new Date(),
): AuditResult {
  const stats = combineStats(data.chain_stats, data.mempool_stats)
  const balance = stats.funded_txo_sum - stats.spent_txo_sum
  const hasSpent = stats.spent_txo_count > 0
  const hasFunds = balance > 0
  const isVisibleKey = script.publicKeyState === 'output-key-visible'
  const isScriptReveal = script.publicKeyState === 'script-hash' && hasSpent
  const publicKeyRevealed = isVisibleKey || hasSpent

  let exposure: Exposure
  let score: number
  if (!hasFunds) {
    exposure = 'empty'
    score = 0
  } else if (isVisibleKey || (script.publicKeyState === 'hidden' && hasSpent)) {
    exposure = 'exposed'
    score = isVisibleKey ? 88 : 96
  } else if (isScriptReveal) {
    exposure = 'likely-exposed'
    score = 82
  } else {
    exposure = 'shielded'
    score = script.publicKeyState === 'script-hash' ? 34 : 18
  }

  const findings: string[] = []
  if (isVisibleKey) findings.push('The Taproot output key is always visible on-chain; there is no pre-spend hash shield.')
  if (script.publicKeyState === 'hidden' && hasSpent) {
    findings.push('This address has spent before; its signature and public key are already visible in scriptSig or witness data.')
  }
  if (isScriptReveal) findings.push('This script hash has spent before; the historical redeem script may expose member public keys.')
  if (!hasSpent && script.publicKeyState === 'hidden') {
    findings.push('No spend was detected; the public key remains protected by its HASH160 commitment.')
  }
  if (utxos.length > 1) findings.push(`${utxos.length} live outputs were found; address reuse increases the single-key exposure.`)
  if (!hasFunds) findings.push('This address has no unspent balance, so no value is currently at risk.')

  const actions = hasFunds
    ? exposure === 'shielded'
      ? ['Do not make a test spend from this address', 'Stop reusing the address', 'Track BIP-360 / BIP-361 without moving into unaudited schemes']
      : ['Stop receiving new funds here', 'Prepare a one-time UTXO migration inventory', 'Use a hardware wallet to generate a fresh, single-use address', 'Wait for a consensus-backed post-quantum output type']
    : ['Archive this result', 'Use every new receiving address only once']

  return {
    schema: 'hourglass.audit.v1',
    policyVersion: '2026.09',
    address: target,
    network,
    script,
    exposure,
    score,
    balance,
    received: stats.funded_txo_sum,
    spent: stats.spent_txo_sum,
    transactionCount: stats.tx_count,
    utxos,
    publicKeyRevealed,
    findings,
    actions,
    source: `${API_ROOT[network]}/address/:address`,
    scannedAt: now.toISOString(),
    caveat: 'The score is a migration priority, not evidence that a quantum computer can steal funds today. BIP-360/361 remain proposals.',
  }
}

export async function auditAddress(
  target: string,
  networkOverride?: NetworkName,
  fetcher: typeof fetch = fetch,
): Promise<AuditResult> {
  const address = target.trim()
  const detected = detectNetwork(address)
  const network = networkOverride ?? detected
  const script = classifyAddress(address, network)
  const root = API_ROOT[network]

  const [addressResponse, utxoResponse] = await Promise.all([
    fetcher(`${root}/address/${encodeURIComponent(address)}`),
    fetcher(`${root}/address/${encodeURIComponent(address)}/utxo`),
  ])

  if (!addressResponse.ok || !utxoResponse.ok) {
    if (addressResponse.status === 429 || utxoResponse.status === 429) {
      throw new Error('The public indexer is rate-limiting requests. Try again shortly.')
    }
    throw new Error('The address could not be read from the public Bitcoin indexer.')
  }

  const data = (await addressResponse.json()) as MempoolAddress
  const utxos = (await utxoResponse.json()) as MempoolUtxo[]
  return evaluate(address, network, script, data, utxos)
}

export function formatSats(value: number): string {
  return new Intl.NumberFormat('en-US').format(value)
}
