import React, { useState } from "react";
import {
  Shield,
  Lock,
  Mail,
  User,
  Building,
  CheckCircle2,
  AlertCircle,
  X,
  Zap,
  ArrowRight
} from "lucide-react";
import { signInWithEmail, signUpWithEmail } from "../supabase";

const DEMO_PERSONAS = [
  {
    id: "cro",
    title: "Chief Risk Officer",
    name: "Dr. Elena Vance, CRO",
    email: "cro@apexbank.com",
    orgName: "Apex Reserve Bank",
    role: "Chief Risk Officer",
    badge: "Risk Oversight"
  },
  {
    id: "pm",
    title: "Senior Portfolio Manager",
    name: "Marcus Sterling, CFA",
    email: "pm@treasury.gov",
    orgName: "State Reserve Treasury",
    role: "Portfolio Manager",
    badge: "Asset Allocation"
  },
  {
    id: "compliance",
    title: "Compliance Auditor",
    name: "Sarah Chen, CPA",
    email: "auditor@finwatch.org",
    orgName: "Financial Regulatory Oversight",
    role: "Compliance Auditor",
    badge: "Audit & Policy"
  }
];

export default function AuthModal({ isOpen, onClose, onAuthSuccess, currentUser }) {
  const [authMode, setAuthMode] = useState("signin"); // "signin" | "signup"
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [orgName, setOrgName] = useState("Apex Reserve Bank");
  const [role, setRole] = useState("Chief Risk Officer");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  if (!isOpen) return null;

  function handleDemoLogin(persona) {
    setLoading(true);
    setError(null);
    setTimeout(() => {
      const demoUser = {
        id: `demo-${persona.id}`,
        email: persona.email,
        user_metadata: {
          full_name: persona.name,
          org_name: persona.orgName,
          role: persona.role
        },
        isDemo: true
      };
      localStorage.setItem("capital_guard_user", JSON.stringify(demoUser));
      setLoading(false);
      onAuthSuccess(demoUser);
      onClose();
    }, 400);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccessMessage(null);

    try {
      if (authMode === "signin") {
        const { user } = await signInWithEmail(email, password);
        localStorage.setItem("capital_guard_user", JSON.stringify(user));
        onAuthSuccess(user);
        onClose();
      } else {
        const { user } = await signUpWithEmail(email, password, {
          fullName,
          orgName,
          role
        });
        setSuccessMessage("Account created successfully! Session initialized.");
        localStorage.setItem("capital_guard_user", JSON.stringify(user));
        setTimeout(() => {
          onAuthSuccess(user);
          onClose();
        }, 1200);
      }
    } catch (err) {
      console.error("Auth error:", err);
      setError(err.message || "Authentication failed. Please verify credentials.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "rgba(0, 0, 0, 0.75)",
        backdropFilter: "blur(4px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1000,
        padding: "1rem"
      }}
      onClick={e => {
        if (e.target === e.currentTarget && onClose) onClose();
      }}
    >
      <div
        className="animate-fade-in"
        style={{
          background: "#FFFFFF",
          borderRadius: "8px",
          width: "100%",
          maxWidth: "520px",
          boxShadow: "0 20px 40px rgba(0, 0, 0, 0.3)",
          border: "1px solid #111111",
          overflow: "hidden"
        }}
      >
                <div
          style={{
            background: "#111111",
            color: "#FFFFFF",
            padding: "1.25rem 1.75rem",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center"
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
            <div
              style={{
                width: "28px",
                height: "28px",
                background: "#FFFFFF",
                color: "#111111",
                fontWeight: 700,
                fontSize: "13px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                borderRadius: "3px"
              }}
            >
              CG
            </div>
            <div>
              <h2 style={{ fontSize: "15px", fontWeight: 600, letterSpacing: "-0.01em" }}>
                Institutional Access Portal
              </h2>
              <p style={{ fontSize: "11px", color: "#A0A0A0" }}>
                Supabase Identity & Role-Based Authorization
              </p>
            </div>
          </div>
          {onClose && (
            <button
              onClick={onClose}
              style={{
                background: "transparent",
                border: "none",
                color: "#A0A0A0",
                cursor: "pointer",
                padding: "4px"
              }}
            >
              <X size={18} />
            </button>
          )}
        </div>

        <div style={{ padding: "1.5rem 1.75rem", maxHeight: "85vh", overflowY: "auto" }}>
                    <div style={{ marginBottom: "1.5rem" }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: "0.6rem"
              }}
            >
              <span
                style={{
                  fontSize: "11px",
                  fontWeight: 700,
                  textTransform: "uppercase",
                  letterSpacing: "0.06em",
                  color: "#666666",
                  display: "flex",
                  alignItems: "center",
                  gap: "0.35rem"
                }}
              >
                <Zap size={13} style={{ color: "#111111" }} /> Quick Demo Personas (1-Click Judge Access)
              </span>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
              {DEMO_PERSONAS.map(p => (
                <button
                  key={p.id}
                  onClick={() => handleDemoLogin(p)}
                  disabled={loading}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "0.65rem 0.9rem",
                    border: "1px solid #E0E0E0",
                    borderRadius: "4px",
                    background: "#FAFAFA",
                    cursor: "pointer",
                    textAlign: "left",
                    transition: "all 0.15s ease"
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.borderColor = "#111111";
                    e.currentTarget.style.background = "#F0F0F0";
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.borderColor = "#E0E0E0";
                    e.currentTarget.style.background = "#FAFAFA";
                  }}
                >
                  <div>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                      <span style={{ fontSize: "13px", fontWeight: 600, color: "#111111" }}>
                        {p.name}
                      </span>
                      <span
                        style={{
                          fontSize: "10px",
                          background: "#E5E5E5",
                          padding: "1px 6px",
                          borderRadius: "3px",
                          fontWeight: 500
                        }}
                      >
                        {p.badge}
                      </span>
                    </div>
                    <div style={{ fontSize: "11px", color: "#666666" }}>
                      {p.orgName} · {p.email}
                    </div>
                  </div>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "0.25rem",
                      fontSize: "11px",
                      fontWeight: 600,
                      color: "#111111"
                    }}
                  >
                    Enter <ArrowRight size={12} />
                  </div>
                </button>
              ))}
            </div>
          </div>

                    <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.75rem",
              margin: "1.25rem 0"
            }}
          >
            <div style={{ flex: 1, height: "1px", background: "#E5E5E5" }} />
            <span style={{ fontSize: "11px", color: "#888888", textTransform: "uppercase" }}>
              or custom account
            </span>
            <div style={{ flex: 1, height: "1px", background: "#E5E5E5" }} />
          </div>

                    <div
            style={{
              display: "flex",
              border: "1px solid #E0E0E0",
              borderRadius: "4px",
              padding: "2px",
              background: "#F5F5F5",
              marginBottom: "1.25rem"
            }}
          >
            <button
              type="button"
              onClick={() => {
                setAuthMode("signin");
                setError(null);
              }}
              style={{
                flex: 1,
                padding: "0.5rem",
                fontSize: "12px",
                fontWeight: authMode === "signin" ? 600 : 500,
                background: authMode === "signin" ? "#FFFFFF" : "transparent",
                color: authMode === "signin" ? "#111111" : "#666666",
                border: "none",
                borderRadius: "3px",
                cursor: "pointer",
                boxShadow: authMode === "signin" ? "0 1px 3px rgba(0,0,0,0.08)" : "none"
              }}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => {
                setAuthMode("signup");
                setError(null);
              }}
              style={{
                flex: 1,
                padding: "0.5rem",
                fontSize: "12px",
                fontWeight: authMode === "signup" ? 600 : 500,
                background: authMode === "signup" ? "#FFFFFF" : "transparent",
                color: authMode === "signup" ? "#111111" : "#666666",
                border: "none",
                borderRadius: "3px",
                cursor: "pointer",
                boxShadow: authMode === "signup" ? "0 1px 3px rgba(0,0,0,0.08)" : "none"
              }}
            >
              Create Account
            </button>
          </div>

                    {error && (
            <div
              style={{
                background: "#FEECEB",
                color: "#D32F2F",
                border: "1px solid #F5C6CB",
                padding: "0.65rem 0.85rem",
                borderRadius: "4px",
                fontSize: "12px",
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
                marginBottom: "1rem"
              }}
            >
              <AlertCircle size={15} />
              <span>{error}</span>
            </div>
          )}

                    {successMessage && (
            <div
              style={{
                background: "#F4FBF7",
                color: "#1B5E20",
                border: "1px solid #C8E6C9",
                padding: "0.65rem 0.85rem",
                borderRadius: "4px",
                fontSize: "12px",
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
                marginBottom: "1rem"
              }}
            >
              <CheckCircle2 size={15} />
              <span>{successMessage}</span>
            </div>
          )}

                    <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "0.85rem" }}>
            {authMode === "signup" && (
              <>
                <div>
                  <label
                    style={{
                      display: "block",
                      fontSize: "11px",
                      fontWeight: 600,
                      color: "#444444",
                      marginBottom: "0.25rem",
                      textTransform: "uppercase"
                    }}
                  >
                    Full Name & Title
                  </label>
                  <div style={{ position: "relative" }}>
                    <input
                      type="text"
                      required
                      placeholder="e.g. John Doe, CFA"
                      value={fullName}
                      onChange={e => setFullName(e.target.value)}
                      style={{
                        width: "100%",
                        padding: "0.55rem 0.75rem 0.55rem 2.2rem",
                        fontSize: "13px",
                        border: "1px solid #D0D0D0",
                        borderRadius: "4px"
                      }}
                    />
                    <User
                      size={14}
                      style={{ position: "absolute", left: "0.75rem", top: "50%", transform: "translateY(-50%)", color: "#888888" }}
                    />
                  </div>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
                  <div>
                    <label
                      style={{
                        display: "block",
                        fontSize: "11px",
                        fontWeight: 600,
                        color: "#444444",
                        marginBottom: "0.25rem",
                        textTransform: "uppercase"
                      }}
                    >
                      Organization
                    </label>
                    <div style={{ position: "relative" }}>
                      <input
                        type="text"
                        required
                        placeholder="Apex Bank"
                        value={orgName}
                        onChange={e => setOrgName(e.target.value)}
                        style={{
                          width: "100%",
                          padding: "0.55rem 0.75rem 0.55rem 2.2rem",
                          fontSize: "13px",
                          border: "1px solid #D0D0D0",
                          borderRadius: "4px"
                        }}
                      />
                      <Building
                        size={14}
                        style={{ position: "absolute", left: "0.75rem", top: "50%", transform: "translateY(-50%)", color: "#888888" }}
                      />
                    </div>
                  </div>

                  <div>
                    <label
                      style={{
                        display: "block",
                        fontSize: "11px",
                        fontWeight: 600,
                        color: "#444444",
                        marginBottom: "0.25rem",
                        textTransform: "uppercase"
                      }}
                    >
                      Role
                    </label>
                    <select
                      value={role}
                      onChange={e => setRole(e.target.value)}
                      style={{
                        width: "100%",
                        padding: "0.55rem 0.75rem",
                        fontSize: "13px",
                        border: "1px solid #D0D0D0",
                        borderRadius: "4px",
                        background: "#FFFFFF"
                      }}
                    >
                      <option value="Chief Risk Officer">Chief Risk Officer</option>
                      <option value="Portfolio Manager">Portfolio Manager</option>
                      <option value="Treasury Head">Treasury Head</option>
                      <option value="Compliance Auditor">Compliance Auditor</option>
                    </select>
                  </div>
                </div>
              </>
            )}

            <div>
              <label
                style={{
                  display: "block",
                  fontSize: "11px",
                  fontWeight: 600,
                  color: "#444444",
                  marginBottom: "0.25rem",
                  textTransform: "uppercase"
                }}
              >
                Institutional Email
              </label>
              <div style={{ position: "relative" }}>
                <input
                  type="email"
                  required
                  placeholder="officer@institution.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "0.55rem 0.75rem 0.55rem 2.2rem",
                    fontSize: "13px",
                    border: "1px solid #D0D0D0",
                    borderRadius: "4px"
                  }}
                />
                <Mail
                  size={14}
                  style={{ position: "absolute", left: "0.75rem", top: "50%", transform: "translateY(-50%)", color: "#888888" }}
                />
              </div>
            </div>

            <div>
              <label
                style={{
                  display: "block",
                  fontSize: "11px",
                  fontWeight: 600,
                  color: "#444444",
                  marginBottom: "0.25rem",
                  textTransform: "uppercase"
                }}
              >
                Password
              </label>
              <div style={{ position: "relative" }}>
                <input
                  type="password"
                  required
                  placeholder="••••••••••••"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "0.55rem 0.75rem 0.55rem 2.2rem",
                    fontSize: "13px",
                    border: "1px solid #D0D0D0",
                    borderRadius: "4px"
                  }}
                />
                <Lock
                  size={14}
                  style={{ position: "absolute", left: "0.75rem", top: "50%", transform: "translateY(-50%)", color: "#888888" }}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              style={{
                marginTop: "0.5rem",
                padding: "0.75rem",
                background: "#111111",
                color: "#FFFFFF",
                fontWeight: 600,
                fontSize: "13px",
                border: "none",
                borderRadius: "4px",
                cursor: loading ? "not-allowed" : "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "0.5rem",
                transition: "background 0.15s ease"
              }}
            >
              {loading ? (
                "Authenticating with Supabase..."
              ) : authMode === "signin" ? (
                <>
                  <Lock size={14} /> Sign In to Capital Guard
                </>
              ) : (
                <>
                  <Shield size={14} /> Register Institutional Account
                </>
              )}
            </button>
          </form>

                    <div
            style={{
              marginTop: "1.25rem",
              paddingTop: "0.75rem",
              borderTop: "1px solid #F0F0F0",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              fontSize: "11px",
              color: "#888888"
            }}
          >
            <span style={{ display: "flex", alignItems: "center", gap: "0.35rem" }}>
              <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#22C55E", display: "inline-block" }} />
              Supabase Auth (PostgreSQL RLS)
            </span>
            <span>TLS 1.3 · 256-bit Encrypted</span>
          </div>
        </div>
      </div>
    </div>
  );
}
