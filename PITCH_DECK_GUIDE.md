# Capital Guard: 3-Minute Hackathon Pitch & Judge Q&A Guide

Use this battle-tested guide to deliver a winning presentation to the hackathon judges.

---

## 1. The 30-Second Elevator Pitch (The Hook)

> *"Judges, almost every financial application in hackathons makes the same mistake: they take inputs, run a quick math formula, display a pie chart, and stop. In the real world, a bank cannot just allocate ₹100 Crores and walk away.*
>
> *Markets crash, bond yields move, and allocations drift into danger. The real problem financial institutions face is:*
> **'Where should our capital be allocated today, and what should we do if our portfolio becomes too risky tomorrow?'**
>
> *Introducing **Capital Guard** — the first closed-loop capital management platform that optimizes institutional portfolios using mathematical Quadratic Programming, continuously monitors real-world risk metrics like Historical VaR, and executes cost-aware rebalancing when risks are breached."*

---

## 2. Live Demo Script (Step-by-Step in 2 Minutes)

Follow this sequence directly in your browser on [http://localhost:5173](http://localhost:5173):

### Step 1: Institutional Setup & Overview (30s)
* **What to do:** Click the **`₹100 Cr Bank Demo`** button in the top-right header.
* **What to say:**
  > *"Here is Apex Reserve Bank managing ₹100 Crores. Rather than using heuristics, we solve Mean-Variance Optimization using **CVXPY** subject to strict institutional constraints: Equity cannot exceed 30%, Corporate Bonds cannot exceed 25%, and ₹20 Cr must remain in liquid reserves.*
  >
  > *Look at this **Deterministic Decision Explanation**: Our system directly inspects the active binding mathematical constraints in the solved problem to tell the treasurer: 'Equity was capped at 30% per your constraint; surplus capital was safely diverted into bonds and cash.'"*

### Step 2: Continuous Risk Monitoring & Simulated Shock (45s)
* **What to do:** Click the **`Simulate Market Shock (Risk 6.2% → 8.1%)`** button in the header.
* **What to say:**
  > *"Now imagine market volatility rises overnight. The portfolio's volatility spikes from 6.2% to 8.1%, breaching the regulatory limit of 7.0%.*
  >
  > *Notice our status instantly transitions to **🔴 RISK BREACH DETECTED**. Under the Risk Monitoring tab, we compute non-parametric **95% Historical Value at Risk (VaR)** — showing an empirical one-day loss threshold of ₹75.6 Lakhs without assuming a naive normal bell curve."*

### Step 3: Cost-Aware Rebalancing (The Differentiator) (45s)
* **What to do:** Click the **`Rebalance Engine`** tab. Show the **Verdicts: REBALANCE vs. HOLD**.
* **What to say:**
  > *"This is where Capital Guard sets itself apart from all competitors. When a risk breach occurs, bad systems blindly trade and destroy capital through fees and slippage.*
  >
  > *Capital Guard evaluates the financial friction: It calculates the turnover, multiplies it by execution basis points, and compares the trading cost against the mathematical risk reduction benefit.*
  >
  > *Because our risk jumped to 8.1%, the risk reduction value of ₹4 Crores heavily justifies the ₹3 Lakh trading cost, so the algorithm issues a **REBALANCE** verdict.*
  >
  > *(Optional bonus)*: *If the breach had been minuscule, our system would output **HOLD**, refusing to churn the portfolio and preserving capital!"*
* **What to do:** Click **`Execute Rebalance & Commit Audit Log`**. The portfolio turns back to 🟢 **SAFE**.

### Step 4: Stress Simulator & Regulatory Audit Trail (20s)
* **What to do:** Switch to the **`Audit History`** tab and click **`Export CSV`**.
* **What to say:**
  > *"Every automated action, trigger, turnover calculation, and rationale is saved to an immutable, append-only audit trail that can be exported for regulators in one click. We close the entire institutional capital lifecycle."*

---

## 3. Tough Judge Q&A Cheatsheet

### Q1: "Why not just use an AI or LLM to optimize the portfolio?"
* **Answer:** *"Financial allocations and fiduciary compliance cannot tolerate hallucinations. If an LLM recommends an allocation that secretly violates liquidity ratios or capital limits, a bank faces regulatory sanctions. We use **deterministic convex optimization (CVXPY)** for the financial decisions, and use deterministic binding-constraint inspection to provide 100% auditable explanations."*

### Q2: "Why use Historical VaR instead of Parametric VaR?"
* **Answer:** *"Parametric VaR assumes returns follow a Gaussian normal distribution. In financial markets, tail-risk events and fat tails mean extreme crashes happen far more frequently than a bell curve predicts. Non-parametric Historical VaR sorts actual empirical market shocks over a 250-day window, giving treasurers accurate downside protection when it matters most."*

### Q3: "What is your tech stack and how does it scale?"
* **Answer:**
  * **Backend:** Python with FastAPI and CVXPY solving Quadratic Programs via Clarabel/OSQP.
  * **Data Layer:** yfinance and local caching with offline synthetic series fallback.
  * **Database:** Dual-Engine Persistence supporting Supabase (cloud PostgreSQL) with local SQLite fallback.
  * **Frontend:** Vite + React + Vanilla CSS design system specifically curated in high-contrast institutional monochrome for executive clarity.

---

## 4. Quick Launch
To start the entire platform with one click anytime, double-click:
[`start.bat`](file:///c:/Hackathon/HHG_CAPITAL_GUARD/start.bat)
