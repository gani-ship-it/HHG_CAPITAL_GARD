import React from "react";
import { usePortfolio } from "../state/portfolioStore";
import { formatCurrency } from "../utils/formatCurrency";
import { Landmark, Briefcase, Clock, Target, Shield, Edit3, RefreshCw } from "lucide-react";

export default function PortfolioContextStrip() {
  const {
    isInitialized,
    portfolio,
    refreshMonitoring,
    setActiveTab,
    loading
  } = usePortfolio();

  if (!isInitialized || !portfolio) return null;

  return (
    <div className="bg-white border-b border-zinc-200 px-6 py-2.5 flex flex-wrap items-center justify-between gap-4 select-none">
            <div className="flex items-center gap-2.5">
        <div className="w-6 h-6 rounded bg-zinc-900 text-white flex items-center justify-center">
          <Landmark className="w-3.5 h-3.5" />
        </div>
        <div className="flex items-center gap-2">
          <h2 className="text-xs font-bold text-zinc-900">{portfolio.org_name}</h2>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-zinc-100 text-zinc-700 border border-zinc-200 uppercase tracking-wider font-semibold">
            {portfolio.org_type || "Bank"}
          </span>
          <span className="text-[10px] font-mono text-zinc-400">
            ID: {String(portfolio.id || '').slice(0, 8)}
          </span>
        </div>
      </div>

            <div className="flex items-center gap-6 text-xs">
        <div className="flex items-center gap-1.5">
          <Briefcase className="w-3.5 h-3.5 text-zinc-400" />
          <span className="text-[10px] text-zinc-500 uppercase tracking-wider font-medium">Capital:</span>
          <span className="font-mono font-semibold text-zinc-900 text-xs">
            {formatCurrency(portfolio.total_capital, portfolio.currency)}
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          <Target className="w-3.5 h-3.5 text-zinc-400" />
          <span className="text-[10px] text-zinc-500 uppercase tracking-wider font-medium">Objective:</span>
          <span className="font-medium text-zinc-900 text-xs">{portfolio.investment_objective}</span>
        </div>

        <div className="flex items-center gap-1.5">
          <Clock className="w-3.5 h-3.5 text-zinc-400" />
          <span className="text-[10px] text-zinc-500 uppercase tracking-wider font-medium">Horizon:</span>
          <span className="font-medium text-zinc-900 text-xs">{portfolio.investment_horizon_years} Yrs</span>
        </div>

        <div className="flex items-center gap-1.5">
          <Shield className="w-3.5 h-3.5 text-zinc-400" />
          <span className="text-[10px] text-zinc-500 uppercase tracking-wider font-medium">Risk Ceiling:</span>
          <span className="font-mono font-semibold text-zinc-900 text-xs">
            {((portfolio.max_risk_limit || 0.07) * 100).toFixed(2)}%
          </span>
        </div>
      </div>

            <div className="flex items-center gap-2">
        <button
          onClick={() => refreshMonitoring()}
          disabled={loading}
          className="p-1.5 rounded hover:bg-zinc-100 text-zinc-600 hover:text-zinc-900 transition text-xs border border-zinc-200"
          title="Refresh live telemetry"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin text-zinc-900" : ""}`} />
        </button>
        <button
          onClick={() => setActiveTab("setup")}
          className="flex items-center gap-1.5 px-3 py-1 rounded bg-zinc-900 hover:bg-zinc-800 text-white text-xs font-medium transition"
        >
          <Edit3 className="w-3 h-3" />
          <span>Adjust Mandate</span>
        </button>
      </div>
    </div>
  );
}
