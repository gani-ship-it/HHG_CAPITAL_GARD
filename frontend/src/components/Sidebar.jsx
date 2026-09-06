import React from "react";
import { usePortfolio } from "../state/portfolioStore";
import {
  Shield,
  Sliders,
  LayoutDashboard,
  Activity,
  GitCompare,
  TrendingDown,
  History,
  Home,
  LogIn,
  LogOut,
  Sparkles,
  UserCircle
} from "lucide-react";

export default function Sidebar() {
  const {
    activeTab,
    setActiveTab,
    riskStatus,
    isInitialized,
    currentUser,
    setCurrentUser,
    setIsAuthModalOpen,
    setIsCopilotOpen
  } = usePortfolio();

  const navItems = [
    {
      id: "landing",
      label: "Portal Home",
      icon: Home,
      requiresInit: false
    },
    {
      id: "setup",
      label: "Mandate Setup",
      icon: Sliders,
      requiresInit: false
    },
    {
      id: "overview",
      label: "Portfolio Overview",
      icon: LayoutDashboard,
      requiresInit: true
    },
    {
      id: "monitoring",
      label: "Risk Monitoring",
      icon: Activity,
      requiresInit: true,
      badge: riskStatus === "BREACH" ? "BREACH" : "LIVE",
      isBreach: riskStatus === "BREACH"
    },
    {
      id: "rebalance",
      label: "Rebalance Engine",
      icon: GitCompare,
      requiresInit: true,
      badge: riskStatus === "BREACH" ? "ACTION" : null,
      isBreach: true
    },
    {
      id: "simulator",
      label: "Stress Simulator",
      icon: TrendingDown,
      requiresInit: true
    },
    {
      id: "history",
      label: "Audit History",
      icon: History,
      requiresInit: true
    }
  ];

  return (
    <aside
      style={{
        width: 220,
        background: "#FAFAFA",
        borderRight: "1px solid #EAEAEA",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        flexShrink: 0,
        userSelect: "none",
        zIndex: 20
      }}
    >
      {/* ── Brand Header ── */}
      <div>
        <div
          style={{
            padding: "16px 16px 14px",
            borderBottom: "1px solid #EAEAEA",
            display: "flex",
            alignItems: "center",
            gap: 10
          }}
        >
          <div
            style={{
              width: 32,
              height: 32,
              borderRadius: 4,
              background: "#111111",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0
            }}
          >
            <Shield style={{ width: 16, height: 16, color: "#FFFFFF" }} />
          </div>
          <div>
            <div
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: 11,
                fontWeight: 700,
                letterSpacing: "0.1em",
                textTransform: "uppercase",
                color: "#111111"
              }}
            >
              CAPITAL GUARD
            </div>
            <div
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: 9,
                letterSpacing: "0.1em",
                textTransform: "uppercase",
                color: "#999999"
              }}
            >
              INSTITUTIONAL RISK OS
            </div>
          </div>
        </div>

        {/* ── Navigation ── */}
        <nav style={{ padding: "10px 8px" }}>
          {/* Section label */}
          <div
            style={{
              padding: "6px 10px 4px",
              fontSize: 9,
              fontWeight: 600,
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              color: "#AAAAAA",
              fontFamily: "var(--font-mono)"
            }}
          >
            Financial Workflow
          </div>

          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            const isLocked = item.requiresInit && !isInitialized;

            return (
              <button
                key={item.id}
                id={`nav-${item.id}`}
                onClick={() => { if (!isLocked) setActiveTab(item.id); }}
                disabled={isLocked}
                style={{
                  width: "100%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "8px 10px",
                  borderRadius: 4,
                  border: isActive ? "1px solid #D4D4D4" : "1px solid transparent",
                  background: isActive ? "#FFFFFF" : "transparent",
                  cursor: isLocked ? "not-allowed" : "pointer",
                  opacity: isLocked ? 0.35 : 1,
                  marginBottom: 1,
                  transition: "all 0.12s ease"
                }}
                onMouseEnter={e => {
                  if (!isActive && !isLocked) {
                    e.currentTarget.style.background = "#F0F0F0";
                  }
                }}
                onMouseLeave={e => {
                  if (!isActive) {
                    e.currentTarget.style.background = "transparent";
                  }
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 8, minWidth: 0 }}>
                  <Icon
                    style={{
                      width: 14,
                      height: 14,
                      flexShrink: 0,
                      color: isActive ? "#111111" : "#888888"
                    }}
                  />
                  <span
                    style={{
                      fontSize: 12,
                      fontWeight: isActive ? 600 : 400,
                      color: isActive ? "#111111" : "#555555",
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis"
                    }}
                  >
                    {item.label}
                  </span>
                </div>

                {/* Badge — only for BREACH or LIVE on monitoring */}
                {item.badge && !isLocked && (
                  <span
                    style={{
                      fontSize: 8,
                      fontFamily: "var(--font-mono)",
                      fontWeight: 700,
                      letterSpacing: "0.08em",
                      textTransform: "uppercase",
                      padding: "2px 5px",
                      borderRadius: 3,
                      flexShrink: 0,
                      marginLeft: 4,
                      background: item.isBreach && riskStatus === "BREACH" ? "#D32F2F" : "#111111",
                      color: "#FFFFFF"
                    }}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* ── Bottom Section: AI Copilot + Auth ── */}
      <div style={{ padding: "10px 8px", borderTop: "1px solid #EAEAEA" }}>
        {/* AI Copilot Button */}
        <button
          id="sidebar-copilot-btn"
          onClick={() => setIsCopilotOpen(true)}
          style={{
            width: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "8px 10px",
            borderRadius: 4,
            border: "1px solid #D4D4D4",
            background: "#FFFFFF",
            cursor: "pointer",
            marginBottom: 6,
            transition: "border-color 0.12s ease"
          }}
          onMouseEnter={e => { e.currentTarget.style.borderColor = "#111111"; }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = "#D4D4D4"; }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
            <Sparkles style={{ width: 13, height: 13, color: "#111111" }} />
            <span style={{ fontSize: 11, fontWeight: 600, color: "#111111" }}>CG Copilot</span>
          </div>
          <span
            style={{
              fontSize: 8,
              fontFamily: "var(--font-mono)",
              fontWeight: 700,
              letterSpacing: "0.08em",
              padding: "2px 4px",
              border: "1px solid #D4D4D4",
              borderRadius: 2,
              color: "#666666"
            }}
          >
            GROQ
          </span>
        </button>

        {/* User Auth Section */}
        {currentUser ? (
          <div
            style={{
              padding: "10px 12px",
              borderRadius: 4,
              border: "1px solid #D4D4D4",
              background: "#FFFFFF",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 8
            }}
          >
            <div style={{ minWidth: 0, display: "flex", alignItems: "center", gap: 9 }}>
              <div
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: "50%",
                  background: currentUser?.isGuest ? "#666666" : "#111111",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                  fontSize: 12,
                  fontWeight: 700,
                  color: "#FFFFFF"
                }}
              >
                {currentUser?.isGuest ? "G" : (currentUser?.full_name?.charAt(0) || currentUser?.email?.charAt(0) || "U")}
              </div>
              <div style={{ minWidth: 0 }}>
                <div style={{ fontSize: 12.5, fontWeight: 700, color: "#111111", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                  {currentUser?.isGuest ? "Guest Sandbox" : (currentUser?.full_name || currentUser?.email || "User")}
                </div>
                <div style={{ fontSize: 10, color: currentUser?.isGuest ? "#C05500" : "#666666", textTransform: "uppercase", letterSpacing: "0.05em", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                  {currentUser?.isGuest ? "In-Memory Only" : (currentUser?.role || currentUser?.org_name || "Institutional User")}
                </div>
              </div>
            </div>
            <button
              onClick={() => {
                localStorage.removeItem("capital_guard_user");
                setCurrentUser(null);
              }}
              title={currentUser?.isGuest ? "Exit Guest Mode" : "Sign Out"}
              style={{
                padding: "6px",
                borderRadius: 4,
                border: "1px solid #EAEAEA",
                background: "transparent",
                cursor: "pointer",
                color: "#666666",
                display: "flex",
                alignItems: "center"
              }}
              onMouseEnter={(e) => { e.currentTarget.style.borderColor = "#111111"; e.currentTarget.style.color = "#111111"; }}
              onMouseLeave={(e) => { e.currentTarget.style.borderColor = "#EAEAEA"; e.currentTarget.style.color = "#666666"; }}
            >
              <LogOut style={{ width: 14, height: 14 }} />
            </button>
          </div>
        ) : (
          /* Not logged in — clean sign-in CTA */
          <button
            id="sidebar-signin-btn"
            onClick={() => setCurrentUser(null)}
            style={{
              width: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
              padding: "10px 12px",
              borderRadius: 4,
              border: "1px solid #111111",
              background: "transparent",
              cursor: "pointer",
              transition: "background 0.12s ease"
            }}
            onMouseEnter={e => { e.currentTarget.style.background = "#F4F4F5"; }}
            onMouseLeave={e => { e.currentTarget.style.background = "transparent"; }}
          >
            <UserCircle style={{ width: 15, height: 15, color: "#111111" }} />
            <span style={{ fontSize: 13, fontWeight: 600, color: "#111111" }}>Access Gate</span>
          </button>
        )}
      </div>
    </aside>
  );
}
