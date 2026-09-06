import React from "react";
import { PortfolioProvider, usePortfolio } from "./state/portfolioStore";
import Sidebar from "./components/Sidebar";
import TopTelemetryBar from "./components/TopTelemetryBar";
import RiskStatusBanner from "./components/RiskStatusBanner";
import AICopilotDrawer from "./components/AICopilotDrawer";
import AuthModal from "./components/AuthModal";
import AccessGate from "./components/AccessGate";

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
      <Sidebar />

      <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0, background: "#FAFAFA", overflow: "hidden" }}>
        <TopTelemetryBar />

        {riskStatus === "BREACH" && <RiskStatusBanner />}

        <main
          className="no-scrollbar"
          style={{ flex: 1, overflowY: "auto", background: "#FAFAFA" }}
        >
          {renderActivePage()}
        </main>
      </div>

      <AICopilotDrawer
        isOpen={isCopilotOpen}
        onClose={() => setIsCopilotOpen(false)}
        portfolio={portfolio}
        macroIndicators={macroIndicators}
      />

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
