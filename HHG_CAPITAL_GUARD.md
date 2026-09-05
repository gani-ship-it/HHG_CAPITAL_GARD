# Capital Optimization & Risk Control Platform

## 1. Project Overview

The **Capital Optimization & Risk Control Platform** is a financial decision-support system that helps financial institutions optimize capital allocation while continuously monitoring and controlling portfolio risk.

The platform follows a continuous decision loop:

> **Setup → Optimize → Monitor → Detect → Decide → Rebalance → Repeat**

It combines:

* Historical market data
* Portfolio optimization
* Risk analysis
* Liquidity management
* Risk-limit monitoring
* Risk breach detection
* Cost-aware rebalancing
* Stress testing
* Decision explanation
* Decision history

The goal is not simply to find the portfolio with the highest return.

The goal is:

> **Find the best risk-adjusted allocation while satisfying financial constraints, then continuously monitor and respond when conditions change.**

---

## 2. Problem Statement

Financial institutions manage large amounts of capital across different asset classes. They must balance:

* Expected return
* Portfolio risk
* Liquidity
* Asset concentration
* Market volatility
* Risk limits
* Rebalancing costs

Static portfolio allocations may become unsuitable when market conditions change.

The platform addresses:

> **"Where should our capital be allocated today, and what should we do if the portfolio becomes too risky tomorrow?"**

The hackathon requires an optimization strategy, automated risk controls, and a decision dashboard. Our architecture directly addresses these requirements.

---

## 3. Target Users

* Financial Officers
* Risk Managers
* Portfolio Managers
* Treasury Teams
* Investment Managers

Potential organizations: Banks, Insurance Companies, Investment Firms, Corporations, other Financial Institutions.

---

## 4. Core Product Idea

```text
Simple User Inputs
        ↓
Sophisticated Financial Analysis
        ↓
Optimized Portfolio
        ↓
Simple Recommendation
        ↓
Continuous Monitoring
        ↓
Automated Risk Detection
        ↓
Cost-Aware Action
```

The user should not need to understand mathematical optimization. The system handles the complexity behind the scenes and presents understandable recommendations.

---

## 5. Complete Project Flow

```text
                         ┌─────────────────────┐
                         │     USER / SETUP    │
                         │ Capital, Assets,    │
                         │ Objective, Risk,    │
                         │ Liquidity,          │
                         │ Constraints         │
                         └──────────┬──────────┘
                                    ↓
                    ┌──────────────────────────┐
                    │        DATA LAYER        │
                    │ yfinance, FRED,          │
                    │ Historical Prices,       │
                    │ Local Cache              │
                    └────────────┬─────────────┘
                                 ↓
                    ┌──────────────────────────┐
                    │    OPTIMIZATION ENGINE   │
                    │ Mean-Variance, CVXPY     │
                    └────────────┬─────────────┘
                                 ↓
                    ┌──────────────────────────┐
                    │     RESULTS DASHBOARD    │
                    │ Allocation, Return,      │
                    │ Risk, Health Score       │
                    └────────────┬─────────────┘
                                 ↓
                    ┌──────────────────────────┐
                    │       MONITORING         │
                    │ Prices, Value, VaR,      │
                    │ Volatility, Drawdown     │
                    └────────────┬─────────────┘
                                 ↓
                         ┌──────────────┐
                         │ RISK BREACH? │
                         └──────┬───────┘
                            NO ↙   ↘ YES
                              ↓     ↓
                           🟢 SAFE  🔴 ALERT
                                     ↓
                              ┌──────────────┐
                              │ REBALANCING  │
                              └──────┬───────┘
                                     ↓
                              Cost vs Benefit
                                     ↓
                              REBALANCE / HOLD
                                     ↓
                              Decision History
                                     ↓
                            Updated Portfolio
                                     │
                                     └────→ Monitoring


             ┌────────────────────────────────────┐
             │        SCENARIO SIMULATOR          │
             │ Select Market Shock                │
             │              ↓                     │
             │ Stress-Test Portfolio              │
             │              ↓                     │
             │ Risk / Return Impact               │
             │              ↓                     │
             │ Recommended Action                 │
             │              ↓                     │
             │ Preview Rebalancing                │
             └────────────────────────────────────┘
```

---

## 6. User Journey

