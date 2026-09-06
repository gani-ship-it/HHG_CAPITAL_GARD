import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import * as api from "../api";
import { DEMO_PRESET_BANK } from "../services/demoData";

const PortfolioContext = createContext(null);

export function PortfolioProvider({ children }) {
  // Navigation & Workflow Stage
  const [activeTab, setActiveTab] = useState("landing");
  const [setupStep, setSetupStep] = useState(1);
  const [isInitialized, setIsInitialized] = useState(false);

  // Core Financial State
  const [portfolio, setPortfolio] = useState(null);
  const [optimizationData, setOptimizationData] = useState(null);
  const [monitoringMetrics, setMonitoringMetrics] = useState(null);
  const [riskStatus, setRiskStatus] = useState("SAFE"); // "SAFE" | "BREACH"
  const [activeAlert, setActiveAlert] = useState(null);

  // Rebalance & Execution State
  const [rebalanceEval, setRebalanceEval] = useState(null);
  const [rebalanceCostBps, setRebalanceCostBps] = useState(15.0);
  const [partialRatio, setPartialRatio] = useState(1.0);
  const [rebalanceExecuting, setRebalanceExecuting] = useState(false);

  // Audit & Decision History
  const [decisionHistory, setDecisionHistory] = useState([]);

  // Macro & Telemetry
  const [macroIndicators, setMacroIndicators] = useState(null);

  // UI Modals & Drawers
  const [isCopilotOpen, setIsCopilotOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Live Streaming Telemetry State
  const [isLiveStreaming, setIsLiveStreaming] = useState(true);
  const [lastTickTime, setLastTickTime] = useState(() => new Date().toLocaleTimeString());

  // Real-Time Company P&L State
  const [realtimePnL, setRealtimePnL] = useState({
    sessionPnlAmount: 1840000.0,
    sessionPnlPercent: 0.184,
    sessionHigh: 2450000.0,
    sessionLow: -420000.0,
    assetBreakdown: [
      { asset: "Equity", weight: 0.25, pnlAmount: 2450000, pnlPercent: 0.98, risk: 16.2, expectedReturn: 12.4 },
      { asset: "GovBonds", weight: 0.35, pnlAmount: 420000, pnlPercent: 0.12, risk: 5.8, expectedReturn: 4.2 },
      { asset: "CorpBonds", weight: 0.20, pnlAmount: 310000, pnlPercent: 0.15, risk: 8.9, expectedReturn: 6.5 },
      { asset: "Gold", weight: 0.10, pnlAmount: -1380000, pnlPercent: -1.38, risk: 14.1, expectedReturn: 8.1 },
      { asset: "Cash", weight: 0.10, pnlAmount: 40000, pnlPercent: 0.04, risk: 0.5, expectedReturn: 4.5 }
    ],
    history: []
  });

  // User Authentication State — null means unauthenticated
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const saved = localStorage.getItem("capital_guard_user");
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  // Setup Wizard Draft Form
  const [formData, setFormData] = useState({
    org_name: "Apex Reserve Bank",
    org_type: "Bank",
    total_capital: 1000000000.0, // ₹100 Cr
    currency: "INR",
    investment_horizon_years: 3,
    investment_objective: "Balanced Growth",
    risk_preference: "Medium",
    min_liquidity: 200000000.0, // ₹20 Cr
    max_risk_limit: 0.07, // 7.0%
    selected_assets: ["GovBonds", "CorpBonds", "Equity", "Gold", "Cash"],
    equity_max: 0.30,
    corpbonds_max: 0.25
  });

  // Fetch FRED Macro Indicators on startup
  useEffect(() => {
    let mounted = true;
    async function loadMacro() {
      try {
        const data = await api.fetchMacroIndicators();
        if (mounted && data) {
          setMacroIndicators(data);
        }
      } catch (err) {
        console.warn("Macro fetch failed:", err);
      }
    }
    loadMacro();
    return () => { mounted = false; };
  }, []);

  // Synchronize user profile with form data on mount / user change
  useEffect(() => {
    if (currentUser && !currentUser.isGuest) {
      setFormData((prev) => ({
        ...prev,
        org_name: currentUser.org_name || prev.org_name,
        org_type: currentUser.org_type || prev.org_type,
        total_capital: currentUser.initial_capital || prev.total_capital,
        currency: currentUser.currency || prev.currency,
        investment_horizon_years: currentUser.investment_horizon?.includes("5") ? 5 : (currentUser.investment_horizon?.includes("1") ? 1 : 3),
        risk_preference: currentUser.risk_tolerance || prev.risk_preference,
        min_liquidity: (currentUser.initial_capital || prev.total_capital) * 0.20,
        investment_objective: currentUser.purpose?.includes("Capital") ? "Capital Preservation" : (currentUser.purpose?.includes("Growth") ? "Growth" : "Balanced Growth")
      }));
    }
  }, [currentUser]);

  // Update Form Data helper
  const updateFormData = useCallback((patch) => {
    setFormData((prev) => ({ ...prev, ...patch }));
  }, []);

  // Refresh Monitoring Metrics
  const refreshMonitoring = useCallback(async (pId) => {
    const targetId = pId || portfolio?.id;
    if (!targetId) return;
    try {
      const res = await api.fetchMonitoringMetrics(targetId);
      if (res && res.metrics) {
        setMonitoringMetrics(res.metrics);
        const isBreached = res.metrics.status === "BREACH" || res.metrics.current_risk > res.metrics.risk_limit;
        setRiskStatus(isBreached ? "BREACH" : "SAFE");
        if (isBreached) {
          setActiveAlert({
            type: "RISK_LIMIT_BREACH",
            message: `Current risk (${(res.metrics.current_risk * 100).toFixed(2)}%) exceeds mandate limit (${(res.metrics.risk_limit * 100).toFixed(2)}%)`,
            timestamp: new Date().toISOString()
          });
        } else {
          setActiveAlert(null);
        }
      }
    } catch (err) {
      console.warn("Failed to refresh monitoring:", err);
    }
  }, [portfolio?.id]);

  // Real-Time Live Market Ticker & P&L Drift Engine (every 3.5s)
  useEffect(() => {
    if (!isLiveStreaming || !portfolio || riskStatus === "BREACH") return;

    const interval = setInterval(() => {
      const now = new Date().toLocaleTimeString();
      setLastTickTime(now);

      const totalCapital = portfolio.total_capital || 1000000000.0;
      const weights = portfolio.allocations || {
        GovBonds: 0.35,
        CorpBonds: 0.20,
        Equity: 0.25,
        Gold: 0.10,
        Cash: 0.10
      };

      // 1. Mean-reverting volatility drift around a safe baseline (comfortably within limit)
      setMonitoringMetrics((prev) => {
        if (!prev) return prev;
        const limit = prev.risk_limit || portfolio.max_risk_limit || 0.07;
        const targetBaseline = Math.min(limit * 0.74, 0.049);
        const current = prev.current_risk || targetBaseline;
        // Mean reversion pull toward target baseline + small random brownian noise
        const meanReversion = (targetBaseline - current) * 0.15;
        const noise = (Math.random() - 0.49) * 0.0003;
        const newRisk = Math.max(0.02, Math.min(limit - 0.006, current + meanReversion + noise));

        return {
          ...prev,
          current_risk: newRisk,
          var_95: newRisk * 0.58,
          cvar_95: newRisk * 0.76,
          last_tick: now
        };
      });

      // 2. Real-Time P&L simulation per asset class
      setRealtimePnL((prev) => {
        const assets = ["GovBonds", "CorpBonds", "Equity", "Gold", "Cash"];
        const prevBreakdown = prev?.assetBreakdown || [];

        const assetVol = {
          Equity: 0.0008,
          Gold: 0.0005,
          CorpBonds: 0.0003,
          GovBonds: 0.0002,
          Cash: 0.00005
        };

        const updatedBreakdown = assets.map((asset) => {
          const w = weights[asset] !== undefined ? weights[asset] : 0.20;
          const prevEntry = prevBreakdown.find((b) => b.asset === asset) || {
            pnlPercent: (Math.random() - 0.45) * 0.4,
            risk: asset === "Equity" ? 16.2 : asset === "Gold" ? 14.1 : asset === "CorpBonds" ? 8.9 : asset === "GovBonds" ? 5.8 : 0.5
          };
          const vol = assetVol[asset] || 0.0003;
          const tickReturn = (Math.random() - 0.485) * vol * 100;
          const newPnlPercent = prevEntry.pnlPercent + tickReturn;
          const assetAllocatedCapital = totalCapital * w;
          const pnlAmount = assetAllocatedCapital * (newPnlPercent / 100);

          return {
            asset,
            weight: w,
            pnlPercent: newPnlPercent,
            pnlAmount: Math.round(pnlAmount),
            risk: prevEntry.risk
          };
        });

        const totalPnlAmount = updatedBreakdown.reduce((sum, item) => sum + item.pnlAmount, 0);
        const totalPnlPercent = (totalPnlAmount / totalCapital) * 100;
        const newHigh = Math.max(prev?.sessionHigh ?? totalPnlAmount, totalPnlAmount);
        const newLow = Math.min(prev?.sessionLow ?? totalPnlAmount, totalPnlAmount);

        const newHistoryPoint = {
          time: now,
          pnlPercent: totalPnlPercent,
          pnlAmount: totalPnlAmount
        };

        const updatedHistory = [...(prev?.history || []), newHistoryPoint].slice(-25);

        return {
          sessionPnlAmount: totalPnlAmount,
          sessionPnlPercent: totalPnlPercent,
          sessionHigh: newHigh,
          sessionLow: newLow,
          assetBreakdown: updatedBreakdown,
          history: updatedHistory
        };
      });
    }, 3500);

    return () => clearInterval(interval);
  }, [isLiveStreaming, portfolio, riskStatus]);

  // Load Audit History
  const loadHistory = useCallback(async (pId) => {
    const targetId = pId || portfolio?.id;
    if (!targetId) return;
    try {
      const res = await api.fetchDecisionHistory(targetId);
      const records = res?.history || res?.records || [];
      setDecisionHistory(records);
    } catch (err) {
      console.warn("Failed to load decision history:", err);
    }
  }, [portfolio?.id]);

  // Run Optimization
  const runOptimization = useCallback(async (customPayload = null) => {
    setLoading(true);
    setError(null);
    const dataToSend = customPayload || formData;
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
      setIsInitialized(true);
      setActiveTab("overview");

      // Load monitoring and history
      await refreshMonitoring(res.portfolio.id);
      await loadHistory(res.portfolio.id);
      return res;
    } catch (err) {
      setError(err.message || "Optimization failed");
      throw err;
    } finally {
      setLoading(false);
    }
  }, [formData, refreshMonitoring, loadHistory]);

  // Fast Load Demo Preset (₹100 Cr Bank Demo)
  const loadDemoPreset = useCallback(async () => {
    setFormData(DEMO_PRESET_BANK);
    const payload = { ...DEMO_PRESET_BANK, portfolio_id: portfolio?.id || 1 };
    return await runOptimization(payload);
  }, [portfolio?.id, runOptimization]);

  // Start Setup Wizard
  const startSetup = useCallback(() => {
    setActiveTab("setup");
    setSetupStep(1);
  }, []);

  // Evaluate Rebalance Action
  const evaluateRebalanceAction = useCallback(async (costBps = rebalanceCostBps, ratio = partialRatio) => {
    const targetId = portfolio?.id || 1;
    try {
      const payload = {
        portfolio_id: targetId,
        cost_per_trade_bps: parseFloat(costBps),
        partial_ratio: parseFloat(ratio)
      };
      const res = await api.evaluateRebalance(payload);
      setRebalanceEval(res);
      return res;
    } catch (err) {
      console.warn("Rebalance evaluation error:", err);
      return null;
    }
  }, [portfolio?.id, rebalanceCostBps, partialRatio]);

  // Simulate Market Shock (trigging Breach)
  const triggerMarketShock = useCallback(async (simulatedRisk = 0.081) => {
    const targetId = portfolio?.id || 1;
    setLoading(true);
    try {
      const res = await api.simulateMarketChange(targetId, simulatedRisk);
      const metricsPayload = res?.metrics || {
        current_risk: res.simulated_risk || simulatedRisk,
        risk_limit: res.max_risk_limit || 0.07,
        status: res.status === "ALERT" ? "BREACH" : "SAFE",
        liquidity_ratio: portfolio?.min_liquidity ? portfolio.min_liquidity / (portfolio.total_capital || 1) : 0.20
      };

      setMonitoringMetrics(metricsPayload);
      setRiskStatus("BREACH");
      setPortfolio((prev) => prev ? { ...prev, expected_risk: simulatedRisk, status: "ALERT" } : prev);
      setActiveAlert({
        type: "MARKET_SHOCK_BREACH",
        message: `Volatility shock detected: Portfolio risk elevated to ${(simulatedRisk * 100).toFixed(2)}% (Limit: ${((res.max_risk_limit || 0.07) * 100).toFixed(2)}%)`,
        timestamp: new Date().toISOString()
      });
      // Immediately run rebalance evaluation so the solution is pre-computed
      await evaluateRebalanceAction();
      // Switch to risk monitoring view to display live shock telemetry
      setActiveTab("monitoring");
    } catch (err) {
      setError(err.message || "Market shock simulation failed");
    } finally {
      setLoading(false);
    }
  }, [portfolio?.id, evaluateRebalanceAction, setActiveTab]);

  // Reset Market Shock
  const resetMarketShock = useCallback(async () => {
    if (!portfolio?.id) return;
    setLoading(true);
    try {
      const safeCeiling = portfolio.max_risk_limit || 0.07;
      const baselineRisk = Math.min(0.048, safeCeiling * 0.72);
      const res = await api.simulateMarketChange(portfolio.id, baselineRisk);
      const metricsPayload = {
        current_risk: baselineRisk,
        risk_limit: safeCeiling,
        status: "SAFE",
        var_95: baselineRisk * 0.58,
        cvar_95: baselineRisk * 0.76,
        liquidity_ratio: portfolio.min_liquidity
          ? portfolio.min_liquidity / (portfolio.total_capital || 1)
          : 0.20
      };
      setMonitoringMetrics(metricsPayload);
      setRiskStatus("SAFE");
      setActiveAlert(null);
      setRebalanceEval(null);
      setPortfolio((prev) => prev ? { ...prev, expected_risk: baselineRisk, current_risk: baselineRisk, status: "SAFE" } : prev);
    } catch (err) {
      console.warn("Reset market shock error:", err);
      setRiskStatus("SAFE");
      setActiveAlert(null);
    } finally {
      setLoading(false);
    }
  }, [portfolio]);

  // Execute Rebalance Action
  const executeRebalanceAction = useCallback(async (rationale = "Basel III Risk De-risking via Clarabel QP") => {
    if (!portfolio?.id || !rebalanceEval) return;
    setRebalanceExecuting(true);
    try {
      const isGuest = Boolean(currentUser?.isGuest);
      const payload = {
        portfolio_id: portfolio.id,
        cost_per_trade_bps: parseFloat(rebalanceCostBps),
        risk_aversion_factor: 2.0,
        partial_ratio: parseFloat(partialRatio),
        trigger: rationale,
        is_guest: isGuest,
        user_email: currentUser?.email || null
      };
      const res = await api.executeRebalance(payload);
      // Merge full updated_portfolio from backend to keep all fields in sync
      if (res.updated_portfolio) {
        setPortfolio((prev) => ({ ...prev, ...res.updated_portfolio }));
      } else {
        // Fallback: manual patch if updated_portfolio not returned
        setPortfolio((prev) => ({
          ...prev,
          allocations: res.updated_allocations || rebalanceEval.target_weights,
          current_weights: res.updated_allocations || rebalanceEval.target_weights,
          expected_risk: res.updated_risk || rebalanceEval.post_risk,
          current_risk: res.updated_risk || rebalanceEval.post_risk,
          expected_return: res.updated_return || rebalanceEval.post_return
        }));
      }
      setRiskStatus("SAFE");
      setActiveAlert(null);
      setRebalanceEval(null);
      await refreshMonitoring(portfolio.id);

      if (isGuest) {
        // Guest Mode: Store ephemeral record in local memory only; do not fetch from DB
        if (res.history_record) {
          setDecisionHistory((prev) => [res.history_record, ...(prev || [])]);
        }
      } else {
        // Registered Mode: Fetch authoritative audit trail from PostgreSQL database
        await loadHistory(portfolio.id);
      }
      return res;
    } catch (err) {
      setError(err.message || "Rebalance execution failed");
      throw err;
    } finally {
      setRebalanceExecuting(false);
    }
  }, [portfolio?.id, rebalanceEval, rebalanceCostBps, partialRatio, currentUser, refreshMonitoring, loadHistory]);

  // Hold Action (Formal Risk Acknowledgment)
  const holdPortfolioAction = useCallback(async (rationale = "Transient market shock; transaction frictions exceed short-term variance. Maintained current weights.") => {
    if (!portfolio?.id) return;
    setRebalanceExecuting(true);
    try {
      const payload = {
        portfolio_id: portfolio.id,
        rebalance_data: rebalanceEval || {
          action: "HOLD_NO_ACTION",
          turnover: 0,
          transaction_cost: 0,
          current_risk: monitoringMetrics?.current_risk || portfolio.expected_risk,
          risk_reduction_bps: 0
        },
        cost_bps: rebalanceCostBps,
        rationale: rationale
      };
      await api.executeRebalance(payload);
      await loadHistory(portfolio.id);
    } catch (err) {
      setError(err.message || "Hold recording failed");
    } finally {
      setRebalanceExecuting(false);
    }
  }, [portfolio, rebalanceEval, monitoringMetrics, rebalanceCostBps, loadHistory]);

  const value = {
    // Navigation & Stages
    activeTab,
    setActiveTab,
    setupStep,
    setSetupStep,
    isInitialized,
    setIsInitialized,

    // Core Portfolio
    portfolio,
    setPortfolio,
    optimizationData,
    monitoringMetrics,
    riskStatus,
    activeAlert,
    formData,
    updateFormData,

    // Rebalance
    rebalanceEval,
    setRebalanceEval,
    rebalanceCostBps,
    setRebalanceCostBps,
    partialRatio,
    setPartialRatio,
    rebalanceExecuting,

    // History & Telemetry
    decisionHistory,
    macroIndicators,
    loading,
    error,
    setError,

    // Modals & User
    isCopilotOpen,
    setIsCopilotOpen,
    isAuthModalOpen,
    setIsAuthModalOpen,
    currentUser,
    setCurrentUser,

    // Live Streaming & Real-Time P&L
    isLiveStreaming,
    setIsLiveStreaming,
    lastTickTime,
    realtimePnL,
    setRealtimePnL,

    // Actions
    startSetup,
    loadDemoPreset,
    runOptimization,
    refreshMonitoring,
    loadHistory,
    triggerMarketShock,
    resetMarketShock,
    evaluateRebalanceAction,
    executeRebalanceAction,
    holdPortfolioAction
  };

  return <PortfolioContext.Provider value={value}>{children}</PortfolioContext.Provider>;
}

export function usePortfolio() {
  const context = useContext(PortfolioContext);
  if (!context) {
    throw new Error("usePortfolio must be used within a PortfolioProvider");
  }
  return context;
}
