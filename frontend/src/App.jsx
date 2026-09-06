import React from "react";
import { PortfolioProvider, usePortfolio } from "./state/portfolioStore";
import Sidebar from "./components/Sidebar";
import TopTelemetryBar from "./components/TopTelemetryBar";
import RiskStatusBanner from "./components/RiskStatusBanner";
import AICopilotDrawer from "./components/AICopilotDrawer";
import AuthModal from "./components/AuthModal";
import AccessGate from "./components/AccessGate";

// Pages
import LandingPage from "./pages/LandingPage";
import OptimizationSetup from "./pages/OptimizationSetup";
import Overview from "./pages/Overview";
import RiskMonitoring from "./pages/RiskMonitoring";
import RebalanceEngine from "./pages/RebalanceEngine";
import StressSimulator from "./pages/StressSimulator";
import AuditHistory from "./pages/AuditHistory";

function AppContent() {
  const {
    activeTab,
    portfolio,
    macroIndicators,
    isCopilotOpen,
    setIsCopilotOpen,
    isAuthModalOpen,
    setIsAuthModalOpen,
    currentUser,
    setCurrentUser,
    riskStatus
  } = usePortfolio();

  // If no authenticated user or active session, display mandatory Access Gate
  if (!currentUser) {
    return <AccessGate />;
  }

  const renderActivePage = () => {
    switch (activeTab) {
      case "landing":    return <LandingPage />;
      case "setup":      return <OptimizationSetup />;
      case "overview":   return <Overview />;
      case "monitoring": return <RiskMonitoring />;
      case "rebalance":  return <RebalanceEngine />;
      case "simulator":  return <StressSimulator />;
      case "history":    return <AuditHistory />;
      default:           return <LandingPage />;
    }
  };

  return (
    <div style={{ display: "flex", height: "100vh", width: "100vw", overflow: "hidden", background: "#FFFFFF" }}>
      {/* ← Fixed 240px Left Sidebar */}
      <Sidebar />

      {/* → Right Viewport Column */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0, background: "#FAFAFA", overflow: "hidden" }}>
        {/* Layer 1: Top Telemetry Bar (FRED macro data, engine status) */}
        <TopTelemetryBar />

        {/* Layer 1: Persistent Risk Status Banner — only shown on breach */}
        {riskStatus === "BREACH" && <RiskStatusBanner />}

        {/* Scrollable Page Content */}
        <main
          className="no-scrollbar"
          style={{ flex: 1, overflowY: "auto", background: "#FAFAFA" }}
        >
          {renderActivePage()}
        </main>

        {/* Slim Institutional Footer */}
        <footer
          style={{
            height: 32,
            padding: "0 24px",
            background: "#FFFFFF",
            borderTop: "1px solid #EAEAEA",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexShrink: 0
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 10, fontFamily: "var(--font-mono)", color: "#999999", letterSpacing: "0.06em", textTransform: "uppercase" }}>
            <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#111111", flexShrink: 0 }} />
            <span>Capital Guard Risk Engine</span>
            <span style={{ color: "#D4D4D4" }}>|</span>
            <span>Clarabel Conic QP Solver</span>
          </div>
          <div style={{ fontSize: 10, fontFamily: "var(--font-mono)", color: "#999999", letterSpacing: "0.06em", textTransform: "uppercase" }}>
            Basel III Compliance Framework
          </div>
        </footer>
      </div>

      {/* Capital Guard AI Copilot Drawer */}
      <AICopilotDrawer
        isOpen={isCopilotOpen}
        onClose={() => setIsCopilotOpen(false)}
        portfolio={portfolio}
        macroIndicators={macroIndicators}
      />

      {/* Authentication & Multi-Persona Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onAuthSuccess={(user) => {
          setCurrentUser(user);
          setIsAuthModalOpen(false);
        }}
        currentUser={currentUser}
      />
    </div>
  );
}

export default function App() {
  return (
    <PortfolioProvider>
      <AppContent />
    </PortfolioProvider>
  );
}
