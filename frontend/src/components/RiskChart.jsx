import React from "react";
import { formatPercentage } from "../utils/formatPercentage";
import { Shield } from "lucide-react";

export default function RiskChart({
  currentRisk  = 0.048,
  riskLimit    = 0.070,
  var95        = 0.028,
  liquidityRatio = 0.20,
  minLiquidity = 0.15
}) {
  const isBreached      = currentRisk > riskLimit;
  const riskPct         = currentRisk * 100;
  const limitPct        = riskLimit * 100;
  const maxScale        = limitPct * 1.4;
  const riskFillWidth   = Math.min(100, (riskPct / maxScale) * 100);
  const limitMarkerPos  = (limitPct / maxScale) * 100;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20, userSelect: "none" }}>

            <div>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <Shield style={{ width: 13, height: 13, color: "#888888" }} />
            <span style={{ fontSize: 11, fontWeight: 500, color: "#555555" }}>
              Volatility vs Mandate Ceiling
            </span>
          </div>
          <div style={{ fontFamily: "var(--font-mono)", fontSize: 12 }}>
            <span style={{ fontWeight: 700, color: isBreached ? "#D32F2F" : "#111111" }}>
              {formatPercentage(currentRisk)}
            </span>
            <span style={{ color: "#AAAAAA" }}> / {formatPercentage(riskLimit)}</span>
          </div>
        </div>

                <div style={{
          height: 10,
          background: "#F0F0F0",
          borderRadius: 999,
          position: "relative",
          overflow: "visible",
          border: "1px solid #EAEAEA"
        }}>
                    <div style={{
            height: "100%",
            borderRadius: 999,
            width: `${riskFillWidth}%`,
            background: isBreached ? "#D32F2F" : "#111111",
            transition: "width 0.4s ease, background 0.3s ease"
          }} />

                    <div style={{
            position: "absolute",
            top: -3,
            bottom: -3,
            width: 2,
            background: "#888888",
            left: `${limitMarkerPos}%`,
            zIndex: 1
          }} title={`Mandate Ceiling: ${formatPercentage(riskLimit)}`} />
        </div>

        <div style={{ display: "flex", justifyContent: "space-between", marginTop: 5 }}>
          <span style={{ fontFamily: "var(--font-mono)", fontSize: 9, color: "#AAAAAA" }}>0.0%</span>
          <span style={{ fontFamily: "var(--font-mono)", fontSize: 9, fontWeight: 600, color: "#555555" }}>
            Ceiling: {formatPercentage(riskLimit)}
          </span>
          <span style={{ fontFamily: "var(--font-mono)", fontSize: 9, color: "#AAAAAA" }}>
            {(riskLimit * 1.4 * 100).toFixed(1)}% (Stress Max)
          </span>
        </div>
      </div>

            <div>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
          <span style={{ fontSize: 11, fontWeight: 500, color: "#555555" }}>LCR Liquidity Cushion</span>
          <div style={{ fontFamily: "var(--font-mono)", fontSize: 12 }}>
            <span style={{ fontWeight: 700, color: "#111111" }}>{formatPercentage(liquidityRatio)}</span>
            <span style={{ color: "#AAAAAA" }}> / Min: {formatPercentage(minLiquidity)}</span>
          </div>
        </div>

        <div style={{
          height: 8,
          background: "#F0F0F0",
          borderRadius: 999,
          overflow: "hidden",
          border: "1px solid #EAEAEA"
        }}>
          <div style={{
            height: "100%",
            borderRadius: 999,
            width: `${Math.min(100, (liquidityRatio / 0.4) * 100)}%`,
            background: "#444444",
            transition: "width 0.4s ease"
          }} />
        </div>
      </div>

            <div style={{
        padding: "10px 14px",
        borderRadius: 3,
        border: "1px solid #EAEAEA",
        background: "#FAFAFA",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between"
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#888888", flexShrink: 0 }} />
          <span style={{ fontSize: 11, color: "#666666" }}>Parametric VaR (95% 1-Day):</span>
        </div>
        <span style={{ fontFamily: "var(--font-mono)", fontSize: 12, fontWeight: 700, color: "#111111" }}>
          {formatPercentage(var95)}
        </span>
      </div>
    </div>
  );
}
