The backend may be functional, but the frontend should not be considered finished merely because the pages, buttons, and API connections exist. For this project, the frontend must make the financial decision process immediately understandable to judges and users.

The main issue is likely not the color palette—it is the information architecture, visual hierarchy, and demo flow. The dashboard should feel like one coherent institutional control system, not several unrelated tabs.

What the frontend should communicate

Within the first 10 seconds, a judge should understand:

How much capital is being managed

Where the capital is allocated

Whether the portfolio is safe

Why the allocation was selected

What happens when risk increases

Whether the system recommends REBALANCE or HOLD

The current description has all these features, but they may be presented as separate screens instead of one connected decision experience.

Recommended frontend redesign
1. Use a proper application shell

Keep a consistent layout:

┌──────────────────────────────────────────────────────────────┐
│ HHG CAPITALGUARD                    ₹100 Cr Demo   Refresh   │
├───────────────┬──────────────────────────────────────────────┤
│               │                                              │
│ Overview      │ Page title                                   │
│ Optimization  │ Short explanation                           │
│ Monitoring    │                                              │
│ Rebalance     │ Main content                                 │
│ Stress Test   │                                              │
│ Audit History │                                              │
│               │                                              │
│ System Status │                                              │
└───────────────┴──────────────────────────────────────────────┘

Use a sidebar on desktop and a bottom navigation or collapsible menu on mobile.

Avoid making every feature look like an independent page. They should feel like modules of the same platform.

2. Redesign the Overview page

The Overview page should be the strongest screen.

Top section
CapitalGuard Overview

Institutional portfolio decision center
Last updated: 2 minutes ago

[₹100 Cr Capital] [11.94% Expected Return] [7.00% Risk]
[₹25 Cr Liquidity] [SAFE]
Main content
┌────────────────────────────┐ ┌────────────────────────────┐
│ Portfolio Allocation       │ │ Portfolio Health            │
│                            │ │                            │
│ Donut chart                │ │ 92 / 100                   │
│                            │ │ SAFE                       │
│ Equity       30%           │ │ Risk within configured cap │
│ Gov Bonds    40%           │ │ Liquidity requirement met  │
│ Corp Bonds   25%           │ │                            │
│ Gold         10%           │ │ [View Risk Details]        │
│ Cash          5%           │ │                            │
└────────────────────────────┘ └────────────────────────────┘

Then show:

Why this allocation?

Equity reached its upper limit of 30%.
The liquidity requirement redirected capital toward
government bonds and cash.

This explanation should be visually prominent—not hidden in a small audit note.

3. Make the risk status impossible to miss

The risk state should be represented by a clear status banner.

Safe state
┌──────────────────────────────────────────────────────────────┐
│ ● PORTFOLIO WITHIN LIMITS                                    │
│ All configured risk and liquidity requirements are satisfied │
└──────────────────────────────────────────────────────────────┘
Breach state
┌──────────────────────────────────────────────────────────────┐
│ ! RISK BREACH DETECTED                                       │
│ Portfolio volatility is above the configured maximum.        │
│                                                              │
│ Allowed risk: 7.00%     Current risk: 8.10%                  │
│                                                              │
│ [Review Rebalancing] [Run Stress Test]                       │
└──────────────────────────────────────────────────────────────┘

Do not rely only on a small red badge or pulsing animation. The breach must remain visible and accessible.

4. Improve the Optimization Setup

The setup page should be a guided form, not a dense collection of sliders.

Step 1 of 4 — Organization

Organization type
[ Bank                         ]

Total capital
[ ₹100 Cr                      ]

Investment horizon
[ 3 years                      ]

                         [Continue]

Then:

Step 2 of 4 — Objective
[ Growth ] [ Balanced Growth ] [ Income ] [ Preservation ]

Then:

Step 3 of 4 — Assets
☑ Government Bonds
☑ Corporate Bonds
☑ Equity
☑ Gold
☑ Cash

Then:

Step 4 of 4 — Risk & Liquidity

Risk preference
Low ─────────●──────── High

Minimum liquidity
[ ₹20 Cr ]

Asset limits
Equity          [30%]
Corporate Bonds [25%]

