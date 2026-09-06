import React from "react";
import { usePortfolio } from "../state/portfolioStore";
import { formatPercentage } from "../utils/formatPercentage";
import { formatCurrency } from "../utils/formatCurrency";
import { calculateHealthScore, getRiskAssessment } from "../utils/riskHelpers";
import RiskChart from "../components/RiskChart";
import RealtimePnLTracker from "../components/RealtimePnLTracker";
import { ShieldAlert, Zap, RotateCcw, ArrowRight } from "lucide-react";

export default function RiskMonitoring() {
  const {
    portfolio,
    monitoringMetrics,
    riskStatus,
    triggerMarketShock,
    resetMarketShock,
    setActiveTab,
    loading,
    isLiveStreaming,
    setIsLiveStreaming,
    lastTickTime
  } = usePortfolio();

  if (!portfolio) {
    return (
      <div style={{ maxWidth: 600, margin: "80px auto", textAlign: "center", padding: "0 24px" }}>
        <h2 style={{ fontSize: 18, fontWeight: 700, color: "#111111", marginBottom: 10 }}>
          No Active Portfolio
        </h2>
        <p style={{ fontSize: 13, color: "#666666", marginBottom: 20 }}>
          Initialize a portfolio first via the Optimization Setup wizard.
        </p>
        <button onClick={() => setActiveTab("setup")} className="cg-btn-primary">
          Open Setup Wizard
          <ArrowRight style={{ width: 14, height: 14 }} />
        </button>
      </div>
    );
  }

  const isBreach    = riskStatus === "BREACH";
  const assessment  = getRiskAssessment(monitoringMetrics, portfolio);
  const healthScore = calculateHealthScore(portfolio, monitoringMetrics);
  const currentRisk = monitoringMetrics?.current_risk ?? portfolio.expected_risk ?? 0.048;
  const riskLimit   = monitoringMetrics?.risk_limit ?? portfolio.max_risk_limit ?? 0.07;
  const var95       = monitoringMetrics?.var_95 ?? (currentRisk * 0.58);
  const cvar95      = monitoringMetrics?.cvar_95 ?? (var95 * 1.25);
  const liqRatio    = monitoringMetrics?.liquidity_ratio ?? (portfolio.min_liquidity ? portfolio.min_liquidity / portfolio.total_capital : 0.20);

  const RiskStat = ({ label, value, subValue, isDanger, isNeutral }) => (
    <div className="cg-card" style={{ padding: 20 }}>
      <div className="cg-label" style={{ marginBottom: 8 }}>{label}</div>
      <div style={{
        fontFamily: "var(--font-mono)",
        fontSize: 26,
        fontWeight: 300,
        color: isDanger ? "#D32F2F" : "#111111",
        lineHeight: 1
      }}>
        {value}
      </div>
      {subValue && <div style={{ fontSize: 11, color: "#666666", marginTop: 6 }}>{subValue}</div>}
    </div>
  );

  return (
    <div style={{ maxWidth: 1100, margin: "0 auto", padding: "32px 40px", display: "flex", flexDirection: "column", gap: 24 }}>

            <div style={{
        display: "flex", flexWrap: "wrap", alignItems: "center",
        justifyContent: "space-between", gap: 16,
        paddingBottom: 24, borderBottom: "1px solid #EAEAEA"
      }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
            <h1 style={{ fontSize: 22, fontWeight: 800, letterSpacing: "-0.02em", color: "#111111" }}>
              Live Risk Telemetry
            </h1>
            <span style={{
              fontFamily: "var(--font-mono)",
              fontSize: 10,
              fontWeight: 700,
              letterSpacing: "0.08em",
              padding: "3px 8px",
              borderRadius: 3,
              border: "1px solid",
              borderColor: isBreach ? "#D32F2F" : "#D4D4D4",
              color: isBreach ? "#D32F2F" : "#666666",
              background: isBreach ? "rgba(211,47,47,0.06)" : "#FAFAFA"
            }}>
              {isBreach ? "MANDATE BREACH" : "MANDATE COMPLIANT"}
            </span>

                        <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                padding: "3px 8px",
                borderRadius: 12,
                background: isLiveStreaming ? "#F0FDF4" : "#F4F4F5",
                border: `1px solid ${isLiveStreaming ? "#BBF7D0" : "#E4E4E7"}`,
                fontSize: 10,
                fontFamily: "var(--font-mono)",
                color: isLiveStreaming ? "#15803D" : "#71717A"
              }}
            >
              <span
                style={{
                  width: 6,
                  height: 6,
                  borderRadius: "50%",
                  background: isLiveStreaming ? "#22C55E" : "#A1A1AA",
                  display: "inline-block"
                }}
              />
              <span>{isLiveStreaming ? `FEED ACTIVE · ${lastTickTime || "SYNCED"}` : "FEED PAUSED"}</span>
            </div>
          </div>
          <p style={{ fontSize: 12, color: "#666666", marginTop: 4 }}>
            Continuous intraday volatility drift, 95% Historical VaR tracking, and macroeconomic shock simulation.
          </p>
        </div>

                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <button
            onClick={() => setIsLiveStreaming(!isLiveStreaming)}
            className="cg-btn-secondary"
            style={{ fontSize: 11, padding: "6px 11px" }}
            title="Pause or resume live market drift stream"
          >
            {isLiveStreaming ? "Pause Stream" : "Resume Stream"}
          </button>

          {isBreach ? (
            <>
              <button onClick={() => resetMarketShock()} disabled={loading} className="cg-btn-secondary" style={{ fontSize: 12 }}>
                <RotateCcw style={{ width: 13, height: 13 }} />
                Reset Shock
              </button>
              <button onClick={() => setActiveTab("rebalance")} className="cg-btn-breach" style={{ fontSize: 12 }}>
                Rebalance Portfolio
                <ArrowRight style={{ width: 13, height: 13 }} />
              </button>
            </>
          ) : (
            <button
              onClick={() => triggerMarketShock(0.081)}
              disabled={loading}
              className="cg-btn-secondary"
              style={{ fontSize: 12, color: "#D32F2F", borderColor: "#D32F2F" }}
              title="Inject a macro yield spike pushing portfolio volatility to 8.10%"
            >
              <Zap style={{ width: 13, height: 13 }} />
              Simulate Market Shock (+110bps)
            </button>
          )}
        </div>
      </div>

            {isBreach && (
        <div style={{
          padding: 24,
          border: "1px solid #D32F2F",
          borderRadius: 4,
          background: "rgba(211,47,47,0.04)",
          display: "flex",
          flexDirection: "column",
          gap: 12
        }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <ShieldAlert style={{ width: 18, height: 18, color: "#D32F2F", flexShrink: 0 }} />
              <span style={{ fontSize: 14, fontWeight: 700, color: "#111111" }}>
                Basel III Pillar II Risk Mandate Limit Breached
              </span>
            </div>
            <span style={{
              fontFamily: "var(--font-mono)",
              fontSize: 10,
              fontWeight: 700,
              letterSpacing: "0.06em",
              padding: "3px 8px",
              border: "1px solid #D32F2F",
              borderRadius: 3,
              color: "#D32F2F"
            }}>
              +{assessment.excessBps} BPS OVERSHOOT
            </span>
          </div>

          <p style={{ fontSize: 12, color: "#555555", lineHeight: 1.65 }}>
            Market volatility shock has driven annualized portfolio risk to{" "}
            <strong style={{ fontFamily: "var(--font-mono)", color: "#D32F2F" }}>{formatPercentage(currentRisk)}</strong>,
            exceeding the statutory mandate ceiling of{" "}
            <strong style={{ fontFamily: "var(--font-mono)", color: "#111111" }}>{formatPercentage(riskLimit)}</strong>.
            This triggers an institutional de-risking requirement under your investment policy statement.
          </p>

          <div style={{
            display: "flex", alignItems: "center", justifyContent: "space-between",
            paddingTop: 14, borderTop: "1px solid rgba(211,47,47,0.2)"
          }}>
            <span style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "#D32F2F" }}>
              Recommended Action: Clarabel QP Convex Rebalance
            </span>
            <button onClick={() => setActiveTab("rebalance")} className="cg-btn-breach" style={{ fontSize: 12 }}>
              Evaluate Cost vs Risk Rebalance
              <ArrowRight style={{ width: 12, height: 12 }} />
            </button>
          </div>
        </div>
      )}

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 12 }}>
        <RiskStat
          label="Current Volatility"
          value={formatPercentage(currentRisk)}
          subValue={`Ceiling: ${formatPercentage(riskLimit)} · ${isBreach ? `+${assessment.excessBps} bps breach` : `${Math.round((riskLimit - currentRisk) * 10000)} bps buffer`}`}
          isDanger={isBreach}
        />
        <RiskStat
          label="Parametric VaR (95% 1-Day)"
          value={formatPercentage(var95)}
          subValue={formatCurrency(portfolio.total_capital * var95, portfolio.currency)}
        />
        <RiskStat
          label="Conditional VaR (CVaR 95%)"
          value={formatPercentage(cvar95)}
          subValue={`Expected Tail Loss · ${formatCurrency(portfolio.total_capital * cvar95, portfolio.currency)}`}
          isDanger={isBreach}
        />
        <RiskStat
          label="LCR Reserve Cushion"
          value={formatPercentage(liqRatio)}
          subValue="Tier 1 HQLA · Basel III 100%+ LCR"
        />
      </div>

            <RealtimePnLTracker />

            <div style={{ display: "grid", gridTemplateColumns: "5fr 7fr", gap: 16 }}>
                <div className="cg-card" style={{ padding: 24 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", paddingBottom: 14, marginBottom: 14, borderBottom: "1px solid #EAEAEA" }}>
            <div className="cg-section-title">Volatility Headroom Gauge</div>
            <span style={{ fontFamily: "var(--font-mono)", fontSize: 9, color: "#AAAAAA" }}>PILLAR II BUFFER</span>
          </div>
          <RiskChart
            currentRisk={currentRisk}
            riskLimit={riskLimit}
            var95={var95}
            liquidityRatio={liqRatio}
            minLiquidity={portfolio.min_liquidity ? portfolio.min_liquidity / portfolio.total_capital : 0.15}
          />
        </div>

                <div className="cg-card" style={{ padding: 24 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", paddingBottom: 14, marginBottom: 14, borderBottom: "1px solid #EAEAEA" }}>
            <div className="cg-section-title">Asset Marginal Risk Contribution</div>
            <span style={{ fontFamily: "var(--font-mono)", fontSize: 9, color: "#AAAAAA" }}>COVARIANCE DECOMP</span>
          </div>

                    <div style={{
            display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr",
            padding: "0 8px 8px",
            borderBottom: "1px solid #111111"
          }}>
            {["Asset Class", "Weight", "Volatility", "Risk Contrib"].map(h => (
              <div key={h} style={{ fontFamily: "var(--font-mono)", fontSize: 9, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", color: "#888888", textAlign: h === "Asset Class" ? "left" : "right" }}>
                {h}
              </div>
            ))}
          </div>

                    <div>
            {Object.entries(portfolio.allocations || {}).map(([asset, weight]) => {
              const w = Number(weight) || 0;
              const assetVol = asset === "Equity" ? 0.152 : asset === "Gold" ? 0.11 : asset === "CorpBonds" ? 0.048 : 0.021;
              const riskContrib = w * assetVol;
              const isHighRisk = asset === "Equity" || asset === "Gold";

              return (
                <div
                  key={asset}
                  style={{
                    display: "grid",
                    gridTemplateColumns: "2fr 1fr 1fr 1fr",
                    padding: "10px 8px",
                    borderBottom: "1px solid #F0F0F0",
                    fontSize: 12
                  }}
                  onMouseEnter={e => { e.currentTarget.style.background = "#F9F9F9"; }}
                  onMouseLeave={e => { e.currentTarget.style.background = "transparent"; }}
                >
                  <div style={{ fontWeight: 500, color: "#111111" }}>{asset}</div>
                  <div style={{ fontFamily: "var(--font-mono)", color: "#555555", textAlign: "right" }}>
                    {formatPercentage(w)}
                  </div>
                  <div style={{ fontFamily: "var(--font-mono)", color: "#888888", textAlign: "right" }}>
                    {formatPercentage(assetVol)}
                  </div>
                  <div style={{
                    fontFamily: "var(--font-mono)",
                    fontWeight: 600,
                    textAlign: "right",
                    color: isHighRisk ? "#C05500" : "#111111"
                  }}>
                    {formatPercentage(riskContrib)}
                  </div>
                </div>
              );
            })}
          </div>

                    <div style={{ marginTop: 16, display: "flex", justifyContent: "space-between", padding: "10px 8px", background: "#FAFAFA", borderRadius: 3, border: "1px solid #EAEAEA" }}>
            <span style={{ fontSize: 11, color: "#666666" }}>Portfolio Health Score</span>
            <span style={{
              fontFamily: "var(--font-mono)",
              fontSize: 12,
              fontWeight: 700,
              color: healthScore < 60 ? "#D32F2F" : healthScore < 80 ? "#C05500" : "#111111"
            }}>
              {healthScore}/100
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