### Step 1 — Landing Page
**Title:** Capital Optimization & Risk Control Platform
**Description:** Optimize capital allocation while maintaining risk and liquidity controls.
**Actions:** Start Analysis · Learn How It Works

### Step 2 — Organization Setup
Inputs: Organization Type, Total Capital, Investment Horizon
Example: Bank · ₹100 Cr · 3 Years

### Step 3 — Investment Objective
- **Growth** — prioritize higher expected returns within risk limits
- **Income** — prioritize stable income-generating assets
- **Capital Preservation** — prioritize stability and lower risk

### Step 4 — Asset Selection
Government Bonds · Corporate Bonds · Equity · Gold · Cash/Liquid Assets (expandable)

### Step 5 — Risk & Liquidity Configuration
Risk Preference (Low/Medium/High), Minimum Liquidity, Asset Allocation Limits
Example: Medium risk · ₹20 Cr minimum liquidity · Equity ≤ 30% · Corporate Bonds ≤ 25%

---

## 7. Data Layer

### Sources
- **yfinance** — historical and updated market price data (Open, High, Low, Close, Adjusted Close, Volume)
- **FRED** — Treasury yields, interest-rate data, macroeconomic indicators

### Local Cache
```text
Request Data → Check Local Cache → Data Available?
   YES → Use Cache
   NO  → Fetch Data → Save to Cache → Use Data
```
Benefits: faster app, fewer external requests, more reliable demo, lower API dependency, reusable historical data.

### Data Processing
```text
Historical Prices → Clean Data → Calculate Returns → Calculate Statistics → Optimization / Risk Engine
```
Computed: mean return, volatility, correlation, **rolling historical covariance** (1-year daily-return window; Ledoit-Wolf shrinkage optional for stability), historical drawdown.

---

## 8. Optimization Engine

**Method:** Mean-Variance Optimization, solved with **CVXPY**.

### Objective
```text
Maximize:  Expected Return − λ × Risk
Score = Expected Return − λ × Risk
```
`λ` (risk penalty) can be tuned per selected investment objective (Growth = lower λ, Capital Preservation = higher λ).

### Constraints
- **Full allocation:** Σ weights = 1
- **Weight bounds:** min ≤ asset weight ≤ max (e.g. Equity ≤ 30%)
- **Liquidity:** liquid assets ≥ minimum liquidity
- **Risk:** portfolio risk ≤ maximum allowed risk

### Portfolio Math
```text
Portfolio Return = Σ(weight × asset expected return)
Portfolio Risk   = √(wᵀΣw)      where w = weight vector, Σ = covariance matrix
```
Covariance-based risk captures diversification and correlation — not just a weighted average of individual asset risks.

---

## 9. Results Dashboard

**Main metrics:** Total Capital, Expected Return, Portfolio Risk, Liquidity, Risk Status (🟢/🔴)

**Visualizations:** Allocation donut/bar chart, Risk-vs-Return scatter (assets + optimized portfolio highlighted), Portfolio Health Indicator.

### Portfolio Health Score (0–100)
```text
Health = 40 × (1 − risk / max_risk)
       + 25 × min(liquidity / min_liquidity, 1)
       + 20 × (1 − Herfindahl Index)
       + 15 × constraint_compliance
```
- **Herfindahl Index** = Σ(weight²) — a standard concentration metric; `1 − HHI` rewards diversification.
- **constraint_compliance** = 1 if all constraints satisfied, scaled down per violation if soft constraints are allowed.
- This is a custom platform indicator, not an official financial rating — state this explicitly in the UI.

### Decision Explanation
Generated from the optimizer's **actual binding constraints**, not an LLM guess:
> "Equity capped at 30% per your constraint — the optimizer would have allocated more for higher return, but the liquidity requirement and equity limit redirected capital into bonds."

Rule: identify which constraints are active (at their bound) in the solved LP/QP, and generate the explanation sentence from that constraint's label — deterministic, auditable, and reproducible from the same inputs.

---

## 10. Monitoring Engine

```text
Updated Market Data → Update Portfolio Value → Recalculate Risk Metrics → Compare Against Limits → Update Portfolio Status
```

Tracks: updated prices, portfolio value/return, volatility, VaR, maximum drawdown, risk limits, asset exposure, liquidity.

