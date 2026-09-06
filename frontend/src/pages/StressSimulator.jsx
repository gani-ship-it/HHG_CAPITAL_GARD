import React, { useState } from "react";
import { usePortfolio } from "../state/portfolioStore";
import * as api from "../api";
import { formatCurrency } from "../utils/formatCurrency";
import { formatPercentage } from "../utils/formatPercentage";
import MetricCard from "../components/MetricCard";
import { Zap, ArrowRight, AlertOctagon } from "lucide-react";

const SCENARIOS = [
  {
    id: "market_crash",
    title: "2008 / Systemic Crash",
    badge: "Severe Equity Liquidation",
    description: "Equities −30%, Bullion +10%, Volatility ×1.5, credit spreads widen +180 bps.",
    riskLevel: "Critical"
  },
  {
    id: "rate_hike",
    title: "Aggressive Rate Hike Cycle",
    badge: "Central Bank Tightening",
    description: "Sovereign yields +250 bps, Bonds −8%, Equity −5%, Cash +1%, Volatility ×1.2.",
    riskLevel: "High"
  },
  {
    id: "inflation_spike",
    title: "Stagflation & Bullion Surge",
    badge: "Commodity Shock",
    description: "Gold +15%, Bonds −6%, Equity −3%, Real yields compress, Volatility ×1.3.",
    riskLevel: "Elevated"
  }
];