[Run Optimization]

Show a small summary panel on the right:

Your configuration

Capital: ₹100 Cr
Objective: Balanced Growth
Risk: Medium
Minimum liquidity: ₹20 Cr
Selected assets: 5

This prevents users from losing context while moving through the form.

5. Rebuild the Rebalance Engine around a before/after comparison

This should be one of your most impressive screens.

Risk Breach Detected

Current portfolio risk: 8.10%
Allowed portfolio risk: 7.00%

Then:

CURRENT PORTFOLIO          PROPOSED PORTFOLIO

Equity       40%           Equity       30%
Gov Bonds    30%           Gov Bonds    40%
Corp Bonds   20%           Corp Bonds   20%
Gold          5%           Gold          5%
Cash          5%           Cash          5%

Below it:

Risk before             8.10%
Risk after              6.70%
Risk reduction          1.40 percentage points

Estimated turnover      18.00%
Transaction cost        ₹4.2 Lakh
Economic benefit        ₹X Lakh

Decision                REBALANCE

Primary action:

[Execute Rebalance & Commit Audit Log]

Secondary action:

[Hold Portfolio]

The execution button should only appear after the cost-benefit result is visible.

6. Make the Stress Simulator visual

Instead of only using a dropdown and a result card:

Scenario
[ Market Crash ▼ ]

Equity shock       -30%
Bond shock           +5%
Gold shock          +10%
Volatility multiplier 1.5x

Show three columns:

CURRENT              SHOCKED              AFTER PREVIEW
Portfolio Value      Projected Value      Projected Value
₹100 Cr              ₹92.7 Cr             ₹95.1 Cr

Risk: 7.0%           Risk: 11.2%          Risk: 7.4%
Status: SAFE         Status: BREACH       Status: WARNING

Then explain:

The scenario breaches the configured risk limit. The preview reduces equity exposure and increases defensive assets, but the projected risk remains slightly above the limit.

This is more convincing than simply showing “Market Crash: -₹7.3 Cr.”

7. Fix the Audit History presentation

The audit page should look like an institutional event log:

Time

	

Event

	

Trigger

	

Decision

	

Risk Before

	

Risk After




10:42

	

Optimization

	

User request

	

OPTIMIZE

	

—

	

7.00%




10:45

	

Risk breach

	

Volatility

	

ALERT

	

8.10%

	

—




10:46

	

Rebalancing

	

Risk breach

	

REBALANCE

	

8.10%

	

6.70%




10:47

	

Scenario test

	

Market Crash

	

PREVIEW

	

7.00%

	

7.40%

Each row should open a detail drawer containing:

Input configuration

Current allocation

Target allocation

Triggering metric

Cost calculation

Explanation

Timestamp

Decision status

The Export CSV button should be secondary, not the main visual focus.

8. Avoid these frontend problems
Do not use:

Too many large cards with no hierarchy

Excessive empty space

A donut chart that dominates the entire page

Random grayscale shades without meaning

Hidden risk alerts

Buttons that do not clearly change state

Fake “live” labels if data only updates on refresh

Hardcoded values presented as live calculations

Separate screens that do not share portfolio state

A health score without showing how it was calculated

Do use:

Strong page titles

Consistent spacing

Clear primary actions

Persistent portfolio status

Before/after comparisons

Meaningful charts

Visible explanations

Clear loading, success, error, and breach states

Shared state across all modules

Recommended final navigation
Overview
   ├── Portfolio summary
   ├── Allocation
   ├── Health score
   ├── Why this allocation
   └── Current risk status

Optimization Setup
   └── Guided configuration wizard

Risk Monitoring
   ├── Portfolio value
   ├── VaR
   ├── Volatility
   ├── Drawdown
   └── Risk-limit comparison

Rebalance Engine
   ├── Breach details
   ├── Current vs target allocation
   ├── Cost-benefit analysis
   └── Rebalance/Hold decision

Stress Simulator
   ├── Scenario presets
   ├── Shock configuration
   ├── Projected impact
   └── Rebalancing preview

Audit History
   ├── Decision timeline
   ├── Event details
   └── CSV export