### Value at Risk (VaR) — Historical Method
```text
1. Take daily portfolio returns over a lookback window (e.g. 250 trading days)
2. Sort worst → best
3. VaR_95 = -percentile(daily_returns, 5) × portfolio_value
```
Chosen because it's non-parametric — it doesn't assume returns are normally distributed, which matters during market stress. State this reasoning explicitly to judges.

### Other Risk Metrics
- **Volatility** — annualized standard deviation of portfolio returns
- **Maximum Drawdown** — largest peak-to-trough decline over the observation window

---

## 11. Risk Breach & Rebalancing

### Risk Breach Trigger
Fires when any monitored metric crosses its configured limit (VaR, volatility, or drawdown threshold) — not on a fixed schedule.

### Cost vs Benefit Logic
```text
turnover = Σ|w_target − w_current| / 2
transaction_cost = turnover × portfolio_value × cost_per_trade_bps / 10000
risk_reduction_value = (risk_current − risk_target) × portfolio_value × risk_aversion_factor

IF risk_reduction_value > transaction_cost:
    REBALANCE
ELSE:
    HOLD  (breach acknowledged, rebalance not cost-justified)
```
`cost_per_trade_bps` and `risk_aversion_factor` are configurable assumptions — expose them as adjustable sliders on the dashboard for transparency and a live "what changes if I adjust this" demo moment.

### Decision Record (Decision History)
```json
{
  "timestamp": "...",
  "trigger": "VaR breach",
  "w_current": {...},
  "w_target": {...},
  "turnover": 0.18,
  "transaction_cost": 245.30,
  "risk_reduction_value": 412.10,
  "decision": "REBALANCE",
  "portfolio_risk_before": 0.081,
  "portfolio_risk_after": 0.067
}
```
Stored append-only (SQLite is sufficient) and displayed as the auditable Decision History log.

### Optional: Partial Rebalancing
Instead of moving fully to `w_target`, move X% of the way there to reduce turnover further — a real-world practice, cheap to add as a toggle, and a good innovation talking point.

---

## 12. Scenario Simulator

Lets the user apply a hypothetical market shock and see the impact before it happens.

### Named Shock Presets
```text
Market Crash:     { equity: -30%, bonds: +5%,  gold: +10% }, volatility × 1.5
Rate Hike:        { bonds: -8%,   cash: +1%,   equity: -5% }, volatility × 1.2
Inflation Spike:  { gold: +15%,   bonds: -6%,  equity: -3% }, volatility × 1.3
```

### Stress Test Transformation
```text
New expected returns = current returns + shock_vector
New covariance        = current covariance × volatility_multiplier
→ Recompute portfolio risk & return with shocked inputs
→ Compare against current risk limits
→ Feed into the same rebalancing cost-vs-benefit logic as a preview (no live trade)
```
This reuses the optimization engine and risk logic already built — it is a wrapper, not a separate system, which keeps it cheap to implement and keeps the loop closed (stress test → preview rebalance, not an isolated report).

---

## 13. Complete Product Loop

```text
SETUP → OPTIMIZE → ALLOCATION → MONITOR → RISK CHECK
                                              ↙        ↘
                                           SAFE       BREACH
                                            ↓            ↓
                                         MONITOR      ALERT → REBALANCE → COST vs BENEFIT
                                                                              ↓
                                                                       ACTION / HOLD
                                                                              ↓
                                                                    UPDATED PORTFOLIO
                                                                              ↓
                                                                          MONITOR (loop)
```

Alongside this loop:
```text
SCENARIO SIMULATOR → MARKET SHOCK → STRESS TEST → IMPACT ANALYSIS → REBALANCING PREVIEW
```

---

## 14. Hackathon Requirement Mapping

| Requirement                 | Platform Feature               |
| ---------------------------- | ------------------------------ |
| Optimize capital allocation | CVXPY Optimization Engine      |
| Risk-adjusted returns       | Mean-Variance Optimization     |
| Financial constraints       | Weight limits                  |
| Liquidity constraints       | Liquidity controls             |
| Risk safeguards             | Risk Control Engine            |
| Risk threshold detection    | VaR / Volatility / Drawdown    |
| Market shock response       | Monitoring + Rebalancing       |
| Dynamic rebalancing         | Rebalancing Engine             |
| Transaction penalties       | Trading-cost calculation       |
| Decision dashboard          | Results + Monitoring Dashboard |
| Hypothetical scenarios      | Scenario Simulator             |
| Explain decisions           | Decision Explanation           |
| Auditability                | Decision History               |