export default function StressSimulator() {
  const { portfolio, setActiveTab } = usePortfolio();
  const [selectedScenario, setSelectedScenario] = useState("market_crash");
  const [simResult, setSimResult]  = useState(null);
  const [simLoading, setSimLoading] = useState(false);
  const [error, setError]          = useState(null);

  if (!portfolio) {
    return (
      <div style={{ maxWidth: 600, margin: "80px auto", textAlign: "center", padding: "0 24px" }}>
        <h2 style={{ fontSize: 18, fontWeight: 700, color: "#111111", marginBottom: 10 }}>No Active Portfolio</h2>
        <button onClick={() => setActiveTab("setup")} className="cg-btn-primary">
          Go to Setup Wizard
          <ArrowRight style={{ width: 14, height: 14 }} />
        </button>
      </div>
    );
  }

  const handleRunStressTest = async () => {
    setSimLoading(true);
    setError(null);
    try {
      const res = await api.runStressTest({ portfolio_id: portfolio.id, scenario_key: selectedScenario });
      setSimResult(res.simulation_result);
    } catch (err) {
      setError(err.message || "Stress test simulation failed");
    } finally {
      setSimLoading(false);
    }
  };

  const isBreach = simResult?.shocked_portfolio?.is_breach;

  return (
    <div style={{ maxWidth: 1100, margin: "0 auto", padding: "32px 40px", display: "flex", flexDirection: "column", gap: 24, userSelect: "none" }}>

      {/* ── Header ── */}
      <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: 16, paddingBottom: 24, borderBottom: "1px solid #EAEAEA" }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <h1 style={{ fontSize: 22, fontWeight: 800, letterSpacing: "-0.02em", color: "#111111" }}>
              Macroeconomic Stress Simulator
            </h1>
            <span style={{ fontFamily: "var(--font-mono)", fontSize: 9, fontWeight: 700, letterSpacing: "0.08em", padding: "3px 7px", border: "1px solid #D4D4D4", borderRadius: 3, color: "#555555" }}>
              WHAT-IF SHOCK ENGINE
            </span>
          </div>
          <p style={{ fontSize: 12, color: "#666666", marginTop: 4 }}>
            Simulate extreme geopolitical, sovereign debt, and inflationary macro shocks against active portfolio weights.
          </p>
        </div>

        <button
          onClick={handleRunStressTest}
          disabled={simLoading}
          className="cg-btn-primary"
          style={{ fontSize: 12 }}
        >
          <Zap style={{ width: 13, height: 13 }} />
          {simLoading ? "Simulating…" : "Run Stress Test"}
        </button>
      </div>

      {/* ── Error ── */}
      {error && (
        <div style={{ padding: 12, borderRadius: 4, border: "1px solid #D32F2F", background: "rgba(211,47,47,0.05)", fontSize: 12, color: "#D32F2F" }}>
          <strong>Error:</strong> {error}
        </div>
      )}

      {/* ── Scenario Selection Cards ── */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12 }}>
        {SCENARIOS.map(sc => {
          const isSelected = selectedScenario === sc.id;
          return (
            <div
              key={sc.id}
              onClick={() => setSelectedScenario(sc.id)}
              style={{
                padding: 20,
                borderRadius: 4,
                border: `1px solid ${isSelected ? "#111111" : "#EAEAEA"}`,
                background: isSelected ? "#111111" : "#FFFFFF",
                cursor: "pointer",
                display: "flex",
                flexDirection: "column",
                gap: 8,
                transition: "all 0.12s ease"
              }}
            >
              <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 8 }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: isSelected ? "#FFFFFF" : "#111111", lineHeight: 1.3 }}>
                  {sc.title}
                </div>
                <span style={{
                  fontFamily: "var(--font-mono)", fontSize: 8, fontWeight: 700, letterSpacing: "0.06em",
                  padding: "2px 5px", borderRadius: 2, flexShrink: 0,
                  border: `1px solid ${isSelected ? "rgba(255,255,255,0.2)" : "#D32F2F"}`,
                  color: isSelected ? "#CCCCCC" : "#D32F2F",
                  background: isSelected ? "rgba(255,255,255,0.08)" : "rgba(211,47,47,0.06)"
                }}>
                  {sc.riskLevel}
                </span>
              </div>

              <div style={{ fontSize: 10, color: isSelected ? "#888888" : "#AAAAAA", letterSpacing: "0.04em", textTransform: "uppercase", fontFamily: "var(--font-mono)" }}>
                {sc.badge}
              </div>

              <p style={{ fontSize: 11, color: isSelected ? "#CCCCCC" : "#666666", lineHeight: 1.6 }}>
                {sc.description}
              </p>

              <div style={{ marginTop: 4, paddingTop: 8, borderTop: `1px solid ${isSelected ? "rgba(255,255,255,0.1)" : "#F0F0F0"}` }}>
                <span style={{ fontFamily: "var(--font-mono)", fontSize: 10, fontWeight: 600, color: isSelected ? "#FFFFFF" : "#AAAAAA" }}>
                  {isSelected ? "● Selected" : "Click to select"}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* ── Stress Results ── */}
      {simResult && (
        <div className="cg-card" style={{ padding: 24 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", paddingBottom: 14, marginBottom: 14, borderBottom: "1px solid #EAEAEA" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <AlertOctagon style={{ width: 16, height: 16, color: isBreach ? "#D32F2F" : "#111111" }} />
              <div className="cg-section-title">Stress Test Impact Projection</div>
            </div>
            <span style={{
              fontFamily: "var(--font-mono)",
              fontSize: 9,
              fontWeight: 700,
              letterSpacing: "0.08em",
              padding: "3px 8px",
              borderRadius: 3,
              border: `1px solid ${isBreach ? "#D32F2F" : "#D4D4D4"}`,
              color: isBreach ? "#D32F2F" : "#555555",
              background: isBreach ? "rgba(211,47,47,0.06)" : "#FAFAFA"
            }}>
              {isBreach ? "BREACH TRIGGERED" : "MANDATE SAFE"}
            </span>
          </div>

          {/* Metric cards */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12, marginBottom: 16 }}>
            <MetricCard
              title="Capital Drawdown"
              value={formatCurrency(simResult.shocked_portfolio?.capital_impact, portfolio.currency)}
              subtitle="Hypothetical immediate loss"
              delta="Tail Loss"
              deltaType="negative"
              status="danger"
            />
            <MetricCard
              title="Shocked Volatility"
              value={formatPercentage(simResult.shocked_portfolio?.portfolio_risk)}
              subtitle={`Baseline: ${formatPercentage(simResult.pre_shock?.portfolio_risk)}`}
              delta={isBreach ? `Exceeds ${(portfolio.max_risk_limit * 100).toFixed(1)}% limit` : "Within ceiling"}
              deltaType={isBreach ? "negative" : "positive"}
              status={isBreach ? "danger" : "neutral"}
            />
            <MetricCard
              title="Pre-Shock Volatility"
              value={formatPercentage(simResult.pre_shock?.portfolio_risk)}
              subtitle="Steady-state base"
              delta="Normal"
              deltaType="neutral"
              status="neutral"
            />
            <MetricCard
              title="Recommended Action"
              value={simResult.rebalance_preview?.decision || "REBALANCE"}
              subtitle={`Turnover: ${simResult.rebalance_preview?.turnover_percentage}%`}
              delta="Clarabel QP Solution"
              deltaType="positive"
              status="neutral"
            />
          </div>

          {/* Insights box */}
          <div style={{ padding: 14, borderRadius: 3, border: "1px solid #EAEAEA", background: "#FAFAFA", marginBottom: 16 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: "#111111", marginBottom: 6 }}>
              Stress Test Rationale &amp; Insights
            </div>
            <p style={{ fontSize: 12, color: "#666666", lineHeight: 1.65 }}>
              {simResult.rebalance_preview?.explanation ||
                "Simulated scenario demonstrates severe concentration risks. Immediate de-risking rebalance is advised to restore Basel III statutory capital adequacy."}
            </p>
          </div>

          {/* CTA */}
          <div style={{ display: "flex", justifyContent: "flex-end" }}>
            <button onClick={() => setActiveTab("rebalance")} className="cg-btn-primary" style={{ fontSize: 12 }}>
              Review Defensive Rebalance Proposal
              <ArrowRight style={{ width: 13, height: 13 }} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
