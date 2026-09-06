import React, { useState, useEffect } from "react";
import { usePortfolio } from "../state/portfolioStore";
import { formatPercentage, formatDelta } from "../utils/formatPercentage";
import { formatCurrency } from "../utils/formatCurrency";
import { CheckCircle2, Zap, Cpu, Scale, ArrowRight } from "lucide-react";

export default function RebalanceEngine() {
  const {
    portfolio,
    monitoringMetrics,
    riskStatus,
    rebalanceEval,
    rebalanceCostBps,
    setRebalanceCostBps,
    partialRatio,
    setPartialRatio,
    evaluateRebalanceAction,
    executeRebalanceAction,
    holdPortfolioAction,
    rebalanceExecuting,
    loading,
    setActiveTab
  } = usePortfolio();

  const [customRationale, setCustomRationale] = useState("");
  const [successMessage, setSuccessMessage] = useState(null);

  useEffect(() => {
    if (portfolio?.id && !rebalanceEval) {
      evaluateRebalanceAction(rebalanceCostBps, partialRatio);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [portfolio?.id, evaluateRebalanceAction]);

  if (!portfolio) {
    return (
      <div style={{ maxWidth: 600, margin: "80px auto", textAlign: "center", padding: "0 24px" }}>
        <h2 style={{ fontSize: 18, fontWeight: 700, color: "#111111", marginBottom: 10 }}>No Active Portfolio</h2>
        <button onClick={() => setActiveTab("setup")} className="cg-btn-primary">
          Initialize Portfolio First
          <ArrowRight style={{ width: 14, height: 14 }} />
        </button>
      </div>
    );
  }

  const isBreach         = riskStatus === "BREACH";
  const evalData         = rebalanceEval?.evaluation || rebalanceEval || {};
  const currentRisk      = monitoringMetrics?.current_risk ?? evalData.risk_current ?? portfolio.expected_risk ?? 0.081;
  const postRisk         = evalData.risk_target ?? evalData.post_risk ?? (portfolio.max_risk_limit ? portfolio.max_risk_limit * 0.92 : 0.0644);
  const riskRedBps       = Math.round((currentRisk - postRisk) * 10000);
  const targetWeights    = evalData.w_target || evalData.target_weights || {};
  const turnover         = evalData.turnover ?? 0.12;
  const txCostAmount     = evalData.transaction_cost ?? (turnover * portfolio.total_capital * (rebalanceCostBps / 10000));
  const isBeneficial     = riskRedBps > rebalanceCostBps;

  const handleExecute = async () => {
    try {
      await executeRebalanceAction(customRationale || "Basel III Risk De-risking via Clarabel QP");
      setSuccessMessage("Portfolio successfully de-risked. Allocations updated and logged to audit ledger.");
      setTimeout(() => { setSuccessMessage(null); setActiveTab("overview"); }, 2200);
    } catch (err) { console.error(err); }
  };

  const handleHold = async () => {
    try {
      await holdPortfolioAction(customRationale || "Tactical Hold: Transaction friction outweighs transient volatility spike.");
      setSuccessMessage("Hold decision logged to audit ledger. Portfolio allocations preserved.");
      setTimeout(() => { setSuccessMessage(null); setActiveTab("history"); }, 2200);
    } catch (err) { console.error(err); }
  };

  return (
    <div style={{ maxWidth: 1100, margin: "0 auto", padding: "32px 40px", display: "flex", flexDirection: "column", gap: 24 }}>

      {/* ── Header ── */}
      <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: 16, paddingBottom: 24, borderBottom: "1px solid #EAEAEA" }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <h1 style={{ fontSize: 22, fontWeight: 800, letterSpacing: "-0.02em", color: "#111111" }}>
              Algorithmic Rebalance Engine
            </h1>
            <span style={{ fontFamily: "var(--font-mono)", fontSize: 9, fontWeight: 700, letterSpacing: "0.08em", padding: "3px 7px", border: "1px solid #D4D4D4", borderRadius: 3, color: "#555555" }}>
              QP CONVEX DERISKING
            </span>
          </div>
          <p style={{ fontSize: 12, color: "#666666", marginTop: 4 }}>
            Cost-benefit optimization balancing execution friction, turnover slippage, and Basel III risk reduction.
          </p>
        </div>

        <button
          onClick={async () => {
            try {
              const res = await evaluateRebalanceAction(rebalanceCostBps, partialRatio);
              if (res) {
                setSuccessMessage("Tradeoff recalculated cleanly.");
                setTimeout(() => setSuccessMessage(""), 3000);
              }
            } catch (err) {
              console.error(err);
            }
          }}
          disabled={loading}
          className="cg-btn-secondary"
          style={{ fontSize: 12, cursor: "pointer" }}
        >
          <Cpu style={{ width: 13, height: 13, animation: loading ? "spin 1s linear infinite" : "none" }} />
          {loading ? "Recalculating…" : "Recalculate"}
        </button>
      </div>

      {/* ── Success Banner ── */}
      {successMessage && (
        <div style={{ padding: 16, borderRadius: 4, border: "1px solid #D4D4D4", background: "#FAFAFA", display: "flex", alignItems: "center", gap: 10 }}>
          <CheckCircle2 style={{ width: 18, height: 18, color: "#111111", flexShrink: 0 }} />
          <span style={{ fontSize: 13, color: "#111111" }}>{successMessage}</span>
        </div>
      )}

      {/* ── Parameter Controls ── */}
      <div className="cg-card" style={{ padding: 24, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 32 }}>
        {/* Cost bps slider */}
        <div>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10 }}>
            <span style={{ fontSize: 12, fontWeight: 500, color: "#111111" }}>Transaction Cost & Slippage</span>
            <span style={{ fontFamily: "var(--font-mono)", fontSize: 13, fontWeight: 700, color: "#111111" }}>
              {rebalanceCostBps} bps
            </span>
          </div>
          <input
            type="range"
            min="5" max="50" step="1"
            value={rebalanceCostBps}
            onChange={(e) => {
              const val = parseFloat(e.target.value);
              setRebalanceCostBps(val);
              evaluateRebalanceAction(val, partialRatio);
            }}
            style={{ width: "100%", accentColor: "#111111", cursor: "pointer" }}
          />
          <div style={{ display: "flex", justifyContent: "space-between", marginTop: 4 }}>
            {["5 bps (High Liq.)", "25 bps (Normal)", "50 bps (Stressed)"].map(l => (
              <span key={l} style={{ fontFamily: "var(--font-mono)", fontSize: 9, color: "#AAAAAA" }}>{l}</span>
            ))}
          </div>
        </div>

        {/* Partial ratio */}
        <div>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10 }}>
            <span style={{ fontSize: 12, fontWeight: 500, color: "#111111" }}>Partial Execution Ratio</span>
            <span style={{ fontFamily: "var(--font-mono)", fontSize: 13, fontWeight: 700, color: "#111111" }}>
              {(partialRatio * 100).toFixed(0)}% Target
            </span>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 6 }}>
            {[0.25, 0.50, 0.75, 1.0].map((ratio) => (
              <button
                key={ratio}
                onClick={() => { setPartialRatio(ratio); evaluateRebalanceAction(rebalanceCostBps, ratio); }}
                style={{
                  padding: "8px 4px",
                  borderRadius: 3,
                  border: `1px solid ${partialRatio === ratio ? "#111111" : "#EAEAEA"}`,
                  background: partialRatio === ratio ? "#111111" : "#FAFAFA",
                  color: partialRatio === ratio ? "#FFFFFF" : "#555555",
                  fontFamily: "var(--font-mono)",
                  fontSize: 11,
                  fontWeight: 600,
                  cursor: "pointer",
                  textAlign: "center"
                }}
              >
                {(ratio * 100).toFixed(0)}%
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── 4 Impact Stats ── */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12 }}>
        {[
          { label: "Current Risk (Stressed)", value: formatPercentage(currentRisk), sub: "Pre-rebalance", isDanger: isBreach },
          { label: "Post-Rebalance Risk", value: formatPercentage(postRisk), sub: `Ceiling: ${formatPercentage(portfolio.max_risk_limit || 0.07)}` },
          {
            label: "Risk Reduction",
            value: turnover < 0.001 ? "0 bps" : (riskRedBps >= 0 ? `+${riskRedBps} bps` : `${riskRedBps} bps`),
            sub: turnover < 0.001 ? "Already in equilibrium" : "Volatility reduction"
          },
          { label: "Friction Cost", value: formatCurrency(txCostAmount, portfolio.currency), sub: `${(turnover * 100).toFixed(1)}% Turnover @ ${rebalanceCostBps} bps` }
        ].map(card => (
          <div key={card.label} className="cg-card" style={{ padding: 18 }}>
            <div className="cg-label" style={{ marginBottom: 8 }}>{card.label}</div>
            <div style={{ fontFamily: "var(--font-mono)", fontSize: 24, fontWeight: 300, color: card.isDanger ? "#D32F2F" : "#111111", lineHeight: 1 }}>
              {card.value}
            </div>
            {card.sub && <div style={{ fontSize: 10, color: "#888888", marginTop: 6 }}>{card.sub}</div>}
          </div>
        ))}
      </div>

      {/* ── Recommendation Banner ── */}
      <div style={{
        padding: "14px 20px",
        borderRadius: 4,
        border: `1px solid ${turnover < 0.001 ? "#16A34A" : isBeneficial ? "#111111" : "#D32F2F"}`,
        background: turnover < 0.001 ? "rgba(22,163,74,0.04)" : isBeneficial ? "#FAFAFA" : "rgba(211,47,47,0.04)",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 12
      }}>
        <div>
          <div style={{ fontSize: 12, fontWeight: 700, color: "#111111", marginBottom: 2 }}>
            Quantitative Recommendation:{" "}
            <span style={{ color: turnover < 0.001 ? "#16A34A" : isBeneficial ? "#111111" : "#D32F2F" }}>
              {turnover < 0.001 ? "HOLD — PORTFOLIO IS IN EQUILIBRIUM" : isBeneficial ? "EXECUTE REBALANCE" : "TACTICAL HOLD — HIGH FRICTION"}
            </span>
          </div>
          <div style={{ fontSize: 11, color: "#666666" }}>
            {turnover < 0.001
              ? "Current portfolio allocations already match the optimal convex QP target. Turnover is 0.0%. No trade execution required."
              : isBeneficial
                ? `Risk reduction of ${riskRedBps} bps exceeds transaction friction of ${rebalanceCostBps} bps. Net value: +${riskRedBps - rebalanceCostBps} bps.`
                : `Risk reduction of ${riskRedBps} bps is less than transaction cost of ${rebalanceCostBps} bps. Net value: ${riskRedBps - rebalanceCostBps} bps.`}
          </div>
        </div>
      </div>

      {/* ── Allocation Comparison Table ── */}
      <div className="cg-card" style={{ padding: 24 }}>
        <div style={{ display: "flex", justifyContent: "space-between", paddingBottom: 14, marginBottom: 14, borderBottom: "1px solid #EAEAEA" }}>
          <div className="cg-section-title">Before vs. After Allocation</div>
          <span style={{ fontFamily: "var(--font-mono)", fontSize: 9, color: "#AAAAAA" }}>
            Net Capital: {formatCurrency(portfolio.total_capital, portfolio.currency)}
          </span>
        </div>

        {/* Table header */}
        <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr 1fr", padding: "0 8px 10px", borderBottom: "1px solid #111111" }}>
          {["Asset Class", "Current", "Target", "Δ Shift", "Trade Notional"].map((h, i) => (
            <div key={h} style={{
              fontFamily: "var(--font-mono)", fontSize: 9, fontWeight: 700, letterSpacing: "0.06em",
              textTransform: "uppercase", color: "#888888",
              textAlign: i === 0 ? "left" : "right"
            }}>{h}</div>
          ))}
        </div>

        {(() => {
          const rawAllocations = (portfolio.allocations && Object.keys(portfolio.allocations).length > 0)
            ? portfolio.allocations
            : (typeof portfolio.current_weights_json === 'string'
                ? JSON.parse(portfolio.current_weights_json || '{}')
                : (portfolio.current_weights_json || { GovBonds: 0, CorpBonds: 0, Equity: 0.3, Gold: 0.1673, Cash: 0.5327 }));

          return Object.entries(rawAllocations).map(([asset, currW]) => {
            const currentW  = Number(currW) || 0;
            const targetW   = Number(targetWeights[asset]) || currentW;
            const deltaW    = targetW - currentW;
            const tradeAmt  = Math.abs(deltaW) * portfolio.total_capital;
            const isBuy     = deltaW > 0.001;
            const isSell    = deltaW < -0.001;

            return (
              <div key={asset}
                style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr 1fr", padding: "10px 8px", borderBottom: "1px solid #F0F0F0", fontSize: 12, alignItems: "center" }}
                onMouseEnter={e => { e.currentTarget.style.background = "#F9F9F9"; }}
                onMouseLeave={e => { e.currentTarget.style.background = "transparent"; }}
              >
                <div style={{ fontWeight: 600, color: "#111111", display: "flex", alignItems: "center", gap: 6 }}>
                  <span>{asset}</span>
                  {isBuy && (
                    <span style={{ fontSize: 8, fontFamily: "var(--font-mono)", fontWeight: 700, padding: "1px 4px", borderRadius: 2, background: "#111111", color: "#FFFFFF" }}>
                      ↑ BUY
                    </span>
                  )}
                  {isSell && (
                    <span style={{ fontSize: 8, fontFamily: "var(--font-mono)", fontWeight: 700, padding: "1px 4px", borderRadius: 2, background: "#FAFAFA", color: "#D32F2F", border: "1px solid #D32F2F" }}>
                      ↓ SELL
                    </span>
                  )}
                  {!isBuy && !isSell && (
                    <span style={{ fontSize: 8, fontFamily: "var(--font-mono)", fontWeight: 600, padding: "1px 4px", borderRadius: 2, background: "#FAFAFA", color: "#888888", border: "1px solid #EAEAEA" }}>
                      • HOLD
                    </span>
                  )}
                </div>
                <div style={{ fontFamily: "var(--font-mono)", color: "#666666", textAlign: "right" }}>{formatPercentage(currentW)}</div>
                <div style={{ fontFamily: "var(--font-mono)", fontWeight: 600, color: "#111111", textAlign: "right" }}>{formatPercentage(targetW)}</div>
                <div style={{ fontFamily: "var(--font-mono)", fontWeight: 700, textAlign: "right", color: isBuy ? "#111111" : isSell ? "#D32F2F" : "#AAAAAA" }}>
                  {formatDelta(deltaW)}
                </div>
                <div style={{ fontFamily: "var(--font-mono)", textAlign: "right" }}>
                  {Math.abs(deltaW) > 0.001 ? (
                    <span style={{ fontWeight: 700, color: isBuy ? "#16A34A" : "#DC2626" }}>
                      {isBuy ? "+" : "-"}{formatCurrency(tradeAmt, portfolio.currency)}
                    </span>
                  ) : (
                    <span style={{ color: "#888888", fontSize: 11 }}>
                      {portfolio.currency === "INR" ? "₹0.00" : "$0.00"} (No Trade)
                    </span>
                  )}
                </div>
              </div>
            );
          });
        })()}
      </div>

      {/* ── Decision Box ── */}
      <div className="cg-card" style={{ padding: 24 }}>
        <div style={{ marginBottom: 14 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: "#111111" }}>Investment Committee Decision Rationale</div>
          <div style={{ fontSize: 11, color: "#666666", marginTop: 3 }}>
            Provide a mandatory rationale before committing this action to the institutional audit ledger.
          </div>
        </div>

        <input
          type="text"
          value={customRationale}
          onChange={(e) => setCustomRationale(e.target.value)}
          placeholder="e.g. Basel III Pillar II risk de-risking: Trimming equities into sovereign G-Secs…"
          style={{
            width: "100%",
            padding: "10px 14px",
            fontSize: 12,
            border: "1px solid #D4D4D4",
            borderRadius: 4,
            background: "#FAFAFA",
            color: "#111111",
            outline: "none",
            fontFamily: "var(--font-sans)",
            marginBottom: 16
          }}
          onFocus={e => { e.currentTarget.style.borderColor = "#111111"; }}
          onBlur={e => { e.currentTarget.style.borderColor = "#D4D4D4"; }}
        />

        <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: 10 }}>
          <button
            type="button"
            onClick={handleHold}
            disabled={rebalanceExecuting}
            className="cg-btn-secondary"
            style={{ fontSize: 12 }}
            title="Log formal risk acknowledgment without executing trades"
          >
            <Scale style={{ width: 13, height: 13 }} />
            Hold Portfolio (Acknowledge Risk)
          </button>

          <button
            type="button"
            onClick={handleExecute}
            disabled={rebalanceExecuting}
            className="cg-btn-primary"
            style={{ fontSize: 13 }}
          >
            <Zap style={{ width: 14, height: 14 }} />
            {rebalanceExecuting ? "Executing & Logging…" : "Execute Rebalance & Derisk"}
          </button>
        </div>
      </div>
    </div>
  );
}
