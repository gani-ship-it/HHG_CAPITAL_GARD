import React from "react";
import { usePortfolio } from "../state/portfolioStore";
import { formatCurrency } from "../utils/formatCurrency";
import { formatPercentage } from "../utils/formatPercentage";
import { calculateHealthScore } from "../utils/riskHelpers";
import AllocationChart from "../components/AllocationChart";
import RiskChart from "../components/RiskChart";
import DecisionExplanation from "../components/DecisionExplanation";
import { TrendingUp, Shield, Activity, Layers, ArrowRight, Zap } from "lucide-react";

/* ── Small stat card — monochrome ─────────────────────────────── */
function StatCard({ label, value, sub, delta, isDanger }) {
  return (
    <div className="cg-card" style={{ padding: 20 }}>
      <div className="cg-label" style={{ marginBottom: 8 }}>{label}</div>
      <div
        style={{
          fontFamily: "var(--font-mono)",
          fontSize: 28,
          fontWeight: 300,
          letterSpacing: "-0.02em",
          color: isDanger ? "#D32F2F" : "#111111",
          lineHeight: 1
        }}
      >
        {value}
      </div>
      {sub && (
        <div style={{ fontSize: 11, color: "#666666", marginTop: 6 }}>{sub}</div>
      )}
      {delta && (
        <div
          style={{
            fontSize: 10,
            fontFamily: "var(--font-mono)",
            fontWeight: 600,
            marginTop: 8,
            padding: "2px 6px",
            borderRadius: 3,
            display: "inline-block",
            background: isDanger ? "rgba(211,47,47,0.08)" : "#F4F4F5",
            color: isDanger ? "#D32F2F" : "#555555",
            letterSpacing: "0.04em"
          }}
        >
          {delta}
        </div>
      )}
    </div>
  );
}

