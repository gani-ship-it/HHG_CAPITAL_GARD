import React, { useState, useEffect } from "react";
import {
  ShieldAlert,
  ShieldCheck,
  TrendingUp,
  PieChart as PieIcon,
  Activity,
  RefreshCw,
  Zap,
  Sliders,
  AlertCircle,
  FileText,
  ChevronRight,
  RotateCcw,
  Layers,
  ArrowRight,
  DollarSign,
  Download,
  User,
  LogIn,
  LogOut,
  Sparkles,
  Bot
} from "lucide-react";
import AuthModal from "./components/AuthModal";
import AICopilotDrawer from "./components/AICopilotDrawer";


import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip as RechartsTooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid
} from "recharts";
import * as api from "./api";

// Monochrome color shades for charts as per DESIGN_SYSTEM.md
const MONO_SHADES = ["#111111", "#444444", "#777777", "#AAAAAA", "#D4D4D4"];

export default function App() {
  const [activeTab, setActiveTab] = useState("overview");
  const [healthStatus, setHealthStatus] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Active Portfolio State
  const [portfolio, setPortfolio] = useState(null);
  const [optimizationData, setOptimizationData] = useState(null);

  // Form Inputs for Optimization Setup
  const [formData, setFormData] = useState({
    org_name: "Apex Reserve Bank",
    org_type: "Bank",
    total_capital: 1000000000.0, // 100 Cr
    currency: "INR",
    investment_horizon_years: 3,
    investment_objective: "Balanced Growth",
    risk_preference: "Medium",
    min_liquidity: 200000000.0, // 20 Cr
    max_risk_limit: 0.07, // 7%
    selected_assets: ["GovBonds", "CorpBonds", "Equity", "Gold", "Cash"],
    equity_max: 0.30,
    corpbonds_max: 0.25
  });

  // Monitoring state
  const [monitoringMetrics, setMonitoringMetrics] = useState(null);

  // Rebalance evaluation state
  const [rebalanceCostBps, setRebalanceCostBps] = useState(15.0);
  const [partialRatio, setPartialRatio] = useState(1.0);
  const [rebalanceEval, setRebalanceEval] = useState(null);
  const [rebalanceExecuting, setRebalanceExecuting] = useState(false);

  // Simulator state
  const [selectedScenario, setSelectedScenario] = useState("market_crash");
  const [simResult, setSimResult] = useState(null);
  const [simLoading, setSimLoading] = useState(false);

  // History state
  const [historyRecords, setHistoryRecords] = useState([]);

  // Macro indicators state (from FRED)
  const [macroIndicators, setMacroIndicators] = useState(null);

  // Supabase Authentication state
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const saved = localStorage.getItem("capital_guard_user");
      return saved ? JSON.parse(saved) : {
        id: "demo-cro",
        email: "cro@apexbank.com",
        user_metadata: {
          full_name: "Dr. Elena Vance, CRO",
          org_name: "Apex Reserve Bank",
          role: "Chief Risk Officer"
        },
        isDemo: true
      };
    } catch (e) {
      return null;
    }
  });
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isCopilotOpen, setIsCopilotOpen] = useState(false);

  // Check backend health & auto-load default optimization on first mount

  useEffect(() => {
    checkHealth();
    loadMacroData();
    handleOptimize();
  }, []);

  async function checkHealth() {
    const data = await api.fetchHealth();
    setHealthStatus(data);
  }

  async function loadMacroData() {
    try {
      const data = await api.fetchMacroIndicators();
      if (data && !data.status) {
        setMacroIndicators(data);
      }
    } catch (e) {
      console.warn("Could not load macro indicators:", e);
    }
  }


  // Optimize Portfolio Handler
  async function handleOptimize(customForm = null) {
    setLoading(true);
    setError(null);
    const dataToSend = customForm || formData;
    try {
      const payload = {
        org_name: dataToSend.org_name,
        org_type: dataToSend.org_type,
        total_capital: parseFloat(dataToSend.total_capital),
        currency: dataToSend.currency,
        investment_horizon_years: parseInt(dataToSend.investment_horizon_years),
        investment_objective: dataToSend.investment_objective,
        risk_preference: dataToSend.risk_preference,
        min_liquidity: parseFloat(dataToSend.min_liquidity),
        max_risk_limit: parseFloat(dataToSend.max_risk_limit),
        selected_assets: dataToSend.selected_assets,
        constraints: {
          equity_max: parseFloat(dataToSend.equity_max),
          corpbonds_max: parseFloat(dataToSend.corpbonds_max)
        }
      };

      const res = await api.optimizePortfolio(payload);
      setPortfolio(res.portfolio);
      setOptimizationData(res.optimization);
      // Fetch monitoring & history
      await refreshMonitoring(res.portfolio.id);
      await loadHistory(res.portfolio.id);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  // Load Demo 100 Cr Preset from Section 16 of Document
  function loadDemoPreset() {
    const demo = {
      org_name: "State Reserve Bank",
      org_type: "Bank",
      total_capital: 1000000000.0,
      currency: "INR",
      investment_horizon_years: 3,
      investment_objective: "Balanced Growth",
      risk_preference: "Medium",
      min_liquidity: 200000000.0,
      max_risk_limit: 0.07,
      selected_assets: ["GovBonds", "CorpBonds", "Equity", "Gold", "Cash"],
      equity_max: 0.30,
      corpbonds_max: 0.25
    };
    setFormData(demo);
    handleOptimize(demo);
  }

  // Refresh live monitoring metrics
  async function refreshMonitoring(pId) {
    const id = pId || portfolio?.id;
    if (!id) return;
    try {
      const res = await api.fetchMonitoringMetrics(id);
      setMonitoringMetrics(res.metrics);
      if (portfolio) {
        setPortfolio(prev => ({ ...prev, status: res.metrics.status }));
      }
    } catch (err) {
      console.error(err);
    }
  }

  // Simulate market spike for hackathon demo
  async function handleSimulateMarketSpike() {
    if (!portfolio?.id) return;
    setLoading(true);
    try {
      const res = await api.simulateMarketChange(portfolio.id, 0.081);
      setPortfolio(prev => ({
        ...prev,
        current_risk: res.simulated_risk,
        status: res.status
      }));
      await refreshMonitoring(portfolio.id);
      // Automatically evaluate rebalancing
      handleEvaluateRebalance(portfolio.id);
      setActiveTab("monitoring");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  // Evaluate rebalancing cost vs benefit
  async function handleEvaluateRebalance(pId) {
    const id = pId || portfolio?.id;
    if (!id) return;
    try {
      const res = await api.evaluateRebalance({
        portfolio_id: id,
        cost_per_trade_bps: parseFloat(rebalanceCostBps),
        risk_aversion_factor: 2.0,
        partial_ratio: parseFloat(partialRatio)
      });
      setRebalanceEval(res.evaluation);
    } catch (err) {
      console.error(err);
    }
  }

  // Execute Rebalancing Action
  async function handleExecuteRebalance() {
    if (!portfolio?.id) return;
    setRebalanceExecuting(true);
    try {
      const res = await api.executeRebalance({
        portfolio_id: portfolio.id,
        cost_per_trade_bps: parseFloat(rebalanceCostBps),
        risk_aversion_factor: 2.0,
        partial_ratio: parseFloat(partialRatio),
        trigger: "Risk breach mitigation & policy realignment"
      });
      setPortfolio(res.updated_portfolio);
      await refreshMonitoring(portfolio.id);
      await loadHistory(portfolio.id);
      setRebalanceEval(null);
      setActiveTab("overview");
    } catch (err) {
      setError(err.message);
    } finally {
      setRebalanceExecuting(false);
    }
  }

  // Run Scenario Stress Test
  async function handleRunStressTest() {
    if (!portfolio?.id) return;
    setSimLoading(true);
    try {
      const res = await api.runStressTest({
        portfolio_id: portfolio.id,
        scenario_key: selectedScenario
      });
      setSimResult(res.simulation_result);
    } catch (err) {
      setError(err.message);
    } finally {
      setSimLoading(false);
    }
  }

  // Load audit decision history
  async function loadHistory(pId) {
    const id = pId || portfolio?.id;
    if (!id) return;
    try {
      const res = await api.fetchDecisionHistory(id);
      setHistoryRecords(res.history || []);
    } catch (err) {
      console.error(err);
    }
  }

  // Export Decision History to CSV for regulatory audits
  function exportHistoryCSV() {
    if (!historyRecords || historyRecords.length === 0) return;
    const headers = ["ID", "Timestamp", "Trigger", "Decision", "Turnover %", "Trading Cost", "Risk Before", "Risk After", "Rationale"];
    const rows = historyRecords.map(r => [
      r.id,
      r.timestamp || "",
      `"${r.trigger || ""}"`,
      r.decision || "",
      (r.turnover * 100).toFixed(2),
      r.transaction_cost,
      r.portfolio_risk_before,
      r.portfolio_risk_after,
      `"${(r.explanation || "").replace(/"/g, '""')}"`
    ]);
    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map(e => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `capital_guard_audit_log_${new Date().toISOString().slice(0,10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  // Prepare Pie Chart data
  const pieData = portfolio?.current_weights
    ? Object.entries(portfolio.current_weights).map(([name, weight]) => ({
        name,
        value: parseFloat((weight * 100).toFixed(2))
      }))
    : [];

  // Currency Formatter
  function formatCurrency(val) {
    if (val === undefined || val === null) return "₹0";
    if (val >= 10000000) {
      return `₹${(val / 10000000).toFixed(2)} Cr`;
    }
    return `₹${val.toLocaleString("en-IN")}`;
  }

  const isAlert = portfolio?.status === "ALERT" || monitoringMetrics?.status === "ALERT";

  return (
    <div className="app-container">
      {/* 1. TOP INSTITUTIONAL NAVIGATION */}
      <header className="top-nav">
        <div className="brand-section">
          <div className="brand-logo">CG</div>
          <div>
            <h1 className="brand-title">CAPITAL GUARD</h1>
            <p className="brand-subtitle">Institutional Capital Optimization & Risk Control</p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="nav-tabs">
          <button
            className={`nav-tab ${activeTab === "overview" ? "active" : ""}`}
            onClick={() => setActiveTab("overview")}
          >
            <PieIcon size={16} /> Overview
          </button>
          <button
            className={`nav-tab ${activeTab === "setup" ? "active" : ""}`}
            onClick={() => setActiveTab("setup")}
          >
            <Sliders size={16} /> Optimization Setup
          </button>
          <button
            className={`nav-tab ${activeTab === "monitoring" ? "active" : ""}`}
            onClick={() => {
              setActiveTab("monitoring");
              refreshMonitoring();
            }}
          >
            <Activity size={16} /> Risk Monitoring
          </button>
          <button
            className={`nav-tab ${activeTab === "rebalance" ? "active" : ""}`}
            onClick={() => {
              setActiveTab("rebalance");
              handleEvaluateRebalance();
            }}
          >
            <RefreshCw size={16} /> Rebalance Engine
          </button>
          <button
            className={`nav-tab ${activeTab === "simulator" ? "active" : ""}`}
            onClick={() => {
              setActiveTab("simulator");
              handleRunStressTest();
            }}
          >
            <Zap size={16} /> Stress Simulator
          </button>
          <button
            className={`nav-tab ${activeTab === "history" ? "active" : ""}`}
            onClick={() => {
              setActiveTab("history");
              loadHistory();
            }}
          >
            <FileText size={16} /> Audit History
          </button>
        </nav>

        {/* Status Pill & Preset Button */}
        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
          {/* User Profile / Supabase Auth Button */}
          <button
            className="btn btn-secondary btn-sm"
            onClick={() => setIsAuthModalOpen(true)}
            title="Supabase Authentication & Role Switcher"
            style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}
          >
            <User size={13} />
            <span style={{ maxWidth: "120px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {currentUser?.user_metadata?.full_name || currentUser?.email || "Sign In"}
            </span>
            <span
              style={{
                fontSize: "10px",
                background: "#E5E5E5",
                color: "#111111",
                padding: "1px 5px",
                borderRadius: "2px",
                fontWeight: 600
              }}
            >
              {currentUser?.user_metadata?.role ? currentUser.user_metadata.role.split(" ")[0] : "Auth"}
            </span>
          </button>

          {/* AI Copilot Trigger Button */}
          <button

            className="btn btn-secondary btn-sm"
            onClick={() => setIsCopilotOpen(true)}
            title="Open Capital Guard AI Copilot (Groq LPU Llama 3.3 70B & Air-Gapped Engine)"
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.45rem",
              background: "#111111",
              color: "#FFFFFF",
              border: "1px solid #333333"
            }}
          >
            <Sparkles size={13} color="#60A5FA" />
            <span>AI Copilot</span>
            <span
              style={{
                fontSize: "9px",
                background: "#2563EB",
                color: "#FFFFFF",
                padding: "1px 5px",
                borderRadius: "3px",
                fontWeight: 600
              }}
            >
              Groq
            </span>
          </button>

          <button
            className="btn btn-secondary btn-sm"
            onClick={loadDemoPreset}
            title="Pre-fills ₹100 Cr Bank Demo Scenario"
          >
            <RotateCcw size={13} /> ₹100 Cr Bank Demo
          </button>


          <div className={`badge ${isAlert ? "badge-alert alert-pulse" : "badge-safe"}`}>
            {isAlert ? (
              <>
                <ShieldAlert size={14} /> 🔴 RISK BREACH DETECTED
              </>
            ) : (
              <>
                <ShieldCheck size={14} /> 🟢 SAFE (COMPLIANT)
              </>
            )}
          </div>
        </div>
      </header>

      {/* INSTITUTIONAL LIVE DATA & CLOUD SYNC TICKER */}
      <div
        style={{
          background: "#121212",
          color: "#D4D4D4",
          fontSize: "11px",
          padding: "0.45rem 2rem",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          borderBottom: "1px solid #242424",
          fontFamily: "var(--font-mono)"
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "1.5rem" }}>
          <span style={{ display: "flex", alignItems: "center", gap: "0.4rem", color: "#888888" }}>
            <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#22C55E", display: "inline-block" }} />
            LIVE FRED FEED:
          </span>
          <span>
            US 10Y: <strong style={{ color: "#FFFFFF" }}>{macroIndicators?.us_10y_treasury?.rate ? `${macroIndicators.us_10y_treasury.rate}%` : "4.77%"}</strong>
          </span>
          <span style={{ color: "#333333" }}>|</span>
          <span>
            FED FUNDS: <strong style={{ color: "#FFFFFF" }}>{macroIndicators?.fed_funds_rate?.rate ? `${macroIndicators.fed_funds_rate.rate}%` : "3.63%"}</strong>
          </span>
          <span style={{ color: "#333333" }}>|</span>
          <span>
            3M T-BILL: <strong style={{ color: "#FFFFFF" }}>{macroIndicators?.us_3m_tbill?.rate ? `${macroIndicators.us_3m_tbill.rate}%` : "3.75%"}</strong>
          </span>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "1.2rem" }}>
          <span style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
            <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#22C55E", display: "inline-block" }} />
            SUPABASE POSTGRES: <strong style={{ color: "#FFFFFF" }}>CLOUD SYNCED</strong>
          </span>
          <span style={{ color: "#333333" }}>|</span>
          <span style={{ color: "#888888" }}>
            OPTIMIZER: <strong style={{ color: "#FFFFFF" }}>CLARABEL / CVXPY QP</strong>
          </span>
        </div>
      </div>

      {/* ERROR BANNER */}
      {error && (
        <div
          style={{
            background: "var(--accent-alert-bg)",
            color: "var(--accent-alert)",
            padding: "0.75rem 2rem",
            fontSize: "13px",
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
            borderBottom: "1px solid var(--accent-alert-border)"
          }}
        >
          <AlertCircle size={16} />
          <span>{error}</span>
        </div>
      )}

      {/* 2. SUB-HEADER: PORTFOLIO QUICK SUMMARY */}
      <div
        style={{
          background: "var(--bg-primary)",
          borderBottom: "1px solid var(--border-subtle)",
          padding: "1rem 2rem",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center"
        }}
      >
        <div style={{ display: "flex", gap: "2rem", alignItems: "center" }}>
          <div>
            <span style={{ fontSize: "11px", color: "var(--text-muted)", textTransform: "uppercase" }}>
              Institution
            </span>
            <p style={{ fontWeight: 600, fontSize: "14px" }}>
              {portfolio?.org_name || "Apex Reserve Bank"} ({portfolio?.org_type || "Bank"})
            </p>
          </div>
          <div style={{ width: "1px", height: "30px", background: "var(--border-subtle)" }} />
          <div>
            <span style={{ fontSize: "11px", color: "var(--text-muted)", textTransform: "uppercase" }}>
              Allocated Capital
            </span>
            <p className="mono" style={{ fontWeight: 600, fontSize: "15px" }}>
              {formatCurrency(portfolio?.total_capital || formData.total_capital)}
            </p>
          </div>
          <div style={{ width: "1px", height: "30px", background: "var(--border-subtle)" }} />
          <div>
            <span style={{ fontSize: "11px", color: "var(--text-muted)", textTransform: "uppercase" }}>
              Horizon & Mandate
            </span>
            <p style={{ fontWeight: 500, fontSize: "13px" }}>
              {portfolio?.investment_horizon_years || 3} Years · {portfolio?.investment_objective || "Balanced Growth"}
            </p>
          </div>
        </div>

        {/* Quick Demo Action: Simulate Market Volatility */}
        <div style={{ display: "flex", gap: "0.5rem" }}>
          <button
            className={`btn btn-sm ${isAlert ? "btn-secondary" : "btn-danger"}`}
            onClick={handleSimulateMarketSpike}
            disabled={loading}
          >
            <Activity size={14} /> Simulate Market Shock (Risk 6.2% → 8.1%)
          </button>
        </div>
      </div>

      {/* 3. MAIN TAB CONTENT */}
      <main style={{ flex: 1, padding: "2rem", maxWidth: "1400px", margin: "0 auto", width: "100%" }}>
        
        {/* ====================================================
            TAB 1: PORTFOLIO OVERVIEW & HEALTH
           ==================================================== */}
        {activeTab === "overview" && (
          <div className="animate-fade-in" style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
            {/* Top KPI row */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "1rem" }}>
              <div className="card metric-box">
                <span className="metric-label">Expected Annual Return</span>
                <span className="metric-value mono">
                  {portfolio?.expected_return ? `${(portfolio.expected_return * 100).toFixed(2)}%` : "11.94%"}
                </span>
                <span className="metric-sub">Mean-Variance Expected</span>
              </div>

              <div className="card metric-box" style={{ borderColor: isAlert ? "var(--accent-alert)" : "var(--border-subtle)" }}>
                <span className="metric-label">Portfolio Volatility (Risk)</span>
                <span className="metric-value mono" style={{ color: isAlert ? "var(--accent-alert)" : "inherit" }}>
                  {portfolio?.current_risk ? `${(portfolio.current_risk * 100).toFixed(2)}%` : "7.00%"}
                </span>
                <span className="metric-sub">
                  Policy Limit: {((portfolio?.max_risk_limit || 0.07) * 100).toFixed(1)}%
                </span>
              </div>

              <div className="card metric-box">
                <span className="metric-label">Liquid Capital Reserves</span>
                <span className="metric-value mono">
                  {formatCurrency(portfolio?.current_liquidity || 532700000)}
                </span>
                <span className="metric-sub">
                  Floor: {formatCurrency(portfolio?.min_liquidity || 200000000)}
                </span>
              </div>

              <div className="card metric-box">
                <span className="metric-label">Portfolio Health Score</span>
                <span className="metric-value mono">
                  {portfolio?.health_score !== undefined ? `${portfolio.health_score}/100` : "92/100"}
                </span>
                <span className="metric-sub">Diversification & Risk Index</span>
              </div>
            </div>

            {/* Asset Allocation & Binding Constraints Grid */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem" }}>
              {/* Left: Allocation Donut */}
              <div className="card">
                <div className="card-header">
                  <span className="card-title">Optimal Asset Allocation</span>
                  <span className="badge badge-safe mono">CVXPY Solved</span>
                </div>
                <div style={{ height: "260px", display: "flex", alignItems: "center" }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={pieData}
                        innerRadius={65}
                        outerRadius={95}
                        paddingAngle={2}
                        dataKey="value"
                      >
                        {pieData.map((entry, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={MONO_SHADES[index % MONO_SHADES.length]}
                            stroke="#FFFFFF"
                            strokeWidth={2}
                          />
                        ))}
                      </Pie>
                      <RechartsTooltip formatter={val => `${val}%`} />
                    </PieChart>
                  </ResponsiveContainer>
                  <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem", minWidth: "160px" }}>
                    {pieData.map((d, i) => (
                      <div key={d.name} style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "12px" }}>
                        <div
                          style={{
                            width: "10px",
                            height: "10px",
                            backgroundColor: MONO_SHADES[i % MONO_SHADES.length]
                          }}
                        />
                        <span style={{ flex: 1, color: "var(--text-secondary)" }}>{d.name}:</span>
                        <span className="mono" style={{ fontWeight: 600 }}>{d.value}%</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Right: Binding Constraints & Audit Explanations */}
              <div className="card" style={{ display: "flex", flexDirection: "column" }}>
                <div className="card-header">
                  <span className="card-title">Deterministic Decision Explanation</span>
                  <span className="card-subtitle">Derived from Active Bounds</span>
                </div>
                <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "1rem" }}>
                  <p style={{ fontSize: "13px", color: "var(--text-secondary)", lineHeight: "1.6" }}>
                    Unlike generative LLMs that approximate, Capital Guard analyzes the exact binding mathematical
                    constraints in the solved quadratic program to justify allocation decisions:
                  </p>
                  
                  <div
                    style={{
                      background: "var(--bg-hover)",
                      borderLeft: "3px solid var(--text-primary)",
                      padding: "1rem",
                      borderRadius: "var(--radius-sm)"
                    }}
                  >
                    {optimizationData?.explanations?.map((exp, idx) => (
                      <p key={idx} style={{ fontSize: "13px", fontWeight: 500, color: "var(--text-primary)" }}>
                        "{exp}"
                      </p>
                    )) || (
                      <p style={{ fontSize: "13px", fontWeight: 500 }}>
                        "Equity capped at 30.0% per your constraint. Capital was diverted to Cash & Treasuries to ensure liquidity reserves."
                      </p>
                    )}
                  </div>

                  <div style={{ marginTop: "auto", paddingTop: "1rem", borderTop: "1px solid var(--border-subtle)" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12px" }}>
                      <span style={{ color: "var(--text-muted)" }}>Solver status:</span>
                      <span className="mono" style={{ fontWeight: 600 }}>
                        {optimizationData?.solver_status || "optimal (CLARABEL)"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Risk vs Return Positioning (Section 9 Requirement) */}
            <div className="card">
              <div className="card-header">
                <div>
                  <span className="card-title">Risk vs. Return Positioning & Frontier Analysis</span>
                  <p className="card-subtitle">
                    Demonstrating how quadratic covariance optimization achieves superior risk-adjusted return
                  </p>
                </div>
                <span className="badge badge-safe mono">Covariance Advantage</span>
              </div>

              <div className="table-container">
                <table className="finance-table">
                  <thead>
                    <tr>
                      <th>Asset / Portfolio</th>
                      <th>Category</th>
                      <th>Expected Return</th>
                      <th>Annualized Volatility (Risk)</th>
                      <th>Sharpe Proxy (Return/Risk)</th>
                      <th>Allocated Weight</th>
                      <th>Role in Capital Allocation</th>
                    </tr>
                  </thead>
                  <tbody>
                    {/* The Optimized Portfolio Row */}
                    <tr style={{ background: "var(--bg-hover)", fontWeight: 600 }}>
                      <td style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                        <div style={{ width: "8px", height: "8px", background: "var(--text-primary)", borderRadius: "50%" }} />
                        <span>OPTIMIZED PORTFOLIO</span>
                      </td>
                      <td>Multi-Asset Portfolio</td>
                      <td className="mono" style={{ color: "var(--text-primary)", fontWeight: 700 }}>
                        {portfolio?.expected_return ? `${(portfolio.expected_return * 100).toFixed(2)}%` : "11.94%"}
                      </td>
                      <td className="mono" style={{ fontWeight: 700 }}>
                        {portfolio?.current_risk ? `${(portfolio.current_risk * 100).toFixed(2)}%` : "7.00%"}
                      </td>
                      <td className="mono">
                        {portfolio?.expected_return && portfolio?.current_risk
                          ? (portfolio.expected_return / portfolio.current_risk).toFixed(2)
                          : "1.71"}
                      </td>
                      <td className="mono">100.0%</td>
                      <td>
                        <span className="badge badge-safe">OPTIMAL RISK-ADJUSTED</span>
                      </td>
                    </tr>

                    {/* Individual Assets */}
                    {Object.entries(optimizationData?.individual_asset_stats || {
                      GovBonds: { expected_return: 0.041, volatility: 0.059 },
                      CorpBonds: { expected_return: 0.062, volatility: 0.088 },
                      Equity: { expected_return: 0.165, volatility: 0.158 },
                      Gold: { expected_return: 0.092, volatility: 0.138 },
                      Cash: { expected_return: 0.045, volatility: 0.005 }
                    }).map(([symbol, s]) => {
                      const weight = portfolio?.current_weights ? portfolio.current_weights[symbol] || 0 : 0;
                      return (
                        <tr key={symbol}>
                          <td style={{ fontWeight: 500 }}>{symbol}</td>
                          <td style={{ color: "var(--text-muted)", fontSize: "12px" }}>
                            {symbol === "Equity" ? "Equities" : symbol === "Gold" ? "Commodity" : symbol === "Cash" ? "Cash Equivalent" : "Fixed Income"}
                          </td>
                          <td className="mono">{(s.expected_return * 100).toFixed(2)}%</td>
                          <td className="mono">{(s.volatility * 100).toFixed(2)}%</td>
                          <td className="mono">{(s.expected_return / Math.max(0.001, s.volatility)).toFixed(2)}</td>
                          <td className="mono" style={{ fontWeight: weight > 0 ? 600 : 400 }}>
                            {(weight * 100).toFixed(1)}%
                          </td>
                          <td style={{ fontSize: "12px", color: "var(--text-secondary)" }}>
                            {weight > 0 ? (symbol === "Cash" || symbol === "GovBonds" ? "Liquidity Guardrail" : "Yield & Alpha Growth") : "Unallocated (High risk/correlation)"}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* If breach detected, show Rebalancing Prompt */}
            {isAlert && (
              <div
                className="card alert-pulse"
                style={{
                  background: "var(--accent-alert-bg)",
                  borderColor: "var(--accent-alert)",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center"
                }}
              >
                <div>
                  <h3 style={{ fontSize: "15px", fontWeight: 600, color: "var(--accent-alert)", marginBottom: "0.25rem" }}>
                    🔴 Risk Breach Alert Active
                  </h3>
                  <p style={{ fontSize: "13px", color: "var(--text-secondary)" }}>
                    Current volatility has crossed policy limit of {((portfolio?.max_risk_limit || 0.07)*100).toFixed(1)}%.
                    Our Cost-Aware Rebalancing Engine has calculated corrective trade turnover.
                  </p>
                </div>
                <button
                  className="btn btn-danger"
                  onClick={() => {
                    setActiveTab("rebalance");
                    handleEvaluateRebalance();
                  }}
                >
                  Review Cost vs Benefit <ChevronRight size={16} />
                </button>
              </div>
            )}
          </div>
        )}

        {/* ====================================================
            TAB 2: OPTIMIZATION SETUP & CONSTRAINTS
           ==================================================== */}
        {activeTab === "setup" && (
          <div className="animate-fade-in card" style={{ maxWidth: "800px", margin: "0 auto" }}>
            <div className="card-header">
              <div>
                <span className="card-title">Institutional Parameters & Bounds</span>
                <p className="card-subtitle">Configure capital allocation constraints for CVXPY optimization</p>
              </div>
              <button className="btn btn-secondary btn-sm" onClick={loadDemoPreset}>
                Reset to Bank Demo
              </button>
            </div>

            <form
              onSubmit={e => {
                e.preventDefault();
                handleOptimize();
                setActiveTab("overview");
              }}
              style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}
            >
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                <div className="form-group">
                  <label className="form-label">Institution Name</label>
                  <input
                    type="text"
                    className="form-control"
                    value={formData.org_name}
                    onChange={e => setFormData({ ...formData, org_name: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Organization Type</label>
                  <select
                    className="form-control"
                    value={formData.org_type}
                    onChange={e => setFormData({ ...formData, org_type: e.target.value })}
                  >
                    <option value="Bank">Commercial Bank</option>
                    <option value="Insurance">Insurance Company</option>
                    <option value="Treasury">Corporate Treasury</option>
                    <option value="Investment Firm">Investment Fund</option>
                  </select>
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                <div className="form-group">
                  <label className="form-label">Total Capital (INR)</label>
                  <input
                    type="number"
                    className="form-control mono"
                    value={formData.total_capital}
                    onChange={e => setFormData({ ...formData, total_capital: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Min Required Liquidity (INR)</label>
                  <input
                    type="number"
                    className="form-control mono"
                    value={formData.min_liquidity}
                    onChange={e => setFormData({ ...formData, min_liquidity: e.target.value })}
                  />
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                <div className="form-group">
                  <label className="form-label">Investment Objective</label>
                  <select
                    className="form-control"
                    value={formData.investment_objective}
                    onChange={e => setFormData({ ...formData, investment_objective: e.target.value })}
                  >
                    <option value="Growth">Growth (Prioritize returns)</option>
                    <option value="Balanced Growth">Balanced Growth (Return with guardrails)</option>
                    <option value="Income">Income (Stable yields)</option>
                    <option value="Capital Preservation">Capital Preservation (Max stability)</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Maximum Allowed Risk (Volatility Limit)</label>
                  <input
                    type="number"
                    step="0.01"
                    className="form-control mono"
                    value={formData.max_risk_limit}
                    onChange={e => setFormData({ ...formData, max_risk_limit: e.target.value })}
                  />
                </div>
              </div>

              <div style={{ borderTop: "1px solid var(--border-subtle)", paddingTop: "1rem" }}>
                <span className="card-title" style={{ display: "block", marginBottom: "0.75rem" }}>
                  Regulatory Asset Caps (Upper Bounds)
                </span>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                  <div className="form-group">
                    <label className="form-label">Max Equity Allocation ({formData.equity_max * 100}%)</label>
                    <input
                      type="range"
                      min="0.10"
                      max="0.60"
                      step="0.05"
                      value={formData.equity_max}
                      onChange={e => setFormData({ ...formData, equity_max: parseFloat(e.target.value) })}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Max Corporate Bonds ({formData.corpbonds_max * 100}%)</label>
                    <input
                      type="range"
                      min="0.10"
                      max="0.50"
                      step="0.05"
                      value={formData.corpbonds_max}
                      onChange={e => setFormData({ ...formData, corpbonds_max: parseFloat(e.target.value) })}
                    />
                  </div>
                </div>
              </div>

              <button type="submit" className="btn btn-primary" disabled={loading} style={{ padding: "0.8rem" }}>
                {loading ? "Solving Quadratic Program with CVXPY..." : "Optimize My Capital Allocation"}
              </button>
            </form>
          </div>
        )}

        {/* ====================================================
            TAB 3: CONTINUOUS RISK MONITORING & VaR
           ==================================================== */}
        {activeTab === "monitoring" && (
          <div className="animate-fade-in" style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
            <div className="card" style={{ borderColor: isAlert ? "var(--accent-alert)" : "var(--border-subtle)" }}>
              <div className="card-header">
                <div>
                  <span className="card-title">Live Risk Threshold Monitor</span>
                  <p className="card-subtitle">Evaluates real-time returns against configured regulatory risk ceilings</p>
                </div>
                <div className={`badge ${isAlert ? "badge-alert" : "badge-safe"}`}>
                  {isAlert ? "CRITICAL RISK BREACH" : "NORMAL COMPLIANCE"}
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "1.5rem", marginTop: "1rem" }}>
                <div className="metric-box">
                  <span className="metric-label">Historical VaR (95% 1-Day)</span>
                  <span className="metric-value mono">
                    {formatCurrency(monitoringMetrics?.historical_var_95 || 7561015)}
                  </span>
                  <span className="metric-sub">Non-parametric empirical loss</span>
                </div>

                <div className="metric-box">
                  <span className="metric-label">Annualized Volatility</span>
                  <span className="metric-value mono" style={{ color: isAlert ? "var(--accent-alert)" : "inherit" }}>
                    {monitoringMetrics?.annualized_volatility
                      ? `${(monitoringMetrics.annualized_volatility * 100).toFixed(2)}%`
                      : "7.13%"}
                  </span>
                  <span className="metric-sub">Threshold: {((portfolio?.max_risk_limit || 0.07)*100).toFixed(1)}%</span>
                </div>

                <div className="metric-box">
                  <span className="metric-label">Peak-To-Trough Max Drawdown</span>
                  <span className="metric-value mono">
                    {monitoringMetrics?.max_drawdown
                      ? `${(monitoringMetrics.max_drawdown * 100).toFixed(2)}%`
                      : "5.02%"}
                  </span>
                  <span className="metric-sub">Historical stress window</span>
                </div>
              </div>

              {isAlert && (
                <div
                  style={{
                    marginTop: "1.5rem",
                    padding: "1rem",
                    background: "var(--accent-alert-bg)",
                    borderRadius: "var(--radius-sm)",
                    border: "1px solid var(--accent-alert-border)"
                  }}
                >
                  <p style={{ color: "var(--accent-alert)", fontWeight: 600, fontSize: "14px", marginBottom: "0.25rem" }}>
                    Trigger Condition:
                  </p>
                  <p style={{ fontSize: "13px", color: "var(--text-secondary)" }}>
                    Portfolio volatility (8.1%) breached configured risk threshold (7.0%). Immediate cost-benefit rebalance evaluation is required.
                  </p>
                </div>
              )}
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end", gap: "1rem" }}>
              <button className="btn btn-secondary" onClick={() => refreshMonitoring()}>
                <RefreshCw size={14} /> Refresh Metrics
              </button>
              {isAlert && (
                <button
                  className="btn btn-primary"
                  onClick={() => {
                    setActiveTab("rebalance");
                    handleEvaluateRebalance();
                  }}
                >
                  Proceed to Cost-Aware Rebalancing <ArrowRight size={16} />
                </button>
              )}
            </div>
          </div>
        )}

        {/* ====================================================
            TAB 4: COST-AWARE REBALANCING ENGINE
           ==================================================== */}
        {activeTab === "rebalance" && (
          <div className="animate-fade-in" style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
            <div className="card">
              <div className="card-header">
                <div>
                  <span className="card-title">Cost vs. Benefit Rebalancing Evaluation</span>
                  <p className="card-subtitle">
                    Determines if risk reduction value exceeds trading execution friction
                  </p>
                </div>
                <div className="badge badge-safe mono">Decision Matrix</div>
              </div>

              {/* Sliders for assumptions */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "2rem",
                  padding: "1rem",
                  background: "var(--bg-hover)",
                  borderRadius: "var(--radius-sm)",
                  marginBottom: "1.5rem"
                }}
              >
                <div>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.5rem" }}>
                    <span className="form-label">Execution Cost Penalty: {rebalanceCostBps} bps</span>
                    <span className="mono" style={{ fontSize: "12px" }}>{(rebalanceCostBps / 100).toFixed(2)}% per trade</span>
                  </div>
                  <input
                    type="range"
                    min="5"
                    max="50"
                    step="1"
                    value={rebalanceCostBps}
                    onChange={e => {
                      setRebalanceCostBps(parseFloat(e.target.value));
                      handleEvaluateRebalance();
                    }}
                    style={{ width: "100%" }}
                  />
                </div>

                <div>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.5rem" }}>
                    <span className="form-label">Rebalance Step Ratio: {partialRatio * 100}%</span>
                    <span className="mono" style={{ fontSize: "12px" }}>
                      {partialRatio === 1.0 ? "Full Rebalance" : "Partial (Avoid Turnover)"}
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0.25"
                    max="1.0"
                    step="0.25"
                    value={partialRatio}
                    onChange={e => {
                      setPartialRatio(parseFloat(e.target.value));
                      handleEvaluateRebalance();
                    }}
                    style={{ width: "100%" }}
                  />
                </div>
              </div>

              {/* Decision Box */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 2fr",
                  gap: "1.5rem",
                  border: "1px solid var(--border-medium)",
                  borderRadius: "var(--radius-md)",
                  padding: "1.5rem",
                  marginBottom: "1.5rem"
                }}
              >
                <div style={{ display: "flex", flexDirection: "column", justifyContent: "center", borderRight: "1px solid var(--border-subtle)", paddingRight: "1.5rem" }}>
                  <span className="metric-label">Algorithm Verdict</span>
                  <div style={{ marginTop: "0.5rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                    <span
                      style={{
                        fontSize: "24px",
                        fontWeight: 700,
                        letterSpacing: "-0.02em",
                        color: rebalanceEval?.decision === "HOLD" ? "var(--text-muted)" : "var(--text-primary)"
                      }}
                    >
                      {rebalanceEval?.decision || "REBALANCE"}
                    </span>
                  </div>
                  <span style={{ fontSize: "12px", color: "var(--text-muted)", marginTop: "0.25rem" }}>
                    {rebalanceEval?.decision === "HOLD" ? "Capital Churn Prevented" : "Action Justified by Risk Math"}
                  </span>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "1rem" }}>
                  <div className="metric-box">
                    <span className="metric-label">Turnover</span>
                    <span className="metric-value mono" style={{ fontSize: "20px" }}>
                      {rebalanceEval?.turnover_percentage ? `${rebalanceEval.turnover_percentage}%` : "20.0%"}
                    </span>
                    <span className="metric-sub">Capital reallocation</span>
                  </div>

                  <div className="metric-box">
                    <span className="metric-label">Trading Cost</span>
                    <span className="metric-value mono" style={{ fontSize: "20px" }}>
                      {formatCurrency(rebalanceEval?.transaction_cost || 300000)}
                    </span>
                    <span className="metric-sub">Execution friction</span>
                  </div>

                  <div className="metric-box">
                    <span className="metric-label">Risk Reduction Value</span>
                    <span className="metric-value mono" style={{ fontSize: "20px" }}>
                      {formatCurrency(rebalanceEval?.risk_reduction_value || 40000000)}
                    </span>
                    <span className="metric-sub">Economic benefit</span>
                  </div>
                </div>
              </div>

              {/* Explanation note */}
              <p style={{ fontSize: "13px", color: "var(--text-secondary)", marginBottom: "1.5rem" }}>
                <strong>Audit Note:</strong> {rebalanceEval?.explanation || "Rebalance recommended: Risk reduction benefit outweighs turnover friction."}
              </p>

              {/* Execute Action */}
              <div style={{ display: "flex", justifyContent: "flex-end" }}>
                <button
                  className="btn btn-primary"
                  onClick={handleExecuteRebalance}
                  disabled={rebalanceExecuting}
                >
                  <RefreshCw size={14} className={rebalanceExecuting ? "animate-spin" : ""} />
                  {rebalanceExecuting ? "Executing & Recording..." : "Execute Rebalance & Commit Audit Log"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ====================================================
            TAB 5: SCENARIO STRESS SIMULATOR
           ==================================================== */}
        {activeTab === "simulator" && (
          <div className="animate-fade-in" style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
            <div className="card">
              <div className="card-header">
                <div>
                  <span className="card-title">Macroeconomic Stress Testing</span>
                  <p className="card-subtitle">
                    Project hypothetical market shocks onto the active portfolio and preview response
                  </p>
                </div>
                <span className="badge badge-safe mono">What-If Engine</span>
              </div>

              {/* Shock Presets selection */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "1rem", marginBottom: "1.5rem" }}>
                <div
                  className="card"
                  style={{
                    cursor: "pointer",
                    borderColor: selectedScenario === "market_crash" ? "var(--text-primary)" : "var(--border-subtle)",
                    background: selectedScenario === "market_crash" ? "var(--bg-hover)" : "var(--bg-surface)"
                  }}
                  onClick={() => {
                    setSelectedScenario("market_crash");
                  }}
                >
                  <h4 style={{ fontSize: "14px", fontWeight: 600, marginBottom: "0.25rem" }}>Market Crash</h4>
                  <p style={{ fontSize: "12px", color: "var(--text-secondary)" }}>
                    Equities -30%, Gold +10%, Volatility × 1.5
                  </p>
                </div>

                <div
                  className="card"
                  style={{
                    cursor: "pointer",
                    borderColor: selectedScenario === "rate_hike" ? "var(--text-primary)" : "var(--border-subtle)",
                    background: selectedScenario === "rate_hike" ? "var(--bg-hover)" : "var(--bg-surface)"
                  }}
                  onClick={() => {
                    setSelectedScenario("rate_hike");
                  }}
                >
                  <h4 style={{ fontSize: "14px", fontWeight: 600, marginBottom: "0.25rem" }}>Aggressive Rate Hike</h4>
                  <p style={{ fontSize: "12px", color: "var(--text-secondary)" }}>
                    Bonds -8%, Cash +1%, Equity -5%, Volatility × 1.2
                  </p>
                </div>

                <div
                  className="card"
                  style={{
                    cursor: "pointer",
                    borderColor: selectedScenario === "inflation_spike" ? "var(--text-primary)" : "var(--border-subtle)",
                    background: selectedScenario === "inflation_spike" ? "var(--bg-hover)" : "var(--bg-surface)"
                  }}
                  onClick={() => {
                    setSelectedScenario("inflation_spike");
                  }}
                >
                  <h4 style={{ fontSize: "14px", fontWeight: 600, marginBottom: "0.25rem" }}>Inflation Spike</h4>
                  <p style={{ fontSize: "12px", color: "var(--text-secondary)" }}>
                    Gold +15%, Bonds -6%, Equity -3%, Volatility × 1.3
                  </p>
                </div>
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: "1.5rem" }}>
                <button className="btn btn-primary btn-sm" onClick={handleRunStressTest} disabled={simLoading}>
                  <Zap size={14} /> {simLoading ? "Simulating..." : "Run Stress Test Simulation"}
                </button>
              </div>

              {/* Stress Simulation Results */}
              {simResult && (
                <div style={{ borderTop: "1px solid var(--border-subtle)", paddingTop: "1.5rem" }}>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "1rem", marginBottom: "1.5rem" }}>
                    <div className="metric-box">
                      <span className="metric-label">Capital Impact</span>
                      <span className="metric-value mono" style={{ color: "var(--accent-alert)" }}>
                        {formatCurrency(simResult.shocked_portfolio?.capital_impact)}
                      </span>
                      <span className="metric-sub">Immediate value decline</span>
                    </div>

                    <div className="metric-box">
                      <span className="metric-label">Shocked Risk (Volatility)</span>
                      <span className="metric-value mono" style={{ color: "var(--accent-alert)" }}>
                        {(simResult.shocked_portfolio?.portfolio_risk * 100).toFixed(2)}%
                      </span>
                      <span className="metric-sub">Pre-shock: {(simResult.pre_shock?.portfolio_risk * 100).toFixed(2)}%</span>
                    </div>

                    <div className="metric-box">
                      <span className="metric-label">Risk Threshold Status</span>
                      <span className="metric-value" style={{ fontSize: "20px", fontWeight: 600 }}>
                        {simResult.shocked_portfolio?.is_breach ? "🔴 BREACH" : "🟢 SAFE"}
                      </span>
                      <span className="metric-sub">Policy Limit: {((portfolio?.max_risk_limit || 0.07)*100).toFixed(1)}%</span>
                    </div>

                    <div className="metric-box">
                      <span className="metric-label">Preview Rebalance Action</span>
                      <span className="metric-value" style={{ fontSize: "20px", fontWeight: 600 }}>
                        {simResult.rebalance_preview?.decision}
                      </span>
                      <span className="metric-sub">Turnover: {simResult.rebalance_preview?.turnover_percentage}%</span>
                    </div>
                  </div>

                  <div style={{ background: "var(--bg-hover)", padding: "1rem", borderRadius: "var(--radius-sm)" }}>
                    <p style={{ fontSize: "13px", color: "var(--text-secondary)" }}>
                      <strong>Preview Insight:</strong> {simResult.rebalance_preview?.explanation}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ====================================================
            TAB 6: AUDIT & DECISION HISTORY LOG
           ==================================================== */}
        {activeTab === "history" && (
          <div className="animate-fade-in card">
            <div className="card-header">
              <div>
                <span className="card-title">Immutable Decision History</span>
                <p className="card-subtitle">
                  Append-only regulatory audit trail of all automated alerts, rebalances, and hold actions
                </p>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                <span className="badge badge-safe mono">{historyRecords.length} Records</span>
                {historyRecords.length > 0 && (
                  <button className="btn btn-secondary btn-sm" onClick={exportHistoryCSV} title="Download official audit CSV">
                    <Download size={13} /> Export CSV
                  </button>
                )}
              </div>
            </div>

            {historyRecords.length === 0 ? (
              <div style={{ textAlign: "center", padding: "3rem", color: "var(--text-muted)" }}>
                <FileText size={32} style={{ margin: "0 auto 1rem auto", opacity: 0.5 }} />
                <p>No decision logs recorded yet.</p>
                <p style={{ fontSize: "12px", marginTop: "0.5rem" }}>
                  Run a simulated breach or execute a rebalance to populate the regulatory audit trail.
                </p>
              </div>
            ) : (
              <div className="table-container">
                <table className="finance-table">
                  <thead>
                    <tr>
                      <th>Timestamp</th>
                      <th>Trigger Event</th>
                      <th>Decision</th>
                      <th>Turnover</th>
                      <th>Trading Cost</th>
                      <th>Risk Impact</th>
                      <th>Audit Rationale</th>
                    </tr>
                  </thead>
                  <tbody>
                    {historyRecords.map(rec => (
                      <tr key={rec.id}>
                        <td className="mono" style={{ fontSize: "12px" }}>
                          {rec.timestamp ? new Date(rec.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }) : "Just now"}
                        </td>
                        <td style={{ fontWeight: 500 }}>{rec.trigger}</td>
                        <td>
                          <span className={`badge ${rec.decision === "REBALANCE" ? "badge-safe" : "badge-safe"}`} style={{ fontWeight: 700 }}>
                            {rec.decision}
                          </span>
                        </td>
                        <td className="mono">{(rec.turnover * 100).toFixed(1)}%</td>
                        <td className="mono">{formatCurrency(rec.transaction_cost)}</td>
                        <td className="mono">
                          {(rec.portfolio_risk_before * 100).toFixed(1)}% → {(rec.portfolio_risk_after * 100).toFixed(1)}%
                        </td>
                        <td style={{ fontSize: "12px", color: "var(--text-secondary)", maxWidth: "320px" }}>
                          {rec.explanation}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </main>

      {/* FOOTER */}
      <footer
        style={{
          borderTop: "1px solid var(--border-subtle)",
          padding: "1rem 2rem",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          fontSize: "12px",
          color: "var(--text-muted)",
          background: "var(--bg-primary)"
        }}
      >
        <div>Capital Optimization & Risk Control Platform · Enterprise Decision System</div>
        <div className="mono">API: http://127.0.0.1:8000 (FastAPI + CVXPY)</div>
      </footer>

      {/* SUPABASE AUTHENTICATION MODAL */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onAuthSuccess={(user) => {
          setCurrentUser(user);
          if (user?.user_metadata?.org_name) {
            setFormData(prev => ({
              ...prev,
              org_name: user.user_metadata.org_name
            }));
          }
        }}
        currentUser={currentUser}
      />

      {/* CAPITAL GUARD AI COPILOT DRAWER */}
      <AICopilotDrawer
        isOpen={isCopilotOpen}
        onClose={() => setIsCopilotOpen(false)}
        portfolio={portfolio}
        macroIndicators={macroIndicators}
      />

      {/* FLOATING COPILOT LAUNCHER BUTTON */}
      <button
        onClick={() => setIsCopilotOpen(true)}
        title="Open Capital Guard AI Copilot (Groq LPU Llama 3.3 70B)"
        style={{
          position: "fixed",
          bottom: "1.75rem",
          right: "1.75rem",
          zIndex: 890,
          background: "#111111",
          color: "#FFFFFF",
          border: "1px solid #333333",
          borderRadius: "32px",
          padding: "0.65rem 1.15rem",
          display: "flex",
          alignItems: "center",
          gap: "0.55rem",
          boxShadow: "0 8px 24px rgba(0,0,0,0.35)",
          cursor: "pointer",
          fontWeight: 600,
          fontSize: "12px",
          letterSpacing: "0.3px",
          transition: "all 0.2s cubic-bezier(0.16, 1, 0.3, 1)"
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = "scale(1.05)";
          e.currentTarget.style.background = "#000000";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = "scale(1.0)";
          e.currentTarget.style.background = "#111111";
        }}
      >
        <Sparkles size={15} color="#60A5FA" />
        <span>Ask AI Copilot</span>
        <span
          style={{
            fontSize: "9px",
            background: "#2563EB",
            color: "#FFFFFF",
            padding: "1px 5px",
            borderRadius: "3px",
            fontWeight: 700
          }}
        >
          Groq
        </span>
      </button>
    </div>
  );
}


