# Institutional Security, Privacy & AI Compliance Defense

> **Document Purpose:** Complete executive & technical defense for Hackathon Judges, Central Bank Regulators, and Chief Information Security Officers (CISOs).
> **Question Addressed:** *"Isn't sending financial portfolio data to an AI Copilot extremely risky? What prevents secret information, proprietary trades, or customer PII from leaking?"*

---

## 1. Executive Summary & Judge Pitch Script (30-Second Pitch Defense)

When a judge asks: **"Isn't using an AI Copilot risky for bank secrets?"**, deliver this response:

> *"That is the exact reason why Capital Guard uses a **Zero-Trust Institutional Architecture** with 4 distinct defense layers:*
>
> 1. * **Mathematical Vector Masking (Zero PII):** We never send raw bank names, customer accounts, cash values, or confidential trade plans to the LLM. We only transmit anonymized mathematical ratios (e.g. `Equity: 0.30, Volatility: 0.071`).*
> 2. * **Enterprise Zero Data Retention (ZDR):** Groq processes requests purely in volatile LPU memory under an enterprise Zero Data Retention agreement—inputs are never stored or used to train public models.*
> 3. * **Supabase Row-Level Security (RLS):** Portfolios and chat histories are cryptographically partitioned by institutional JWT tokens, preventing cross-tenant leakage.*
> 4. * **Air-Gapped Sovereign Fallback:** For defense reserves or central banks with strict air-gapped firewalls, Capital Guard includes an **on-premise deterministic rule engine** that runs 100% offline without a single cloud packet.*
>
> *In short: Capital Guard separates deterministic mathematical execution from conversational explanation, guaranteeing zero data leakage."*

---

## 2. The 5-Layer Institutional Security Architecture

```text
┌───────────────────────────────────────────────────────────────────────────────────┐
│                        USER BROWSER / CRO DASHBOARD                               │
│  User types: "Why was Equity allocation limited to 30% for Apex Reserve Bank?"   │
└─────────────────────────────────────────┬─────────────────────────────────────────┘
                                          │  HTTPS + Supabase JWT Auth
                                          ▼
┌───────────────────────────────────────────────────────────────────────────────────┐
│              LAYER 1: ENTERPRISE DATA MASKING & PII SCRUBBING                      │
│  • Redacts: "Apex Reserve Bank" ➔ "[Institutional Client #402]"                   │
│  • Redacts: Absolute ₹ amounts (₹1,000,000,000) ➔ Normalized Ratios (1.00 Unit)  │
│  • Redacts: Internal account numbers, IP addresses, employee credentials          │
└─────────────────────────────────────────┬─────────────────────────────────────────┘
                                          │
                                          ▼
┌───────────────────────────────────────────────────────────────────────────────────┐
│              LAYER 2: MATHEMATICAL CONTEXT INJECTION (SAFE VECTORS)                │
│  Payload prepared:                                                                │
│  {                                                                                │
│    "weights": {"GovBonds": 0.40, "Equity": 0.30, "CorpBonds": 0.20, "Gold": 0.05}│
│    "volatility": 0.070, "policy_limit": 0.070,                                    │
│    "binding_constraint": "equity_max <= 0.30 (Lagrange λ = 0.042)",               │
│    "macro_rates": {"us_10y": 4.77, "fed_funds": 3.63}                             │
│  }                                                                                │
└─────────────────────────────────────────┬─────────────────────────────────────────┘
                                          │
                   ┌──────────────────────┴──────────────────────┐
                   │ Network Check                               │
                   ▼                                             ▼
┌────────────────────────────────────────┐     ┌────────────────────────────────────┐
│ LAYER 3A: GROQ LPU CLOUD ENGINE        │     │ LAYER 3B: AIR-GAPPED OFFLINE MODE  │
│ • Enterprise Zero Data Retention (ZDR) │     │ • 100% Local Python Rule Engine    │
│ • Ephemeral volatile memory processing │     │ • No external network egress       │
│ • 500+ tokens/sec latency via LPU      │     │ • Deterministic math explanation   │
│ • Model: Llama-3.3-70b-versatile       │     │ • Zero cloud risk                  │
└──────────────────┬─────────────────────┘     └─────────────────┬──────────────────┘
                   │                                             │
                   └──────────────────────┬──────────────────────┘
                                          │ Sanitized Response
                                          ▼
┌───────────────────────────────────────────────────────────────────────────────────┐
│              LAYER 4: SUPABASE ROW-LEVEL SECURITY & CRYPTOGRAPHIC MULTI-TENANCY    │
│  • Each conversation turn is encrypted and saved with tenant `portfolio_id`       │
│  • Postgres Row-Level Security (RLS) policies prevent unauthorized cross-queries  │
└─────────────────────────────────────────┬─────────────────────────────────────────┘
                                          │
                                          ▼
┌───────────────────────────────────────────────────────────────────────────────────┐
│              LAYER 5: IMMUTABLE AUDIT TRAIL & REGULATORY LOGS                     │
│  • Timestamp, Model ID, Input Tokens, Decision Rationale recorded                 │
│  • Exportable to CSV / JSON for SEC / RBI / Basel III compliance auditors          │
└───────────────────────────────────────────────────────────────────────────────────┘
```

