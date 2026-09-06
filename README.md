# Capital Guard | Autonomous Institutional Capital Allocation & Risk Defense OS

[![Team HYVEX](https://img.shields.io/badge/Team-HYVEX-black?style=for-the-badge)](https://github.com/gani-ship-it/HHG_CAPITAL_GARD)
[![INIT'26 Hackathon](https://img.shields.io/badge/INIT'26-FinTech%20Track-blue?style=for-the-badge)](https://github.com/gani-ship-it/HHG_CAPITAL_GARD)
[![Python](https://img.shields.io/badge/Python-3.10%2B-blue?logo=python&logoColor=white)](https://www.python.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.110%2B-009688?logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com/)
[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=black)](https://react.dev/)
[![CVXPY](https://img.shields.io/badge/Optimization-CVXPY%20Clarabel%20QP-red)](https://www.cvxpy.org/)
[![Supabase](https://img.shields.io/badge/Database-Supabase%20PostgreSQL-3ECF8E?logo=supabase&logoColor=white)](https://supabase.com/)
[![Compliance](https://img.shields.io/badge/Standard-Basel%20III%20%7C%20RBI-black)](https://www.bis.org/bcbs/basel3.htm)

> **An autonomous, closed-loop financial decision support platform that solves convex quadratic portfolio optimizations, monitors continuous intraday market risk, generates real-time Profit & Loss (P&L) telemetry, autonomously flags policy breaches, and evaluates cost-aware rebalancing vs. tactical holding under severe macroeconomic stress.**

```text
Mandate Setup → Clarabel Conic QP → Real-Time Telemetry → Breach Sentinel → Cost-Aware Rebalance → Regulatory Audit Ledger
```

---

## 🏛️ Executive Summary

Financial institutions (central banks, commercial treasuries, sovereign wealth funds, and pensions) manage multi-asset balance sheets subject to statutory liquidity floors (Basel III LCR), asset concentration ceilings, duration matching, and strict Value-at-Risk limits. 

Traditional spreadsheet models and retail portfolio tools suffer from three fundamental flaws:
1. **Open-Loop Disconnect:** They generate a static initial pie chart and stop, offering zero automated safeguards when macroeconomic conditions deteriorate.
2. **Friction-Blind Rebalancing:** When market volatility spikes, primitive tools blindly rebalance, causing massive turnover that destroys capital through bid-ask spread and transaction fees.
3. **Black-Box Allocations:** They fail to provide mathematical proof of why specific bounds constrained returns.

**Capital Guard** bridges this gap by providing an enterprise-grade **closed-loop decision system** tailored for Chief Risk Officers (CROs), Treasury Officers, and Investment Committees.

---

## ⚡ Key Capabilities & Highlights

* 📐 **Mathematical Optimization (Clarabel Conic QP):** Solves constrained Mean-Variance Quadratic Programs using interior-point conic solvers (`cvxpy` with Clarabel and OSQP engines) with Basel III Liquidity Coverage Ratio (LCR $\ge 20\%$) and asset concentration bounds.
* 📈 **Real-Time Company Profit & Loss (P&L) Engine:** 
  * **Asset P&L Bar Chart:** Real-time gain/loss contribution per asset (`GovBonds`, `CorpBonds`, `Equity`, `Gold`, `Cash`) with institutional green/red coloring.
  * **Risk vs. Return Scatter Plot:** Live mapping of volatility vs. return with standard quadrant decomposition.
  * **Session Timeline:** Real-time tick-by-tick trajectory tracking mark-to-market portfolio value.
* 🛡️ **Continuous Intraday Risk Telemetry:** Computes non-parametric **95% Historical Value at Risk (VaR)**, CVaR (Expected Shortfall), and annualized volatility with mean-reverting Ornstein-Uhlenbeck market drift.
* 🚨 **Automated Breach Sentinel:** Persistent global breach telemetry (`🔴 MANDATE BREACH`) across the top telemetry bar, sidebar, and pages upon volatility or VaR overshoot.
* ⚖️ **Cost-Aware Algorithmic Rebalancing:** Evaluates the economic trade-off between **Risk Reduction ($\Delta \sigma$) vs. Frictional Costs (Turnover $\times$ bps)** to output deterministic **`REBALANCE`** vs. **`HOLD`** verdicts.
* 🌪️ **Macroeconomic Stress Simulator:** Injects named historical shocks (*2008 Market Crash*, *Aggressive Fed Rate Hike +150bps*, *Stagflation Crisis*) to preview post-shock capital impairment before reality hits.
* 📜 **Immutable Governance & Audit Ledger:** Persists all optimizations, alerts, trade rationales, and rebalance actions into an append-only database (Supabase PostgreSQL) with 1-click **Export to CSV** for regulatory compliance.
* 🤖 **Institutional AI Copilot (Groq):** Low-latency quantitative risk assistant with institutional context injection, mathematical explanation generation, and prompt injection defense.
* 🔑 **Institutional Access Gate:** Multi-tier authentication supporting 1-click Judge Personas (CRO, Portfolio Manager, Auditor), custom multi-step onboarding, and sandboxed in-memory Guest Mode.

---

## 🏗️ System Architecture

```text
┌─────────────────────────────────────────────────────────────────────────────────┐
│              FRONTEND: Institutional High-Performance React Web App             │
│        Vite 8 · React 19 · Recharts · Lucide Icons · Institutional Monochrome   │
├─────────────────────────────────────────────────────────────────────────────────┤
│ • Portal Home & Access Gate       • Real-Time Risk & P&L Telemetry Engine       │
│ • Guided Mandate Setup Wizard     • Cost vs. Benefit Rebalance Engine           │
│ • Dynamic Portfolio Overview      • Macroeconomic Stress Simulator              │
│ • Air-Gapped Groq AI Copilot      • Immutable Audit History Ledger (CSV Export) │
└────────────────────────────────────────┬────────────────────────────────────────┘
                                         │ REST API / JSON (HTTP 8000)
                                         ▼
┌─────────────────────────────────────────────────────────────────────────────────┐
│                    BACKEND: High-Performance FastAPI Engine                     │
│                        Python 3.10+ · Uvicorn · Pydantic                        │
├─────────────────────────────────────────────────────────────────────────────────┤
│ • Optimization Engine: CVXPY (Clarabel / OSQP Conic Solvers)                    │
│ • Quantitative Risk: NumPy · SciPy · Non-Parametric 95% Historical VaR Engine   │
│ • Macro Indicators: Live Federal Reserve Economic Data (FRED)                   │
│ • Market Data Cache: yfinance with 24-Hour Local Disk Persistence               │
│ • LLM Intelligence: Groq API (Llama 3.3 70B Versatile) with System Defenses     │
└────────────────────────────────────────┬────────────────────────────────────────┘
                                         │ Connection String / SQLAlchemy ORM
                                         ▼
┌─────────────────────────────────────────────────────────────────────────────────┐
│               PERSISTENCE LAYER: Supabase (PostgreSQL) / SQLite                 │
├─────────────────────────────────────────────────────────────────────────────────┤
│ • portfolios       : Mandates, capital, weights, risk limits, and health scores │
│ • user_profiles    : Verified institutional user onboarding & risk preferences  │
│ • decision_history : Append-only regulatory audit ledger with user isolation     │
│ • market_cache     : Disk/DB cached historical returns and covariance matrices  │
│ • Auto-Fallback    : Automatic zero-configuration SQLite fallback if offline    │
└─────────────────────────────────────────────────────────────────────────────────┘
```

---

## 📋 Prerequisites & System Requirements

Before running the project, ensure you have the following installed:

| Requirement | Supported Versions | Notes |
| :--- | :--- | :--- |
| **Python** | `3.10`, `3.11`, or `3.12` | Required for FastAPI & CVXPY solver |
| **Node.js** | `18.x`, `20.x`, or higher | Required for Vite & React frontend |
| **npm** | `9.x` or higher | Packaged with Node.js |
| **Git** | Any recent version | For repository cloning |
| **Operating System** | Windows 10/11, macOS, Linux | Cross-platform compatibility |

---

## ⚙️ Environment Variables Configuration (`.env`)

The project uses environment variables for database connections, third-party API integrations, and security.

### 1. Root / Backend Environment File
Create a `.env` file inside the `backend/` folder (or copy from [`.env.example`](.env.example)):

```bash
cp .env.example backend/.env
```

### 2. Complete `.env` Reference & Example

```ini
# =================================================================
# Application Settings
# =================================================================
ENVIRONMENT=development
DEBUG=True
APP_NAME="Capital Guard - Institutional Capital Management OS"
PORT=8000
HOST=0.0.0.0

# =================================================================
# CORS Allowed Origins
# =================================================================
CORS_ORIGINS=http://localhost:5173,http://localhost:3000,http://127.0.0.1:5173

# =================================================================
# Database & Supabase Configuration
# =================================================================
# PostgreSQL connection string for SQLAlchemy
# Format: postgresql://[user]:[password]@[host]:5432/[db]
DATABASE_URL=postgresql://postgres:your_supabase_db_password@db.your_project_ref.supabase.co:5432/postgres

# (Optional) Supabase Client Keys
SUPABASE_URL=https://your-project-ref.supabase.co
SUPABASE_ANON_KEY=your_supabase_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key_here

# =================================================================
# External Financial Data & AI APIs
# =================================================================
# Federal Reserve Economic Data (FRED) API Key for live macro yields
FRED_API_KEY=your_fred_api_key_here

# Groq API Key for AI Risk Copilot (Llama-3.3-70b-versatile)
GROQ_API_KEY=gsk_your_groq_api_key_here

# =================================================================
# Market Data Cache Settings
# =================================================================
ENABLE_DATA_CACHE=True
CACHE_EXPIRY_HOURS=24
```

> [!TIP]
> **Zero-Config Fallback:** If you do not provide a `DATABASE_URL`, Capital Guard **automatically falls back to a local SQLite database** (`capital_guard.db`) without crashing, ensuring an instant evaluation experience!

---

## 🗄️ Database Setup & Supabase Migrations

### Method A: Automated Initialization (Recommended)
When the FastAPI backend starts, SQLAlchemy automatically detects your database engine, initializes the schema, runs table migrations, and provisions performance indexes:
- Automatically creates `portfolios`, `decision_history`, and `user_profiles`.
- Applies performance indexes: `idx_portfolios_user_email`, `idx_decision_history_user_email`, `idx_user_profiles_email`.

### Method B: Manual Supabase SQL Editor Script
If you prefer initializing or verifying the tables directly inside the **Supabase Dashboard**:
1. Open your Supabase project at [supabase.com](https://supabase.com).
2. Navigate to **SQL Editor** in the left navigation.
3. Copy and paste the contents of [`backend/supabase_schema.sql`](backend/supabase_schema.sql).
4. Click **Run**.

This script sets up:
- Primary tables with default institutional bounds
- Cascading foreign key references
- Realtime replication publication (`ALTER PUBLICATION supabase_realtime ADD TABLE ...`)
- Fast lookup B-Tree performance indexes

---

## 🚀 Step-by-Step Installation & Run Instructions

### Option 1: 1-Click Launch (Windows)
Double-click the [`start.bat`](start.bat) script in the root directory:
```text
start.bat
```
This script will automatically:
1. Initialize the Python virtual environment and install backend dependencies.
2. Launch the FastAPI server on `http://127.0.0.1:8000`.
3. Install frontend dependencies and launch Vite on `http://localhost:5173`.
4. Open your default web browser directly to the application.

---

### Option 2: Manual Step-by-Step Launch

#### Step 1: Clone the Repository
```bash
git clone https://github.com/gani-ship-it/HHG_CAPITAL_GARD.git
cd HHG_CAPITAL_GARD
```

#### Step 2: Backend Setup
```bash
# Navigate to backend folder
cd backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
# On Windows:
.\venv\Scripts\activate
# On macOS / Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Run automated backend test suite (verifies solver & risk math)
python test_backend.py

# Launch FastAPI backend server
python run.py
```
* Backend API is now live at: **`http://127.0.0.1:8000`**
* Interactive Swagger API Documentation: **`http://127.0.0.1:8000/docs`**
* System Health Check: **`http://127.0.0.1:8000/health`**

#### Step 3: Frontend Setup (Open a New Terminal)
```bash
# Navigate to frontend folder
cd frontend

# Install Node dependencies
npm install

# Start Vite React development server
npm run dev
```
* Frontend application is now live at: **`http://localhost:5173`**

---

### Option 3: Docker Compose Launch
If you have Docker installed, you can spin up the entire multi-tier system with one command:
```bash
docker-compose up --build
```
* Frontend: `http://localhost:5173`
* Backend: `http://localhost:8000`

---

## 🧪 Verification & Test Suite

Run the automated test suite to verify mathematical solvers, non-parametric VaR, and API routes:

```bash
cd backend
.\venv\Scripts\python.exe test_backend.py
```

**Expected Test Output:**
```text
[PASS] Optimization Engine (Clarabel QP): Mean-Variance weights sum to 1.000
[PASS] Basel III Liquidity Floor: HQLA reserves >= 20.0% satisfied
[PASS] Equity Concentration Cap: <= 30.0% satisfied
[PASS] Risk Engine: Historical 95% VaR computed non-parametrically
[PASS] Rebalance Engine: Cost vs. Benefit trade-off outputs verified
[PASS] Database & Auth: User profile and decision history isolation verified
ALL VERIFICATIONS COMPLETED SUCCESSFULLY.
```

---

## 🎯 Step-by-Step Evaluator & Demo Script (2 Minutes)

Follow this sequence to evaluate the complete financial lifecycle:

1. **Access Gate & Institutional Personas:**
   - Open `http://localhost:5173`.
   - Choose a verified persona: click **`Dr. Elena Vance, CRO`** (Apex Reserve Bank) or enter as a **`Guest Sandbox`**.
2. **Mandate Formulation Wizard (`Mandate Setup`):**
   - Click **`Configure New Mandate`** to open the 4-step wizard.
   - Click **`Autofill Regulatory Defaults`** (enforces statutory Basel III constraints: equity ceiling 30%, corporate bond ceiling 25%, minimum liquidity 20%).
   - Click **`Optimize My Capital`**. The Clarabel QP solver calculates the optimal allocation in ~40ms and navigates to the Overview.
3. **Live Risk Telemetry & Real-Time P&L (`Risk Monitoring`):**
   - Switch to **`Risk Monitoring`**.
   - Notice the **`● FEED ACTIVE`** indicator and timestamp heartbeat updating every 3.5 seconds.
   - Inspect the **Company Real-Time P&L Engine**:
     - 📊 **Asset P&L Bar Chart:** Displays profit/loss per asset class in green and red.
     - 🎯 **Risk vs. Return Scatter Plot:** Displays volatility vs return distribution with the company portfolio star.
     - 📈 **Session Timeline:** Tracks mark-to-market session value.
4. **Simulate Macro Volatility Shock:**
   - Click **`Simulate Market Shock (+110bps)`**.
   - Portfolio volatility jumps to 8.10%, breaching the statutory 7.00% ceiling.
   - The platform immediately triggers a persistent global **`🔴 MANDATE BREACH`** alert across all pages.
5. **Algorithmic Rebalance Decision (`Rebalance Engine`):**
   - Click **`Open Rebalance Engine`**.
   - Notice the quantitative trade-off evaluation:
     $$\text{Risk Reduction Value } (+\text{166 bps}) > \text{Transaction Friction } (\text{15 bps})$$
   - Recommendation: **`EXECUTE REBALANCE`**.
   - Inspect the **Before vs. After Allocation** table showing exact target allocations and **Trade Notional** amounts (`+₹15.00 Cr BUY`, `-₹12.50 Cr SELL`).
   - Click **`Commit Rebalance Action`**. The portfolio de-risks and returns to `🟢 SAFE`.
6. **Regulatory Compliance & Audit Trail (`Audit History`):**
   - Switch to **`Audit History`**.
   - View the immutable, append-only record of the breach, timestamp, trigger, and committee rationale.
   - Click **`Export to CSV`** to download the regulatory audit file for regulators.
7. **Institutional AI Copilot:**
   - Click **`AI Copilot`** in the top-right header.
   - Ask: *"Why did the system recommend rebalancing instead of holding?"* or *"Explain our current binding constraints."*

---

## 🧮 Mathematical & Financial Formulations

### 1. Convex Quadratic Programming (Mean-Variance QP)

The institutional asset allocation engine solves a constrained convex Quadratic Program (QP) using the **Clarabel / OSQP** conic interior-point solver:

$$
\min_{\mathbf{w}} \quad \frac{1}{2} \mathbf{w}^T \mathbf{\Sigma} \mathbf{w} - q \cdot \boldsymbol{\mu}^T \mathbf{w}
$$

**Subject to institutional constraints:**

$$
\begin{aligned}
\sum_{i=1}^n w_i &= 1 && \text{-- Full Investment Constraint} \\
w_i &\ge 0, \quad \forall i \in \{1, \dots, n\} && \text{-- Long-Only Non-Negativity} \\
w_{\text{Cash}} + w_{\text{GovBonds}} &\ge \text{LCR}_{\min} && \text{-- Basel III Liquidity Coverage Ratio (HQLA Floor)} \\
w_{\text{Equity}} &\le \text{Cap}_{\text{Equity}} && \text{-- Equity Market Concentration Ceiling} \\
w_{\text{CorpBonds}} &\le \text{Cap}_{\text{CorpBonds}} && \text{-- Corporate Credit Exposure Ceiling}
\end{aligned}
$$

* **$\mathbf{w} \in \mathbb{R}^n$**: Portfolio asset allocation weights vector
* **$\mathbf{\Sigma} \in \mathbb{R}^{n \times n}$**: Empirical covariance matrix of asset returns
* **$\boldsymbol{\mu} \in \mathbb{R}^n$**: Expected annual asset return vector
* **$q \ge 0$**: Risk-tolerance parameter ($q = 0.5$ for balanced institutional mandates)
* **$\text{LCR}_{\min}$**: Minimum High-Quality Liquid Assets reserve ratio under Basel III

---

### 2. Non-Parametric Historical Value at Risk (95% 1-Day VaR)

Calculates the maximum expected one-day loss at a 95% statistical confidence level using empirical historical return distributions rather than assuming a naive Gaussian normal distribution:

$$
\text{VaR}_{0.95} = -\text{Quantile}_{0.05}\left(R_{\text{portfolio}}\right) \times \text{Capital}
$$

Where the portfolio historical daily return series across the 250-trading-day lookback window is defined as:

$$
R_{\text{portfolio}, t} = \sum_{i=1}^n w_i \cdot r_{i, t}, \quad \forall t \in \{1, \dots, 250\}
$$

**Conditional Value at Risk ($\text{CVaR}_{0.95}$ / Expected Shortfall):**  
Quantifies tail risk conditional on exceeding the 95% VaR threshold:

$$
\text{CVaR}_{0.95} = -\mathbb{E}\left[ R_{\text{portfolio}} \;\middle|\; R_{\text{portfolio}} \le -\text{VaR}_{0.95} \right] \times \text{Capital}
$$

---

### 3. Frictional Rebalancing Decision Condition

To protect institutional capital from unnecessary turnover fee drag, trades are executed only when the risk reduction utility strictly exceeds execution friction:

**1. Portfolio Turnover:**

$$
\text{Turnover} = \frac{1}{2} \sum_{i=1}^n \left| w_{i, \text{target}} - w_{i, \text{current}} \right|
$$

**2. Transaction Execution Cost:**

$$
\text{Cost}_{\text{trade}} = \text{Turnover} \times \text{Capital} \times \frac{\text{Cost}_{\text{bps}}}{10{,}000}
$$

**3. Execution Verdict Decision Rule:**

$$
\text{Verdict} = 
\begin{cases} 
\mathbf{REBALANCE}, & \text{if } (\sigma_{\text{current}} - \sigma_{\text{target}}) \times \text{Capital} \times \lambda > \text{Cost}_{\text{trade}} \\[10pt]
\mathbf{HOLD}, & \text{otherwise (Acknowledge breach without capital churn)}
\end{cases}
$$

---

## 📁 Project Directory Structure

```text
HHG_CAPITAL_GUARD/
├── backend/
│   ├── app/
│   │   ├── api/v1/
│   │   │   ├── endpoints/
│   │   │   │   ├── auth.py          # Institutional identity, personas & onboarding
│   │   │   │   ├── copilot.py       # Groq AI risk assistant & prompt defense
│   │   │   │   ├── history.py       # Append-only audit history & CSV export
│   │   │   │   ├── monitoring.py    # Live risk telemetry & FRED macro indicators
│   │   │   │   ├── portfolio.py     # Convex QP optimization & default mandates
│   │   │   │   ├── rebalance.py     # Cost vs. benefit algorithmic trade-off
│   │   │   │   └── simulator.py     # Macroeconomic crisis shock simulation
│   │   │   └── api.py               # FastAPI APIRouter aggregator
│   │   ├── core/
│   │   │   └── config.py            # Pydantic Settings & .env validation
│   │   ├── db/
│   │   │   ├── database.py          # SQLAlchemy engine & SQLite fallback
│   │   │   └── models.py            # Portfolio, UserProfile & DecisionHistory schemas
│   │   ├── services/
│   │   │   ├── assistant_service.py # Groq AI client with prompt safety defense
│   │   │   ├── data_service.py      # yfinance market data & 24h disk caching
│   │   │   ├── optimizer.py         # CVXPY Clarabel/OSQP Conic Solver
│   │   │   ├── rebalancer.py        # Frictional trade-off & partial execution logic
│   │   │   ├── risk_engine.py       # Non-parametric VaR, CVaR & drawdown math
│   │   │   └── simulator.py         # Macro crisis shock engine
│   │   └── main.py                  # FastAPI app factory, CORS & health endpoints
│   ├── data/cache/                  # Persisted historical asset return series
│   ├── requirements.txt             # Python dependencies
│   ├── run.py                       # Server runner
│   ├── supabase_schema.sql          # Complete Supabase PostgreSQL DDL initialization
│   └── test_backend.py              # Automated unit and integration test suite
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── AccessGate.jsx       # Auth modal, judge personas & guest sandbox
│   │   │   ├── AICopilotDrawer.jsx  # Floating quantitative AI risk copilot
│   │   │   ├── AllocationChart.jsx  # Recharts donut allocation visualizer
│   │   │   ├── DecisionExplanation.jsx # Plain-English binding constraint insights
│   │   │   ├── MetricCard.jsx       # Standard financial KPI card
│   │   │   ├── PortfolioContextStrip.jsx # Header context & capital bar
│   │   │   ├── RealtimePnLTracker.jsx   # Live Asset P&L Bar Chart, Scatter & Timeline
│   │   │   ├── RiskChart.jsx        # Volatility headroom gauge
│   │   │   ├── RiskStatusBanner.jsx # Persistent global breach banner
│   │   │   ├── Sidebar.jsx          # Desktop navigation & live pulsing status
│   │   │   └── TopTelemetryBar.jsx  # FRED macro ticker & engine status
│   │   ├── pages/
│   │   │   ├── AuditHistory.jsx     # Regulatory ledger with CSV export
│   │   │   ├── LandingPage.jsx      # Institutional portal home & verified session
│   │   │   ├── OptimizationSetup.jsx# 4-Step guided mandate wizard
│   │   │   ├── Overview.jsx         # Portfolio balance sheet & health breakdown
│   │   │   ├── RebalanceEngine.jsx  # Cost-aware rebalancer & trade table
│   │   │   ├── RiskMonitoring.jsx   # Live telemetry & Real-time P&L engine
│   │   │   └── StressSimulator.jsx  # Macroeconomic crisis shock sandbox
│   │   ├── services/
│   │   │   └── demoData.js          # Default institutional benchmarks & asset universe
│   │   ├── state/
│   │   │   └── portfolioStore.jsx   # Shared global state, live drift & P&L engine
│   │   ├── utils/
│   │   │   ├── formatCurrency.js    # Indian Crores/Lakhs & USD formatting
│   │   │   ├── formatPercentage.js  # Precision basis point & percentage formatting
│   │   │   └── riskHelpers.js       # Health score & regulatory assessment logic
│   │   ├── api.js                   # Typed backend HTTP client
│   │   ├── index.css                # Institutional Monochrome Design System
│   │   └── main.jsx                 # Vite application entry point
│   ├── package.json                 # Frontend dependencies (React 19, Recharts)
│   └── vite.config.js               # Vite bundler configuration
├── .env.example                     # Environment template with Supabase, FRED & Groq
├── .gitignore                       # Clean repository exclusions (cache, .env, venv)
├── docker-compose.yml               # Multi-container deployment specification
├── PITCH_DECK_GUIDE.md              # 3-Minute hackathon presentation script & Q&A
├── PROBLEM_STATEMENT.md             # Official INIT'26 Hackathon problem statement
├── start.bat                        # 1-Click launcher for Windows
└── README.md                        # Master documentation & setup guide
```

---

## 🏆 Hackathon Context & Credits

Developed for **INIT'26 Hackathon** — **Track 1: FinTech**  
**Challenge:** Asset & Capital Management / Optimization Controls

* **Team Name:** **HYVEX**
* **Repository:** [https://github.com/gani-ship-it/HHG_CAPITAL_GARD.git](https://github.com/gani-ship-it/HHG_CAPITAL_GARD.git)
* **Regulatory Reference:** Bank for International Settlements (BIS) Basel III Framework & Reserve Bank of India (RBI) Prudential Capital Guidelines.
