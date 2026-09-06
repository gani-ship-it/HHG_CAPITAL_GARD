const API_BASE_URL = "http://127.0.0.1:8000/api/v1";

export async function fetchHealth() {
  try {
    const res = await fetch("http://127.0.0.1:8000/health");
    return await res.json();
  } catch (err) {
    return { status: "offline", error: err.message };
  }
}

export async function fetchDefaults() {
  const res = await fetch(`${API_BASE_URL}/portfolio/defaults`);
  if (!res.ok) throw new Error("Failed to fetch defaults");
  return await res.json();
}

export async function optimizePortfolio(payload) {
  const res = await fetch(`${API_BASE_URL}/portfolio/optimize`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.detail || "Optimization failed");
  }
  return await res.json();
}

export async function fetchMonitoringMetrics(portfolioId) {
  const res = await fetch(`${API_BASE_URL}/monitoring/${portfolioId}/metrics`);
  if (!res.ok) throw new Error("Failed to fetch metrics");
  return await res.json();
}

export async function simulateMarketChange(portfolioId, simulatedRisk = 0.081) {
  const res = await fetch(`${API_BASE_URL}/monitoring/${portfolioId}/simulate-market-change`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ simulated_risk: simulatedRisk })
  });
  if (!res.ok) throw new Error("Failed to simulate market change");
  return await res.json();
}

export async function evaluateRebalance(payload) {
  const res = await fetch(`${API_BASE_URL}/rebalance/evaluate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });
  if (!res.ok) throw new Error("Failed to evaluate rebalance");
  return await res.json();
}

export async function executeRebalance(payload) {
  const res = await fetch(`${API_BASE_URL}/rebalance/execute`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });
  if (!res.ok) throw new Error("Failed to execute rebalance");
  return await res.json();
}

export async function fetchScenarioPresets() {
  const res = await fetch(`${API_BASE_URL}/simulator/presets`);
  if (!res.ok) throw new Error("Failed to fetch scenario presets");
  return await res.json();
}

export async function runStressTest(payload) {
  const res = await fetch(`${API_BASE_URL}/simulator/stress-test`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });
  if (!res.ok) throw new Error("Failed to run stress test");
  return await res.json();
}

export async function fetchDecisionHistory(portfolioId) {
  const res = await fetch(`${API_BASE_URL}/history/${portfolioId}`);
  if (!res.ok) throw new Error("Failed to fetch decision history");
  return await res.json();
}

export async function fetchMacroIndicators() {
  try {
    const res = await fetch(`${API_BASE_URL}/monitoring/macro-indicators`);
    if (!res.ok) return null;
    return await res.json();
  } catch (err) {
    console.warn("FRED macro fetch warning:", err);
    return null;
  }
}

export async function fetchCopilotStatus() {
  try {
    const res = await fetch(`${API_BASE_URL}/copilot/status`);
    if (!res.ok) return null;
    return await res.json();
  } catch (err) {
    console.warn("Copilot status fetch warning:", err);
    return null;
  }
}

export async function sendCopilotMessage(message, portfolioId = null) {
  const res = await fetch(`${API_BASE_URL}/copilot/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message, portfolio_id: portfolioId })
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: "Failed to query Copilot" }));
    throw new Error(err.detail || "Copilot inference error");
  }
  return await res.json();
}

export async function fetchCopilotHistory(portfolioId = null) {
  const url = portfolioId
    ? `${API_BASE_URL}/copilot/history?portfolio_id=${portfolioId}`
    : `${API_BASE_URL}/copilot/history`;
  const res = await fetch(url);
  if (!res.ok) return { messages: [] };
  return await res.json();
}

export async function clearCopilotHistory(portfolioId = null) {
  const url = portfolioId
    ? `${API_BASE_URL}/copilot/history?portfolio_id=${portfolioId}`
    : `${API_BASE_URL}/copilot/history`;
  const res = await fetch(url, { method: "DELETE" });
  if (!res.ok) throw new Error("Failed to clear history");
  return await res.json();
}

export async function fetchPersonas() {
  const res = await fetch(`${API_BASE_URL}/auth/personas`);
  if (!res.ok) throw new Error("Failed to fetch demo personas");
  return await res.json();
}

export async function loginUser(payload) {
  const res = await fetch(`${API_BASE_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: "Login failed" }));
    throw new Error(err.detail || "Authentication failed");
  }
  return await res.json();
}

export async function registerUser(payload) {
  const res = await fetch(`${API_BASE_URL}/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: "Registration failed" }));
    throw new Error(err.detail || "Onboarding failed");
  }
  return await res.json();
}

export async function fetchGuestSession() {
  const res = await fetch(`${API_BASE_URL}/auth/guest`);
  if (!res.ok) throw new Error("Failed to initialize guest session");
  return await res.json();
}