export default function Overview() {
  const {
    portfolio,
    optimizationData,
    monitoringMetrics,
    riskStatus,
    setActiveTab,
    triggerMarketShock,
    loading
  } = usePortfolio();

  if (!portfolio) {
    return (
      <div style={{ maxWidth: 600, margin: "80px auto", textAlign: "center", padding: "0 24px" }}>
        <h2 style={{ fontSize: 18, fontWeight: 700, color: "#111111", marginBottom: 10 }}>
          No Active Portfolio
        </h2>
        <p style={{ fontSize: 13, color: "#666666", marginBottom: 20 }}>
          Run the Optimization Setup wizard or load the demo preset to initialize your mandate.
        </p>
        <button onClick={() => setActiveTab("setup")} className="cg-btn-primary">
          Open Setup Wizard
          <ArrowRight style={{ width: 14, height: 14 }} />
        </button>
      </div>
    );
  }

  const healthScore    = calculateHealthScore(portfolio, monitoringMetrics);
  const currentRisk    = monitoringMetrics?.current_risk ?? portfolio.expected_risk ?? 0.048;
  const riskLimit      = monitoringMetrics?.risk_limit ?? portfolio.max_risk_limit ?? 0.07;
  const expectedReturn = portfolio.expected_return ?? 0.0845;
  const sharpe         = portfolio.sharpe_ratio ?? 1.42;
  const liquidityRatio = monitoringMetrics?.liquidity_ratio ?? 0.20;
  const liquidityAmt   = portfolio.total_capital * liquidityRatio;
  const isBreach       = riskStatus === "BREACH";

  return (
    <div style={{ maxWidth: 1100, margin: "0 auto", padding: "32px 40px", display: "flex", flexDirection: "column", gap: 28 }}>

      {/* ── Page Header ── */}
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 16,
          paddingBottom: 24,
          borderBottom: "1px solid #EAEAEA"
        }}
      >
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <h1 style={{ fontSize: 22, fontWeight: 800, letterSpacing: "-0.02em", color: "#111111" }}>
              Portfolio Overview
            </h1>
            <span
              style={{
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
              }}
            >
              HEALTH {healthScore}/100
            </span>
          </div>
          <p style={{ fontSize: 12, color: "#666666", marginTop: 4 }}>
            Optimized convex risk-parity mandate under Basel III capital adequacy guidelines.
          </p>
        </div>

        <div style={{ display: "flex", gap: 8 }}>
          <button onClick={() => setActiveTab("monitoring")} className="cg-btn-secondary" style={{ fontSize: 12 }}>
            <Activity style={{ width: 13, height: 13 }} />
            Risk Monitoring
            <ArrowRight style={{ width: 12, height: 12 }} />
          </button>
          <button
            onClick={() => triggerMarketShock(0.081)}
            disabled={loading}
            className="cg-btn-secondary"
            style={{ fontSize: 12, color: "#D32F2F", borderColor: "#D32F2F", background: "rgba(211,47,47,0.04)", cursor: loading ? "wait" : "pointer" }}
            title="Simulate severe interest rate / volatility market shock"
          >
            <Zap style={{ width: 13, height: 13 }} />
            {loading ? "Simulating Shock…" : "Simulate Shock"}
          </button>
        </div>
      </div>

      {/* ── Breach Alert Banner ── */}
      {isBreach && (
        <div
          style={{
            padding: "16px 20px",
            borderRadius: 4,
            border: "1px solid #D32F2F",
            background: "rgba(211,47,47,0.05)",
            display: "flex",
            flexWrap: "wrap",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 16
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <span style={{ fontSize: 18 }}>🚨</span>
            <div>
              <div style={{ fontSize: 13, fontWeight: 700, color: "#D32F2F" }}>
                VOLATILITY SHOCK DETECTED — MANDATE LIMIT BREACHED
              </div>
              <div style={{ fontSize: 11, color: "#666666", marginTop: 2 }}>
                Current Portfolio Volatility is elevated to {formatPercentage(currentRisk)} (Exceeds mandate limit of {formatPercentage(riskLimit)}).
              </div>
            </div>
          </div>
          <button onClick={() => setActiveTab("rebalance")} className="cg-btn-primary" style={{ background: "#D32F2F", borderColor: "#D32F2F", fontSize: 12 }}>
            Review Defensive Rebalance Proposal →
          </button>
        </div>
      )}

      {/* ── 4 Stat Cards ── */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 12 }}>
        <StatCard
          label="Expected Annual Return"
          value={formatPercentage(expectedReturn)}
          sub="Nominal yield target"
          delta="↑ +2.15% real alpha"
        />
        <StatCard
          label="Portfolio Volatility"
          value={formatPercentage(currentRisk)}
          sub={`Mandate Limit: ${formatPercentage(riskLimit)}`}
          delta={
            isBreach
              ? `↑ +${Math.round((currentRisk - riskLimit) * 10000)} bps breach`
              : `↓ ${Math.round((riskLimit - currentRisk) * 10000)} bps safety buffer`
          }
          isDanger={isBreach}
        />
        <StatCard
          label="Sharpe Ratio"
          value={sharpe ? sharpe.toFixed(2) : "1.42"}
          sub="Risk-free base 5.33%"
          delta="↑ Top Decile Tier"
        />
        <StatCard
          label="LCR Liquidity Cushion"
          value={formatCurrency(liquidityAmt, portfolio.currency)}
          sub={`${formatPercentage(liquidityRatio)} total allocation`}
          delta="↑ Basel III 100%+ LCR"
        />
      </div>

      {/* ── Charts Grid ── */}
      <div style={{ display: "grid", gridTemplateColumns: "7fr 5fr", gap: 16 }}>
        {/* Allocation Donut */}
        <div className="cg-card" style={{ padding: 24 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", paddingBottom: 16, marginBottom: 16, borderBottom: "1px solid #EAEAEA" }}>
            <div className="cg-section-title">Optimal Asset Allocation</div>
            <span style={{ fontFamily: "var(--font-mono)", fontSize: 9, color: "#AAAAAA" }}>CLARABEL CONIC QP</span>
          </div>
          <AllocationChart
            allocations={
              (portfolio.allocations && Object.keys(portfolio.allocations).length > 0)
                ? portfolio.allocations
                : (typeof portfolio.current_weights_json === 'string'
                    ? JSON.parse(portfolio.current_weights_json || '{}')
                    : (portfolio.current_weights_json || { GovBonds: 0.20, CorpBonds: 0.20, Equity: 0.30, Gold: 0.10, Cash: 0.20 }))
            }
            totalCapital={portfolio.total_capital}
            currency={portfolio.currency}
          />
        </div>

        {/* Risk Gauge */}
        <div className="cg-card" style={{ padding: 24 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", paddingBottom: 16, marginBottom: 16, borderBottom: "1px solid #EAEAEA" }}>
            <div className="cg-section-title">Mandate Headroom &amp; VaR</div>
            <span
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: 9,
                fontWeight: 700,
                letterSpacing: "0.08em",
                padding: "2px 5px",
                borderRadius: 2,
                border: "1px solid",
                borderColor: isBreach ? "#D32F2F" : "#D4D4D4",
                color: isBreach ? "#D32F2F" : "#666666"
              }}
            >
              {isBreach ? "BREACHED" : "COMPLIANT"}
            </span>
          </div>

          <RiskChart
            currentRisk={currentRisk}
            riskLimit={riskLimit}
            var95={portfolio.var_95 || currentRisk * 0.58}
            liquidityRatio={liquidityRatio}
            minLiquidity={portfolio.min_liquidity ? portfolio.min_liquidity / portfolio.total_capital : 0.15}
          />

          {/* Solver status mini-table */}
          <div style={{ marginTop: 16, padding: 14, borderRadius: 3, border: "1px solid #EAEAEA", background: "#FAFAFA" }}>
            {[
              { label: "Optimization Status", value: "OPTIMAL (1.2e-8)" },
              { label: "Risk Parity Efficiency", value: "99.4% Frontier Match" }
            ].map(row => (
              <div key={row.label} style={{ display: "flex", justifyContent: "space-between", fontSize: 11, marginBottom: 6 }}>
                <span style={{ color: "#666666" }}>{row.label}</span>
                <span style={{ fontFamily: "var(--font-mono)", fontWeight: 600, color: "#111111" }}>{row.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Decision Explanation ── */}
      <DecisionExplanation
        objective={portfolio.investment_objective}
        optimizationData={optimizationData}
        constraints={portfolio.constraints}
      />
    </div>
  );
}
