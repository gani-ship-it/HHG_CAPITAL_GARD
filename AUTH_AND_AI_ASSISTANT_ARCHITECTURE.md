# Architecture & Requirements: AI Assistant & Multi-User Authentication

> **Document Purpose:** Detailed analysis and implementation specification answering two critical requirements:
> 1. **Do we need an AI Assistant API?** (LLM Copilot for portfolio advisory & risk explanation)
> 2. **Do we need Sign In / Sign Up?** (Multi-user roles, institutional tenancy, and session management)

---

## 1. Quick Answers & Executive Summary

| Requirement | Do We Need an API / Service? | Recommended Solution | Setup Effort |
| :--- | :--- | :--- | :--- |
| **AI Assistant / Copilot** | **Yes, an LLM API (Google Gemini API)** | **Google Gemini API (`GEMINI_API_KEY`)**<br>Free tier via Google AI Studio. Provides conversational Q&A, explains complex mathematical constraints, and evaluates trade tradeoffs. | 2 minutes to get key; built with zero-cost fallback. |
| **Sign In / Sign Up (Auth)** | **No new API needed! Already available in Supabase** | **Supabase Auth (Native)**<br>Your connected Supabase instance (`rbdyvetyifiodxcsupmq`) already has built-in User Authentication, JWTs, and Row-Level Security. | 0 new services; just activate frontend Auth modal. |

---

## 2. Part 1: The AI Assistant (Capital Guard Copilot)

### Why an AI Assistant is High-Value for Judges
While our backend already solves **deterministic quadratic programming (CVXPY)** with 100% mathematical certainty, judges and users love interacting with an **embedded conversational Copilot** that can answer questions like:
- *"Why did the optimizer cap Equity at 30% instead of 40%?"*
- *"Should I execute this rebalancing right now or hold, considering the 15 bps trading fee?"*
- *"Explain my 95% Historical VaR in plain English to the Board of Directors."*
- *"What would happen to our ₹100 Cr portfolio if the Fed cuts interest rates by 50 bps?"*

