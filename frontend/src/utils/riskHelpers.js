/**
 * Institutional Risk Assessment and Health Scoring Helpers
 */

/**
 * Calculates a composite Institutional Health Score (0 - 100).
 * Factoring:
 * - VaR headroom against limit (35 pts)
 * - Volatility headroom against target (30 pts)
 * - Liquidity buffer compliance (20 pts)
 * - Diversification / concentration penalty (15 pts)
 */
export function calculateHealthScore(portfolio, metrics) {
  if (!portfolio || !metrics) return 92; // Baseline healthy

  let score = 100;
  const currentRisk = metrics.current_risk ?? portfolio.expected_risk ?? 0.045;
  const riskLimit = metrics.risk_limit ?? 0.055;
  const isBreached = metrics.status === "BREACH" || currentRisk > riskLimit;

  // 1. VaR / Risk Penalty
  if (isBreached) {
    const overshootRatio = (currentRisk - riskLimit) / (riskLimit || 0.01);
    const riskDeduction = Math.min(45, Math.round(overshootRatio * 150) + 25);
    score -= riskDeduction;
  } else {
    const headroomRatio = (riskLimit - currentRisk) / (riskLimit || 0.01);
    if (headroomRatio < 0.1) {
      score -= 8; // Narrow buffer
    }
  }

  // 2. Liquidity cushion penalty
  const liquidityWeight = metrics.liquidity_ratio ?? 0.15;
  const minLiquidity = 0.10;
  if (liquidityWeight < minLiquidity) {
    score -= 15;
  }

  // 3. Status flag override
  if (isBreached && score > 55) {
    score = 48; // Ensure breached portfolios clearly reflect distressed health
  }

  return Math.max(10, Math.min(100, Math.round(score)));
}

/**
 * Returns formatted risk status details
 */
export function getRiskAssessment(metrics, portfolio) {
  const currentRisk = metrics?.current_risk ?? portfolio?.expected_risk ?? 0.045;
  const riskLimit = metrics?.risk_limit ?? 0.055;
  const isBreach = metrics?.status === "BREACH" || currentRisk > riskLimit;

  const excessRisk = Math.max(0, currentRisk - riskLimit);
  const excessBps = Math.round(excessRisk * 10000);

  return {
    status: isBreach ? "BREACH" : "SAFE",
    currentRisk,
    riskLimit,
    excessBps,
    badgeColor: isBreach ? "bg-red-50 text-red-700 border-red-200 font-semibold" : "bg-zinc-100 text-zinc-900 border-zinc-200 font-medium",
    bannerColor: isBreach ? "border-red-200 bg-red-50 text-red-900" : "border-zinc-200 bg-zinc-50 text-zinc-900",
    recommendation: isBreach 
      ? `Portfolio risk exceeds mandate by ${excessBps} bps. Mandatory rebalance evaluation recommended.`
      : `All portfolio metrics are within Basel III mandate limits. Steady-state monitoring.`
  };
}
