import { FormEvent, useMemo, useState } from 'react'
import { AuditResult, NetworkName, auditAddress, formatSats } from './auditor'
import './styles.css'

const SAMPLE = '1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa'

const labels = {
  exposed: { eyebrow: 'CRITICAL EXPOSURE', title: '公钥已暴露', tone: 'critical' },
  'likely-exposed': { eyebrow: 'REVIEW REQUIRED', title: '脚本可能暴露', tone: 'warning' },
  shielded: { eyebrow: 'HASH SHIELDED', title: '暂未暴露', tone: 'safe' },
  empty: { eyebrow: 'NO VALUE AT RISK', title: '没有在险余额', tone: 'neutral' },
} as const

function shortHash(value: string) {
  return `${value.slice(0, 12)}…${value.slice(-10)}`
}

function downloadReport(result: AuditResult) {
  const blob = new Blob([JSON.stringify(result, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `hourglass-${result.address.slice(0, 10)}-${Date.now()}.json`
  link.click()
  URL.revokeObjectURL(url)
}

export default function App() {
  const [address, setAddress] = useState('')
  const [network, setNetwork] = useState<'auto' | NetworkName>('auto')
  const [result, setResult] = useState<AuditResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const verdict = useMemo(() => (result ? labels[result.exposure] : null), [result])

  async function submit(event: FormEvent) {
    event.preventDefault()
    if (!address.trim()) return
    setError('')
    setLoading(true)
    try {
      setResult(await auditAddress(address, network === 'auto' ? undefined : network))
    } catch (err) {
      setResult(null)
      setError(err instanceof Error ? err.message : '审计失败。')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main>
      <nav>
        <a className="brand" href="#" aria-label="Hourglass home">
          <span className="brand-mark">⌛</span>
          <span>HOURGLASS</span>
        </a>
        <div className="nav-meta">
          <span className="pulse" />
          POLICY 2026.09
          <span className="divider" />
          READ-ONLY
        </div>
      </nav>

      <section className="hero">
        <div className="hero-copy">
          <p className="kicker">BITCOIN / POST-QUANTUM READINESS</p>
          <h1>你的 BTC，<br />公钥已经暴露了吗？</h1>
          <p className="lede">
            量子风险不是“破解 Bitcoin”，而是从链上公开密钥反推私钥。
            Hourglass 检查地址历史、脚本类型和 UTXO，生成可验证的迁移优先级。
          </p>
        </div>

        <aside className="threat-card">
          <div className="threat-head">
            <span>THREAT MODEL</span>
            <span>CRQC</span>
          </div>
          <div className="threat-visual" aria-hidden="true">
            <div className="orbit orbit-one" />
            <div className="orbit orbit-two" />
            <div className="core">EC</div>
          </div>
          <p>目标：secp256k1 公钥</p>
          <p>攻击：Shor 算法</p>
          <p>边界：尚无公开可行的 CRQC</p>
        </aside>
      </section>

      <section className="terminal">
        <div className="terminal-bar">
          <span>01 / ADDRESS AUDIT</span>
          <span>不会请求私钥或签名</span>
        </div>
        <form onSubmit={submit}>
          <label htmlFor="address">BITCOIN ADDRESS</label>
          <div className="input-row">
            <span className="prompt">&gt;</span>
            <input
              id="address"
              value={address}
              onChange={(event) => setAddress(event.target.value)}
              placeholder="bc1q… / bc1p… / 1… / 3…"
              spellCheck={false}
              autoComplete="off"
            />
            <select value={network} onChange={(event) => setNetwork(event.target.value as typeof network)} aria-label="网络">
              <option value="auto">AUTO</option>
              <option value="mainnet">MAINNET</option>
              <option value="testnet">TESTNET</option>
              <option value="signet">SIGNET</option>
            </select>
            <button type="submit" disabled={loading || !address.trim()}>
              {loading ? 'SCANNING…' : 'RUN AUDIT ↗'}
            </button>
          </div>
          <button className="sample" type="button" onClick={() => setAddress(SAMPLE)}>
            使用历史地址样本：{shortHash(SAMPLE)}
          </button>
        </form>
        {error && <div className="error" role="alert">× {error}</div>}
      </section>

      {result && verdict && (
        <section className={`report ${verdict.tone}`} aria-live="polite">
          <div className="score-panel">
            <p>{verdict.eyebrow}</p>
            <div className="score-ring" style={{ '--score': `${result.score * 3.6}deg` } as React.CSSProperties}>
              <div>
                <strong>{result.score}</strong>
                <span>/ 100</span>
              </div>
            </div>
            <h2>{verdict.title}</h2>
            <span className="risk-note">量子迁移优先级</span>
          </div>

          <div className="report-body">
            <div className="report-title">
              <div>
                <p>AUDIT RECEIPT</p>
                <h3>{shortHash(result.address)}</h3>
              </div>
              <button className="download" onClick={() => downloadReport(result)}>↓ JSON 证据</button>
            </div>

            <div className="metrics">
              <div><span>脚本</span><strong>{result.script.type}</strong><small>{result.script.summary}</small></div>
              <div><span>在险余额</span><strong>{formatSats(result.balance)} sats</strong><small>{result.utxos.length} UTXO</small></div>
              <div><span>公钥状态</span><strong>{result.publicKeyRevealed ? 'REVEALED' : 'HASHED'}</strong><small>{result.transactionCount} 笔相关交易</small></div>
            </div>

            <div className="report-grid">
              <div>
                <h4>FINDINGS / 发现</h4>
                <ol>{result.findings.map((item) => <li key={item}>{item}</li>)}</ol>
              </div>
              <div>
                <h4>ACTIONS / 建议</h4>
                <ol>{result.actions.map((item) => <li key={item}>{item}</li>)}</ol>
              </div>
            </div>

            <div className="caveat">
              <span>!</span>
              <p>{result.caveat}</p>
            </div>
          </div>
        </section>
      )}

      <section className="logic">
        <div className="section-number">02</div>
        <div>
          <p className="kicker">EXPOSURE LOGIC</p>
          <h2>并非所有 BTC 面临相同风险。</h2>
        </div>
        <div className="logic-list">
          <article><span>01</span><h3>P2PKH / P2WPKH</h3><p>首次花费前只有公钥哈希；地址一旦花费又被复用，剩余 UTXO 随之暴露。</p></article>
          <article><span>02</span><h3>P2TR</h3><p>Taproot 输出直接承诺 x-only 公钥，链上始终可见，因此没有隐藏窗口。</p></article>
          <article><span>03</span><h3>P2SH / P2WSH</h3><p>首次花费会公开脚本；具体风险取决于脚本中是否含有长期公钥。</p></article>
        </div>
      </section>

      <footer>
        <span>HOURGLASS / OPEN SECURITY RESEARCH</span>
        <span>数据由 mempool.space 提供 · 地址会发送至公共索引器</span>
        <span>不是钱包，不构成迁移指令</span>
      </footer>
    </main>
  )
}
