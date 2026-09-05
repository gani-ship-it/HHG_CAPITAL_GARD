# Capital Guard | Institutional Capital Optimization & Risk Control Platform

> **A closed-loop financial decision platform that optimizes institutional portfolios, continuously monitors market risks, detects policy breaches, evaluates cost-aware rebalancing, and stress-tests decisions under macro market shocks.**

```text
Setup → Optimize → Monitor → Detect → Decide (Cost vs. Benefit) → Rebalance → Stress Test → Repeat
```

---

## 🏛️ Executive Summary

Financial institutions manage large amounts of capital across diverse asset classes while balancing expected return, volatility, liquidity requirements, asset caps, and trade execution costs. Static portfolio allocations become hazardous when macroeconomic conditions change.

Most portfolio tools stop after generating an initial allocation. **Capital Guard** provides an automated **closed-loop decision system**:
1. **Mathematical Optimization:** Uses **CVXPY** Quadratic Programming for Mean-Variance allocation with institutional bounds and deterministic binding constraint explanations.
2. **Real-World Risk Monitoring:** Computes non-parametric **95% Historical Value at Risk (VaR)**, annualized volatility, and peak-to-trough drawdowns against regulatory limits.
3. **Cost-Aware Rebalancing:** Balances risk reduction against transaction friction (turnover $\times$ bps) to deterministically decide **REBALANCE** or **HOLD**, avoiding capital-destroying portfolio churn.
4. **Macro Stress Simulator:** Live simulation of named macroeconomic shocks (*Market Crash*, *Aggressive Rate Hike*, *Inflation Spike*) with rebalancing impact previews.
5. **Auditable Decision Trail:** Append-only regulatory log with 1-click **Export to CSV**.

---

## 🏗️ Architecture & Technology Stack

```text
┌─────────────────────────────────────────────────────────────┐
│      FRONTEND: Institutional Monochrome React Application   │
│         Vite · Recharts · Lucide · Pure Monochrome CSS      │
└──────────────────────────────┬──────────────────────────────┘
                               │ REST API (JSON)
                               ▼
┌─────────────────────────────────────────────────────────────┐
│          BACKEND: High-Performance FastAPI Engine           │
│                    Python 3.10+ · Uvicorn                   │
├─────────────────────────────────────────────────────────────┤
│ • Optimization Engine: CVXPY (Clarabel / OSQP Solvers)      │
│ • Quantitative Analysis: NumPy · Pandas · SciPy             │
│ • Market Data: yfinance with Local Disk Caching             │
│ • Persistence: Supabase (PostgreSQL) + Local SQLite Fallback│
└─────────────────────────────────────────────────────────────┘
```

---

## 🚀 Quick Start Guide

### 1-Click Launch (Windows)
Double-click [`start.bat`](start.bat) in the root directory. This script launches both the backend and frontend servers and opens your default browser to [http://localhost:5173](http://localhost:5173).

---

### Manual Launch

#### Prerequisites
* Python 3.10+
* Node.js 18+ and npm

#### 1. Backend Setup
```bash
cd backend
# Create virtual environment
python -m venv venv

# Activate virtual environment
# Windows:
.\venv\Scripts\activate
# Linux/macOS:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Run backend test verification
python test_backend.py

# Start backend server (runs on http://127.0.0.1:8000)
python run.py
```
*API Documentation (Swagger UI):* [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)  
*Health Check:* [http://127.0.0.1:8000/health](http://127.0.0.1:8000/health)

#### 2. Frontend Setup
```bash
cd frontend

# Install dependencies
npm install

# Start Vite development server (runs on http://localhost:5173)
npm run dev
```

---

## 🧠 Core Financial Engines

### 1. Convex Optimization (CVXPY)
Solves the constrained Quadratic Program:
$$\text{Maximize } w^T \mu - \lambda \cdot w^T \Sigma w$$
Subject to:
* $\sum w_i = 1$
* $w_i \ge 0$ (long-only)
* $w_{\min, i} \le w_i \le w_{\max, i}$ (e.g. Equity $\le 30\%$, Corporate Bonds $\le 25\%$)
* Liquid assets $\ge \text{min\_liquidity}$
* Portfolio risk $\sqrt{w^T \Sigma w} \le \sigma_{\max}$

### 2. Portfolio Health Score (0–100)
```text
Health = 40 × (1 − Risk / Max_Risk)
       + 25 × min(Liquidity / Min_Liquidity, 1)
       + 20 × (1 − Herfindahl Index)
       + 15 × Constraint Compliance
```

### 3. Non-Parametric Historical VaR (95%)
Empirical 250-day rolling lookback sorting daily returns:
$$\text{VaR}_{95} = -\text{percentile}(\text{daily\_returns}, 5\%) \times \text{Capital}$$
Does not assume a Gaussian bell curve, preserving tail-risk accuracy during market turbulence.

### 4. Cost vs. Benefit Rebalancing Logic
```text
Turnover = 0.5 × Σ |w_target - w_current|
Transaction Cost = Turnover × Capital × (Cost_bps / 10000)
Risk Reduction Value = (Risk_current - Risk_target) × Capital × Risk_Aversion

IF Risk Reduction Value > Transaction Cost:
    REBALANCE
ELSE:
    HOLD  (breach acknowledged, preventing costly capital churn)
```

---

## 📁 Repository Structure

```text
HHG_CAPITAL_GUARD/
├── backend/
│   ├── app/
│   │   ├── api/v1/endpoints/  # Portfolio, Monitoring, Rebalance, Simulator, History
│   │   ├── core/              # Config & settings (.env reader)
│   │   ├── db/                # SQLAlchemy models & Supabase client
│   │   ├── services/          # CVXPY optimizer, RiskEngine, Rebalancer, Simulator
│   │   └── main.py            # FastAPI app factory & middleware
│   ├── data/cache/            # Cached historical price series
│   ├── requirements.txt       # Python dependencies
│   ├── run.py                 # Convenience server runner
│   └── test_backend.py        # Automated test verification suite
├── frontend/
│   ├── src/
│   │   ├── App.jsx            # Enterprise dashboard & workflows
│   │   ├── index.css          # Institutional Monochrome Design System
│   │   ├── api.js             # REST API client
│   │   └── main.jsx
│   └── package.json
├── .env.example               # Configuration template (Supabase, FRED, etc.)
├── DESIGN_SYSTEM.md           # Visual design guidelines
├── HHG_CAPITAL_GUARD.md       # Product requirements & problem statement
├── PITCH_DECK_GUIDE.md        # 3-Minute hackathon pitch script & Judge Q&A
├── start.bat                  # Single-click launcher
└── README.md                  # System overview & documentation
```

---

## ⚖️ License
This project was developed for hackathon presentation and institutional financial decision support.
