import React from "react";
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from "recharts";
import { formatCurrency } from "../utils/formatCurrency";
import { formatPercentage } from "../utils/formatPercentage";

const ASSET_SHADES = {
  GovBonds: "#111111",  // darkest — largest/safest position
  CorpBonds: "#444444",
  Equity:   "#777777",
  Gold:     "#AAAAAA",
  Cash:     "#D4D4D4"   // lightest
};

const ASSET_METADATA = {
  GovBonds:  { label: "Sovereign 10Y G-Sec",    tier: "Level 1 HQLA" },
  CorpBonds: { label: "AAA Corporate Debt",      tier: "Level 2A HQLA" },
  Equity:    { label: "NIFTY 50 Large Cap",      tier: "Growth Asset" },
  Gold:      { label: "Sovereign Gold Bullion",  tier: "Reserve Hedge" },
  Cash:      { label: "TREPS & Liquid Cash",     tier: "Operational Cash" }
};

export default function AllocationChart({
  allocations = {},
  totalCapital = 1000000000,
  currency = "INR",
  showTable = true
}) {
  const chartData = Object.entries(allocations).map(([key, weight]) => {
    const rawVal = Number(weight) || 0;
    return {
      id: key,
      name: ASSET_METADATA[key]?.label || key,
      keyName: key,
      value: rawVal,
      amount: rawVal * totalCapital,
      color: ASSET_SHADES[key] || "#888888",
      tier: ASSET_METADATA[key]?.tier || "Standard"
    };
  });

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload?.length) {
      const d = payload[0].payload;
      return (
        <div style={{
          background: "#FFFFFF",
          border: "1px solid #EAEAEA",
          borderRadius: 4,
          padding: "10px 14px",
          fontSize: 11,
          boxShadow: "0 2px 8px rgba(0,0,0,0.08)"
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 6 }}>
            <span style={{ width: 8, height: 8, borderRadius: "50%", background: d.color, flexShrink: 0 }} />
            <span style={{ fontWeight: 700, color: "#111111" }}>{d.name}</span>
          </div>
          <div style={{ fontFamily: "var(--font-mono)", color: "#555555" }}>
            Weight: <strong style={{ color: "#111111" }}>{formatPercentage(d.value)}</strong>
          </div>
          <div style={{ fontFamily: "var(--font-mono)", color: "#555555" }}>
            Capital: <strong style={{ color: "#111111" }}>{formatCurrency(d.amount, currency)}</strong>
          </div>
          <div style={{ fontSize: 9, color: "#AAAAAA", marginTop: 4, letterSpacing: "0.06em", textTransform: "uppercase" }}>
            {d.tier}
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div style={{ display: "grid", gridTemplateColumns: "5fr 7fr", gap: 24, alignItems: "center" }}>
            <div style={{ height: 220, position: "relative", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Tooltip content={<CustomTooltip />} />
            <Pie
              data={chartData}
              innerRadius={68}
              outerRadius={90}
              paddingAngle={2}
              dataKey="value"
              stroke="#FFFFFF"
              strokeWidth={2}
            >
              {chartData.map((entry) => (
                <Cell key={`cell-${entry.id}`} fill={entry.color} />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>

                <div style={{
          position: "absolute", inset: 0,
          display: "flex", flexDirection: "column",
          alignItems: "center", justifyContent: "center",
          pointerEvents: "none", textAlign: "center"
        }}>
          <span style={{ fontSize: 9, fontFamily: "var(--font-mono)", letterSpacing: "0.1em", textTransform: "uppercase", color: "#AAAAAA" }}>
            TOTAL AUM
          </span>
          <span style={{ fontSize: 16, fontWeight: 700, fontFamily: "var(--font-mono)", color: "#111111", lineHeight: 1.2, marginTop: 2 }}>
            {formatCurrency(totalCapital, currency, 1)}
          </span>
          <span style={{ fontSize: 9, fontFamily: "var(--font-mono)", color: "#888888", letterSpacing: "0.06em", marginTop: 2 }}>
            100% ALLOCATED
          </span>
        </div>
      </div>

            {showTable && (
        <div>
                    <div style={{ display: "grid", gridTemplateColumns: "3fr 1fr 1fr", padding: "0 8px 8px", borderBottom: "1px solid #111111" }}>
            {["Asset Class", "Weight", "Capital"].map((h, i) => (
              <div key={h} style={{
                fontFamily: "var(--font-mono)", fontSize: 9, fontWeight: 700,
                letterSpacing: "0.06em", textTransform: "uppercase", color: "#888888",
                textAlign: i > 0 ? "right" : "left"
              }}>{h}</div>
            ))}
          </div>

                    {chartData.map((item) => {
            let actionBadge = { text: "• HOLD", bg: "#F4F4F5", color: "#555555" };
            if (item.keyName === "Equity" && item.value >= 0.30) {
              actionBadge = { text: "MAX CAP", bg: "#111111", color: "#FFFFFF" };
            } else if (item.keyName === "Cash" && item.value > 0.40) {
              actionBadge = { text: "↑ BUY", bg: "#111111", color: "#FFFFFF" };
            } else if (item.keyName === "Gold" && item.value > 0.15) {
              actionBadge = { text: "↓ SELL", bg: "#FAFAFA", color: "#555555" };
            } else if (item.value === 0) {
              actionBadge = { text: "UNALLOCATED", bg: "#FAFAFA", color: "#AAAAAA" };
            }

            return (
              <div
                key={item.id}
                style={{ display: "grid", gridTemplateColumns: "3fr 1fr 1fr", padding: "9px 8px", borderBottom: "1px solid #F0F0F0", alignItems: "center" }}
                onMouseEnter={e => { e.currentTarget.style.background = "#F9F9F9"; }}
                onMouseLeave={e => { e.currentTarget.style.background = "transparent"; }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 8, minWidth: 0 }}>
                  <span style={{ width: 8, height: 8, borderRadius: "50%", background: item.color, flexShrink: 0 }} />
                  <div style={{ minWidth: 0 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      <span style={{ fontSize: 12, fontWeight: 500, color: "#111111", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                        {item.name}
                      </span>
                      <span style={{
                        fontSize: 8,
                        fontFamily: "var(--font-mono)",
                        fontWeight: 700,
                        padding: "1px 4px",
                        borderRadius: 2,
                        background: actionBadge.bg,
                        color: actionBadge.color,
                        border: "1px solid #E4E4E7",
                        letterSpacing: "0.04em"
                      }}>
                        {actionBadge.text}
                      </span>
                    </div>
                    <div style={{ fontSize: 9, color: "#AAAAAA", letterSpacing: "0.04em", textTransform: "uppercase", marginTop: 2 }}>
                      {item.tier}
                    </div>
                  </div>
                </div>

                <div style={{ fontFamily: "var(--font-mono)", fontSize: 12, fontWeight: 600, color: "#111111", textAlign: "right" }}>
                  {formatPercentage(item.value)}
                </div>

                <div style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "#555555", textAlign: "right" }}>
                  {formatCurrency(item.amount, currency)}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
