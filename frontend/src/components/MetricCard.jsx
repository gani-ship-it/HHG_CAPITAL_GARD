import React from "react";
import { Info } from "lucide-react";

export default function MetricCard({
  title,
  value,
  subtitle,
  status = "neutral",
  delta,
  deltaType = "neutral",
  icon: Icon,
  tooltip
}) {
  const isDanger = status === "danger";

  return (
    <div
      style={{
        borderRadius: 4,
        border: `1px solid ${isDanger ? "#D32F2F" : "#EAEAEA"}`,
        background: isDanger ? "rgba(211,47,47,0.03)" : "#FFFFFF",
        padding: 18,
        display: "flex",
        flexDirection: "column",
        gap: 8,
        transition: "border-color 0.15s ease"
      }}
    >
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          {Icon && <Icon style={{ width: 12, height: 12, color: isDanger ? "#D32F2F" : "#888888", flexShrink: 0 }} />}
          <span
            style={{
              fontSize: 10,
              fontWeight: 600,
              letterSpacing: "0.06em",
              textTransform: "uppercase",
              color: isDanger ? "#D32F2F" : "#888888"
            }}
          >
            {title}
          </span>
        </div>
        {tooltip && (
          <span title={tooltip} style={{ cursor: "help", color: "#CCCCCC" }}>
            <Info style={{ width: 11, height: 11 }} />
          </span>
        )}
      </div>

            <div
        style={{
          fontFamily: "var(--font-mono)",
          fontSize: 26,
          fontWeight: 300,
          letterSpacing: "-0.02em",
          color: isDanger ? "#D32F2F" : "#111111",
          lineHeight: 1
        }}
      >
        {value}
      </div>

            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", paddingTop: 8, borderTop: "1px solid #F0F0F0" }}>
        <span style={{ fontSize: 11, color: "#888888" }}>{subtitle}</span>
        {delta && (
          <span
            style={{
              fontSize: 9,
              fontFamily: "var(--font-mono)",
              fontWeight: 700,
              letterSpacing: "0.04em",
              padding: "2px 5px",
              borderRadius: 2,
              border: "1px solid",
              borderColor: deltaType === "negative" ? "#D32F2F" : "#D4D4D4",
              color: deltaType === "negative" ? "#D32F2F" : "#555555",
              background: deltaType === "negative" ? "rgba(211,47,47,0.06)" : "#F4F4F5",
              flexShrink: 0,
              marginLeft: 8
            }}
          >
            {delta}
          </span>
        )}
      </div>
    </div>
  );
}
