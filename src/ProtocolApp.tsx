import { FormEvent, useEffect, useMemo, useState } from 'react'
import { QRCodeSVG } from 'qrcode.react'
import { api, type MintConfig, type MintOrder, type SignedPass } from './api'
import { auditAddress, formatSats, type AuditResult } from './auditor'
import './field.css'

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
  const [scanTarget, setScanTarget] = useState('')
  const [scanResult, setScanResult] = useState<AuditResult | null>(null)
  const [scanError, setScanError] = useState('')
  const [scanning, setScanning] = useState(false)

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

  async function runExposureTest(event: FormEvent) {
    event.preventDefault()
    if (!scanTarget.trim()) return
    setScanning(true)
    setScanError('')
    setScanResult(null)
    try {
      setScanResult(await auditAddress(scanTarget))
    } catch (cause) {
      setScanError(cause instanceof Error ? cause.message : 'LIVE_TEST_FAILED')
    } finally {
      setScanning(false)
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
          <a href="#test">Live Test</a>
          <a href="#missions">Missions</a>
          <a href="#access">Join</a>
        </div>
        <div className="network-state"><i /> CONTROL PLANE / ONLINE</div>
      </nav>

      <header className="protocol-hero">
        <div className="hero-ghost" aria-hidden="true">FIELD<br />UNIT</div>
        <div className="cosmic-coordinates" aria-hidden="true">
          <span>PART: HG–QD/01</span>
          <span>CAL: 2140–09</span>
          <span>STATUS: TEST READY</span>
        </div>
        <div className="hero-copy">
          <p className="eyebrow">THE BITCOIN Q-DAY DRILL</p>
          <h1>Would your Bitcoin<br /><em>survive Q-Day?</em></h1>
          <p className="hero-deck">
            Put any public Bitcoin address through a live exposure test. Find the leaked keys,
            measure the value at risk, and join 2,100 founding Watchers preparing the exit route.
          </p>
          <div className="hero-actions">
            <a className="orange-button" href="#test">TEST AN ADDRESS <b>↓</b></a>
            <span>NO PRIVATE KEYS<br />NO CUSTODY</span>
          </div>
        </div>

        <div className="block-visual" aria-hidden="true">
          <i className="screw screw-a" /><i className="screw screw-b" />
          <i className="screw screw-c" /><i className="screw screw-d" />
          <div className="block-head"><span>BLOCK 000000</span><span>Q / 01</span></div>
          <div className="key-orbit">
            <div className="event-horizon" />
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
        <div><span>P2PK / P2TR</span><strong>PUBLIC KEY VISIBLE</strong><small>Exposed by design</small></div>
        <div><span>P2PKH / P2WPKH</span><strong>HASH SHIELDED</strong><small>Until the first spend</small></div>
        <div><span>REUSED ADDRESS</span><strong>KEY REVEALED</strong><small>Old spend, live risk</small></div>
        <div><span>THREAT MODEL</span><strong>SHOR / CRQC</strong><small>Detect before migration</small></div>
      </section>

      <section className="live-test" id="test">
        <div className="section-head">
          <p>PLAY / 01</p>
          <h2>Run the live exposure test.</h2>
          <span>Public chain data only. Never enter a private key.</span>
        </div>
        <div className="test-grid">
          <form className="test-console" onSubmit={runExposureTest}>
            <div className="console-head"><span>Q-DAY STRESS TEST</span><span>LIVE</span></div>
            <label htmlFor="scan-target">BITCOIN ADDRESS</label>
            <input
              id="scan-target"
              value={scanTarget}
              onChange={(event) => setScanTarget(event.target.value)}
              placeholder="bc1q… / bc1p… / 1… / 3…"
              spellCheck={false}
              autoComplete="off"
            />
            <button className="orange-button full" disabled={scanning || !scanTarget.trim()}>
              {scanning ? 'READING THE CHAIN…' : 'START THE DRILL'} <b>↗</b>
            </button>
            {scanError && <div className="test-error">FAULT / {scanError}</div>}
          </form>

          <div className={`test-result ${scanResult ? scanResult.exposure : 'idle'}`}>
            {!scanResult ? (
              <>
                <div className="radar"><i /><i /><i /><b>?</b></div>
                <h3>NO TARGET LOCKED</h3>
                <p>Enter a public address to reveal its script type, key state, live UTXOs, and Q-Day priority.</p>
              </>
            ) : (
              <>
                <div className="result-top">
                  <span>EXPOSURE SCORE</span>
                  <strong>{scanResult.score}<small>/100</small></strong>
                </div>
                <h3>{scanResult.exposure === 'shielded' ? 'HASH SHIELD ACTIVE' : scanResult.exposure === 'empty' ? 'NO VALUE AT RISK' : 'PUBLIC KEY EXPOSED'}</h3>
                <div className="result-stats">
                  <div><span>SCRIPT</span><b>{scanResult.script.type}</b></div>
                  <div><span>KEY STATE</span><b>{scanResult.publicKeyRevealed ? 'REVEALED' : 'HASHED'}</b></div>
                  <div><span>LIVE VALUE</span><b>{formatSats(scanResult.balance)} sats</b></div>
                </div>
                <p>{scanResult.findings[0]}</p>
                <a href="#access">TURN THIS INTO A SIGNED Q-SEAL →</a>
              </>
            )}
          </div>
        </div>
      </section>

      <section className="mechanism" id="missions">
        <div className="section-head">
          <p>MISSIONS / 02</p>
          <h2>Four ways to enter the defense.</h2>
          <span>Test, watch, prove, and rehearse the exit.</span>
        </div>
        <div className="mechanism-grid">
          <article>
            <div className="step"><b>01</b><span>ATLAS</span></div>
            <h3>Hunt exposed keys</h3>
            <p>Scan UTXOs, script types, old spends, and reused addresses. Find the Bitcoin already visible to a quantum attacker.</p>
            <code>UTXO → SCRIPT → KEY STATE</code>
          </article>
          <article>
            <div className="step"><b>02</b><span>CANARY</span></div>
            <h3>Stand the watch</h3>
            <p>Follow cryptographic canaries, dormant-coin movement, and attack signals. Be early when the threat state changes.</p>
            <code>SIGNAL → VERIFY → ALERT</code>
          </article>
          <article>
            <div className="step"><b>03</b><span>Q-SEAL</span></div>
            <h3>Seal the evidence</h3>
            <p>Turn an address result into a signed, portable Q-Seal with a policy version, risk score, and migration priority.</p>
            <code>ASSESS → SIGN → PROVE</code>
          </article>
          <article>
            <div className="step"><b>04</b><span>DARK EXIT</span></div>
            <h3>Rehearse the exit</h3>
            <p>Join encrypted-relay drills designed to reduce the public-key race window when vulnerable Bitcoin must move.</p>
            <code>ENCRYPT → RELAY → INCLUDE</code>
          </article>
        </div>
      </section>

      <section className="flow">
        <div className="section-head compact-head">
          <p>THE DRILL / 03</p>
          <h2>Your route through Q-Day.</h2>
        </div>
        <div className="flow-line">
          <div><b>01</b><span>Pick a target</span><small>Bitcoin UTXO Set</small></div>
          <i>→</i>
          <div><b>02</b><span>Read the exposure</span><small>Key-state Graph</small></div>
          <i>→</i>
          <div><b>03</b><span>Claim the proof</span><small>Q-Seal Credential</small></div>
          <i>→</i>
          <div><b>04</b><span>Join the response</span><small>Alert / Dark Exit</small></div>
        </div>
      </section>

      <section className="participation">
        <div className="section-head">
          <p>YOUR SEAT / 04</p>
          <h2>Do more than read the research.</h2>
          <span>One payment. One numbered Watcher. One year in the network.</span>
        </div>
        <div className="participation-grid">
          <article><strong>10</strong><h3>Q-Seal missions</h3><p>Create ten signed exposure records you can download, verify, and share.</p></article>
          <article><strong>12</strong><h3>Months on watch</h3><p>Follow Q-Day alerts and changes to the network threat state.</p></article>
          <article><strong>#</strong><h3>Founding rank</h3><p>Own a permanent serial from the first 2,100 Watchers.</p></article>
          <article><strong>β</strong><h3>Dark Exit drills</h3><p>Get first access to encrypted-relay simulations and migration rehearsals.</p></article>
        </div>
        <div className="why-pay">
          <p>WHY PAY?</p>
          <h3>Your 47,619 sats turns a free test into an active defense seat.</h3>
          <span>It funds the shared exposure index, canary monitoring, signed evidence, and relay drills. It does not buy yield, equity, or a price promise.</span>
        </div>
      </section>

      <section className="access" id="access">
        <div className="access-copy">
          <p className="eyebrow">BECOME A FOUNDING WATCHER</p>
          <h2>Take your seat.</h2>
          <p>2,100 numbered seats open the Q-Seal missions, Q-Day watch, exposure API, and Dark Exit drills.</p>
          <dl>
            <div><dt>ONE-TIME ACCESS</dt><dd>{config ? number(config.priceSats) : '—'} sats</dd></div>
            <div><dt>SEATS OPEN</dt><dd>{config ? number(config.available) : '—'} / 2,100</dd></div>
            <div><dt>NETWORK CAP</dt><dd>99,999,900 sats</dd></div>
          </dl>
          <div className="capacity"><i style={{ width: `${capacity}%` }} /></div>
        </div>

        <div className="access-console">
          {!order && config?.paymentMode === 'offline' && (
            <div className="offline-state">
              <div className="console-head"><span>ACCESS GATE</span><span>STANDBY</span></div>
              <div className="credential-mark"><span>₿</span><b>HG</b></div>
              <h3>LIVE TESTS ARE OPEN.<br />WATCHER ACCESS IS NEXT.</h3>
              <p>The public Q-Day drill is live. Self-hosted Bitcoin settlement and persistent credential issuance are being connected before the first seat opens.</p>
              <a className="orange-button full" href="#test">RUN THE FREE DRILL <b>↑</b></a>
            </div>
          )}

          {!order && config?.paymentMode !== 'offline' && (
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
              <p>This ID is written into your signed credential. Never enter a private key, seed phrase, or legal name.</p>
              <button className="orange-button full" disabled={loading || !holder.trim() || !config?.available}>
                {loading ? 'OPENING…' : `JOIN AS WATCHER #${config ? String(config.minted + 1).padStart(4, '0') : '----'}`} <b>↗</b>
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
                  <p>Your numbered Watcher credential appears after settlement.</p>
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
        <span>THE BITCOIN Q-DAY DRILL</span>
        <span>{config ? `ISSUER ${compact(config.issuerFingerprint, 10, 10)}` : 'ISSUER —'}</span>
      </footer>
    </main>
  )
}
