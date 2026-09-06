import React, { useState } from "react";
import { usePortfolio } from "../state/portfolioStore";
import { formatCurrency } from "../utils/formatCurrency";
import { formatPercentage } from "../utils/formatPercentage";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  ScatterChart,
  Scatter,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
  Cell,
  ZAxis
} from "recharts";
import {
  TrendingUp,
  TrendingDown,
  BarChart3,
  ScatterChart as ScatterIcon,
  Activity,
  DollarSign,
  ArrowUpRight,
  ArrowDownRight,
  ShieldCheck
} from "lucide-react";

export default function RealtimePnLTracker() {
  const { portfolio, realtimePnL, isLiveStreaming, lastTickTime } = usePortfolio();
  const [chartMode, setChartMode] = useState("bar"); // "bar" | "scatter" | "timeline"

  if (!portfolio) return null;

  const pnl = realtimePnL || {
    sessionPnlAmount: 0,
    sessionPnlPercent: 0,
    sessionHigh: 0,
    sessionLow: 0,
    assetBreakdown: [],
    history: []
  };

  const isPositive = pnl.sessionPnlAmount >= 0;
  const totalCapital = portfolio.total_capital || 1000000000;
  const currentTotalVal = totalCapital + pnl.sessionPnlAmount;

  const BarTooltip = ({ active, payload }) => {
    if (!active || !payload || !payload.length) return null;
    const data = payload[0].payload;
    const isGain = data.pnlAmount >= 0;
    return (
      <div
        style={{
          background: "#111111",
          color: "#FFFFFF",
          padding: "8px 12px",
          borderRadius: 4,
          fontSize: 11,
          fontFamily: "var(--font-mono)",
          boxShadow: "0 4px 12px rgba(0,0,0,0.2)"
        }}
      >
        <div style={{ fontWeight: 700, marginBottom: 4, color: "#FFFFFF" }}>{data.asset}</div>
        <div style={{ color: isGain ? "#4ADE80" : "#F87171" }}>
          P&L: {isGain ? "+" : ""}{formatCurrency(data.pnlAmount, portfolio.currency)} ({isGain ? "+" : ""}{data.pnlPercent.toFixed(2)}%)
        </div>
        <div style={{ color: "#A1A1AA", marginTop: 2 }}>
          Weight: {(data.weight * 100).toFixed(1)}% · Risk: {data.risk.toFixed(1)}%
        </div>
      </div>
    );
  };

  const ScatterTooltip = ({ active, payload }) => {
    if (!active || !payload || !payload.length) return null;
    const data = payload[0].payload;
    const isGain = (data.y || data.pnlPercent || 0) >= 0;
    return (
      <div
        style={{
          background: "#111111",
          color: "#FFFFFF",
          padding: "8px 12px",
          borderRadius: 4,
          fontSize: 11,
          fontFamily: "var(--font-mono)",
          boxShadow: "0 4px 12px rgba(0,0,0,0.2)"
        }}
      >
        <div style={{ fontWeight: 700, marginBottom: 4, color: "#FFFFFF" }}>{data.name || data.asset}</div>
        <div>Volatility / Risk: <span style={{ color: "#E4E4E7" }}>{data.x ? data.x.toFixed(2) : data.risk?.toFixed(2)}%</span></div>
        <div style={{ color: isGain ? "#4ADE80" : "#F87171" }}>
          Return / P&L: {isGain ? "+" : ""}{data.y ? data.y.toFixed(2) : data.pnlPercent?.toFixed(2)}%
        </div>
        {data.pnlAmount !== undefined && (
          <div style={{ color: "#A1A1AA", marginTop: 2 }}>
            Net: {data.pnlAmount >= 0 ? "+" : ""}{formatCurrency(data.pnlAmount, portfolio.currency)}
          </div>
        )}
      </div>
    );
  };

  const scatterData = (pnl.assetBreakdown || []).map((item) => ({
    name: item.asset,
    x: item.risk,
    y: item.pnlPercent,
    z: Math.max(10, Math.round(item.weight * 100)),
    pnlAmount: item.pnlAmount,
    color: item.pnlAmount >= 0 ? "#16A34A" : "#DC2626"
  }));

  const portfolioScatterPoint = {
    name: "★ Company Portfolio",
    x: (portfolio.current_risk || portfolio.expected_risk || 0.052) * 100,
    y: pnl.sessionPnlPercent,
    z: 50,
    pnlAmount: pnl.sessionPnlAmount,
    color: "#111111",
    isPortfolio: true
  };

  return (
    <div className="cg-card" style={{ padding: 24, display: "flex", flexDirection: "column", gap: 20 }}>
            <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 16,
          paddingBottom: 16,
          borderBottom: "1px solid #EAEAEA"
        }}
      >
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div
              style={{
                width: 24,
                height: 24,
                borderRadius: 4,
                background: "#111111",
                color: "#FFFFFF",
                display: "flex",
                alignItems: "center",
                justifyContent: "center"
              }}
            >
              <DollarSign style={{ width: 14, height: 14 }} />
            </div>
            <div className="cg-section-title" style={{ fontSize: 15 }}>
              Company Real-Time Profit &amp; Loss (P&amp;L)
            </div>
            <span
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 5,
                padding: "2px 7px",
                borderRadius: 3,
                fontSize: 9,
                fontFamily: "var(--font-mono)",
                fontWeight: 700,
                letterSpacing: "0.06em",
                background: isLiveStreaming ? "rgba(22, 163, 74, 0.1)" : "#F4F4F5",
                color: isLiveStreaming ? "#16A34A" : "#71717A",
                border: `1px solid ${isLiveStreaming ? "rgba(22, 163, 74, 0.3)" : "#E4E4E7"}`
              }}
            >
              <span
                style={{
                  width: 5,
                  height: 5,
                  borderRadius: "50%",
                  background: isLiveStreaming ? "#16A34A" : "#A1A1AA"
                }}
              />
              {isLiveStreaming ? "STREAMING" : "PAUSED"}
            </span>
          </div>
          <p style={{ fontSize: 12, color: "#666666", marginTop: 4 }}>
            Mark-to-market live session valuation and asset-level profit/loss attribution.
          </p>
        </div>

                <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            background: "#F4F4F5",
            padding: 3,
            borderRadius: 6,
            border: "1px solid #E4E4E7",
            gap: 4
          }}
        >
          <button
            onClick={() => setChartMode("bar")}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              padding: "5px 10px",
              fontSize: 11,
              fontFamily: "var(--font-mono)",
              fontWeight: 600,
              borderRadius: 4,
              border: "none",
              cursor: "pointer",
              background: chartMode === "bar" ? "#FFFFFF" : "transparent",
              color: chartMode === "bar" ? "#111111" : "#71717A",
              boxShadow: chartMode === "bar" ? "0 1px 3px rgba(0,0,0,0.08)" : "none",
              transition: "all 0.15s ease"
            }}
          >
            <BarChart3 style={{ width: 12, height: 12 }} />
            Asset P&amp;L Bar Chart
          </button>

          <button
            onClick={() => setChartMode("scatter")}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              padding: "5px 10px",
              fontSize: 11,
              fontFamily: "var(--font-mono)",
              fontWeight: 600,
              borderRadius: 4,
              border: "none",
              cursor: "pointer",
              background: chartMode === "scatter" ? "#FFFFFF" : "transparent",
              color: chartMode === "scatter" ? "#111111" : "#71717A",
              boxShadow: chartMode === "scatter" ? "0 1px 3px rgba(0,0,0,0.08)" : "none",
              transition: "all 0.15s ease"
            }}
          >
            <ScatterIcon style={{ width: 12, height: 12 }} />
            Risk vs. Return Scatter
          </button>

          <button
            onClick={() => setChartMode("timeline")}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              padding: "5px 10px",
              fontSize: 11,
              fontFamily: "var(--font-mono)",
              fontWeight: 600,
              borderRadius: 4,
              border: "none",
              cursor: "pointer",
              background: chartMode === "timeline" ? "#FFFFFF" : "transparent",
              color: chartMode === "timeline" ? "#111111" : "#71717A",
              boxShadow: chartMode === "timeline" ? "0 1px 3px rgba(0,0,0,0.08)" : "none",
              transition: "all 0.15s ease"
            }}
          >
            <Activity style={{ width: 12, height: 12 }} />
            Session Timeline
          </button>
        </div>
      </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 12 }}>
                <div
          style={{
            padding: "14px 16px",
            background: isPositive ? "rgba(22, 163, 74, 0.04)" : "rgba(220, 38, 38, 0.04)",
            border: `1px solid ${isPositive ? "rgba(22, 163, 74, 0.2)" : "rgba(220, 38, 38, 0.2)"}`,
            borderRadius: 4
          }}
        >
          <div style={{ fontSize: 11, color: "#71717A", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em" }}>
            Net Session P&amp;L
          </div>
          <div
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: 22,
              fontWeight: 700,
              color: isPositive ? "#16A34A" : "#DC2626",
              marginTop: 4,
              display: "flex",
              alignItems: "center",
              gap: 4
            }}
          >
            {isPositive ? <ArrowUpRight style={{ width: 18, height: 18 }} /> : <ArrowDownRight style={{ width: 18, height: 18 }} />}
            {isPositive ? "+" : ""}{formatCurrency(pnl.sessionPnlAmount, portfolio.currency)}
          </div>
          <div style={{ fontSize: 11, color: isPositive ? "#16A34A" : "#DC2626", marginTop: 2, fontFamily: "var(--font-mono)" }}>
            {isPositive ? "+" : ""}{pnl.sessionPnlPercent.toFixed(3)}% on Capital
          </div>
        </div>

                <div style={{ padding: "14px 16px", background: "#FAFAFA", border: "1px solid #EAEAEA", borderRadius: 4 }}>
          <div style={{ fontSize: 11, color: "#71717A", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em" }}>
            Total Capital Value
          </div>
          <div style={{ fontFamily: "var(--font-mono)", fontSize: 22, fontWeight: 700, color: "#111111", marginTop: 4 }}>
            {formatCurrency(currentTotalVal, portfolio.currency)}
          </div>
          <div style={{ fontSize: 11, color: "#71717A", marginTop: 2 }}>
            Base Capital: {formatCurrency(totalCapital, portfolio.currency)}
          </div>
        </div>

                <div style={{ padding: "14px 16px", background: "#FAFAFA", border: "1px solid #EAEAEA", borderRadius: 4 }}>
          <div style={{ fontSize: 11, color: "#71717A", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em" }}>
            Session High Peak
          </div>
          <div style={{ fontFamily: "var(--font-mono)", fontSize: 20, fontWeight: 700, color: "#16A34A", marginTop: 4 }}>
            +{formatCurrency(pnl.sessionHigh, portfolio.currency)}
          </div>
          <div style={{ fontSize: 11, color: "#71717A", marginTop: 2 }}>
            Maximum Intraday Gain
          </div>
        </div>

                <div style={{ padding: "14px 16px", background: "#FAFAFA", border: "1px solid #EAEAEA", borderRadius: 4 }}>
          <div style={{ fontSize: 11, color: "#71717A", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em" }}>
            Session Low / Drawdown
          </div>
          <div style={{ fontFamily: "var(--font-mono)", fontSize: 20, fontWeight: 700, color: pnl.sessionLow < 0 ? "#DC2626" : "#71717A", marginTop: 4 }}>
            {pnl.sessionLow >= 0 ? "+" : ""}{formatCurrency(pnl.sessionLow, portfolio.currency)}
          </div>
          <div style={{ fontSize: 11, color: "#71717A", marginTop: 2 }}>
            Maximum Intraday Dip
          </div>
        </div>
      </div>

            <div style={{ height: 280, width: "100%", marginTop: 4 }}>
        {chartMode === "bar" && (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={pnl.assetBreakdown || []}
              margin={{ top: 10, right: 20, left: 10, bottom: 20 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#F0F0F0" vertical={false} />
              <XAxis
                dataKey="asset"
                stroke="#888888"
                fontSize={11}
                tickLine={false}
                axisLine={{ stroke: "#EAEAEA" }}
                tick={{ fill: "#333333", fontWeight: 600 }}
              />
              <YAxis
                stroke="#888888"
                fontSize={10}
                tickLine={false}
                axisLine={false}
                tickFormatter={(val) => {
                  const lakh = val / 100000;
                  return `${lakh >= 0 ? "+" : ""}${lakh.toFixed(0)}L`;
                }}
              />
              <Tooltip content={<BarTooltip />} />
              <ReferenceLine y={0} stroke="#111111" strokeWidth={1.5} />
              <Bar dataKey="pnlAmount" radius={[3, 3, 0, 0]}>
                {(pnl.assetBreakdown || []).map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={entry.pnlAmount >= 0 ? "#16A34A" : "#DC2626"}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}

        {chartMode === "scatter" && (
          <ResponsiveContainer width="100%" height="100%">
            <ScatterChart margin={{ top: 10, right: 30, left: 10, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F0F0F0" />
              <XAxis
                type="number"
                dataKey="x"
                name="Volatility / Risk"
                unit="%"
                stroke="#888888"
                fontSize={10}
                tickLine={false}
                domain={[0, 20]}
                label={{ value: "Annualized Volatility / Risk (%)", position: "insideBottom", offset: -10, fontSize: 11, fill: "#71717A" }}
              />
              <YAxis
                type="number"
                dataKey="y"
                name="Return / P&L"
                unit="%"
                stroke="#888888"
                fontSize={10}
                tickLine={false}
                label={{ value: "Real-Time Return / P&L (%)", angle: -90, position: "insideLeft", offset: 5, fontSize: 11, fill: "#71717A" }}
              />
              <ZAxis type="number" dataKey="z" range={[80, 260]} />
              <Tooltip content={<ScatterTooltip />} cursor={{ strokeDasharray: "3 3" }} />
              <ReferenceLine y={0} stroke="#71717A" strokeDasharray="3 3" />
              <Scatter name="Asset Classes" data={scatterData}>
                {scatterData.map((entry, index) => (
                  <Cell key={`scatter-cell-${index}`} fill={entry.color} />
                ))}
              </Scatter>
              <Scatter name="Company Portfolio" data={[portfolioScatterPoint]}>
                <Cell fill="#111111" stroke="#FFFFFF" strokeWidth={2} />
              </Scatter>
            </ScatterChart>
          </ResponsiveContainer>
        )}

        {chartMode === "timeline" && (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={pnl.history && pnl.history.length > 0 ? pnl.history : [{ time: "Now", pnlPercent: 0 }]}
              margin={{ top: 10, right: 20, left: 10, bottom: 20 }}
            >
              <defs>
                <linearGradient id="pnlGreenGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#16A34A" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#16A34A" stopOpacity={0.0} />
                </linearGradient>
                <linearGradient id="pnlRedGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#DC2626" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#DC2626" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#F0F0F0" vertical={false} />
              <XAxis dataKey="time" stroke="#888888" fontSize={9} tickLine={false} />
              <YAxis
                stroke="#888888"
                fontSize={10}
                tickLine={false}
                axisLine={false}
                tickFormatter={(val) => `${val >= 0 ? "+" : ""}${val.toFixed(2)}%`}
              />
              <Tooltip
                formatter={(val) => [`${val >= 0 ? "+" : ""}${Number(val).toFixed(3)}%`, "Cumulative Return"]}
                labelFormatter={(label) => `Tick Time: ${label}`}
                contentStyle={{ background: "#111111", color: "#FFFFFF", borderRadius: 4, fontSize: 11, fontFamily: "var(--font-mono)" }}
              />
              <ReferenceLine y={0} stroke="#71717A" strokeWidth={1} />
              <Area
                type="monotone"
                dataKey="pnlPercent"
                stroke={isPositive ? "#16A34A" : "#DC2626"}
                strokeWidth={2}
                fill={isPositive ? "url(#pnlGreenGrad)" : "url(#pnlRedGrad)"}
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>

            <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 12,
          paddingTop: 12,
          borderTop: "1px solid #F0F0F0",
          fontSize: 11,
          color: "#71717A",
          fontFamily: "var(--font-mono)"
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <ShieldCheck style={{ width: 13, height: 13, color: "#16A34A" }} />
          <span>REAL-TIME VALUATION: Continuous Mark-to-Market (MTM)</span>
        </div>
        <div>
          Last Telemetry Update: <strong>{lastTickTime || "Live"}</strong>
        </div>
      </div>
    </div>
  );
}