---

## 15. What Makes the Project Different

A normal portfolio optimizer: `Market Data → Optimization → Portfolio`

Our system: `Market Data → Optimization → Portfolio → Continuous Monitoring → Risk Detection → Automated Decision → Cost-Aware Rebalancing → Stress Testing → Decision Explanation → Repeat`

> **Optimization + Risk Control + Continuous Monitoring + Cost-Aware Rebalancing + Stress Testing + Explainability**

---

## 16. Demo Scenario (₹100 Cr Example)

**Setup:** Bank · ₹100 Cr · 3-year horizon · Balanced Growth · Medium risk · ₹20 Cr minimum liquidity
**Assets:** Government Bonds, Corporate Bonds, Equity, Gold, Cash
**Constraints:** Equity ≤ 30% · Corporate Bonds ≤ 25% · Liquidity ≥ ₹20 Cr

### Demo Sequence
1. User enters ₹100 Cr, selects Balanced Growth, chooses assets, sets Medium risk + ₹20 Cr liquidity.
2. Clicks **Optimize My Capital** — system loads/caches data and runs CVXPY optimization.
3. **Result:** Gov Bonds 40% · Corp Bonds 25% · Equity 20% · Gold 10% · Cash 5%
4. **Dashboard:** Return 9.4% · Risk 6.2% · Liquidity ₹25 Cr · 🟢 SAFE
5. **Market change simulated:** Portfolio risk rises 6.2% → 8.1%
6. **Risk Alert:** 🔴 Allowed Risk 7% vs Actual 8.1%
7. **Rebalancing:** Risk Before 8.1% → After 6.7% · Trading Cost ₹4.2 Lakh
8. **Decision:** REBALANCE (risk reduction value > cost)
9. **Scenario Simulator:** User selects "Market Crash" → stress test runs
10. **Preview:** Platform shows projected allocation and risk after a hypothetical rebalance — end the demo here to highlight the closed loop.

*Tip: also demo a HOLD case (a smaller breach where cost > benefit) to show the system correctly refuses to churn the portfolio — this is a strong differentiator judges haven't usually seen.*

---

## 17. Judge-Friendly Explanations

**"What does your project do?"**
> Our platform helps financial institutions optimize their capital allocation based on expected returns, risk, liquidity, and portfolio constraints. After optimization, it continuously monitors the portfolio using metrics such as VaR, volatility, and maximum drawdown. If a risk limit is breached, our system evaluates a cost-aware rebalancing action and logs the decision. Users can also run hypothetical market shocks through the scenario simulator.

**"What is innovative?"**
> The innovation is the closed-loop decision system. We don't stop after producing an optimal portfolio. We continuously monitor it, detect risk breaches, evaluate the financial cost of correcting them, recommend rebalancing, and allow users to stress-test the same decision logic under hypothetical market conditions.

**"Why not just use AI?"**
> Financial decisions should be constrained and explainable. We use deterministic optimization and risk-control logic for the actual financial decision. AI can optionally be used as an explanation layer to make those decisions easier for financial officers to understand.

**"Why CVXPY?"**
> CVXPY allows us to formulate portfolio optimization as a constrained mathematical problem. This lets us explicitly enforce requirements such as full capital allocation, asset limits, liquidity requirements, and risk constraints instead of relying on arbitrary portfolio generation.

**"Why historical VaR instead of parametric?"**
> Historical VaR doesn't assume returns are normally distributed, which is exactly when parametric methods break down — during market stress, when accurate risk estimates matter most.

**"What happens during a market crash?"**
> Updated market data changes the portfolio's risk metrics. If VaR, volatility, drawdown, or another configured limit is breached, the risk-control engine generates an alert and passes the portfolio to the rebalancing engine. The rebalancing engine calculates a safer target allocation, estimates trading costs, compares the risk reduction against the cost, and recommends whether to rebalance.

---

## 18. Final Definition

> **A closed-loop capital management platform that optimizes institutional portfolios, continuously monitors risk, detects breaches, evaluates cost-aware rebalancing, and stress-tests decisions under changing market conditions.**

```text
OPTIMIZE → MONITOR → DETECT → DECIDE → REBALANCE → STRESS TEST → EXPLAIN → REPEAT
```

This is the core identity of the project.
