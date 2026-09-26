import { FormEvent, useEffect, useMemo, useState } from 'react'
import { QRCodeSVG } from 'qrcode.react'
import { api, type MintConfig, type MintOrder, type SignedPass } from './api'
import './genesis.css'

function compact(value: string, start = 10, end = 8) {
  return `${value.slice(0, start)}…${value.slice(-end)}`
}

function sats(value: number) {
  return new Intl.NumberFormat('en-US').format(value)
}

function downloadPass(pass: SignedPass) {
  const blob = new Blob([JSON.stringify(pass, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `hourglass-canary-${String(pass.claims.serial).padStart(4, '0')}.json`
  link.click()
  URL.revokeObjectURL(url)
}

export default function App() {
  const [config, setConfig] = useState<MintConfig | null>(null)
  const [holder, setHolder] = useState('')
  const [order, setOrder] = useState<MintOrder | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [verified, setVerified] = useState<boolean | null>(null)

  const issuedPercent = useMemo(() => {
    if (!config) return 0
    return ((config.minted + config.reserved) / config.supply) * 100
  }, [config])

  useEffect(() => {
    api.config().then(setConfig).catch(() => setError('ISSUER_OFFLINE'))
    const id = new URLSearchParams(window.location.search).get('order')
    if (id) api.order(id).then(setOrder).catch(() => setError('ORDER_NOT_FOUND'))
  }, [])

  useEffect(() => {
    if (!order || order.status !== 'pending') return
    const timer = window.setInterval(async () => {
      const next = await api.order(order.id).catch(() => null)
      if (next) {
        setOrder(next)
        if (next.status === 'paid') api.config().then(setConfig)
      }
    }, 3_000)
    return () => window.clearInterval(timer)
  }, [order?.id, order?.status])

  async function mint(event: FormEvent) {
    event.preventDefault()
    if (!holder.trim()) return
    setError('')
    setLoading(true)
    try {
      const next = await api.createOrder(holder)
      setOrder(next)
      history.replaceState(null, '', `?order=${next.id}`)
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'MINT_FAILED')
    } finally {
      setLoading(false)
    }
  }

  async function simulateSettlement() {
    if (!order) return
    setLoading(true)
    try {
      const next = await api.mockSettle(order.id)
      setOrder(next)
      setConfig(await api.config())
    } finally {
      setLoading(false)
    }
  }

  async function verifyPass() {
    if (!order?.credential) return
    try {
      const result = await api.verify(order.credential)
      setVerified(result.valid)
    } catch {
      setVerified(false)
    }
  }

  function reset() {
    setOrder(null)
    setHolder('')
    setVerified(null)
    setError('')
    history.replaceState(null, '', window.location.pathname)
  }

  return (
    <main>
      <nav>
        <div className="brand"><span className="sigil">⌛</span><span>HOURGLASS</span></div>
        <div className="nav-meta">
          <span className="pulse" /> ISSUER ONLINE
          <span className="divider" /> GENESIS / 0000
        </div>
      </nav>

      <header className="ritual">
        <div className="coordinates">EPOCH 000 / SHA-256 / ED25519</div>
        <div className="halo" aria-hidden="true">
          <div className="halo-ring ring-a" />
          <div className="halo-ring ring-b" />
          <div className="halo-ring ring-c" />
          <div className="canary">◈</div>
        </div>
        <p className="kicker">GENESIS CANARY PASS</p>
        <h1>THE CANARY<br /><em>ENTERS FIRST.</em></h1>
        <p className="declaration">
          2,100 枚创世访问凭证。<br />
          量子暴露监控、Q-DAY 预警、签名审计与加密撤离试验。
        </p>
        <div className="supply-line">
          <span>{config ? String(config.minted).padStart(4, '0') : '----'} ISSUED</span>
          <div><i style={{ width: `${issuedPercent}%` }} /></div>
          <span>{config ? String(config.available).padStart(4, '0') : '----'} REMAIN</span>
        </div>
      </header>

      <section className="mint-vault">
        <div className="vault-index">
          <span>ISSUANCE CHAMBER</span>
          <span>01 / 03</span>
        </div>

        {!order && (
          <form className="mint-form" onSubmit={mint}>
            <div className="terms">
              <div><span>UNIT PRICE</span><strong>{config ? sats(config.priceSats) : '—'} SATS</strong></div>
              <div><span>MAXIMUM SUPPLY</span><strong>2,100</strong></div>
              <div><span>HARD CAP</span><strong>0.999999 BTC</strong></div>
            </div>
            <label htmlFor="holder">PUBLIC HOLDER ID</label>
            <input
              id="holder"
              value={holder}
              onChange={(event) => setHolder(event.target.value)}
              placeholder="NOSTR PUBKEY / BTC ADDRESS / PSEUDONYM"
              spellCheck={false}
              autoComplete="off"
            />
            <p className="field-note">此标识写入签名凭证。不要输入私钥、助记词或真实姓名。</p>
            <button className="primary" type="submit" disabled={loading || !holder.trim() || !config?.available}>
              <span>{loading ? 'OPENING…' : 'ENTER THE SHAFT'}</span><b>↘</b>
            </button>
          </form>
        )}

        {order?.status === 'pending' && (
          <div className="invoice">
            <div className="qr-shell">
              <QRCodeSVG value={order.checkoutUrl ?? window.location.href} size={190} bgColor="#d7ff3f" fgColor="#0a0b08" />
              <span className="scanline" />
            </div>
            <div className="invoice-copy">
              <p className="kicker">RESERVATION ACTIVE</p>
              <h2>{sats(config?.priceSats ?? 47_619)} SATS</h2>
              <p>序列号已保留至 {new Date(order.expiresAt).toLocaleTimeString()}。BTCPay 确认结算后，签名凭证自动生成。</p>
              {config?.paymentMode === 'btcpay' ? (
                <a className="primary" href={order.checkoutUrl ?? '#'} target="_blank" rel="noreferrer">
                  <span>OPEN BTCPAY</span><b>↗</b>
                </a>
              ) : (
                <button className="primary dev" onClick={simulateSettlement} disabled={loading}>
                  <span>DEV / SIMULATE SETTLEMENT</span><b>∴</b>
                </button>
              )}
              <button className="text-button" onClick={reset}>ABANDON RESERVATION</button>
            </div>
          </div>
        )}

        {order?.status === 'expired' && (
          <div className="terminal-state">
            <p className="kicker">RESERVATION EXPIRED</p>
            <h2>THE GATE HAS CLOSED.</h2>
            <button className="primary" onClick={reset}><span>BEGIN AGAIN</span><b>↺</b></button>
          </div>
        )}

        {order?.status === 'paid' && order.credential && (
          <div className="pass-reveal">
            <div className="pass-card">
              <div className="pass-no">№ {String(order.serial).padStart(4, '0')} / 2100</div>
              <div className="pass-symbol">⌛</div>
              <div>
                <span>GENESIS</span>
                <h2>CANARY<br />PASS</h2>
              </div>
              <div className="holder">{compact(order.holder, 16, 12)}</div>
              <div className="micro">HOURGLASS NETWORK · Q-DAY DEFENSE GRID · ED25519</div>
            </div>
            <div className="credential">
              <p className="kicker">CREDENTIAL ISSUED</p>
              <h2>WITNESS ACCEPTED.</h2>
              <dl>
                <div><dt>SERIAL</dt><dd>{String(order.serial).padStart(4, '0')} / 2100</dd></div>
                <div><dt>HOLDER</dt><dd>{compact(order.holder, 18, 10)}</dd></div>
                <div><dt>ISSUER KEY</dt><dd>{compact(order.credential.proof.fingerprint, 14, 12)}</dd></div>
                <div><dt>PROOF</dt><dd>ED25519 / {verified === true ? 'VALID' : verified === false ? 'INVALID' : 'UNTESTED'}</dd></div>
              </dl>
              <div className="button-pair">
                <button className="primary" onClick={() => downloadPass(order.credential!)}><span>DOWNLOAD PASS</span><b>↓</b></button>
                <button className="outline" onClick={verifyPass}>VERIFY SIGNATURE</button>
              </div>
            </div>
          </div>
        )}

        {error && <div className="error" role="alert">FAULT / {error}</div>}
      </section>

      <section className="rights">
        <div className="section-label"><span>ACCESS RIGHTS</span><span>02 / 03</span></div>
        <div className="rights-grid">
          <article><b>01</b><h3>Q-SEAL × 10</h3><p>十份签名量子暴露审计凭证。</p></article>
          <article><b>02</b><h3>Q-DAY FEED</h3><p>十二个月预警与暴露事件流。</p></article>
          <article><b>03</b><h3>EXPOSURE API</h3><p>地址风险、脚本类型与迁移优先级。</p></article>
          <article><b>04</b><h3>DARK EXIT</h3><p>加密撤离中继试验优先访问权。</p></article>
        </div>
      </section>

      <section className="cap">
        <div className="section-label"><span>ISSUANCE LAW</span><span>03 / 03</span></div>
        <div className="cap-number">≤ 1 BTC</div>
        <p>2,100 × 47,619 sats = 99,999,900 sats</p>
        <div className="law-grid">
          <span>NO YIELD</span><span>NO REVENUE SHARE</span><span>NO BUYBACK</span><span>FIXED SUPPLY</span>
        </div>
      </section>

      <footer>
        <span>HOURGLASS NETWORK / GENESIS ISSUER</span>
        <span>{config ? `KEY ${compact(config.issuerFingerprint, 12, 12)}` : 'KEY —'}</span>
        <span>ACCESS CREDENTIAL / NOT AN INVESTMENT</span>
      </footer>
    </main>
  )
}
