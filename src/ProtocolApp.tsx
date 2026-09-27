import { FormEvent, useEffect, useMemo, useState } from 'react'
import { QRCodeSVG } from 'qrcode.react'
import { api, type MintConfig, type MintOrder, type SignedPass } from './api'
import './protocol.css'

function compact(value: string, start = 10, end = 8) {
  if (value.length <= start + end + 1) return value
  return `${value.slice(0, start)}…${value.slice(-end)}`
}

function number(value: number) {
  return new Intl.NumberFormat('en-US').format(value)
}

function downloadCredential(pass: SignedPass) {
  const blob = new Blob([JSON.stringify(pass, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `hourglass-access-${String(pass.claims.serial).padStart(4, '0')}.json`
  link.click()
  URL.revokeObjectURL(url)
}

export default function ProtocolApp() {
  const [config, setConfig] = useState<MintConfig | null>(null)
  const [holder, setHolder] = useState('')
  const [order, setOrder] = useState<MintOrder | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [verified, setVerified] = useState<boolean | null>(null)

  const capacity = useMemo(() => {
    if (!config) return 0
    return ((config.minted + config.reserved) / config.supply) * 100
  }, [config])

  useEffect(() => {
    api.config().then(setConfig).catch(() => setError('CONTROL_PLANE_OFFLINE'))
    const id = new URLSearchParams(window.location.search).get('order')
    if (id) api.order(id).then(setOrder).catch(() => setError('ACCESS_RECORD_NOT_FOUND'))
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

  async function activate(event: FormEvent) {
    event.preventDefault()
    if (!holder.trim()) return
    setError('')
    setLoading(true)
    try {
      const next = await api.createOrder(holder)
      setOrder(next)
      history.replaceState(null, '', `?order=${next.id}`)
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'ACCESS_REQUEST_FAILED')
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

  async function verifyCredential() {
    if (!order?.credential) return
    try {
      setVerified((await api.verify(order.credential)).valid)
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
        <a className="protocol-brand" href="#">
          <span className="btc-mark">₿</span>
          <span>HOURGLASS</span>
        </a>
        <div className="protocol-nav">
          <a href="#mechanism">机制</a>
          <a href="#exposure">暴露模型</a>
          <a href="#access">接入</a>
        </div>
        <div className="network-state"><i /> CONTROL PLANE / ONLINE</div>
      </nav>

      <header className="protocol-hero">
        <div className="hero-copy">
          <p className="eyebrow">BITCOIN QUANTUM DEFENSE NETWORK</p>
          <h1>在公钥成为目标之前，<br /><em>识别它。</em></h1>
          <p className="hero-deck">
            Hourglass 建立 Bitcoin UTXO 的量子暴露索引，签发可验证风险凭证，
            监测 Q-DAY 信号，并为高风险资产准备加密撤离通道。
          </p>
          <div className="hero-actions">
            <a className="orange-button" href="#mechanism">查看协议机制 <b>↓</b></a>
            <span>NO PRIVATE KEYS<br />NO CUSTODY</span>
          </div>
        </div>

        <div className="block-visual" aria-hidden="true">
          <div className="block-head"><span>BLOCK 000000</span><span>Q / 01</span></div>
          <div className="key-orbit">
            <span className="key-core">K</span>
            <i className="orbit-one" />
            <i className="orbit-two" />
            <b className="satellite sat-a">TX</b>
            <b className="satellite sat-b">PK</b>
            <b className="satellite sat-c">Q</b>
          </div>
          <div className="block-foot"><span>SECP256K1</span><span>EXPOSURE: VISIBLE</span></div>
        </div>
      </header>

      <section className="risk-strip" id="exposure">
        <div><span>P2PK / P2TR</span><strong>PUBLIC KEY VISIBLE</strong><small>直接暴露</small></div>
        <div><span>P2PKH / P2WPKH</span><strong>HASH SHIELDED</strong><small>首次花费前</small></div>
        <div><span>REUSED ADDRESS</span><strong>KEY REVEALED</strong><small>历史花费后</small></div>
        <div><span>THREAT MODEL</span><strong>SHOR / CRQC</strong><small>迁移前预警</small></div>
      </section>

      <section className="mechanism" id="mechanism">
        <div className="section-head">
          <p>PROTOCOL / 01</p>
          <h2>四层量子防御控制面</h2>
          <span>从全量链上识别，到受控迁移。</span>
        </div>
        <div className="mechanism-grid">
          <article>
            <div className="step"><b>01</b><span>ATLAS</span></div>
            <h3>暴露索引</h3>
            <p>解析 UTXO、脚本类型、历史花费与地址复用，持续计算公钥暴露状态和在险价值。</p>
            <code>UTXO → SCRIPT → KEY STATE</code>
          </article>
          <article>
            <div className="step"><b>02</b><span>CANARY</span></div>
            <h3>Q-DAY 预警</h3>
            <p>监测密码学挑战、老币异常移动和公开攻击信号，形成机器可读取的分级事件流。</p>
            <code>SIGNAL → VERIFY → ALERT</code>
          </article>
          <article>
            <div className="step"><b>03</b><span>Q-SEAL</span></div>
            <h3>风险凭证</h3>
            <p>将地址状态、策略版本与迁移优先级写入 Ed25519 签名凭证，允许独立验证与复核。</p>
            <code>ASSESS → SIGN → PROVE</code>
          </article>
          <article>
            <div className="step"><b>04</b><span>DARK EXIT</span></div>
            <h3>加密撤离</h3>
            <p>研究门限加密与矿工私有中继，缩短迁移交易公开公钥后的抢跑暴露窗口。</p>
            <code>ENCRYPT → RELAY → INCLUDE</code>
          </article>
        </div>
      </section>

      <section className="flow">
        <div className="section-head compact-head">
          <p>CONTROL FLOW / 02</p>
          <h2>一条确定的响应路径</h2>
        </div>
        <div className="flow-line">
          <div><b>01</b><span>链上状态</span><small>Bitcoin UTXO Set</small></div>
          <i>→</i>
          <div><b>02</b><span>暴露引擎</span><small>Key-state Graph</small></div>
          <i>→</i>
          <div><b>03</b><span>签名判断</span><small>Q-SEAL Receipt</small></div>
          <i>→</i>
          <div><b>04</b><span>预警与撤离</span><small>Alert / Dark Exit</small></div>
        </div>
      </section>

      <section className="access" id="access">
        <div className="access-copy">
          <p className="eyebrow">GENESIS ACCESS</p>
          <h2>进入防御网络。</h2>
          <p>开放 2,100 个创世接入席位。每个席位包含 Q-SEAL、预警流、暴露 API 与 Dark Exit 试验权限。</p>
          <dl>
            <div><dt>接入成本</dt><dd>{config ? number(config.priceSats) : '—'} sats</dd></div>
            <div><dt>可用席位</dt><dd>{config ? number(config.available) : '—'} / 2,100</dd></div>
            <div><dt>资金边界</dt><dd>99,999,900 sats</dd></div>
          </dl>
          <div className="capacity"><i style={{ width: `${capacity}%` }} /></div>
        </div>

        <div className="access-console">
          {!order && (
            <form onSubmit={activate}>
              <div className="console-head"><span>ACCESS REQUEST</span><span>01</span></div>
              <label htmlFor="holder">PUBLIC HOLDER ID</label>
              <input
                id="holder"
                value={holder}
                onChange={(event) => setHolder(event.target.value)}
                placeholder="NOSTR PUBKEY / BTC ADDRESS / PSEUDONYM"
                spellCheck={false}
                autoComplete="off"
              />
              <p>写入签名访问凭证。不要输入私钥、助记词或真实姓名。</p>
              <button className="orange-button full" disabled={loading || !holder.trim() || !config?.available}>
                {loading ? 'OPENING…' : 'REQUEST ACCESS'} <b>↗</b>
              </button>
            </form>
          )}

          {order?.status === 'pending' && (
            <div className="payment-state">
              <div className="console-head"><span>ACCESS RESERVED</span><span>02</span></div>
              <div className="payment-body">
                <QRCodeSVG value={order.checkoutUrl ?? window.location.href} size={158} bgColor="#ffffff" fgColor="#111111" />
                <div>
                  <strong>{number(config?.priceSats ?? 47_619)} SATS</strong>
                  <p>结算确认后生成签名访问凭证。</p>
                  {config?.paymentMode === 'btcpay' ? (
                    <a className="orange-button full" href={order.checkoutUrl ?? '#'} target="_blank" rel="noreferrer">OPEN BTCPAY <b>↗</b></a>
                  ) : (
                    <button className="orange-button full dev" onClick={simulateSettlement} disabled={loading}>DEV / CONFIRM <b>→</b></button>
                  )}
                  <button className="text-action" onClick={reset}>CANCEL</button>
                </div>
              </div>
            </div>
          )}

          {order?.status === 'expired' && (
            <div className="expired-state">
              <div className="console-head"><span>ACCESS EXPIRED</span><span>00</span></div>
              <h3>RESERVATION CLOSED</h3>
              <button className="orange-button full" onClick={reset}>RESTART <b>↺</b></button>
            </div>
          )}

          {order?.status === 'paid' && order.credential && (
            <div className="credential-state">
              <div className="console-head"><span>ACCESS ACTIVE</span><span>{String(order.serial).padStart(4, '0')}</span></div>
              <div className="credential-mark"><span>₿</span><b>HG</b></div>
              <h3>GENESIS ACCESS<br />#{String(order.serial).padStart(4, '0')}</h3>
              <dl>
                <div><dt>HOLDER</dt><dd>{compact(order.holder, 18, 10)}</dd></div>
                <div><dt>SIGNATURE</dt><dd>ED25519 / {verified === true ? 'VALID' : verified === false ? 'INVALID' : 'UNTESTED'}</dd></div>
                <div><dt>ISSUER</dt><dd>{compact(order.credential.proof.fingerprint, 12, 10)}</dd></div>
              </dl>
              <div className="credential-actions">
                <button className="orange-button full" onClick={() => downloadCredential(order.credential!)}>DOWNLOAD <b>↓</b></button>
                <button className="verify-button" onClick={verifyCredential}>VERIFY</button>
              </div>
            </div>
          )}

          {error && <div className="console-error">FAULT / {error}</div>}
        </div>
      </section>

      <footer>
        <div className="protocol-brand"><span className="btc-mark">₿</span><span>HOURGLASS</span></div>
        <span>BITCOIN QUANTUM DEFENSE NETWORK</span>
        <span>{config ? `ISSUER ${compact(config.issuerFingerprint, 10, 10)}` : 'ISSUER —'}</span>
      </footer>
    </main>
  )
}
