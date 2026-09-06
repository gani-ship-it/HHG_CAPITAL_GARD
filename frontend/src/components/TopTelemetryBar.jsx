import React from "react";
import { usePortfolio } from "../state/portfolioStore";
import { TrendingDown, TrendingUp, Sparkles, UserCircle } from "lucide-react";

export default function TopTelemetryBar() {
  const {
    macroIndicators,
    loading,
    setIsCopilotOpen,
    setIsAuthModalOpen,
    currentUser
  } = usePortfolio();

  const fred = macroIndicators?.indicators || {};
  const yield10Y  = fred.treasury_10y?.value  ? `${fred.treasury_10y.value.toFixed(2)}%`  : "4.22%";
  const fedFunds  = fred.fed_funds?.value      ? `${fred.fed_funds.value.toFixed(2)}%`      : "5.33%";
  const spread    = fred.spread_2_10?.value    ? fred.spread_2_10.value.toFixed(2)          : "-0.42";
  const cpi       = fred.cpi_inflation?.value  ? `${fred.cpi_inflation.value.toFixed(2)}%`  : "3.10%";
  const spreadNeg = parseFloat(spread) < 0;

  return (
    <header
      style={{
        height: 40,
        background: "#FFFFFF",
        borderBottom: "1px solid #EAEAEA",
        padding: "0 20px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        flexShrink: 0,
        userSelect: "none",
        zIndex: 10
      }}
    >
      {/* ── Left: Engine Status + FRED Macro Ticker ── */}
      <div style={{ display: "flex", alignItems: "center", gap: 16, overflow: "hidden" }}>
        {/* Engine Status Pill */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            paddingRight: 16,
            borderRight: "1px solid #EAEAEA",
            flexShrink: 0
          }}
        >
          <span
            style={{
              width: 6,
              height: 6,
              borderRadius: "50%",
              background: "#111111",
              flexShrink: 0
            }}
          />
          <span
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: 10,
              fontWeight: 700,
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              color: "#111111"
            }}
          >
            CLARABEL QP
          </span>
          <span
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: 9,
              fontWeight: 600,
              letterSpacing: "0.08em",
              padding: "2px 5px",
              border: "1px solid #D4D4D4",
              borderRadius: 2,
              color: "#666666"
            }}
          >
            ACTIVE
          </span>
        </div>

        {/* FRED Macro Pills */}
        <div style={{ display: "flex", alignItems: "center", gap: 8, overflow: "hidden" }}>
          <MacroPill label="US 10Y" value={yield10Y} />
          <MacroPill label="FED FUNDS" value={fedFunds} />
          <MacroPill
            label="2Y–10Y"
            value={`${spread}%`}
            negative={spreadNeg}
            icon={spreadNeg ? <TrendingDown style={{ width: 10, height: 10 }} /> : <TrendingUp style={{ width: 10, height: 10 }} />}
          />
          <MacroPill label="CPI" value={cpi} />
        </div>
      </div>

      {/* ── Right: Auth + AI Copilot ── */}
      <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
        {/* AI Copilot trigger */}
        <button
          id="topbar-copilot-btn"
          onClick={() => setIsCopilotOpen(true)}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            padding: "5px 10px",
            borderRadius: 4,
            border: "1px solid #D4D4D4",
            background: "transparent",
            cursor: "pointer",
            transition: "border-color 0.12s ease"
          }}
          onMouseEnter={e => { e.currentTarget.style.borderColor = "#111111"; }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = "#D4D4D4"; }}
        >
          <Sparkles style={{ width: 12, height: 12, color: "#111111" }} />
          <span style={{ fontSize: 11, fontWeight: 500, color: "#111111" }}>AI Copilot</span>
        </button>

        {/* Auth: show "Sign In" or user initials */}
        <button
          id="topbar-auth-btn"
          onClick={() => setIsAuthModalOpen(true)}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            padding: "5px 10px",
            borderRadius: 4,
            border: "1px solid #111111",
            background: currentUser ? "#111111" : "transparent",
            cursor: "pointer",
            transition: "background 0.12s ease"
          }}
          onMouseEnter={e => {
            if (!currentUser) e.currentTarget.style.background = "#F4F4F5";
          }}
          onMouseLeave={e => {
            if (!currentUser) e.currentTarget.style.background = "transparent";
          }}
        >
          <UserCircle style={{ width: 12, height: 12, color: currentUser ? "#FFFFFF" : "#111111" }} />
          <span style={{ fontSize: 11, fontWeight: 600, color: currentUser ? "#FFFFFF" : "#111111" }}>
            {currentUser?.user_metadata?.full_name?.split(" ")[0] || "Sign In"}
          </span>
        </button>
      </div>
    </header>
  );
}

/* Small reusable macro data pill */
function MacroPill({ label, value, negative, icon }) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 4,
        padding: "3px 8px",
        borderRadius: 3,
        border: "1px solid #EAEAEA",
        background: "#FAFAFA",
        flexShrink: 0
      }}
    >
      <span
        style={{
          fontFamily: "var(--font-mono)",
          fontSize: 9,
          fontWeight: 500,
          letterSpacing: "0.06em",
          textTransform: "uppercase",
          color: "#AAAAAA"
        }}
      >
        {label}
      </span>
      <div style={{ display: "flex", alignItems: "center", gap: 2, color: negative ? "#C05500" : "#111111" }}>
        {icon}
        <span style={{ fontFamily: "var(--font-mono)", fontSize: 10, fontWeight: 600, color: negative ? "#C05500" : "#111111" }}>
          {value}
        </span>
      </div>
    </div>
  );
}
