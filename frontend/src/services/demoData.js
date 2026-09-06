/**
 * Demo Presets and Financial Universe Constants
 */

export const DEMO_PRESET_BANK = {
  org_name: "Apex Reserve Bank",
  org_type: "Bank",
  total_capital: 1000000000.0, // ₹100 Cr
  currency: "INR",
  investment_horizon_years: 3,
  investment_objective: "Balanced Growth",
  risk_preference: "Medium",
  min_liquidity: 200000000.0, // ₹20 Cr (20%)
  max_risk_limit: 0.07, // 7%
  selected_assets: ["GovBonds", "CorpBonds", "Equity", "Gold", "Cash"],
  equity_max: 0.30,
  corpbonds_max: 0.25
};

export const ASSET_UNIVERSE = [
  {
    id: "GovBonds",
    name: "Government Securities (10Y G-Sec)",
    category: "Sovereign Debt",
    expectedReturn: 0.0715,
    volatility: 0.021,
    liquidityTier: "Tier 1 (Instant)",
    baselClassification: "Level 1 HQLA",
    defaultSelected: true,
    description: "RBI-backed sovereign benchmark offering risk-free yields and maximum statutory liquidity reserve compliance."
  },
  {
    id: "CorpBonds",
    name: "AAA Corporate Debt",
    category: "High-Grade Credit",
    expectedReturn: 0.0840,
    volatility: 0.048,
    liquidityTier: "Tier 2 (T+1)",
    baselClassification: "Level 2A HQLA",
    defaultSelected: true,
    description: "Top-tier institutional corporate bonds providing high coupon yield with tight credit default spreads."
  },
  {
    id: "Equity",
    name: "NIFTY 50 Large Cap Index",
    category: "Public Equities",
    expectedReturn: 0.1250,
    volatility: 0.152,
    liquidityTier: "Tier 1 (T+1)",
    baselClassification: "Non-HQLA Growth Asset",
    defaultSelected: true,
    description: "Blue-chip equity index basket delivering long-term capital appreciation and inflation-hedged upside."
  },
  {
    id: "Gold",
    name: "Sovereign Gold Bullion",
    category: "Commodities & Hedges",
    expectedReturn: 0.0890,
    volatility: 0.110,
    liquidityTier: "Tier 2 (T+2)",
    baselClassification: "Alternative Reserve",
    defaultSelected: true,
    description: "Physical bullion reserve hedge uncorrelated to debt & equity cycles during systemic macro shocks."
  },
  {
    id: "Cash",
    name: "Overnight TREPS & Liquid Funds",
    category: "Cash & Equivalents",
    expectedReturn: 0.0625,
    volatility: 0.002,
    liquidityTier: "Tier 1 (Instant T+0)",
    baselClassification: "Level 1 Operational Cash",
    defaultSelected: true,
    description: "Triparty repo (TREPS) & liquid reverse repo for immediate operational redemptions and stress drawdowns."
  }
];

export const OBJECTIVE_OPTIONS = [
  {
    id: "Capital Preservation",
    title: "Capital Preservation",
    subtitle: "Sovereign & cash heavy",
    description: "Ultra-conservative mandate prioritizing capital defense, minimal volatility, and maximum LCR liquidity.",
    defaultRisk: 0.045
  },
  {
    id: "Balanced Growth",
    title: "Balanced Growth",
    subtitle: "Basel III QP optimized",
    description: "Institutional balance targeting consistent real yield through optimized equity-debt risk parity.",
    defaultRisk: 0.070
  },
  {
    id: "Aggressive Yield",
    title: "Aggressive Yield",
    subtitle: "Credit & growth tilted",
    description: "Yield-seeking allocation maximizing risk-adjusted alpha within prudent concentration constraints.",
    defaultRisk: 0.095
  }
];

export const ORG_TYPE_OPTIONS = [
  { id: "Bank", label: "Commercial Bank (RBI Basel III)", defaultCap: 1000000000 },
  { id: "Insurance", label: "Life / General Insurer (IRDAI Solvency)", defaultCap: 500000000 },
  { id: "Pension", label: "Pension & Gratuity Trust (PFRDA Rules)", defaultCap: 250000000 },
  { id: "Corporate", label: "Corporate Treasury (Liquidity First)", defaultCap: 100000000 }
];
