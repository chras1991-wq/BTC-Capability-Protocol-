import { DocShell } from "@/components/DocShell";

export default function WhitepaperPage() {
  return (
    <DocShell title="Whitepaper Core">
      <p>
        This note captures the mathematical and economic core of ROOT. It is
        not a full academic whitepaper; it is the spine a formal paper and
        investor memo can expand.
      </p>

      <h2>1. Definitions</h2>
      <p>
        Let <code>U</code> be a UTXO with value <code>v</code> sats under
        owner public key <code>O</code>.
      </p>
      <p>
        A <strong>capability</strong> <code>C</code> is a tuple
      </p>
      <pre>{`C = (U, H, Π, [t0, t1], δ, ρ)`}</pre>
      <ul>
        <li>
          <code>H</code> — capability holder identity (key or script)
        </li>
        <li>
          <code>Π</code> — allowed policy: the set of authorized successor
          transactions / state transitions
        </li>
        <li>
          <code>[t0, t1]</code> — validity window
        </li>
        <li>
          <code>δ</code> — maximum drawdown (sats or bps of <code>v</code>)
        </li>
        <li>
          <code>ρ</code> — rent terms paid to <code>O</code>
        </li>
      </ul>
      <p>
        <strong>Safety invariant.</strong> For every complete execution path
        under <code>Π</code>, residual value controlled by <code>O</code> at
        or before <code>t1</code> satisfies:
      </p>
      <pre>{`v_residual ≥ v − δ − fees_authorized`}</pre>
      <p>
        Unauthorized transitions (including <code>send(v, H)</code>) are not
        in <code>Π</code> and cannot be completed without violating the
        enforcement layer.
      </p>

      <h2>2. Ownership vs capability</h2>
      <p>Define two claim bundles on the same coins:</p>
      <pre>{`Own(U)  = right to recover exclusive control after t1
         ∪ right to revoke unused caps per policy
Cap(U)  = right to execute Π within [t0, t1]`}</pre>
      <p>
        Classical Bitcoin conflates <code>Own</code> and <code>Cap</code> into
        a single private key. ROOT factors them.
      </p>

      <h2>3. Capability pricing</h2>
      <p>
        Let expected economic value of exercising <code>Π</code> over the
        window be <code>E[V_Π]</code>, and let the holder’s opportunity cost
        of locked attention/bonds be <code>κ</code>. A competitive rent
        satisfies:
      </p>
      <pre>{`ρ* ≈ f( E[V_Π], δ, σ, T, L )`}</pre>
      <ul>
        <li>
          <code>δ</code> — risk budget granted to the holder
        </li>
        <li>
          <code>σ</code> — underlying volatility / utilization uncertainty
        </li>
        <li>
          <code>T = t1 − t0</code> — tenor
        </li>
        <li>
          <code>L</code> — liquidity / scarcity of similar caps
        </li>
      </ul>
      <p>
        For collateral-style capabilities, a first-order analogy is a
        haircutted securities-lending fee. For liquidity capabilities, analogy
        is inventory rental / channel lease rates. ROOT does not fix
        <code>ρ*</code>—markets discover it.
      </p>

      <h2>4. Bitcoin Capability Rate (BCR)</h2>
      <p>
        For a segment <code>s</code> (e.g. Lightning liquidity, option
        capacity), define the annualized capability rate:
      </p>
      <pre>{`BCR_s = (1 / |C_s|) Σ_i (ρ_i / v_i) · (365 / T_i)`}</pre>
      <p>
        where the sum is over cleared leases in segment <code>s</code>. BCR is
        an observable index of BTC usage demand—not a protocol emission APY.
      </p>

      <h2>5. Capability AMM (sketch)</h2>
      <p>
        Homogeneous capabilities (same <code>Π</code> class, similar
        <code>δ</code>, standardized tenors) can be pooled. Let pool reserves
        be capability-notional <code>N</code> and rent-numeraire BTC
        <code>R</code>. A constant-product or concentrated curve prices
        marginal leases:
      </p>
      <pre>{`ρ_marginal = ΔR  s.t.  (N − ΔN)(R + ΔR) = k`}</pre>
      <p>
        Heterogeneous / bespoke capabilities clear via RFQ or auction;
        standardized strips clear via AMM. Secondary transfers of
        <code>C</code> trade the remaining window and residual
        <code>δ</code>.
      </p>

      <h2>6. Risk decomposition</h2>
      <ul>
        <li>
          <strong>Policy risk</strong> — bugs or underspecified <code>Π</code>
        </li>
        <li>
          <strong>Enforcer liveness</strong> — mitigated by owner CSV recovery
        </li>
        <li>
          <strong>Enforcer honesty (V1)</strong> — reduced via multiparty +
          bonds; largely replaced by challenge games in V2 / covenants in V3
        </li>
        <li>
          <strong>Market risk within δ</strong> — intentionally borne by owner
          as the leased risk budget
        </li>
        <li>
          <strong>Capability counterparty</strong> — holder may underperform
          economically but cannot exceed <code>δ</code> if enforcement holds
        </li>
      </ul>

      <h2>7. Settlement asset</h2>
      <p>
        All protocol fees and rents settle in BTC. Governance tokens—if
        ever introduced—follow proven product-market fit, not precede it.
      </p>

      <h2>8. Research agenda</h2>
      <ol>
        <li>Formal verification of V1 spend-graph compilers.</li>
        <li>Standard capability schemas (LN, MM, collateral, covered option).</li>
        <li>BitVMX wrappers for drawdown monitors.</li>
        <li>CCV / covenant encoding of ROOT vault state machines.</li>
        <li>BCR index methodology and oracle-free publication.</li>
      </ol>
    </DocShell>
  );
}
