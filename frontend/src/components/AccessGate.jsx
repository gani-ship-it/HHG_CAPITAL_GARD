import React, { useState, useEffect } from "react";
import { usePortfolio } from "../state/portfolioStore";
import * as api from "../api";
import {
  Shield,
  Building2,
  Lock,
  ArrowRight,
  ArrowLeft,
  UserCheck,
  CheckCircle2,
  AlertTriangle,
  HelpCircle,
  Briefcase,
  Layers,
  Sparkles
} from "lucide-react";

export default function AccessGate() {
  const { setCurrentUser, setPortfolio, setIsInitialized } = usePortfolio();

  // Mode: "signin" | "signup" | "guest_info"
  const [activeMode, setActiveMode] = useState("signin");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Demo personas for instant 1-click login
  const [personas, setPersonas] = useState([]);

  // Sign In Form State
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");

  // Sign Up Multi-Step Questionnaire State
  const [onboardingStep, setOnboardingStep] = useState(1);
  const [signupData, setSignupData] = useState({
    // Step 1: Identity & Credentials
    full_name: "",
    email: "",
    password: "",
    role: "Chief Risk Officer",
    
    // Step 2: Institution & Objective
    org_name: "",
    org_type: "Central / Commercial Bank",
    purpose: "Basel III Regulatory Capital Defense & Pillar 1 VaR Headroom",

    // Step 3: Mandate & Risk Architecture
    initial_capital: 1000000000.0, // ₹1,000 Cr
    currency: "INR",
    investment_horizon: "3-5 Years",
    risk_tolerance: "Balanced",
    regulatory_framework: "Basel III & RBI Guidelines",
    primary_assets: ["GovBonds", "CorpBonds", "Equity", "Gold", "Cash"]
  });

  useEffect(() => {
    let mounted = true;
    api.fetchPersonas()
      .then((data) => {
        if (mounted && data?.personas) {
          setPersonas(data.personas);
        }
      })
      .catch((err) => console.warn("Failed to load personas:", err));
    return () => { mounted = false; };
  }, []);

  // Quick 1-click persona sign-in
  const handlePersonaSelect = async (persona) => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.loginUser({
        email: persona.email,
        password: "password123"
      });
      if (res.user) {
        const userObj = { ...res.user, isGuest: false };
        localStorage.setItem("capital_guard_user", JSON.stringify(userObj));
        setCurrentUser(userObj);
        if (res.portfolio) {
          setPortfolio(res.portfolio);
          setIsInitialized(true);
        }
      }
    } catch (err) {
      setError(err.message || "Failed to log in with persona");
    } finally {
      setLoading(false);
    }
  };

  // Regular Sign In
  const handleSignInSubmit = async (e) => {
    e.preventDefault();
    if (!loginEmail) {
      setError("Please provide your institutional email.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await api.loginUser({
        email: loginEmail,
        password: loginPassword || "password123"
      });
      if (res.user) {
        const userObj = { ...res.user, isGuest: false };
        localStorage.setItem("capital_guard_user", JSON.stringify(userObj));
        setCurrentUser(userObj);
        if (res.portfolio) {
          setPortfolio(res.portfolio);
          setIsInitialized(true);
        }
      }
    } catch (err) {
      setError(err.message || "Sign in failed. Check your credentials.");
    } finally {
      setLoading(false);
    }
  };

  // Sign Up Multi-Step Next
  const handleNextStep = (e) => {
    e?.preventDefault();
    if (onboardingStep === 1) {
      if (!signupData.full_name || !signupData.email) {
        setError("Please provide your name and institutional email.");
        return;
      }
    }
    if (onboardingStep === 2) {
      if (!signupData.org_name) {
        setError("Please specify your institutional or organization name.");
        return;
      }
    }
    setError(null);
    setOnboardingStep((prev) => prev + 1);
  };

  // Sign Up Multi-Step Registration Submit
  const handleSignUpSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await api.registerUser(signupData);
      if (res.user) {
        const userObj = { ...res.user, isGuest: false };
        localStorage.setItem("capital_guard_user", JSON.stringify(userObj));
        setCurrentUser(userObj);
        if (res.portfolio) {
          setPortfolio(res.portfolio);
          setIsInitialized(true);
        }
      }
    } catch (err) {
      setError(err.message || "Registration failed. Try again.");
    } finally {
      setLoading(false);
    }
  };

  // Enter Guest Mode
  const handleGuestMode = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.fetchGuestSession();
      const guestObj = { ...res.user, isGuest: true };
      localStorage.setItem("capital_guard_user", JSON.stringify(guestObj));
      setCurrentUser(guestObj);
      if (res.portfolio) {
        setPortfolio(res.portfolio);
        setIsInitialized(true);
      }
    } catch (err) {
      setError(err.message || "Failed to initialize guest sandbox");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        width: "100vw",
        height: "100vh",
        background: "#FFFFFF",
        color: "#111111",
        overflowY: "auto",
        overflowX: "hidden",
        WebkitOverflowScrolling: "touch",
        fontFamily: "var(--font-sans)",
        zIndex: 9999
      }}
    >
      <div
        style={{
          minHeight: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "flex-start",
          padding: "24px 16px 80px 16px"
        }}
      >
        {/* Top Identity Header */}
        <div style={{ textAlign: "center", marginBottom: 20, maxWidth: 640 }}>
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              padding: "4px 14px",
              background: "#F4F4F5",
              border: "1px solid #E4E4E7",
              borderRadius: 20,
              fontSize: 12,
              fontWeight: 600,
              letterSpacing: "0.04em",
              textTransform: "uppercase",
              marginBottom: 10
            }}
          >
            <Shield size={14} strokeWidth={2.2} />
            <span>Capital Guard Risk Engine</span>
            <span style={{ color: "#A1A1AA" }}>•</span>
            <span style={{ color: "#71717A" }}>Clarabel QP Institutional Access</span>
          </div>
          <h1
            style={{
              fontSize: 28,
              fontWeight: 800,
              letterSpacing: "-0.03em",
              lineHeight: 1.2,
              marginBottom: 6,
              color: "#111111"
            }}
          >
            Access Gate & Institutional Verification
          </h1>
          <p style={{ fontSize: 14, color: "#666666", lineHeight: 1.4 }}>
            Autonomous multi-asset portfolio risk defense & Basel III compliance.
            Choose your access tier or enter the live guest sandbox.
          </p>
        </div>

        {/* Main Form Container */}
        <div
          style={{
            width: "100%",
            maxWidth: 660,
            background: "#FFFFFF",
            border: "1px solid #111111",
            borderRadius: 6,
            boxShadow: "0 8px 30px rgba(0,0,0,0.06)",
            overflow: "hidden"
          }}
        >
          {/* Navigation Tabs */}
          <div
            style={{
              display: "flex",
              borderBottom: "1px solid #EAEAEA",
              background: "#FAFAFA"
            }}
          >
            <button
              type="button"
              onClick={() => { setActiveMode("signin"); setError(null); }}
              style={{
                flex: 1,
                padding: "13px 16px",
                border: "none",
                borderBottom: activeMode === "signin" ? "2px solid #111111" : "2px solid transparent",
                background: activeMode === "signin" ? "#FFFFFF" : "transparent",
                fontWeight: 700,
                fontSize: 14,
                color: activeMode === "signin" ? "#111111" : "#71717A",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
                transition: "all 0.15s ease"
              }}
            >
              <Lock size={15} />
              <span>Sign In (Existing Account)</span>
            </button>

            <button
              type="button"
              onClick={() => { setActiveMode("signup"); setOnboardingStep(1); setError(null); }}
              style={{
                flex: 1,
                padding: "13px 16px",
                border: "none",
                borderBottom: activeMode === "signup" ? "2px solid #111111" : "2px solid transparent",
                background: activeMode === "signup" ? "#FFFFFF" : "transparent",
                fontWeight: 700,
                fontSize: 14,
                color: activeMode === "signup" ? "#111111" : "#71717A",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
                transition: "all 0.15s ease"
              }}
            >
              <Building2 size={15} />
              <span>Sign Up (New Institution)</span>
            </button>

            <button
              type="button"
              onClick={() => { setActiveMode("guest"); setError(null); }}
              style={{
                flex: 1,
                padding: "13px 16px",
                border: "none",
                borderBottom: activeMode === "guest" ? "2px solid #111111" : "2px solid transparent",
                background: activeMode === "guest" ? "#FFFFFF" : "transparent",
                fontWeight: 700,
                fontSize: 14,
                color: activeMode === "guest" ? "#111111" : "#71717A",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
                transition: "all 0.15s ease"
              }}
            >
              <Sparkles size={15} />
              <span>Guest Sandbox</span>
            </button>
          </div>

          {/* Error Notification Banner */}
          {error && (
            <div
              style={{
                margin: "14px 20px 0",
                padding: "10px 14px",
                background: "rgba(211,47,47,0.06)",
                border: "1px solid rgba(211,47,47,0.3)",
                borderRadius: 4,
                display: "flex",
                alignItems: "center",
                gap: 10,
                color: "#D32F2F",
                fontSize: 13.5
              }}
            >
              <AlertTriangle size={17} style={{ flexShrink: 0 }} />
              <span>{error}</span>
            </div>
          )}

          {/* ============================================================
              TAB 1: SIGN IN (Fast & Direct — No extra questions)
             ============================================================ */}
          {activeMode === "signin" && (
            <div style={{ padding: "22px 26px" }}>
              <div style={{ marginBottom: 16 }}>
                <h2 style={{ fontSize: 19, fontWeight: 700, marginBottom: 3 }}>
                  Welcome Back
                </h2>
                <p style={{ fontSize: 13.5, color: "#666666" }}>
                  Sign in to resume your regulatory portfolio management and access your permanent audit trail.
                </p>
              </div>

              <form onSubmit={handleSignInSubmit}>
                <div style={{ marginBottom: 13 }}>
                  <label style={{ display: "block", fontSize: 12.5, fontWeight: 600, marginBottom: 5 }}>
                    Institutional Email
                  </label>
                  <input
                    type="email"
                    placeholder="e.g. cro@apexbank.com"
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    style={{
                      width: "100%",
                      padding: "9px 12px",
                      border: "1px solid #D4D4D4",
                      borderRadius: 4,
                      fontSize: 14,
                      fontFamily: "var(--font-sans)",
                      outline: "none"
                    }}
                    required
                  />
                </div>

                <div style={{ marginBottom: 16 }}>
                  <label style={{ display: "block", fontSize: 12.5, fontWeight: 600, marginBottom: 5 }}>
                    Password
                  </label>
                  <input
                    type="password"
                    placeholder="••••••••••••"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    style={{
                      width: "100%",
                      padding: "9px 12px",
                      border: "1px solid #D4D4D4",
                      borderRadius: 4,
                      fontSize: 14,
                      fontFamily: "var(--font-sans)",
                      outline: "none"
                    }}
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="cg-btn-primary"
                  style={{ width: "100%", justifyContent: "center", padding: "11px 18px", fontSize: 14.5 }}
                >
                  {loading ? "Authenticating..." : "Sign In to Institutional Dashboard"}
                  <ArrowRight size={16} />
                </button>
              </form>

              {/* Quick-Access Verified Demo Personas */}
              <div style={{ marginTop: 20, paddingTop: 16, borderTop: "1px solid #EAEAEA" }}>
                <div style={{ fontSize: 12, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", color: "#888888", marginBottom: 10 }}>
                  Or 1-Click Sign In as Verified Institutional Persona:
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {personas.map((p) => (
                    <div
                      key={p.id}
                      onClick={() => handlePersonaSelect(p)}
                      style={{
                        padding: "10px 14px",
                        border: "1px solid #EAEAEA",
                        borderRadius: 4,
                        background: "#FFFFFF",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        transition: "border-color 0.15s ease, background 0.15s ease"
                      }}
                      onMouseEnter={(e) => { e.currentTarget.style.borderColor = "#111111"; e.currentTarget.style.background = "#F9F9F9"; }}
                      onMouseLeave={(e) => { e.currentTarget.style.borderColor = "#EAEAEA"; e.currentTarget.style.background = "#FFFFFF"; }}
                    >
                      <div>
                        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 2 }}>
                          <span style={{ fontWeight: 700, fontSize: 13.5 }}>{p.name}</span>
                          <span style={{ padding: "2px 7px", background: "#111111", color: "#FFFFFF", borderRadius: 3, fontSize: 10.5, fontWeight: 600 }}>
                            {p.badge}
                          </span>
                        </div>
                        <div style={{ fontSize: 12, color: "#666666" }}>
                          {p.orgName} • {p.email}
                        </div>
                      </div>
                      <ArrowRight size={15} color="#888888" />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

        {/* ============================================================
            TAB 2: SIGN UP (Multi-Step Onboarding Questionnaire)
           ============================================================ */}
        {activeMode === "signup" && (
          <div style={{ padding: "28px 32px" }}>
            {/* Step Progress Bar */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24, borderBottom: "1px solid #EAEAEA", paddingBottom: 16 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span
                  style={{
                    width: 28,
                    height: 28,
                    borderRadius: "50%",
                    background: "#111111",
                    color: "#FFFFFF",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 13,
                    fontWeight: 700
                  }}
                >
                  {onboardingStep}
                </span>
                <div>
                  <div style={{ fontSize: 14.5, fontWeight: 700 }}>
                    {onboardingStep === 1 && "Step 1: Identity & Credentials"}
                    {onboardingStep === 2 && "Step 2: Institutional Affiliation & Purpose"}
                    {onboardingStep === 3 && "Step 3: Mandate Parameters & Risk Framework"}
                    {onboardingStep === 4 && "Step 4: Confirm & Initialize Account"}
                  </div>
                  <div style={{ fontSize: 12, color: "#888888" }}>
                    Stage {onboardingStep} of 4 • Data will be permanently archived in database
                  </div>
                </div>
              </div>

              <div style={{ display: "flex", gap: 4 }}>
                {[1, 2, 3, 4].map((s) => (
                  <div
                    key={s}
                    style={{
                      width: 24,
                      height: 4,
                      borderRadius: 2,
                      background: s <= onboardingStep ? "#111111" : "#EAEAEA"
                    }}
                  />
                ))}
              </div>
            </div>

            {/* Step 1: Identity & Credentials */}
            {onboardingStep === 1 && (
              <div>
                <p style={{ fontSize: 14, color: "#666666", marginBottom: 18 }}>
                  Tell us who you are. This information links your audit records and governance decisions.
                </p>

                <div style={{ marginBottom: 16 }}>
                  <label style={{ display: "block", fontSize: 13, fontWeight: 600, marginBottom: 6 }}>
                    Full Legal Name & Title
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Dr. Rajesh Sharma, Chief Investment Officer"
                    value={signupData.full_name}
                    onChange={(e) => setSignupData({ ...signupData, full_name: e.target.value })}
                    style={{
                      width: "100%",
                      padding: "11px 14px",
                      border: "1px solid #D4D4D4",
                      borderRadius: 4,
                      fontSize: 14.5,
                      fontFamily: "var(--font-sans)",
                      outline: "none"
                    }}
                  />
                </div>

                <div style={{ marginBottom: 16 }}>
                  <label style={{ display: "block", fontSize: 13, fontWeight: 600, marginBottom: 6 }}>
                    Institutional Corporate Email
                  </label>
                  <input
                    type="email"
                    placeholder="e.g. rajesh.sharma@statetreasury.gov"
                    value={signupData.email}
                    onChange={(e) => setSignupData({ ...signupData, email: e.target.value })}
                    style={{
                      width: "100%",
                      padding: "11px 14px",
                      border: "1px solid #D4D4D4",
                      borderRadius: 4,
                      fontSize: 14.5,
                      fontFamily: "var(--font-sans)",
                      outline: "none"
                    }}
                  />
                </div>

                <div style={{ marginBottom: 16 }}>
                  <label style={{ display: "block", fontSize: 13, fontWeight: 600, marginBottom: 6 }}>
                    Password
                  </label>
                  <input
                    type="password"
                    placeholder="Create a strong institutional password"
                    value={signupData.password}
                    onChange={(e) => setSignupData({ ...signupData, password: e.target.value })}
                    style={{
                      width: "100%",
                      padding: "11px 14px",
                      border: "1px solid #D4D4D4",
                      borderRadius: 4,
                      fontSize: 14.5,
                      fontFamily: "var(--font-sans)",
                      outline: "none"
                    }}
                  />
                </div>

                <div style={{ marginBottom: 22 }}>
                  <label style={{ display: "block", fontSize: 13, fontWeight: 600, marginBottom: 6 }}>
                    Governance Role in Organization
                  </label>
                  <select
                    value={signupData.role}
                    onChange={(e) => setSignupData({ ...signupData, role: e.target.value })}
                    style={{
                      width: "100%",
                      padding: "11px 14px",
                      border: "1px solid #D4D4D4",
                      borderRadius: 4,
                      fontSize: 14.5,
                      fontFamily: "var(--font-sans)",
                      background: "#FFFFFF",
                      outline: "none"
                    }}
                  >
                    <option value="Chief Risk Officer">Chief Risk Officer (CRO) — Capital & VaR Oversight</option>
                    <option value="Portfolio Manager">Senior Portfolio Manager — Tactical Rebalancing</option>
                    <option value="Compliance Auditor">Regulatory Compliance Auditor — Pillar 1 Supervision</option>
                    <option value="Chief Investment Officer">Chief Investment Officer (CIO) — Strategic Mandate</option>
                    <option value="Quantitative Risk Analyst">Quantitative Risk Analyst — Stress Testing & Conic QP</option>
                  </select>
                </div>

                <button
                  type="button"
                  onClick={handleNextStep}
                  className="cg-btn-primary"
                  style={{ width: "100%", justifyContent: "center", padding: "13px 20px", fontSize: 15 }}
                >
                  Continue to Institutional Affiliation
                  <ArrowRight size={16} />
                </button>
              </div>
            )}

            {/* Step 2: Institution & Objective */}
            {onboardingStep === 2 && (
              <div>
                <p style={{ fontSize: 14, color: "#666666", marginBottom: 18 }}>
                  Specify the financial institution you represent and what regulatory mandate you are executing.
                </p>

                <div style={{ marginBottom: 16 }}>
                  <label style={{ display: "block", fontSize: 13, fontWeight: 600, marginBottom: 6 }}>
                    Institution / Organization Name
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Reserve Treasury Bank of India / Apex Sovereign Fund"
                    value={signupData.org_name}
                    onChange={(e) => setSignupData({ ...signupData, org_name: e.target.value })}
                    style={{
                      width: "100%",
                      padding: "11px 14px",
                      border: "1px solid #D4D4D4",
                      borderRadius: 4,
                      fontSize: 14.5,
                      fontFamily: "var(--font-sans)",
                      outline: "none"
                    }}
                  />
                </div>

                <div style={{ marginBottom: 16 }}>
                  <label style={{ display: "block", fontSize: 13, fontWeight: 600, marginBottom: 6 }}>
                    Institution Classification
                  </label>
                  <select
                    value={signupData.org_type}
                    onChange={(e) => setSignupData({ ...signupData, org_type: e.target.value })}
                    style={{
                      width: "100%",
                      padding: "11px 14px",
                      border: "1px solid #D4D4D4",
                      borderRadius: 4,
                      fontSize: 14.5,
                      fontFamily: "var(--font-sans)",
                      background: "#FFFFFF",
                      outline: "none"
                    }}
                  >
                    <option value="Central / Commercial Bank">Central / Commercial Tier-1 Bank</option>
                    <option value="Sovereign Wealth / Treasury">Sovereign Wealth Fund / National Treasury</option>
                    <option value="Pension Fund">Public / Corporate Pension Fund</option>
                    <option value="Insurance / Reinsurance">Insurance / Reinsurance Underwriter</option>
                    <option value="Asset Management Institution">Institutional Asset Management Firm</option>
                  </select>
                </div>

                <div style={{ marginBottom: 22 }}>
                  <label style={{ display: "block", fontSize: 13, fontWeight: 600, marginBottom: 6 }}>
                    What brings you to Capital Guard? (Primary Purpose)
                  </label>
                  <select
                    value={signupData.purpose}
                    onChange={(e) => setSignupData({ ...signupData, purpose: e.target.value })}
                    style={{
                      width: "100%",
                      padding: "11px 14px",
                      border: "1px solid #D4D4D4",
                      borderRadius: 4,
                      fontSize: 14.5,
                      fontFamily: "var(--font-sans)",
                      background: "#FFFFFF",
                      outline: "none"
                    }}
                  >
                    <option value="Basel III Regulatory Capital Defense & Pillar 1 VaR Headroom">
                      Basel III Regulatory Capital Defense & Pillar 1 VaR Headroom
                    </option>
                    <option value="Convex Quadratic Programming (Clarabel QP) Portfolio De-risking">
                      Convex Quadratic Programming (Clarabel QP) Portfolio De-risking
                    </option>
                    <option value="Cost-Aware Rebalancing Evaluation with Friction Modeling">
                      Cost-Aware Rebalancing Evaluation with Friction Modeling
                    </option>
                    <option value="Macro Stress Testing (Yield Spikes, Equity Crashes, Stagflation)">
                      Macro Stress Testing (Yield Spikes, Equity Crashes, Stagflation)
                    </option>
                    <option value="Immutable Audit Ledger Archival & Solvency Supervision">
                      Immutable Audit Ledger Archival & Solvency Supervision
                    </option>
                  </select>
                </div>

                <div style={{ display: "flex", gap: 12 }}>
                  <button
                    type="button"
                    onClick={() => setOnboardingStep(1)}
                    className="cg-btn-secondary"
                    style={{ flex: 1, justifyContent: "center" }}
                  >
                    <ArrowLeft size={16} />
                    Back
                  </button>
                  <button
                    type="button"
                    onClick={handleNextStep}
                    className="cg-btn-primary"
                    style={{ flex: 2, justifyContent: "center" }}
                  >
                    Continue to Mandate Setup
                    <ArrowRight size={16} />
                  </button>
                </div>
              </div>
            )}

            {/* Step 3: Mandate Parameters & Risk Framework */}
            {onboardingStep === 3 && (
              <div>
                <p style={{ fontSize: 14, color: "#666666", marginBottom: 18 }}>
                  Establish initial capital parameters and supervisory rules.
                </p>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 16 }}>
                  <div>
                    <label style={{ display: "block", fontSize: 13, fontWeight: 600, marginBottom: 6 }}>
                      Total Capital (AUM)
                    </label>
                    <input
                      type="number"
                      step="10000000"
                      value={signupData.initial_capital}
                      onChange={(e) => setSignupData({ ...signupData, initial_capital: parseFloat(e.target.value) || 0 })}
                      style={{
                        width: "100%",
                        padding: "11px 14px",
                        border: "1px solid #D4D4D4",
                        borderRadius: 4,
                        fontSize: 14.5,
                        fontFamily: "var(--font-mono)",
                        outline: "none"
                      }}
                    />
                    <span style={{ fontSize: 11.5, color: "#888888", marginTop: 4, display: "block" }}>
                      ₹{(signupData.initial_capital / 10000000).toLocaleString()} Crores
                    </span>
                  </div>

                  <div>
                    <label style={{ display: "block", fontSize: 13, fontWeight: 600, marginBottom: 6 }}>
                      Base Currency
                    </label>
                    <select
                      value={signupData.currency}
                      onChange={(e) => setSignupData({ ...signupData, currency: e.target.value })}
                      style={{
                        width: "100%",
                        padding: "11px 14px",
                        border: "1px solid #D4D4D4",
                        borderRadius: 4,
                        fontSize: 14.5,
                        fontFamily: "var(--font-sans)",
                        background: "#FFFFFF",
                        outline: "none"
                      }}
                    >
                      <option value="INR">INR (Indian Rupee - ₹)</option>
                      <option value="USD">USD (US Dollar - $)</option>
                      <option value="EUR">EUR (Euro - €)</option>
                      <option value="GBP">GBP (British Pound - £)</option>
                    </select>
                  </div>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 16 }}>
                  <div>
                    <label style={{ display: "block", fontSize: 13, fontWeight: 600, marginBottom: 6 }}>
                      Investment Horizon
                    </label>
                    <select
                      value={signupData.investment_horizon}
                      onChange={(e) => setSignupData({ ...signupData, investment_horizon: e.target.value })}
                      style={{
                        width: "100%",
                        padding: "11px 14px",
                        border: "1px solid #D4D4D4",
                        borderRadius: 4,
                        fontSize: 14.5,
                        fontFamily: "var(--font-sans)",
                        background: "#FFFFFF",
                        outline: "none"
                      }}
                    >
                      <option value="1-3 Years">1-3 Years (Short-Term Liquidity)</option>
                      <option value="3-5 Years">3-5 Years (Medium-Term Capital)</option>
                      <option value="5-10 Years">5-10 Years (Strategic Long-Term)</option>
                    </select>
                  </div>

                  <div>
                    <label style={{ display: "block", fontSize: 13, fontWeight: 600, marginBottom: 6 }}>
                      Risk Tolerance
                    </label>
                    <select
                      value={signupData.risk_tolerance}
                      onChange={(e) => setSignupData({ ...signupData, risk_tolerance: e.target.value })}
                      style={{
                        width: "100%",
                        padding: "11px 14px",
                        border: "1px solid #D4D4D4",
                        borderRadius: 4,
                        fontSize: 14.5,
                        fontFamily: "var(--font-sans)",
                        background: "#FFFFFF",
                        outline: "none"
                      }}
                    >
                      <option value="Conservative">Conservative (Capital Preservation)</option>
                      <option value="Balanced">Balanced (Risk-Adjusted Return)</option>
                      <option value="Growth">Growth (Expanded Volatility Buffer)</option>
                    </select>
                  </div>
                </div>

                <div style={{ marginBottom: 22 }}>
                  <label style={{ display: "block", fontSize: 13, fontWeight: 600, marginBottom: 6 }}>
                    Supervisory & Regulatory Standard
                  </label>
                  <select
                    value={signupData.regulatory_framework}
                    onChange={(e) => setSignupData({ ...signupData, regulatory_framework: e.target.value })}
                    style={{
                      width: "100%",
                      padding: "11px 14px",
                      border: "1px solid #D4D4D4",
                      borderRadius: 4,
                      fontSize: 14.5,
                      fontFamily: "var(--font-sans)",
                      background: "#FFFFFF",
                      outline: "none"
                    }}
                  >
                    <option value="Basel III & RBI Guidelines">Basel III & Reserve Bank of India Master Directions</option>
                    <option value="Basel III Global Standard">Basel Committee on Banking Supervision (BCBS 128)</option>
                    <option value="Solvency II Framework">European Insurance and Occupational Pensions (Solvency II)</option>
                  </select>
                </div>

                <div style={{ display: "flex", gap: 12 }}>
                  <button
                    type="button"
                    onClick={() => setOnboardingStep(2)}
                    className="cg-btn-secondary"
                    style={{ flex: 1, justifyContent: "center" }}
                  >
                    <ArrowLeft size={16} />
                    Back
                  </button>
                  <button
                    type="button"
                    onClick={handleNextStep}
                    className="cg-btn-primary"
                    style={{ flex: 2, justifyContent: "center" }}
                  >
                    Review & Verify
                    <ArrowRight size={16} />
                  </button>
                </div>
              </div>
            )}

            {/* Step 4: Confirm & Initialize Account */}
            {onboardingStep === 4 && (
              <div>
                <p style={{ fontSize: 14, color: "#666666", marginBottom: 18 }}>
                  Verify your institutional onboarding parameters before creating your permanent profile in the database.
                </p>

                <div
                  style={{
                    background: "#FAFAFA",
                    border: "1px solid #EAEAEA",
                    borderRadius: 4,
                    padding: "16px 20px",
                    marginBottom: 20
                  }}
                >
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px 16px", fontSize: 13.5 }}>
                    <div>
                      <span style={{ color: "#888888", display: "block" }}>Full Name:</span>
                      <strong>{signupData.full_name}</strong>
                    </div>
                    <div>
                      <span style={{ color: "#888888", display: "block" }}>Role:</span>
                      <strong>{signupData.role}</strong>
                    </div>
                    <div>
                      <span style={{ color: "#888888", display: "block" }}>Institution:</span>
                      <strong>{signupData.org_name}</strong>
                    </div>
                    <div>
                      <span style={{ color: "#888888", display: "block" }}>Classification:</span>
                      <strong>{signupData.org_type}</strong>
                    </div>
                    <div>
                      <span style={{ color: "#888888", display: "block" }}>Total Capital:</span>
                      <strong style={{ fontFamily: "var(--font-mono)" }}>
                        ₹{(signupData.initial_capital / 10000000).toLocaleString()} Cr ({signupData.currency})
                      </strong>
                    </div>
                    <div>
                      <span style={{ color: "#888888", display: "block" }}>Framework:</span>
                      <strong>{signupData.regulatory_framework}</strong>
                    </div>
                    <div style={{ gridColumn: "span 2" }}>
                      <span style={{ color: "#888888", display: "block" }}>Mandate Purpose:</span>
                      <strong>{signupData.purpose}</strong>
                    </div>
                  </div>
                </div>

                <div
                  style={{
                    padding: "12px 16px",
                    background: "#F4F4F5",
                    border: "1px solid #E4E4E7",
                    borderRadius: 4,
                    fontSize: 13,
                    color: "#333333",
                    marginBottom: 20,
                    display: "flex",
                    alignItems: "center",
                    gap: 10
                  }}
                >
                  <CheckCircle2 size={18} color="#111111" style={{ flexShrink: 0 }} />
                  <span>
                    <strong>Permanent Database Persistence Active:</strong> All portfolio allocations, stress tests, and rebalancing decisions will be permanently logged to the PostgreSQL audit ledger.
                  </span>
                </div>

                <div style={{ display: "flex", gap: 12 }}>
                  <button
                    type="button"
                    onClick={() => setOnboardingStep(3)}
                    className="cg-btn-secondary"
                    style={{ flex: 1, justifyContent: "center" }}
                  >
                    <ArrowLeft size={16} />
                    Back
                  </button>
                  <button
                    type="button"
                    onClick={handleSignUpSubmit}
                    disabled={loading}
                    className="cg-btn-primary"
                    style={{ flex: 2, justifyContent: "center", padding: "13px 20px", fontSize: 15 }}
                  >
                    {loading ? "Registering & Provisioning..." : "Create Account & Enter Engine"}
                    <ArrowRight size={16} />
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ============================================================
            TAB 3: GUEST SANDBOX (No Login, Sample Data, In-Memory Only)
           ============================================================ */}
        {activeMode === "guest" && (
          <div style={{ padding: "32px 32px" }}>
            <div style={{ textAlign: "center", marginBottom: 24 }}>
              <div
                style={{
                  width: 56,
                  height: 56,
                  borderRadius: "50%",
                  background: "#F4F4F5",
                  border: "1px solid #E4E4E7",
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  marginBottom: 14
                }}
              >
                <Sparkles size={28} color="#111111" />
              </div>
              <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 8 }}>
                Guest Sandbox Mode
              </h2>
              <p style={{ fontSize: 14.5, color: "#666666", maxWidth: 520, margin: "0 auto" }}>
                Instant access to test the Clarabel QP optimizer and real-time FRED macro telemetry using pre-configured sample institutional inputs.
              </p>
            </div>

            {/* Crucial Notice regarding user's requirement */}
            <div
              style={{
                background: "#FAFAFA",
                border: "1px solid #111111",
                borderRadius: 6,
                padding: "20px",
                marginBottom: 24
              }}
            >
              <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
                <AlertTriangle size={20} color="#111111" style={{ flexShrink: 0, marginTop: 2 }} />
                <div>
                  <div style={{ fontSize: 14.5, fontWeight: 700, marginBottom: 4 }}>
                    Ephemeral Session Notice
                  </div>
                  <div style={{ fontSize: 13.5, color: "#555555", lineHeight: 1.5 }}>
                    In <strong>Guest Mode</strong>:
                    <ul style={{ paddingLeft: 18, marginTop: 6 }}>
                      <li>Pre-populated sample portfolio (₹100 Cr capital across GovBonds, CorpBonds, Equity, Gold, Cash).</li>
                      <li>Live Clarabel QP conic solver and FRED yield curves are 100% operational.</li>
                      <li><strong>Audit History will NOT be committed to the database.</strong> All decision history records remain in temporary memory only for this session.</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={handleGuestMode}
              disabled={loading}
              className="cg-btn-primary"
              style={{
                width: "100%",
                justifyContent: "center",
                padding: "14px 24px",
                fontSize: 15.5
              }}
            >
              {loading ? "Starting Guest Sandbox..." : "Launch Guest Mode (Instant Access)"}
              <ArrowRight size={18} />
            </button>
          </div>
        )}
      </div>

        {/* Footer Branding */}
        <div style={{ marginTop: 24, paddingBottom: 24, fontSize: 12, color: "#999999", letterSpacing: "0.04em" }}>
          CAPITAL GUARD RISK ENGINE • BASEL III REGULATORY COMPLIANCE SYSTEM
        </div>
      </div>
    </div>
  );
}
