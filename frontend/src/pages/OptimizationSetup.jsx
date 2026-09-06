import React from "react";
import { usePortfolio } from "../state/portfolioStore";
import {
  ASSET_UNIVERSE,
  OBJECTIVE_OPTIONS,
  ORG_TYPE_OPTIONS,
  DEMO_PRESET_BANK
} from "../services/demoData";
import { formatCurrency } from "../utils/formatCurrency";
import { formatPercentage } from "../utils/formatPercentage";
import {
  Landmark, Target, Layers, Shield,
  ArrowLeft, ArrowRight, Zap, CheckCircle2, Cpu
} from "lucide-react";

const inputStyle = {
  width: "100%",
  padding: "9px 12px",
  fontSize: 13,
  border: "1px solid #D4D4D4",
  borderRadius: 4,
  background: "#FFFFFF",
  color: "#111111",
  outline: "none",
  fontFamily: "var(--font-sans)"
};

const labelStyle = {
  display: "block",
  fontSize: 11,
  fontWeight: 600,
  color: "#555555",
  marginBottom: 6,
  letterSpacing: "0.02em"
};

export default function OptimizationSetup() {
  const {
    setupStep,
    setSetupStep,
    formData,
    updateFormData,
    runOptimization,
    loading,
    error,
    setActiveTab,
    currentUser,
    portfolio
  } = usePortfolio();

  const isRegisteredUser = currentUser && !currentUser.isGuest;

  const handleAssetToggle = (assetId) => {
    const current = formData.selected_assets || [];
    if (current.includes(assetId)) {
      if (current.length <= 2) {
        alert("At least 2 asset classes must be selected for quadratic optimization.");
        return;
      }
      updateFormData({ selected_assets: current.filter(id => id !== assetId) });
    } else {
      updateFormData({ selected_assets: [...current, assetId] });
    }
  };

  const autofillDemo = () => {
    if (isRegisteredUser) {
      updateFormData({
        ...DEMO_PRESET_BANK,
        org_name: portfolio?.org_name || currentUser.org_name || formData.org_name,
        org_type: portfolio?.org_type || currentUser.org_type || formData.org_type,
        total_capital: portfolio?.total_capital || currentUser.initial_capital || formData.total_capital,
        currency: portfolio?.currency || currentUser.currency || formData.currency
      });
    } else {
      updateFormData(DEMO_PRESET_BANK);
    }
  };

  const handleFinalSubmit = async (e) => {
    e?.preventDefault();
    try { await runOptimization(); } catch (err) { console.error(err); }
  };

  const steps = [
    { step: 1, title: "Organization & Capital", icon: Landmark },
    { step: 2, title: "Objective & Horizon",    icon: Target },
    { step: 3, title: "Asset Universe",          icon: Layers },
    { step: 4, title: "Risk & Constraints",      icon: Shield }
  ];

  return (
    <div style={{ maxWidth: 1100, margin: "0 auto", padding: "32px 40px", display: "flex", flexDirection: "column", gap: 24, userSelect: "none" }}>

            <div style={{ display: "flex", flexWrap: "wrap", alignItems: "flex-start", justifyContent: "space-between", gap: 16, paddingBottom: 24, borderBottom: "1px solid #EAEAEA" }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <h1 style={{ fontSize: 22, fontWeight: 800, letterSpacing: "-0.02em", color: "#111111" }}>
              Mandate Formulation Wizard
            </h1>
            <span style={{ fontFamily: "var(--font-mono)", fontSize: 9, fontWeight: 700, letterSpacing: "0.08em", padding: "3px 7px", border: "1px solid #D4D4D4", borderRadius: 3, color: "#555555" }}>
              STEP {setupStep} OF 4
            </span>
          </div>
          <p style={{ fontSize: 12, color: "#666666", marginTop: 4 }}>
            Configure institutional mandate parameters, statutory liquidity constraints, and asset bounds.
          </p>
        </div>

        <button onClick={autofillDemo} type="button" className="cg-btn-secondary" style={{ fontSize: 12 }}>
          <Zap style={{ width: 13, height: 13 }} />
          {isRegisteredUser ? "Autofill Regulatory Defaults" : "Autofill Sample Preset"}
        </button>
      </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 8 }}>
        {steps.map((item) => {
          const isDone    = setupStep > item.step;
          const isCurrent = setupStep === item.step;
          const Icon      = item.icon;
          return (
            <button
              key={item.step}
              onClick={() => setSetupStep(item.step)}
              style={{
                padding: "12px 14px",
                borderRadius: 4,
                border: `1px solid ${isCurrent ? "#111111" : isDone ? "#D4D4D4" : "#EAEAEA"}`,
                background: isCurrent ? "#111111" : "#FFFFFF",
                display: "flex",
                alignItems: "center",
                gap: 10,
                cursor: isDone || isCurrent ? "pointer" : "default",
                textAlign: "left",
                transition: "all 0.12s ease"
              }}
            >
                            <div style={{
                width: 26, height: 26, borderRadius: "50%", flexShrink: 0,
                display: "flex", alignItems: "center", justifyContent: "center",
                background: isCurrent ? "#FFFFFF" : isDone ? "#111111" : "#F0F0F0",
                border: `1px solid ${isCurrent ? "#FFFFFF" : isDone ? "#111111" : "#D4D4D4"}`
              }}>
                {isDone
                  ? <CheckCircle2 style={{ width: 13, height: 13, color: "#FFFFFF" }} />
                  : <Icon style={{ width: 11, height: 11, color: isCurrent ? "#111111" : "#AAAAAA" }} />
                }
              </div>
              <div>
                <div style={{ fontSize: 9, fontFamily: "var(--font-mono)", letterSpacing: "0.08em", textTransform: "uppercase", color: isCurrent ? "#AAAAAA" : "#CCCCCC", marginBottom: 1 }}>
                  Step {item.step}
                </div>
                <div style={{ fontSize: 11, fontWeight: 600, color: isCurrent ? "#FFFFFF" : isDone ? "#111111" : "#888888", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", maxWidth: 110 }}>
                  {item.title}
                </div>
              </div>
            </button>
          );
        })}
      </div>

            <div style={{ display: "grid", gridTemplateColumns: "8fr 4fr", gap: 16, alignItems: "start" }}>

                <div className="cg-card" style={{ padding: 28, display: "flex", flexDirection: "column", gap: 20 }}>

                    {error && (
            <div style={{ padding: 12, borderRadius: 4, border: "1px solid #D32F2F", background: "rgba(211,47,47,0.05)", fontSize: 12, color: "#D32F2F" }}>
              <strong>Optimization Error:</strong> {error}
            </div>
          )}

                    {setupStep === 1 && (
            <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
              <div>
                <div style={{ fontSize: 13, fontWeight: 700, color: "#111111", letterSpacing: "-0.01em" }}>
                  01. Institutional Entity &amp; Capital Base
                </div>
                <p style={{ fontSize: 11, color: "#666666", marginTop: 3 }}>
                  Identify legal entity type and initial statutory allocation balance.
                </p>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                <div>
                  <label style={labelStyle}>Institution / Portfolio Name</label>
                  <input
                    type="text"
                    value={formData.org_name}
                    onChange={e => updateFormData({ org_name: e.target.value })}
                    style={inputStyle}
                    placeholder="e.g. Apex Reserve Bank"
                    onFocus={e => { e.target.style.borderColor = "#111111"; }}
                    onBlur={e => { e.target.style.borderColor = "#D4D4D4"; }}
                  />
                </div>

                <div>
                  <label style={labelStyle}>Regulatory Entity Classification</label>
                  <select
                    value={formData.org_type}
                    onChange={e => updateFormData({ org_type: e.target.value })}
                    style={{ ...inputStyle }}
                    onFocus={e => { e.target.style.borderColor = "#111111"; }}
                    onBlur={e => { e.target.style.borderColor = "#D4D4D4"; }}
                  >
                    {ORG_TYPE_OPTIONS.map(o => (
                      <option key={o.id} value={o.id}>{o.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                  <label style={labelStyle}>Total Mandate Capital ({formData.currency})</label>
                  <span style={{ fontFamily: "var(--font-mono)", fontSize: 13, fontWeight: 700, color: "#111111" }}>
                    {formatCurrency(formData.total_capital, formData.currency)}
                  </span>
                </div>
                <input
                  type="number"
                  step="10000000"
                  value={formData.total_capital}
                  onChange={e => updateFormData({ total_capital: parseFloat(e.target.value) || 0 })}
                  style={{ ...inputStyle, fontFamily: "var(--font-mono)" }}
                  onFocus={e => { e.target.style.borderColor = "#111111"; }}
                  onBlur={e => { e.target.style.borderColor = "#D4D4D4"; }}
                />

                                <div style={{ display: "flex", gap: 6, marginTop: 8 }}>
                  {[
                    { label: "₹50 Cr",     val: 500000000 },
                    { label: "₹100 Cr",    val: 1000000000 },
                    { label: "₹500 Cr",    val: 5000000000 },
                    { label: "₹1,000 Cr",  val: 10000000000 }
                  ].map(preset => (
                    <button
                      key={preset.label}
                      type="button"
                      onClick={() => updateFormData({ total_capital: preset.val })}
                      style={{
                        padding: "5px 10px",
                        borderRadius: 3,
                        border: `1px solid ${formData.total_capital === preset.val ? "#111111" : "#EAEAEA"}`,
                        background: formData.total_capital === preset.val ? "#111111" : "#FAFAFA",
                        color: formData.total_capital === preset.val ? "#FFFFFF" : "#555555",
                        fontFamily: "var(--font-mono)",
                        fontSize: 11,
                        cursor: "pointer"
                      }}
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

                    {setupStep === 2 && (
            <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
              <div>
                <div style={{ fontSize: 13, fontWeight: 700, color: "#111111" }}>
                  02. Investment Objective &amp; Horizon
                </div>
                <p style={{ fontSize: 11, color: "#666666", marginTop: 3 }}>
                  Specify asset management objective and duration mandate.
                </p>
              </div>

                            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10 }}>
                {OBJECTIVE_OPTIONS.map(obj => {
                  const isSelected = formData.investment_objective === obj.id;
                  return (
                    <div
                      key={obj.id}
                      onClick={() => updateFormData({ investment_objective: obj.id, max_risk_limit: obj.defaultRisk })}
                      style={{
                        padding: 16,
                        borderRadius: 4,
                        border: `1px solid ${isSelected ? "#111111" : "#EAEAEA"}`,
                        background: isSelected ? "#111111" : "#FFFFFF",
                        cursor: "pointer",
                        display: "flex",
                        flexDirection: "column",
                        gap: 6,
                        transition: "all 0.12s ease"
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                        <div style={{ fontSize: 12, fontWeight: 700, color: isSelected ? "#FFFFFF" : "#111111" }}>
                          {obj.title}
                        </div>
                        {isSelected && <CheckCircle2 style={{ width: 13, height: 13, color: "#FFFFFF" }} />}
                      </div>
                      <div style={{ fontFamily: "var(--font-mono)", fontSize: 10, fontWeight: 600, color: isSelected ? "#AAAAAA" : "#888888" }}>
                        {obj.subtitle}
                      </div>
                      <p style={{ fontSize: 11, color: isSelected ? "#CCCCCC" : "#666666", lineHeight: 1.55 }}>
                        {obj.description}
                      </p>
                      <div style={{ marginTop: 4, paddingTop: 6, borderTop: `1px solid ${isSelected ? "rgba(255,255,255,0.1)" : "#F0F0F0"}`, fontFamily: "var(--font-mono)", fontSize: 10, color: isSelected ? "#AAAAAA" : "#AAAAAA" }}>
                        Default Risk Cap: {(obj.defaultRisk * 100).toFixed(1)}%
                      </div>
                    </div>
                  );
                })}
              </div>

                            <div>
                <label style={labelStyle}>Investment Duration Mandate</label>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 8 }}>
                  {[
                    { label: "1 Year (Short)", years: 1 },
                    { label: "3 Years (Standard)", years: 3 },
                    { label: "5 Years (Medium)", years: 5 },
                    { label: "10 Years (Strategic)", years: 10 }
                  ].map(h => (
                    <button
                      key={h.years}
                      type="button"
                      onClick={() => updateFormData({ investment_horizon_years: h.years })}
                      style={{
                        padding: "9px 6px",
                        borderRadius: 4,
                        border: `1px solid ${formData.investment_horizon_years === h.years ? "#111111" : "#EAEAEA"}`,
                        background: formData.investment_horizon_years === h.years ? "#111111" : "#FAFAFA",
                        color: formData.investment_horizon_years === h.years ? "#FFFFFF" : "#555555",
                        fontSize: 11,
                        fontWeight: 500,
                        cursor: "pointer",
                        textAlign: "center",
                        transition: "all 0.12s ease"
                      }}
                    >
                      {h.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

                    {setupStep === 3 && (
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: "#111111" }}>
                    03. Asset Class Universe Selection
                  </div>
                  <p style={{ fontSize: 11, color: "#666666", marginTop: 3 }}>
                    Select eligible investment instruments for quadratic optimization.
                  </p>
                </div>
                <span style={{ fontFamily: "var(--font-mono)", fontSize: 10, fontWeight: 600, padding: "3px 8px", border: "1px solid #D4D4D4", borderRadius: 3, color: "#555555" }}>
                  {formData.selected_assets?.length || 0} Selected
                </span>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                {ASSET_UNIVERSE.map(asset => {
                  const isChecked = formData.selected_assets?.includes(asset.id);
                  return (
                    <div
                      key={asset.id}
                      onClick={() => handleAssetToggle(asset.id)}
                      style={{
                        padding: "14px 16px",
                        borderRadius: 4,
                        border: `1px solid ${isChecked ? "#111111" : "#EAEAEA"}`,
                        background: isChecked ? "#111111" : "#FFFFFF",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        gap: 12,
                        transition: "all 0.12s ease"
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center", gap: 12, minWidth: 0 }}>
                                                <div style={{
                          width: 18, height: 18, borderRadius: 3, flexShrink: 0,
                          border: `1px solid ${isChecked ? "#FFFFFF" : "#D4D4D4"}`,
                          background: isChecked ? "#FFFFFF" : "#FAFAFA",
                          display: "flex", alignItems: "center", justifyContent: "center"
                        }}>
                          {isChecked && <CheckCircle2 style={{ width: 12, height: 12, color: "#111111" }} />}
                        </div>

                        <div style={{ minWidth: 0 }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                            <span style={{ fontSize: 12, fontWeight: 700, color: isChecked ? "#FFFFFF" : "#111111" }}>
                              {asset.name}
                            </span>
                            <span style={{
                              fontSize: 9, fontFamily: "var(--font-mono)", fontWeight: 600,
                              padding: "2px 5px", borderRadius: 2,
                              border: `1px solid ${isChecked ? "rgba(255,255,255,0.2)" : "#EAEAEA"}`,
                              color: isChecked ? "#AAAAAA" : "#888888",
                              background: isChecked ? "rgba(255,255,255,0.08)" : "#FAFAFA",
                              letterSpacing: "0.04em", textTransform: "uppercase"
                            }}>
                              {asset.category}
                            </span>
                          </div>
                          <div style={{ fontSize: 11, color: isChecked ? "#CCCCCC" : "#888888", marginTop: 2 }}>
                            {asset.description}
                          </div>
                        </div>
                      </div>

                                            <div style={{ display: "flex", gap: 20, flexShrink: 0, fontFamily: "var(--font-mono)" }}>
                        <div style={{ textAlign: "right" }}>
                          <div style={{ fontSize: 9, letterSpacing: "0.06em", textTransform: "uppercase", color: isChecked ? "#888888" : "#AAAAAA" }}>Exp. Return</div>
                          <div style={{ fontSize: 12, fontWeight: 700, color: isChecked ? "#FFFFFF" : "#111111" }}>
                            {formatPercentage(asset.expectedReturn)}
                          </div>
                        </div>
                        <div style={{ textAlign: "right" }}>
                          <div style={{ fontSize: 9, letterSpacing: "0.06em", textTransform: "uppercase", color: isChecked ? "#888888" : "#AAAAAA" }}>Volatility</div>
                          <div style={{ fontSize: 12, fontWeight: 700, color: isChecked ? "#CCCCCC" : "#555555" }}>
                            {formatPercentage(asset.volatility)}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

                    {setupStep === 4 && (
            <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
              <div>
                <div style={{ fontSize: 13, fontWeight: 700, color: "#111111" }}>
                  04. Risk Mandates &amp; Basel III Constraints
                </div>
                <p style={{ fontSize: 11, color: "#666666", marginTop: 3 }}>
                  Establish regulatory boundaries for the Clarabel QP conic solver.
                </p>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                                {[
                  {
                    label: "Portfolio Volatility Ceiling",
                    value: `${(formData.max_risk_limit * 100).toFixed(2)}%`,
                    min: 0.02, max: 0.15, step: 0.005,
                    current: formData.max_risk_limit,
                    onChange: v => updateFormData({ max_risk_limit: v }),
                    hint: "Hard risk ceiling. Breach triggers mandatory de-risking alerts."
                  },
                  {
                    label: "Minimum Liquidity Buffer (LCR)",
                    value: `${formatCurrency(formData.min_liquidity, formData.currency)} (${((formData.min_liquidity / (formData.total_capital || 1)) * 100).toFixed(0)}%)`,
                    min: formData.total_capital * 0.05,
                    max: formData.total_capital * 0.40,
                    step: formData.total_capital * 0.05,
                    current: formData.min_liquidity,
                    onChange: v => updateFormData({ min_liquidity: v }),
                    hint: "Level 1 operational cash floor reserved for stress drawdowns."
                  },
                  {
                    label: "Public Equity Cap",
                    value: `${(formData.equity_max * 100).toFixed(0)}%`,
                    min: 0.05, max: 0.50, step: 0.05,
                    current: formData.equity_max,
                    onChange: v => updateFormData({ equity_max: v }),
                    hint: "Statutory concentration limit for risk-weighted capital adequacy."
                  },
                  {
                    label: "Corporate Credit Cap",
                    value: `${(formData.corpbonds_max * 100).toFixed(0)}%`,
                    min: 0.10, max: 0.50, step: 0.05,
                    current: formData.corpbonds_max,
                    onChange: v => updateFormData({ corpbonds_max: v }),
                    hint: "Counterparty exposure ceiling for AAA credit portfolio."
                  }
                ].map(ctrl => (
                  <div
                    key={ctrl.label}
                    style={{ padding: 16, borderRadius: 4, border: "1px solid #EAEAEA", background: "#FAFAFA", display: "flex", flexDirection: "column", gap: 10 }}
                  >
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                      <label style={{ ...labelStyle, marginBottom: 0 }}>{ctrl.label}</label>
                      <span style={{ fontFamily: "var(--font-mono)", fontSize: 13, fontWeight: 700, color: "#111111" }}>
                        {ctrl.value}
                      </span>
                    </div>
                    <input
                      type="range"
                      min={ctrl.min} max={ctrl.max} step={ctrl.step}
                      value={ctrl.current}
                      onChange={e => ctrl.onChange(parseFloat(e.target.value))}
                      style={{ width: "100%", accentColor: "#111111", cursor: "pointer" }}
                    />
                    <div style={{ fontSize: 10, color: "#AAAAAA" }}>{ctrl.hint}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", paddingTop: 16, borderTop: "1px solid #EAEAEA", marginTop: 4 }}>
            {setupStep > 1 ? (
              <button type="button" onClick={() => setSetupStep(setupStep - 1)} className="cg-btn-secondary" style={{ fontSize: 12 }}>
                <ArrowLeft style={{ width: 13, height: 13 }} />
                Previous
              </button>
            ) : (
              <button type="button" onClick={() => setActiveTab("landing")} style={{ fontSize: 12, color: "#888888", background: "none", border: "none", cursor: "pointer" }}>
                ← Return to Portal
              </button>
            )}

            {setupStep < 4 ? (
              <button type="button" onClick={() => setSetupStep(setupStep + 1)} className="cg-btn-primary" style={{ fontSize: 13 }}>
                Continue
                <ArrowRight style={{ width: 13, height: 13 }} />
              </button>
            ) : (
              <button type="button" onClick={handleFinalSubmit} disabled={loading} className="cg-btn-primary" style={{ fontSize: 13 }}>
                <Cpu style={{ width: 14, height: 14, animation: loading ? "spin 1s linear infinite" : "none" }} />
                {loading ? "Executing Solver…" : "Execute Clarabel QP Optimization"}
              </button>
            )}
          </div>
        </div>

                <div className="cg-card" style={{ padding: 20, position: "sticky", top: 24 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", paddingBottom: 14, marginBottom: 14, borderBottom: "1px solid #EAEAEA" }}>
            <div className="cg-section-title">Live Mandate Draft</div>
            <span style={{ fontFamily: "var(--font-mono)", fontSize: 8, fontWeight: 700, letterSpacing: "0.08em", padding: "2px 5px", border: "1px solid #D4D4D4", borderRadius: 2, color: "#555555" }}>
              READY
            </span>
          </div>

                    <div style={{ display: "flex", flexDirection: "column" }}>
            {[
              { label: "Institution",    value: formData.org_name },
              { label: "Entity Tier",    value: formData.org_type },
              { label: "Capital Base",   value: formatCurrency(formData.total_capital, formData.currency), bold: true },
              { label: "Objective",      value: formData.investment_objective },
              { label: "Horizon",        value: `${formData.investment_horizon_years} Years` },
              { label: "Risk Limit",     value: `${(formData.max_risk_limit * 100).toFixed(2)}%`, bold: true },
              { label: "Liquidity Floor",value: formatCurrency(formData.min_liquidity, formData.currency) },
              { label: "Active Assets",  value: `${formData.selected_assets?.length || 0}` }
            ].map(row => (
              <div key={row.label} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 0", borderBottom: "1px solid #F0F0F0" }}>
                <span style={{ fontSize: 11, color: "#888888" }}>{row.label}</span>
                <span style={{ fontFamily: "var(--font-mono)", fontSize: 11, fontWeight: row.bold ? 700 : 500, color: "#111111", textAlign: "right", maxWidth: "60%", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {row.value}
                </span>
              </div>
            ))}
          </div>

                    <div style={{ marginTop: 14, padding: 12, borderRadius: 3, border: "1px solid #EAEAEA", background: "#FAFAFA" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 6 }}>
              <Cpu style={{ width: 12, height: 12, color: "#111111" }} />
              <span style={{ fontSize: 11, fontWeight: 700, color: "#111111" }}>Conic Interior-Point Solver</span>
            </div>
            <p style={{ fontSize: 10, color: "#666666", lineHeight: 1.6 }}>
              Clarabel solves the convex QP formulation with dual tolerance 1e-8. Computes optimal weights, expected Sharpe, and asset bounds.
            </p>
          </div>

                    {setupStep < 4 && (
            <button
              type="button"
              onClick={() => setSetupStep(4)}
              style={{ width: "100%", marginTop: 10, padding: "8px", borderRadius: 4, border: "1px dashed #D4D4D4", background: "transparent", color: "#888888", fontSize: 11, cursor: "pointer" }}
            >
              Skip to Step 4 →
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
