import { FormEvent, useEffect, useMemo, useState } from 'react'
import { QRCodeSVG } from 'qrcode.react'
import { api, type MintConfig, type MintOrder, type SignedPass } from './api'
import { auditAddress, formatSats, type AuditResult } from './auditor'
import './sheet.css'

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

function Gauge({ score }: { score: number | null }) {
  const angle = score == null ? -6 : -118 + (score / 100) * 236
  const ticks = Array.from({ length: 21 }, (_, index) => -118 + index * 11.8)
  return (
    <svg className="gauge" viewBox="0 0 320 210" aria-hidden="true">
      <path d="M34 168 A126 126 0 0 1 286 168" fill="none" stroke="#1c1b18" strokeWidth="1.2" />
      {ticks.map((tick) => (
        <line key={tick} x1="160" y1="46" x2="160" y2={tick % 23.6 < 6 ? 58 : 53} stroke="#1c1b18" strokeWidth="1" transform={`rotate(${tick} 160 168)`} />
      ))}
      <g style={{ transform: `rotate(${angle}deg)`, transformOrigin: '160px 168px', transition: 'transform .7s cubic-bezier(.2,.7,.2,1)' }}>
        <line x1="160" y1="168" x2="160" y2="58" stroke="#c2410c" strokeWidth="1.6" />
      </g>
      <circle cx="160" cy="168" r="4.5" fill="#1c1b18" />
      <text x="42" y="188">0</text>
      <text x="154" y="34">50</text>
      <text x="268" y="188">100</text>
    </svg>
  )
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

  const taken = useMemo(() => (config ? config.minted + config.reserved : 0), [config])

  useEffect(() => {
    api.config().then(setConfig).catch(() => setError('The sheet could not reach the issuer.'))
    const id = new URLSearchParams(window.location.search).get('order')
    if (id) api.order(id).then(setOrder).catch(() => setError('This record is not on the sheet.'))
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
      setError(cause instanceof Error ? cause.message : 'The seat could not be reserved.')
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
      setScanError(cause instanceof Error ? cause.message : 'The chain reading failed.')
    } finally {
      setScanning(false)
    }
  }

  async function simulateSettlement() {
    if (!order) return
    setLoading(true)
    try {
      setOrder(await api.mockSettle(order.id))
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

  const verdict = !scanResult
    ? 'Waiting for an address.'
    : scanResult.exposure === 'shielded'
      ? 'The key is still behind its hash.'
      : scanResult.exposure === 'empty'
        ? 'Nothing remains to take.'
        : 'The public key is already visible.'

  return (
    <div className="sheet">
      <header className="mast">
        <a href="#">Hourglass</a>
        <nav>
          <a href="#reading">Reading</a>
          <a href="#work">Work</a>
          <a href="#seat">Seat</a>
        </nav>
        <span>Sheet 01 · 2026</span>
      </header>

      <section className="opening">
        <div>
          <p className="folio">A field reading for public Bitcoin keys</p>
          <h1>Test the coin before the key is useful to anyone else.</h1>
          <p>
            Paste a public address. Hourglass reads its script, spend history, and live balance,
            then sets the needle. The free reading stops there. A seat keeps the record, the watch,
            and a place in the exit drill.
          </p>
        </div>
        <Gauge score={scanResult?.score ?? null} />
      </section>

      <section className="reading" id="reading">
        <form onSubmit={runExposureTest}>
          <label htmlFor="scan-target">Public address</label>
          <div className="ruled">
            <input
              id="scan-target"
              value={scanTarget}
              onChange={(event) => setScanTarget(event.target.value)}
              placeholder="bc1… or 1…"
              spellCheck={false}
              autoComplete="off"
            />
            <button disabled={scanning || !scanTarget.trim()}>{scanning ? 'Reading' : 'Read'}</button>
          </div>
          <small>No private key. No signature. The address is sent to a public indexer.</small>
          {scanError && <p className="fault">{scanError}</p>}
        </form>

        <article className={scanResult ? 'stamped' : ''}>
          {scanResult && <b className="stamp">{scanResult.score}</b>}
          <h2>{verdict}</h2>
          {scanResult ? (
            <dl>
              <div><dt>Script</dt><dd>{scanResult.script.type}</dd></div>
              <div><dt>Key</dt><dd>{scanResult.publicKeyRevealed ? 'Revealed' : 'Hashed'}</dd></div>
              <div><dt>Balance</dt><dd>{formatSats(scanResult.balance)} sats</dd></div>
              <div><dt>Note</dt><dd>{scanResult.findings[0]}</dd></div>
            </dl>
          ) : (
            <p>The dial stays at rest until a real output is read.</p>
          )}
        </article>
      </section>

      <section className="work" id="work">
        <h2>What a seat actually does</h2>
        <dl>
          <div>
            <dt>Atlas</dt>
            <dd>Ten signed readings. Each one records the address, key state, balance, and the policy used to judge it.</dd>
          </div>
          <div>
            <dt>Canary</dt>
            <dd>Twelve months of notices when a public challenge, old coin, or exposure signal changes.</dd>
          </div>
          <div>
            <dt>Q-Seal</dt>
            <dd>A portable proof you can hand to a counterparty without asking them to trust the website.</dd>
          </div>
          <div>
            <dt>Dark Exit</dt>
            <dd>A numbered place in the encrypted-relay drills, ahead of open enrollment.</dd>
          </div>
        </dl>
      </section>

      <section className="seat" id="seat">
        <div>
          <h2>2,100 names on the first sheet.</h2>
          <p>
            {config ? number(config.priceSats) : '47,619'} sats once. The sheet closes at 99,999,900 sats.
            The payment buys the four items above. It does not buy a return, a share, or a promise that the seat will trade.
          </p>
          <p className="count">{String(taken).padStart(4, '0')} taken · {config ? String(config.available).padStart(4, '0') : '2100'} open</p>
        </div>

        <div className="form-card">
          {!order && config?.paymentMode === 'offline' && (
            <>
              <h3>Readings are open. Seats are not.</h3>
              <p>Bitcoin settlement is still being connected. The dial above already works.</p>
              <a href="#reading">Make a reading</a>
            </>
          )}
          {!order && config?.paymentMode !== 'offline' && (
            <form onSubmit={activate}>
              <label htmlFor="holder">Name on the credential</label>
              <input id="holder" value={holder} onChange={(event) => setHolder(event.target.value)} placeholder="A public name or address" spellCheck={false} autoComplete="off" />
              <button disabled={loading || !holder.trim() || !config?.available}>{loading ? 'Holding' : 'Reserve the next seat'}</button>
            </form>
          )}
          {order?.status === 'pending' && (
            <div className="pay">
              <QRCodeSVG value={order.checkoutUrl ?? window.location.href} size={132} bgColor="#f7f4ee" fgColor="#1c1b18" />
              <div>
                <strong>{number(config?.priceSats ?? 47_619)} sats</strong>
                <p>The credential is written after the payment settles.</p>
                {config?.paymentMode === 'btcpay'
                  ? <a href={order.checkoutUrl ?? '#'} target="_blank" rel="noreferrer">Pay</a>
                  : <button onClick={simulateSettlement} disabled={loading}>Mark paid in development</button>}
                <button className="quiet" onClick={reset}>Release</button>
              </div>
            </div>
          )}
          {order?.status === 'expired' && <button onClick={reset}>Start again</button>}
          {order?.status === 'paid' && order.credential && (
            <div>
              <h3>Seat {String(order.serial).padStart(4, '0')}</h3>
              <dl>
                <div><dt>Name</dt><dd>{compact(order.holder, 18, 10)}</dd></div>
                <div><dt>Proof</dt><dd>{verified === true ? 'Valid' : verified === false ? 'Rejected' : 'Not checked'}</dd></div>
              </dl>
              <div className="pair">
                <button onClick={() => downloadCredential(order.credential!)}>Download</button>
                <button className="quiet" onClick={verifyCredential}>Check signature</button>
              </div>
            </div>
          )}
          {error && <p className="fault">{error}</p>}
        </div>
      </section>

      <footer>
        <span>Hourglass</span>
        <span>Public-key exposure sheet</span>
        <span>{config ? compact(config.issuerFingerprint, 8, 8) : 'Key pending'}</span>
      </footer>
    </div>
  )
}
