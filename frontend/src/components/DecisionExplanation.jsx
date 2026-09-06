import React, { useState } from "react";
import { ChevronDown, ChevronUp, Cpu, Shield, Scale, CheckCircle2 } from "lucide-react";

/**
 * DecisionExplanation — Collapsible card explaining the Clarabel QP solver's logic.
 * Monochrome design: white cards, black borders, no emerald/teal.
 */
export default function DecisionExplanation({
  objective = "Balanced Growth",
  optimizationData = {},
  constraints = {}
}) {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <div className="cg-card" style={{ overflow: "hidden" }}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={{
          width: "100%",
          padding: "14px 20px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          border: "none",
          background: "transparent",
          cursor: "pointer",
          textAlign: "left"
        }}
        onMouseEnter={e => { e.currentTarget.style.background = "#FAFAFA"; }}
        onMouseLeave={e => { e.currentTarget.style.background = "transparent"; }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <Cpu style={{ width: 14, height: 14, color: "#111111" }} />
          <span className="cg-section-title">Algorithmic Decision Rationale (Clarabel QP Solver)</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11, color: "#888888" }}>
          <span>{isOpen ? "Collapse" : "Explain Logic"}</span>
          {isOpen
            ? <ChevronUp style={{ width: 14, height: 14 }} />
            : <ChevronDown style={{ width: 14, height: 14 }} />
          }
        </div>
      </button>

      {isOpen && (
        <div style={{ padding: "0 20px 20px", borderTop: "1px solid #EAEAEA" }}>
          {/* QP Formula */}
          <p style={{ fontSize: 12, color: "#666666", lineHeight: 1.65, marginTop: 14, marginBottom: 16 }}>
            The target allocation is synthesized by minimizing portfolio variance{" "}
            <code style={{
              fontFamily: "var(--font-mono)",
              fontSize: 11,
              color: "#111111",
              background: "#F4F4F5",
              padding: "2px 6px",
              borderRadius: 3,
              border: "1px solid #E5E5E5"
            }}>
              min (1/2) xᵀΣx − λμᵀx
            </code>{" "}
            subject to Basel III statutory liquidity and regulatory asset ceilings using the interior-point Clarabel conic solver.
          </p>

          {/* Three pillars */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 12 }}>
            {[
              {
                icon: Shield,
                title: "Basel III HQLA Buffer",
                desc: "Maintains Level 1 sovereign G-Sec & TREPS to guarantee 100%+ Liquidity Coverage Ratio (LCR) under simulated 30-day run."
              },
              {
                icon: Scale,
                title: "Active Bound Multipliers",
                desc: "Equity capped at statutory ceiling (30%). Shadow prices indicate marginal risk penalty beyond 15% equity exposure."
              },
              {
                icon: CheckCircle2,
                title: "Convex Risk Parity",
                desc: "Bullion (Gold) provides non-correlated risk mitigation against bond yield spikes and currency depreciation shocks."
              }
            ].map(item => {
              const Icon = item.icon;
              return (
                <div
                  key={item.title}
                  style={{
                    padding: 14,
                    borderRadius: 3,
                    border: "1px solid #EAEAEA",
                    background: "#FAFAFA"
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 7 }}>
                    <Icon style={{ width: 12, height: 12, color: "#111111", flexShrink: 0 }} />
                    <span style={{ fontSize: 11, fontWeight: 700, color: "#111111" }}>{item.title}</span>
                  </div>
                  <p style={{ fontSize: 11, color: "#666666", lineHeight: 1.6 }}>{item.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
