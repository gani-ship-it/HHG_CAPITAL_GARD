# Institutional Frontend Redesign & Information Architecture Plan

> **Document Purpose:** Translates the evaluation critique in [`frontend.md`](file:///c:/Hackathon/HHG_CAPITAL_GUARD/frontend.md) into a concrete, executable frontend architecture and UI specification for **Capital Guard**.

---

## 1. Executive Summary & Philosophy

The objective is to transform the platform from a functional "collection of tabs" into a **single, unified institutional capital control center**. 

### The 10-Second Judge Standard
Within 10 seconds of opening the dashboard, an evaluator or chief risk officer must clearly understand:
1. **Capital Scale:** Total capital under management (e.g. ₹100 Cr).
2. **Allocation:** Current distribution across asset classes (Equity, Bonds, Gold, Cash).
3. **Safety Status:** Whether the portfolio satisfies all regulatory and risk mandates (`🟢 SAFE` vs `🔴 BREACH`).
4. **Causality ("Why this allocation?"):** The deterministic mathematical justification (e.g. Equity hit 30% upper bound; liquidity redirected to Gov Bonds).
5. **Shock Response:** What happens when market volatility increases.
6. **Cost-Aware Action:** Whether the system advises **REBALANCE** or **HOLD** based on trading friction vs. risk reduction.

---

## 2. Layout Architecture: Desktop Sidebar Shell

Instead of horizontal top navigation tabs, the application transitions to a **Fixed Institutional Left Sidebar (240px)** with a **Dynamic Content Stage**.

### Wireframe Layout

```text
┌────────────────────────────────────────────────────────────────────────────────────────┐
│ CG  CAPITAL GUARD  |  Apex Reserve Bank     [⚡ ₹100 Cr Bank Demo]  [⟳ Refresh] [Live]  │
│ [FRED Macro Feed: US 10Y 4.77% · Fed Funds 3.63% · 3M T-Bill 3.75%] [Supabase Cloud 🟢]│
├───────────────────┬────────────────────────────────────────────────────────────────────┤
│                   │ ┌────────────────────────────────────────────────────────────────┐ │
│  NAVIGATION       │ │ ● FULL-WIDTH PERSISTENT RISK BANNER (SAFE or BREACH DETECTED)  │ │
│                   │ └────────────────────────────────────────────────────────────────┘ │
│  📊 Overview      │                                                                    │
│  ⚙️ Optimization   │  PAGE HEADER & PERSISTENT METRIC STRIP                             │
│  📈 Monitoring    │  ₹100 Cr Capital · 11.94% Exp Return · 7.00% Volatility · ₹20 Cr Liq│
│  ⚖️ Rebalance     │ ────────────────────────────────────────────────────────────────── │
│  ⚡ Stress Test    │                                                                    │
│  📜 Audit History │  MODULE CONTENT STAGE                                              │
│                   │  (Overview / Guided Wizard / Side-by-Side Rebalance / etc.)        │
│ ───────────────── │                                                                    │
│  SYSTEM STATUS    │                                                                    │
│  • Engine: CVXPY  │                                                                    │
│  • Cloud: Sync OK │                                                                    │
│  • Latency: 22ms  │                                                                    │
└───────────────────┴────────────────────────────────────────────────────────────────────┘
```

---

## 3. Detailed Component Specifications

### Component 1: Persistent Full-Width Status Banner
Positioned at the top of the main viewport, immediately visible on **every** screen.

* **Safe State (Normal Operations):**
  ```text
  ┌───────────────────────────────────────────────────────────────────────────────────┐
  │ 🟢 PORTFOLIO WITHIN POLICY LIMITS                                                  │
  │ All configured volatility limits (7.00%) and liquidity floors (₹20 Cr) satisfied. │
  └───────────────────────────────────────────────────────────────────────────────────┘
  ```
* **Breach State (Market Shock / Volatility Surge):**
  ```text
  ┌───────────────────────────────────────────────────────────────────────────────────┐
  │ 🔴 CRITICAL RISK BREACH DETECTED                                                   │
  │ Current Volatility: 8.10% crosses Policy Limit: 7.00% (+1.10% over limit)         │
  │ Action Required:                                                                   │
  │ [Review Rebalancing Engine ➔]             [Run Macro Stress Test]                 │
  └───────────────────────────────────────────────────────────────────────────────────┘
  ```

---

### Component 2: Redesigned Overview ("The 10-Second Screen")

1. **Top Metric Strip (Persistent Context):**
   - Capital Under Management: `₹100.00 Cr`
   - Expected Annual Return: `11.94%`
   - Portfolio Volatility: `7.00%` (or `8.10%` in alert)
   - Liquid Reserves: `₹20.00 Cr`
   - Overall Health Score: `92/100` (`SAFE`)

2. **Visual Allocation & Health Grid (50 / 50 Split):**
   - **Left:** Asset Allocation Donut Chart with clean grayscale shades and inline percentage breakdown table.
   - **Right:** Portfolio Health Card with circular score gauge, status badge, and checklist:
     - `✓ Liquidity Requirement Met (₹20 Cr floor)`
     - `✓ Volatility Within Limits (<= 7.0%)`
     - `✓ Asset Concentration Diversified (HHI: 0.28)`

3. **Prominent "Why This Allocation?" Narrative Card:**
   - Placed directly beneath the allocation chart in high-contrast styling.
   - Plain-English deterministic reason derived from active binding constraints:
     > *"Equity allocation reached its regulatory upper limit of 30.0%. Capital was redirected into Government Bonds (40.0%) and Cash (5.0%) to satisfy the mandatory ₹20 Cr liquidity reserve constraint."*

4. **Risk vs. Return Frontier Analysis Table:**
   - Proves mathematically why the solved portfolio achieves a **1.71 Sharpe Proxy**, outperforming individual standalone asset classes.

---

### Component 3: 4-Step Guided Optimization Wizard

Replaces the single cluttered form with a guided institutional workflow:

```text
Step 1: Organization ──➔ Step 2: Objective ──➔ Step 3: Assets ──➔ Step 4: Limits
```

* **Step 1 (Organization & Scale):**
  - Institution Type: Bank / Insurance / Corporate Treasury / Fund
  - Total Capital: `₹1,000,000,000` with quick preset buttons (`₹10 Cr`, `₹50 Cr`, `₹100 Cr`, `₹500 Cr`)
  - Investment Horizon: 1, 3, 5, or 10 Years
* **Step 2 (Investment Mandate):**
  - 4 Selectable Objective Cards:
    1. **Growth** (Max return)
    2. **Balanced Growth** (Recommended for Banks)
    3. **Income** (Yield-focused)
    4. **Capital Preservation** (Zero drawdown priority)
* **Step 3 (Asset Universe):**
  - Selectable Asset Chips with checkboxes: Gov Bonds, Corporate Bonds, Equities, Gold, Cash.
* **Step 4 (Risk Limits & Regulatory Caps):**
  - Risk Preference Slider (Low ──●── High)
  - Minimum Liquidity Floor (₹ Cr)
  - Maximum Equity Cap (%)
  - Maximum Corporate Bond Cap (%)
* **Persistent Sticky Right Panel ("Your Configuration"):**
  - Live summary panel that updates as the user fills the wizard, displaying Capital, Objective, Risk Tolerance, Liquidity Floor, and Asset Count so context is never lost.

---

### Component 4: Rebalance Engine (Before vs. After Comparison)

Rebuilt completely around an institutional **side-by-side comparative ledger**:

```text
┌──────────────────────────────────────┬──────────────────────────────────────┐
│ CURRENT ALLOCATION (8.10% Volatility)│ PROPOSED ALLOCATION (6.70% Volatility│
├──────────────────────────────────────┼──────────────────────────────────────┤
│ Equity       40.0%  (Breached)       │ Equity       30.0%  (-10.0% SELL)    │
│ Gov Bonds    30.0%                   │ Gov Bonds    40.0%  (+10.0% BUY)     │
│ Corp Bonds   20.0%                   │ Corp Bonds   20.0%  (HOLD)           │
│ Gold          5.0%                   │ Gold          5.0%  (HOLD)           │
│ Cash          5.0%                   │ Cash          5.0%  (HOLD)           │
└──────────────────────────────────────┴──────────────────────────────────────┘
```

* **Cost vs. Benefit Calculation Card:**
  - **Risk Delta:** `8.10% ➔ 6.70%` (-1.40% risk reduction)
  - **Estimated Trade Turnover:** `18.00%`
  - **Transaction Friction:** `₹4.20 Lakh` (15 bps)
  - **Net Economic Benefit:** `+₹18.50 Lakh`
  - **Recommendation:** **`REBALANCE`** (or **`HOLD`** if costs exceed benefit)
* **Primary Action:**
  - `[Execute Rebalance & Commit to Immutable Audit Trail]`
* **Secondary Action:**
  - `[Hold Current Portfolio (Acknowledge Risk)]`

---

### Component 5: 3-Column Comparative Stress Simulator

Replaces a simple result card with a **3-Column Macro Impact Board**:

```text
┌────────────────────┐      ┌────────────────────┐      ┌────────────────────┐
│ 1. PRE-SHOCK BASE  │  ──➔ │ 2. SHOCKED STATE   │  ──➔ │ 3. AFTER PREVIEW   │
├────────────────────┤      ├────────────────────┤      ├────────────────────┤
│ Value:  ₹100.00 Cr │      │ Value:  ₹92.70 Cr  │      │ Value:  ₹95.10 Cr  │
│ Risk:   7.00%      │      │ Risk:   11.20%     │      │ Risk:   7.40%      │
│ Status: SAFE 🟢    │      │ Status: BREACH 🔴  │      │ Status: CAUTION 🟡 │
│ Drawdown: 0.0%     │      │ Loss:   -₹7.30 Cr  │      │ Loss:   -₹4.90 Cr  │
└────────────────────┘      └────────────────────┘      └────────────────────┘
```

* **Scenario Parameter Breakdown:**
  - Shock breakdown pills: `Equity: -30%`, `Gov Bonds: +5%`, `Gold: +10%`, `Vol Multiplier: 1.5x`.
* **Institutional Narrative:**
  - *"In a Market Crash scenario, unhedged equity draws down by ₹7.3 Cr. Capital Guard's rebalancing preview redirects capital into Gold and Government Bonds, cushioning portfolio valuation by +₹2.4 Cr."*

---

### Component 6: Audit Event Log & Inspection Slide-Out Drawer

1. **Structured Log Table:**
   - Columns: `Timestamp` | `Event Type` | `Trigger` | `Decision` | `Risk Before` | `Risk After` | `Action`
2. **Slide-Out Inspection Drawer (Right Flyout):**
   - Clicking any audit row opens a right-side drawer displaying:
     - Exact timestamp & event ID (Supabase DB UUID)
     - Input configuration snapshot
     - Pre-trade vs. post-trade asset weights
     - Binding Lagrange multiplier constraints
     - Transaction cost math formula: $\text{Turnover} \times \text{Cost (bps)} \times \text{Capital}$
     - Deterministic justification string
3. **Secondary Utility:**
   - `[Export Audit Trail (.CSV)]` positioned in the table toolbar as a secondary action.

---

## 4. Open Design Questions & Clarifications

Before executing the changes in code, here are the key operational details:

1. **Sidebar Navigation Behavior:**
   - **Recommendation:** Fixed 240px sidebar on desktop screens ($\ge 1024\text{px}$) with an institutional monochrome aesthetic; collapsible on mobile/tablet.
2. **Preset Demo Button (`₹100 Cr Bank Demo`):**
   - **Recommendation:** Keep the button always visible in the top header so that at any point during a demo, a single click restores the ₹100 Cr scenario.
3. **Optimization Setup Stepper:**
   - **Recommendation:** Include both "Next / Back" stepper buttons and direct step clickability so judges can quickly jump to Step 4 if desired.
4. **Audit Drawer:**
   - **Recommendation:** Implement as a smooth slide-out overlay drawer from the right side, so the user never leaves the audit timeline.

---

## 5. Implementation Roadmap

| Phase | Files Involved | Scope |
| :--- | :--- | :--- |
| **Phase 1: Shell & CSS** | `frontend/src/index.css` | Add sidebar grid, persistent banner styles, step wizard layouts, and drawer transitions. |
| **Phase 2: Status & Top Bar** | `frontend/src/App.jsx` | Implement the full-width persistent status banner and top telemetry bar. |
| **Phase 3: 4-Step Wizard** | `frontend/src/App.jsx` | Build the stepped wizard with persistent configuration preview panel. |
| **Phase 4: Side-by-Side Rebalance** | `frontend/src/App.jsx` | Implement the before-vs-after comparison table and decision card. |
| **Phase 5: 3-Column Simulator** | `frontend/src/App.jsx` | Build the 3-column macro shock comparative board. |
| **Phase 6: Audit Drawer** | `frontend/src/App.jsx` | Build the slide-over inspection drawer for event records. |
| **Phase 7: Verification** | Browser / Vite | Test build, verify responsive layout, check state persistence. |
