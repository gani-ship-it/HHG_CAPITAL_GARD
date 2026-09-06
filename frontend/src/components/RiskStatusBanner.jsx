import React from "react";
import { usePortfolio } from "../state/portfolioStore";
import { calculateHealthScore, getRiskAssessment } from "../utils/riskHelpers";
import { ShieldAlert, ArrowRight, RotateCcw } from "lucide-react";

/**
 * RiskStatusBanner — only rendered when riskStatus === "BREACH".
 * High-contrast crimson strip with immediate rebalance CTA.
 * Monochrome design: color is ONLY used here as an exception (design system rule).
 */
export default function RiskStatusBanner() {
  const {
    isInitialized,
    portfolio,
    monitoringMetrics,
    setActiveTab,
    resetMarketShock
  } = usePortfolio();

  if (!isInitialized || !portfolio) return null;

  const assessment = getRiskAssessment(monitoringMetrics, portfolio);
  const rawCurrent = monitoringMetrics?.current_risk ?? portfolio.expected_risk ?? 0.081;
  const rawLimit   = monitoringMetrics?.risk_limit ?? portfolio.max_risk_limit ?? 0.07;
  const currentRisk = (rawCurrent * 100).toFixed(2);
  const riskLimit   = (rawLimit * 100).toFixed(2);
  const excessBps   = Math.max(1, Math.round((rawCurrent - rawLimit) * 10000));

  return (
    <div
      style={{
        padding: "10px 20px",
        borderBottom: "1px solid #D32F2F",
        background: "rgba(211,47,47,0.06)",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 16,
        flexShrink: 0,
        userSelect: "none"
      }}
    >
      {/* Left: Breach label + message */}
      <div style={{ display: "flex", alignItems: "center", gap: 12, minWidth: 0 }}>
        {/* Breach badge */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 5,
            padding: "3px 8px",
            borderRadius: 3,
            border: "1px solid #D32F2F",
            background: "#D32F2F",
            flexShrink: 0
          }}
        >
          <ShieldAlert style={{ width: 11, height: 11, color: "#FFFFFF" }} />
          <span
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: 9,
              fontWeight: 700,
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              color: "#FFFFFF"
            }}
          >
            RISK BREACH
          </span>
        </div>

        {/* Message */}
        <span style={{ fontSize: 12, color: "#111111" }}>
          Mandate limit exceeded: Volatility elevated to{" "}
          <strong style={{ fontFamily: "var(--font-mono)", color: "#D32F2F" }}>
            {currentRisk}%
          </strong>
          {" "}(Limit: <span style={{ fontFamily: "var(--font-mono)" }}>{riskLimit}%</span>,{" "}
          <span style={{ color: "#D32F2F", fontFamily: "var(--font-mono)", fontWeight: 600 }}>
            +{excessBps} bps
          </span>
          ). Immediate rebalance required.
        </span>
      </div>

      {/* Right: CTAs */}
      <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
        <button
          id="breach-rebalance-btn"
          onClick={() => setActiveTab("rebalance")}
          className="cg-btn-breach"
          style={{ fontSize: 12 }}
        >
          Open Rebalance Engine
          <ArrowRight style={{ width: 12, height: 12 }} />
        </button>
        <button
          id="breach-reset-btn"
          onClick={() => resetMarketShock?.()}
          className="cg-btn-secondary"
          style={{ fontSize: 12 }}
          title="Reset simulated shock to baseline"
        >
          <RotateCcw style={{ width: 12, height: 12 }} />
          Reset
        </button>
      </div>
    </div>
  );
}