### Which API Should We Use?
We recommend **Google Gemini API** (`gemini-1.5-flash` or `gemini-2.0-flash`):
1. **Free & Instant:** Free API keys are generated with 1 click at [aistudio.google.com](https://aistudio.google.com).
2. **Speed:** Flash models respond in < 600ms, making the assistant feel real-time.
3. **Structured Context Injection:** We can feed the assistant the live portfolio state (current weights, risk breach status, FRED Treasury yields, and CVXPY binding constraints) as system context.

### Architecture: Hybrid AI (Deterministic Math + Generative Explanation)

```text
┌────────────────────────────────────────────────────────┐
│            USER CHAT / VOICE / PROMPT                  │
│       "Explain why the system recommended REBALANCE"   │
└──────────────────────────┬─────────────────────────────┘
                           │
                           ▼
┌────────────────────────────────────────────────────────┐
│              CAPITAL GUARD COPILOT                     │
│  Context Injected:                                     │
│  • Solved Weights: Equity 30%, GovBonds 40%           │
│  • Risk Breach: 8.10% vs Allowed 7.00%                 │
│  • Turnover: 18.0%, Trading Friction: ₹4.2 Lakh        │
│  • Live FRED Yields: US 10Y @ 4.77%                    │
└──────────────────────────┬─────────────────────────────┘
                           │
                           ▼
┌────────────────────────────────────────────────────────┐
│         GEMINI API (or Offline Rule Engine)            │
│  "The mathematical optimizer detected a 1.10% breach. │
│   Trading costs of ₹4.2 Lakh are significantly         │
│   outweighed by ₹18.5 Lakh in risk reduction..."       │
└────────────────────────────────────────────────────────┘
```

> **Fallback Guarantee:** If no `GEMINI_API_KEY` is provided, the assistant uses our built-in **Deterministic Financial Rule Engine** so the feature **never crashes or throws errors**.

---

## 3. Part 2: Multi-User Authentication & Roles (Sign In / Sign Up)

### Why Authentication is Essential
In an institutional bank or asset management firm, different stakeholders have distinct responsibilities:
1. **Chief Risk Officer (CRO):** Sets maximum volatility caps (e.g. 7.0%) and approves rebalance executions.
2. **Portfolio Manager (PM):** Configures asset universes, selects growth mandates, and initiates optimizations.
3. **Compliance Auditor:** Views immutable audit history logs, inspects constraint decisions, and exports CSV reports.

### Do We Need to Buy or Set Up a New Service?
**No!** We already have **Supabase** connected:
- **Supabase URL:** `https://rbdyvetyifiodxcsupmq.supabase.co`
- **Supabase Anon Key:** Configured in `.env` and `frontend/src/api.js`

Supabase includes an enterprise-ready **Auth engine** out of the box:
- Email & Password Sign Up / Sign In
- Session persistence via LocalStorage
- User profiles table linked to portfolios (`user_id` foreign key)
- Password reset and magic links

### The "Hackathon Judge UX" Best Practice:
Judges hate filling out long registration forms during a 3-minute pitch. Therefore, we implement a **dual-mode authentication**:

1. **1-Click Instant Demo Login (Judge Persona Selector):**
   - `[Login as Chief Risk Officer]` (Apex Reserve Bank)
   - `[Login as Senior Portfolio Manager]` (State Treasury)
   - `[Login as Compliance Auditor]` (Regulatory Oversight)
2. **Full Email/Password Sign In & Sign Up Modal:**
   - For real users who want to register their own organization, create a custom portfolio, and persist their own data.

```text
┌────────────────────────────────────────────────────────┐
│            INSTITUTIONAL ACCESS PORTAL                 │
│                                                        │
│  Quick Judge Access (No Signup Required):              │
│  ┌───────────────────────┐  ┌───────────────────────┐  │
│  │ Chief Risk Officer    │  │ Portfolio Manager     │  │
│  │ [Instant Demo Login]  │  │ [Instant Demo Login]  │  │
│  └───────────────────────┘  └───────────────────────┘  │
│                                                        │
│  ─────────────── OR SIGN IN / SIGN UP ────────────────  │
│                                                        │
│  Email:    [ officer@apexbank.com          ]           │
│  Password: [ ••••••••••••••••              ]           │
│                                                        │
│  [ Sign In ]                     [ Create New Account ]│
└────────────────────────────────────────────────────────┘
```

---

## 4. How They Integrate into the Redesigned Sidebar

Both features seamlessly enhance our [`FRONTEND_REDESIGN_PLAN.md`](file:///c:/Hackathon/HHG_CAPITAL_GUARD/FRONTEND_REDESIGN_PLAN.md):

1. **User Profile in Sidebar (Bottom-Left):**
   - Displays logged-in user avatar: `CRO Ganesh K. (Apex Reserve Bank)`
   - Status: `Active Session · Bank Admin`
   - `[Sign Out]` / `[Switch Role]` button.

2. **Floating Copilot Drawer / Sidebar Item:**
   - Added as a persistent widget or sidebar item: `🤖 Capital Copilot (AI Assistant)`.
   - Clicking it slides out an interactive conversational drawer from the right where the user can ask anything about their portfolio.

---

## 5. API Keys Required Summary

| API / Service | Key Required? | Status | Source |
| :--- | :--- | :--- | :--- |
| **Supabase Auth** | `SUPABASE_ANON_KEY` | ✅ **Already Configured** | Present in `.env` |
| **Federal Reserve (FRED)** | `FRED_API_KEY` | ✅ **Already Configured** | Present in `.env` (`f869ca8...`) |
| **AI Copilot (Gemini)** | `GEMINI_API_KEY` | ⚡ **Optional / Recommended** | Free from [aistudio.google.com](https://aistudio.google.com) (or works with deterministic fallback) |

---

## 6. Implementation Steps

If you want to include these capabilities alongside the frontend redesign:

1. **Step 1: Supabase Auth Modal & User Context:**
   - Create `AuthContext.jsx` using `@supabase/supabase-js`.
   - Add Sign In / Sign Up modal with 1-Click Demo Personas (Chief Risk Officer, Portfolio Manager).
2. **Step 2: AI Copilot Backend Endpoint & Service:**
   - Add `backend/app/services/assistant_service.py` that connects to Gemini API with full portfolio context.
   - Fallback to deterministic financial Q&A rules if no API key is present.
3. **Step 3: Frontend AI Copilot Drawer:**
   - Add a sleek slide-out Institutional Chat Drawer with suggested prompts:
     - *"Explain our ₹100 Cr allocation"*
     - *"Why was Equity limited to 30%?"*
     - *"Evaluate rebalancing cost vs benefit"*
