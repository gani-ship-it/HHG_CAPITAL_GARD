import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

// ── One-time migration: clear the legacy hardcoded demo user ──────────────
// The previous build stored a fake "Dr. Elena Vance" persona in localStorage.
// Remove it so users start with a clean unauthenticated state.
try {
  const stored = localStorage.getItem("capital_guard_user");
  if (stored) {
    const parsed = JSON.parse(stored);
    // Detect the old hardcoded demo persona and clear it
    if (parsed?.id === "cro-institutional-01" || parsed?.isDemo === true) {
      localStorage.removeItem("capital_guard_user");
    }
  }
} catch {
  localStorage.removeItem("capital_guard_user");
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
