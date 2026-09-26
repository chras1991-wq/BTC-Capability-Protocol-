import { address as btcAddress, networks } from 'bitcoinjs-lib'

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
    throw new Error('地址格式或网络无效。请输入 mainnet / testnet 的标准 Bitcoin 地址。')
  }

  const hex = Array.from(script, (byte) => byte.toString(16).padStart(2, '0')).join('')
  if (/^76a914[0-9a-f]{40}88ac$/.test(hex)) {
    return { type: 'P2PKH', publicKeyState: 'hidden', summary: '公钥哈希地址；首次花费前隐藏公钥' }
  }
  if (/^a914[0-9a-f]{40}87$/.test(hex)) {
    return { type: 'P2SH', publicKeyState: 'script-hash', summary: '脚本哈希地址；花费时通常公开赎回脚本' }
  }
  if (/^0014[0-9a-f]{40}$/.test(hex)) {
    return { type: 'P2WPKH', publicKeyState: 'hidden', summary: '隔离见证公钥哈希；首次花费前隐藏公钥' }
  }
  if (/^0020[0-9a-f]{64}$/.test(hex)) {
    return { type: 'P2WSH', publicKeyState: 'script-hash', summary: '隔离见证脚本哈希；花费时公开见证脚本' }
  }
  if (/^5120[0-9a-f]{64}$/.test(hex)) {
    return { type: 'P2TR', publicKeyState: 'output-key-visible', summary: 'Taproot 输出直接包含 x-only 公钥' }
  }
  throw new Error('当前版本不支持该脚本类型。')
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
  if (isVisibleKey) findings.push('Taproot 输出公钥始终在链上可见；不存在“首次花费前”的哈希保护期。')
  if (script.publicKeyState === 'hidden' && hasSpent) {
    findings.push('该地址已有花费记录，签名与公钥已随 scriptSig / witness 公开。')
  }
  if (isScriptReveal) findings.push('该脚本哈希已有花费记录；历史赎回脚本可能公开其成员公钥。')
  if (!hasSpent && script.publicKeyState === 'hidden') {
    findings.push('未检测到花费记录；当前公钥仍受 HASH160 承诺保护。')
  }
  if (utxos.length > 1) findings.push(`检测到 ${utxos.length} 个未花费输出；地址复用扩大了单点暴露面。`)
  if (!hasFunds) findings.push('当前没有未花费余额，因此没有在险资金。')

  const actions = hasFunds
    ? exposure === 'shielded'
      ? ['不要从该地址进行“试花费”', '停止地址复用', '关注 BIP-360 / BIP-361，但不要迁移至未经审计的方案']
      : ['停止向该地址接收新资金', '制定一次性 UTXO 迁移清单', '使用硬件钱包生成全新地址，避免复用', '等待共识认可的抗量子输出类型，不要相信“量子恢复服务”']
    : ['归档该地址的审计记录', '新收款地址坚持一次一用']

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
    caveat: '风险分数是迁移优先级，不代表量子计算机可立即盗取资金。BIP-360/361 仍处于提案阶段。',
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
      throw new Error('公共索引器请求过于频繁，请稍后重试。')
    }
    throw new Error('无法从公共 Bitcoin 索引器读取该地址。')
  }

  const data = (await addressResponse.json()) as MempoolAddress
  const utxos = (await utxoResponse.json()) as MempoolUtxo[]
  return evaluate(address, network, script, data, utxos)
}

export function formatSats(value: number): string {
  return new Intl.NumberFormat('en-US').format(value)
}
