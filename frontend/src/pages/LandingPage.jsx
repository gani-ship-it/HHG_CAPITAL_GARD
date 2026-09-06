import React from "react";
import { usePortfolio } from "../state/portfolioStore";
import { formatCurrency } from "../utils/formatCurrency";
import {
  Shield,
  Sliders,
  Zap,
  ArrowRight,
  Activity,
  GitCompare,
  History,
  Cpu,
  Lock,
  Building,
  CheckCircle2
} from "lucide-react";

export default function LandingPage() {
  const {
    startSetup,
    loadDemoPreset,
    loading,
    isInitialized,
    setActiveTab,
    setIsAuthModalOpen,
    currentUser,
    portfolio
  } = usePortfolio();

  const isRegisteredUser = currentUser && !currentUser.isGuest;
  const currentCapital = portfolio?.total_capital || currentUser?.initial_capital;
  const currentOrg = portfolio?.org_name || currentUser?.org_name || "Institutional Client";
  const currentRole = currentUser?.role || "Risk Officer";

  return (
    <div
      style={{
        minHeight: "100%",
        background: "#FAFAFA",
        padding: "48px 56px",
        display: "flex",
        flexDirection: "column",
        gap: 48,
        maxWidth: 1000,
        margin: "0 auto"
      }}
    >
      {/* ── Hero Section ── */}
      <section style={{ display: "flex", flexDirection: "column", gap: 20 }}>
        {/* Compliance or Institutional Verification Badge */}
        {isRegisteredUser ? (
          <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 7,
                background: "#111111",
                color: "#FFFFFF",
                padding: "4px 12px",
                borderRadius: 4,
                fontSize: 11,
                fontFamily: "var(--font-mono)",
                letterSpacing: "0.06em",
                fontWeight: 600
              }}
            >
              <Building style={{ width: 12, height: 12 }} />
              <span>{currentOrg.toUpperCase()}</span>
            </div>
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                background: "#F4F4F5",
                border: "1px solid #E4E4E7",
                padding: "4px 10px",
                borderRadius: 4,
                fontSize: 11,
                color: "#52525B",
                fontFamily: "var(--font-mono)"
              }}
            >
              <CheckCircle2 style={{ width: 12, height: 12, color: "#16A34A" }} />
              <span>AUTHENTICATED INSTITUTIONAL SESSION</span>
              {currentCapital && (
                <>
                  <span style={{ color: "#A1A1AA" }}>•</span>
                  <span style={{ color: "#111111", fontWeight: 700 }}>
                    CAPITAL: {formatCurrency(currentCapital, portfolio?.currency || currentUser?.currency || "INR")}
                  </span>
                </>
              )}
            </div>
          </div>
        ) : (
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span
              style={{
                width: 6,
                height: 6,
                borderRadius: "50%",
                background: "#111111",
                display: "inline-block"
              }}
            />
            <span
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: 10,
                fontWeight: 600,
                letterSpacing: "0.12em",
                textTransform: "uppercase",
                color: "#666666"
              }}
            >
              Basel III Compliance · Clarabel Conic QP · Sovereign Risk OS
            </span>
          </div>
        )}

        {/* Main headline */}
        <h1
          style={{
            fontSize: 40,
            fontWeight: 800,
            letterSpacing: "-0.03em",
            lineHeight: 1.1,
            color: "#111111",
            maxWidth: 680
          }}
        >
          Autonomous Institutional Capital
          <br />
          <span style={{ fontWeight: 300, color: "#555555" }}>
            Allocation &amp; Risk Defense
          </span>
        </h1>

        {/* Subtitle */}
        <p
          style={{
            fontSize: 14,
            color: "#666666",
            lineHeight: 1.65,
            maxWidth: 580
          }}
        >
          {isRegisteredUser
            ? `Welcome, ${currentUser.full_name || currentUser.email}. Manage your institution's active capital (${formatCurrency(currentCapital, portfolio?.currency || currentUser?.currency || "INR")}), monitor live risk limits, and run convex quadratic optimizations under Basel III capital defense constraints.`
            : "Formulate investment mandates, execute convex quadratic portfolio optimization, monitor live VaR headroom, and trigger cost-efficient rebalancing under severe macro stress."}
        </p>

        {/* CTA row — User-Aware Actions */}
        <div style={{ display: "flex", flexWrap: "wrap", gap: 10, paddingTop: 8 }}>
          {isRegisteredUser ? (
            <>
              {/* Authenticated user: Prioritize their own portfolio */}
              <button
                id="landing-open-dashboard"
                onClick={() => setActiveTab("overview")}
                className="cg-btn-primary"
                style={{ fontSize: 13 }}
              >
                <Activity style={{ width: 14, height: 14 }} />
                Open Portfolio Dashboard
                <ArrowRight style={{ width: 14, height: 14 }} />
              </button>

              <button
                id="landing-reconfigure-mandate"
                onClick={startSetup}
                className="cg-btn-secondary"
                style={{ fontSize: 13 }}
              >
                <Sliders style={{ width: 14, height: 14 }} />
                Adjust Mandate &amp; Constraints
              </button>
            </>
          ) : (
            <>
              {/* Guest / Unregistered user: Allow setup or sample test */}
              <button
                id="landing-start-mandate"
                onClick={startSetup}
                className="cg-btn-primary"
                style={{ fontSize: 13 }}
              >
                <Sliders style={{ width: 14, height: 14 }} />
                Configure New Mandate
                <ArrowRight style={{ width: 14, height: 14 }} />
              </button>

              <button
                id="landing-demo-preset"
                onClick={loadDemoPreset}
                disabled={loading}
                className="cg-btn-secondary"
                style={{ fontSize: 13 }}
              >
                <Zap style={{ width: 14, height: 14 }} />
                {loading ? "Loading…" : "Explore Demo Sandbox (₹100 Cr)"}
              </button>

              {isInitialized && (
                <button
                  id="landing-return-dashboard"
                  onClick={() => setActiveTab("overview")}
                  className="cg-btn-secondary"
                  style={{ fontSize: 13 }}
                >
                  Return to Dashboard
                  <ArrowRight style={{ width: 14, height: 14 }} />
                </button>
              )}
            </>
          )}
        </div>
      </section>

      {/* ── Horizontal Divider ── */}
      <hr style={{ border: "none", borderTop: "1px solid #EAEAEA" }} />

      {/* ── Workflow Pipeline ── */}
      <section style={{ display: "flex", flexDirection: "column", gap: 20 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div>
            <div className="cg-section-title">End-to-End Institutional Workflow</div>
            <p style={{ fontSize: 12, color: "#666666", marginTop: 4 }}>
              From regulatory onboarding to continuous automated risk remediation.
            </p>
          </div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              padding: "4px 10px",
              border: "1px solid #D4D4D4",
              borderRadius: 3,
              background: "#FFFFFF"
            }}
          >
            <Cpu style={{ width: 11, height: 11, color: "#111111" }} />
            <span style={{ fontFamily: "var(--font-mono)", fontSize: 9, fontWeight: 700, letterSpacing: "0.08em", color: "#111111" }}>
              CLARABEL QP SOLVER
            </span>
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 12 }}>
          {[
            {
              num: "01",
              title: "Mandate Formulation",
              desc: "Define organization tier (Bank/Insurance/NBFC), capital size, duration horizon, asset universe, and LCR liquidity floors.",
              onClick: startSetup
            },
            {
              num: "02",
              title: "Convex QP Optimization",
              desc: "Interior-point conic solver minimizes portfolio variance subject to Basel III statutory capital floors and concentration ceilings.",
              onClick: null
            },
            {
              num: "03",
              title: "Continuous Monitoring",
              desc: "Live VaR 95%, volatility vs. limit tracking, and simulated macro shocks triggering persistent visual breach telemetry.",
              onClick: null
            },
            {
              num: "04",
              title: "Rebalance Engine",
              desc: "Algorithmic trade-off between friction costs (bps) and risk reduction, followed by immutable audit ledger commits.",
              onClick: null
            }
          ].map((step) => (
            <div
              key={step.num}
              className="cg-card"
              style={{ padding: 20, display: "flex", flexDirection: "column", gap: 10 }}
            >
              <div
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: 3,
                  border: "1px solid #111111",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontFamily: "var(--font-mono)",
                  fontSize: 11,
                  fontWeight: 700,
                  color: "#111111"
                }}
              >
                {step.num}
              </div>
              <div style={{ fontSize: 12, fontWeight: 700, color: "#111111", letterSpacing: "-0.01em" }}>
                {step.title}
              </div>
              <p style={{ fontSize: 11, color: "#666666", lineHeight: 1.6 }}>
                {step.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Three Institutional Pillars ── */}
      <section style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 12 }}>
        {[
          {
            icon: Shield,
            title: "Basel III & LCR Compliance",
            desc: "Hard statutory constraints guarantee sovereign Level 1 HQLA buffers and statutory liquidity ratio requirements under liquidity stress."
          },
          {
            icon: GitCompare,
            title: "Cost-Benefit Rebalance Logic",
            desc: "Evaluates turnover fees and bid-ask slippage against risk reduction bps to prevent value-destroying churn before trading."
          },
          {
            icon: History,
            title: "Immutable Audit Ledger",
            desc: "Every allocation run, market shock acknowledgment, and rebalance execution is timestamped and recorded for regulatory compliance."
          }
        ].map((pillar) => {
          const Icon = pillar.icon;
          return (
            <div
              key={pillar.title}
              className="cg-card"
              style={{ padding: 24, display: "flex", flexDirection: "column", gap: 12 }}
            >
              <div
                style={{
                  width: 34,
                  height: 34,
                  borderRadius: 3,
                  border: "1px solid #EAEAEA",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center"
                }}
              >
                <Icon style={{ width: 16, height: 16, color: "#111111" }} />
              </div>
              <div style={{ fontSize: 13, fontWeight: 700, color: "#111111" }}>{pillar.title}</div>
              <p style={{ fontSize: 11, color: "#666666", lineHeight: 1.65 }}>{pillar.desc}</p>
            </div>
          );
        })}
      </section>

      {/* ── Footer CTA: Active Verified Session Status or Guest Sign In ── */}
      {currentUser ? (
        <section
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "18px 24px",
            border: "1px solid #111111",
            borderRadius: 4,
            background: "#FFFFFF",
            boxShadow: "0 2px 8px rgba(0,0,0,0.04)"
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: 4,
                background: "#111111",
                color: "#FFFFFF",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0
              }}
            >
              <CheckCircle2 size={18} />
            </div>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ fontSize: 13.5, fontWeight: 700, color: "#111111" }}>
                  Verified Session: {currentUser.full_name || currentUser.user_metadata?.full_name || currentUser.email}
                </span>
                <span
                  style={{
                    fontSize: 10,
                    fontWeight: 700,
                    padding: "2px 7px",
                    background: "#111111",
                    color: "#FFFFFF",
                    borderRadius: 3,
                    textTransform: "uppercase",
                    letterSpacing: "0.04em"
                  }}
                >
                  {currentUser.isGuest ? "GUEST SANDBOX" : (currentUser.role || "Risk Officer")}
                </span>
              </div>
              <div style={{ fontSize: 12, color: "#666666", marginTop: 2 }}>
                {currentUser.org_name || portfolio?.org_name || "Apex Reserve Bank"} • Authenticated institutional access under Basel III & RBI guidelines.
              </div>
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <button
              onClick={() => setActiveTab("setup")}
              className="cg-btn-primary"
              style={{ fontSize: 12.5, padding: "9px 18px", whiteSpace: "nowrap" }}
            >
              Configure Mandate
              <ArrowRight size={14} />
            </button>
          </div>
        </section>
      ) : (
        <section
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "20px 24px",
            border: "1px solid #D4D4D4",
            borderRadius: 4,
            background: "#FFFFFF"
          }}
        >
          <div>
            <div style={{ fontSize: 13, fontWeight: 700, color: "#111111" }}>Institutional Access</div>
            <div style={{ fontSize: 12, color: "#666666", marginTop: 3 }}>
              Sign in to save your mandate, access audit history, and enable compliance reporting.
            </div>
          </div>
          <button
            id="landing-signin-cta"
            onClick={() => setIsAuthModalOpen(true)}
            className="cg-btn-primary"
            style={{ whiteSpace: "nowrap", fontSize: 12 }}
          >
            <Lock style={{ width: 12, height: 12 }} />
            Sign In
          </button>
        </section>
      )}
    </div>
  );
}