---

## 3. Threat Model & Mitigation Matrix

| Threat Vector | Potential Impact | Capital Guard Defense & Mitigation |
| :--- | :--- | :--- |
| **Model Ingestion Leakage** (Public LLM training on secret data) | Proprietary alpha or client assets appear in future LLM weights | **Zero Data Retention (ZDR):** Groq enterprise API terms guarantee zero data storage and zero model training on customer payloads. |
| **PII & Trade Secret Exfiltration** | Client account numbers or trader identities intercepted | **Data Minimization Filter:** Names and currency figures are stripped and converted to normalized percentages prior to egress. |
| **Cross-Tenant Data Confusion** | Bank A sees Bank B's portfolio or AI chat advice | **Cryptographic JWT + Supabase RLS:** Every database query filters by `portfolio_id` and `user_id`. Tenant isolation is enforced at the database engine level. |
| **Prompt Injection Attacks** | Malicious actor instructs AI to bypass risk limits | **Deterministic Constraint Sovereignity:** The AI Copilot **explains** decisions; it cannot modify CVXPY optimization constraints or execute rebalancing without cryptographic human-in-the-loop CRO sign-off. |
| **Air-Gapped Central Bank Environments** | Outbound cloud connections violate national banking laws | **Zero-Cloud Local Fallback:** When `GROQ_API_KEY` is omitted or disconnected, the system switches automatically to the offline deterministic rule engine. |

---

## 4. Why Groq is the Superior Institutional Choice

1. **Ultra-Low Latency (500+ tokens/sec):**
   Groq’s Language Processing Units (LPUs) provide near-instantaneous responses (< 400ms), crucial for real-time trading desks and executive presentations.
2. **Open-Weights Transparency (Llama 3.3 70B):**
   Unlike opaque proprietary models, Llama 3.3 weights are open, auditable, and can be hosted fully on-premise on private hardware if an institution demands complete isolation.
3. **Multi-Turn Memory Management:**
   Capital Guard maintains conversation threads indexed by `portfolio_id`, passing relevant past turns while pruning stale tokens to stay within strict context bounds.

---

## 5. Compliance & Regulatory Alignment

- **Basel III Risk Governance:** Separation of quantitative calculation (CVXPY quadratic solver) from generative natural language explanation.
- **EU AI Act (High-Risk Financial Systems):** Fully transparent audit logs, verifiable mathematical formulas, and human-in-the-loop override on every trade execution.
- **RBI / SEC Cybersecurity Guidelines:** Cryptographic token encryption, zero local hardcoding of sensitive credentials, and role-based access tiers.
