import React, { useState } from "react";
import { usePortfolio } from "../state/portfolioStore";
import { formatCurrency } from "../utils/formatCurrency";
import { Download, FileText, ChevronRight, X } from "lucide-react";

function DecisionBadge({ decision }) {
  const isRebalance = decision === "REBALANCE";
  const isHold = decision === "HOLD" || decision === "HOLD_NO_ACTION";
  return (
    <span style={{
      fontFamily: "var(--font-mono)",
      fontSize: 8,
      fontWeight: 700,
      letterSpacing: "0.08em",
      textTransform: "uppercase",
      padding: "2px 6px",
      borderRadius: 2,
      border: "1px solid",
      borderColor: isRebalance ? "#111111" : isHold ? "#D4D4D4" : "#D4D4D4",
      background: isRebalance ? "#111111" : "#FAFAFA",
      color: isRebalance ? "#FFFFFF" : "#555555",
      whiteSpace: "nowrap"
    }}>
      {decision}
    </span>
  );
}

export default function AuditHistory() {
  const { portfolio, decisionHistory, loadHistory, currentUser, setActiveTab } = usePortfolio();
  const [selectedRecord, setSelectedRecord] = useState(null);

  React.useEffect(() => {
    loadHistory(portfolio?.id || 1);
  }, [portfolio?.id, loadHistory]);

  const exportHistoryCSV = () => {
    if (!decisionHistory || decisionHistory.length === 0) return;
    const headers = ["ID", "Timestamp", "Trigger", "Decision", "Turnover_Pct", "Transaction_Cost", "Risk_Before", "Risk_After", "Explanation"];
    const rows = decisionHistory.map((r) => [
      r.id, r.timestamp || "", `"${r.trigger || ""}"`, r.decision || "",
      (r.turnover * 100).toFixed(2), r.transaction_cost,
      r.portfolio_risk_before, r.portfolio_risk_after,
      `"${(r.explanation || "").replace(/"/g, '""')}"`
    ]);
    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map(e => e.join(","))].join("\n");
    const link = document.createElement("a");
    link.setAttribute("href", encodeURI(csvContent));
    link.setAttribute("download", `capital_guard_audit_log_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div style={{ maxWidth: 1100, margin: "0 auto", padding: "32px 40px", display: "flex", flexDirection: "column", gap: 24 }}>

            <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: 16, paddingBottom: 24, borderBottom: "1px solid #EAEAEA" }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <h1 style={{ fontSize: 24, fontWeight: 800, letterSpacing: "-0.02em", color: "#111111" }}>
              Immutable Audit Ledger
            </h1>
            <span style={{ fontFamily: "var(--font-mono)", fontSize: 11, fontWeight: 700, letterSpacing: "0.08em", padding: "4px 9px", border: "1px solid #D4D4D4", borderRadius: 3, color: "#111111", background: "#F4F4F5" }}>
              {decisionHistory?.length || 0} RECORDS
            </span>
            {currentUser?.isGuest ? (
              <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.05em", textTransform: "uppercase", padding: "4px 8px", background: "#FEF3C7", border: "1px solid #F59E0B", color: "#92400E", borderRadius: 3 }}>
                Guest Sandbox (In-Memory Only)
              </span>
            ) : (
              <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.05em", textTransform: "uppercase", padding: "4px 8px", background: "#111111", color: "#FFFFFF", borderRadius: 3 }}>
                PostgreSQL DB Persisted
              </span>
            )}
          </div>
          <p style={{ fontSize: 14, color: "#666666", marginTop: 6 }}>
            {currentUser?.isGuest
              ? "Notice: Guest session active. Decisions remain in temporary memory only and are not stored in the database."
              : `Append-only regulatory audit trail archived in PostgreSQL for ${currentUser?.org_name || currentUser?.email || 'Institution'}.`}
          </p>
        </div>

        {decisionHistory?.length > 0 && (
          <button onClick={exportHistoryCSV} className="cg-btn-secondary" style={{ fontSize: 13 }} title="Download regulatory audit CSV">
            <Download style={{ width: 14, height: 14 }} />
            Export Audit CSV
          </button>
        )}
      </div>

            {!decisionHistory || decisionHistory.length === 0 ? (
        <div style={{ padding: "60px 24px", border: "1px solid #EAEAEA", borderRadius: 4, background: "#FFFFFF", textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center", gap: 12 }}>
          <FileText style={{ width: 36, height: 36, color: "#D4D4D4" }} />
          <div style={{ fontSize: 15, fontWeight: 700, color: "#111111" }}>No Audit Records Yet</div>
          <p style={{ fontSize: 12, color: "#666666", maxWidth: 380 }}>
            Decisions are recorded when an initial mandate is optimized, market shocks trigger alerts, or tactical rebalance/hold decisions are executed.
          </p>
          <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
            <button onClick={() => setActiveTab("monitoring")} className="cg-btn-secondary" style={{ fontSize: 12 }}>
              Simulate Market Shock
            </button>
            <button onClick={() => setActiveTab("rebalance")} className="cg-btn-primary" style={{ fontSize: 12 }}>
              Execute Rebalance
            </button>
          </div>
        </div>
      ) : (
        <div className="cg-card" style={{ overflow: "hidden" }}>
          <div style={{ overflowX: "auto" }}>
            <table className="cg-table">
              <thead>
                <tr>
                  {["Timestamp", "Trigger Event", "Decision", "Turnover", "Trading Cost", "Risk Impact", "Rationale Note", ""].map((h, i) => (
                    <th key={h} style={{ textAlign: i > 5 ? "center" : i > 2 ? "right" : "left" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {decisionHistory.map((rec) => (
                  <tr
                    key={rec.id}
                    style={{ cursor: "pointer" }}
                    onClick={() => setSelectedRecord(rec)}
                  >
                    <td style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "#888888", whiteSpace: "nowrap" }}>
                      {rec.timestamp
                        ? new Date(rec.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" })
                        : "Just now"}
                    </td>

                    <td style={{ fontWeight: 500, maxWidth: 180, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {rec.trigger || "Mandate Alignment"}
                    </td>

                    <td>
                      <DecisionBadge decision={rec.decision} />
                    </td>

                    <td style={{ fontFamily: "var(--font-mono)", textAlign: "right" }}>
                      {((rec.turnover || 0) * 100).toFixed(1)}%
                    </td>

                    <td style={{ fontFamily: "var(--font-mono)", textAlign: "right" }}>
                      {formatCurrency(rec.transaction_cost, portfolio?.currency || "INR")}
                    </td>

                    <td style={{ fontFamily: "var(--font-mono)", textAlign: "right", whiteSpace: "nowrap" }}>
                      <span style={{ color: "#888888" }}>
                        {((rec.portfolio_risk_before || 0) * 100).toFixed(1)}%
                      </span>
                      <span style={{ color: "#D4D4D4", margin: "0 4px" }}>→</span>
                      <span style={{ fontWeight: 600, color: "#111111" }}>
                        {((rec.portfolio_risk_after || 0) * 100).toFixed(1)}%
                      </span>
                    </td>

                    <td style={{ color: "#888888", maxWidth: 260, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", fontSize: 11 }}>
                      {rec.explanation}
                    </td>

                    <td style={{ textAlign: "center" }}>
                      <ChevronRight style={{ width: 13, height: 13, color: "#D4D4D4", display: "inline" }} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

            {selectedRecord && (
        <div
          style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)", zIndex: 50, display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}
          onClick={(e) => { if (e.target === e.currentTarget) setSelectedRecord(null); }}
        >
          <div style={{
            background: "#FFFFFF",
            border: "1px solid #EAEAEA",
            borderRadius: 4,
            maxWidth: 480,
            width: "100%",
            padding: 28,
            boxShadow: "0 8px 32px rgba(0,0,0,0.12)"
          }}>
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", paddingBottom: 16, marginBottom: 16, borderBottom: "1px solid #EAEAEA" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <FileText style={{ width: 16, height: 16, color: "#111111" }} />
                <span style={{ fontSize: 13, fontWeight: 700, color: "#111111", fontFamily: "var(--font-mono)", letterSpacing: "0.04em" }}>
                  AUDIT RECORD #{String(selectedRecord.id || "LOG").slice(0, 8)}
                </span>
              </div>
              <button onClick={() => setSelectedRecord(null)} style={{ padding: 4, border: "none", background: "transparent", cursor: "pointer", color: "#888888" }}>
                <X style={{ width: 16, height: 16 }} />
              </button>
            </div>

                        <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
              {[
                { label: "Timestamp", value: selectedRecord.timestamp || "Immediate" },
                { label: "Signatory", value: currentUser?.user_metadata?.full_name || "Institutional User" },
                { label: "Turnover", value: `${((selectedRecord.turnover || 0) * 100).toFixed(2)}%` },
                { label: "Trading Frictions", value: formatCurrency(selectedRecord.transaction_cost, portfolio?.currency || "INR") },
                {
                  label: "Risk Mitigation",
                  value: `${((selectedRecord.portfolio_risk_before || 0) * 100).toFixed(2)}% → ${((selectedRecord.portfolio_risk_after || 0) * 100).toFixed(2)}%`
                }
              ].map(row => (
                <div key={row.label} style={{ display: "flex", justifyContent: "space-between", padding: "9px 0", borderBottom: "1px solid #F0F0F0" }}>
                  <span style={{ fontSize: 12, color: "#888888" }}>{row.label}</span>
                  <span style={{ fontSize: 12, fontFamily: "var(--font-mono)", fontWeight: 500, color: "#111111" }}>{row.value}</span>
                </div>
              ))}
                            <div style={{ display: "flex", justifyContent: "space-between", padding: "9px 0", borderBottom: "1px solid #F0F0F0", alignItems: "center" }}>
                <span style={{ fontSize: 12, color: "#888888" }}>Decision</span>
                <DecisionBadge decision={selectedRecord.decision} />
              </div>
            </div>

                        <div style={{ marginTop: 16 }}>
              <div style={{ fontSize: 10, fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase", color: "#888888", marginBottom: 6 }}>
                Committee Rationale
              </div>
              <div style={{ padding: 14, borderRadius: 3, border: "1px solid #EAEAEA", background: "#FAFAFA", fontSize: 12, color: "#555555", lineHeight: 1.65 }}>
                {selectedRecord.explanation || "No notes attached."}
              </div>
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 20 }}>
              <button onClick={() => setSelectedRecord(null)} className="cg-btn-secondary" style={{ fontSize: 12 }}>
                Close Record
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
