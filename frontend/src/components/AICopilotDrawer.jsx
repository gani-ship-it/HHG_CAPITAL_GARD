import React, { useState, useEffect, useRef } from "react";
import {
  MessageSquare,
  X,
  Send,
  Trash2,
  ShieldCheck,
  Zap,
  Sparkles,
  Bot,
  User,
  Info,
  ChevronRight,
  ExternalLink,
  Lock
} from "lucide-react";
import * as api from "../api";

function parseInlineMarkdown(text) {
  if (!text) return "";
  const regex = /(\*\*[^*]+\*\*|\*[^*]+\*)/g;
  const parts = text.split(regex);
  return parts.map((part, i) => {
    if (part.startsWith("**") && part.endsWith("**") && part.length > 4) {
      return <strong key={i} style={{ fontWeight: 600 }}>{part.slice(2, -2)}</strong>;
    }
    if (part.startsWith("*") && part.endsWith("*") && part.length > 2) {
      return <em key={i}>{part.slice(1, -1)}</em>;
    }
    return part;
  });
}

function renderFormattedMessage(content) {
  if (!content) return null;
  const lines = content.split("\n");
  return lines.map((line, idx) => {
    const trimmed = line.trim();
    if (!trimmed) {
      return <div key={idx} style={{ height: "0.4rem" }} />;
    }
    const isBullet = trimmed.startsWith("• ") || trimmed.startsWith("- ") || (trimmed.startsWith("* ") && !trimmed.startsWith("**"));
    const textContent = isBullet ? trimmed.slice(2) : line;
    return (
      <div
        key={idx}
        style={{
          marginBottom: "0.2rem",
          display: isBullet ? "flex" : "block",
          alignItems: "flex-start",
          gap: "0.35rem"
        }}
      >
        {isBullet && <span style={{ color: "#6B7280", userSelect: "none" }}>•</span>}
        <span>{parseInlineMarkdown(textContent)}</span>
      </div>
    );
  });
}

export default function AICopilotDrawer({ isOpen, onClose, portfolio, macroIndicators }) {
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [engineStatus, setEngineStatus] = useState(null);
  const messagesEndRef = useRef(null);

  const SUGGESTED_PROMPTS = [
    "What does this website do?",
    "Why was Equity capped at 30%?",
    "Should we execute Rebalance considering 15 bps friction?",
    "Explain our 95% Historical VaR to the Board.",
    "What is the impact of FRED 10Y Treasury yield on our bonds?",
    "What prevents confidential bank data from leaking to the AI?"
  ];

  useEffect(() => {
    if (isOpen) {
      loadStatusAndHistory();
    }
  }, [isOpen, portfolio?.id]);

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  async function loadStatusAndHistory() {
    try {
      const [status, hist] = await Promise.all([
        api.fetchCopilotStatus(),
        api.fetchCopilotHistory(portfolio?.id)
      ]);
      if (status) setEngineStatus(status);
      if (hist && hist.messages) {
        if (hist.messages.length === 0) {
          setMessages([
            {
              role: "assistant",
              content:
                "**Welcome to Capital Guard Copilot.**\n\nI am your quantitative portfolio and risk co-pilot. I have live access to your active **CVXPY mathematical solver**, regulatory bounds, transaction cost models, and real-time **FRED Federal Reserve yields**.\n\nHow may I assist your risk committee today?",
              source_badge: status?.groq_active
                ? "Groq LPU (Llama 3.3 70B · 0.3s)"
                : "Deterministic Air-Gapped Engine",
              timestamp: new Date().toISOString()
            }
          ]);
        } else {
          setMessages(hist.messages);
        }
      }
    } catch (err) {
      console.warn("Failed to load Copilot state:", err);
    }
  }

  async function handleSend(textToSend) {
    const text = textToSend || inputMessage;
    if (!text.trim() || loading) return;

    const userMsg = {
      role: "user",
      content: text.trim(),
      timestamp: new Date().toISOString()
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputMessage("");
    setLoading(true);

    try {
      const response = await api.sendCopilotMessage(text.trim(), portfolio?.id);
      const assistantMsg = {
        role: "assistant",
        content: response.reply,
        source_badge: response.source_badge,
        timestamp: response.timestamp || new Date().toISOString()
      };
      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: `⚠️ **Inference Advisory:** ${err.message || "Unable to reach Copilot service."}`,
          source_badge: "Error Fallback",
          timestamp: new Date().toISOString()
        }
      ]);
    } finally {
      setLoading(false);
    }
  }

  async function handleClear() {
    if (window.confirm("Clear this portfolio's conversation history?")) {
      try {
        await api.clearCopilotHistory(portfolio?.id);
        setMessages([
          {
            role: "assistant",
            content: "Conversation history cleared. Memory reset for the active portfolio.",
            source_badge: "System",
            timestamp: new Date().toISOString()
          }
        ]);
      } catch (err) {
        alert("Failed to clear history: " + err.message);
      }
    }
  }

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  if (!isOpen) return null;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9999,
        background: "rgba(0, 0, 0, 0.45)",
        backdropFilter: "blur(2px)",
        display: "flex",
        justifyContent: "flex-end"
      }}
      onClick={onClose}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "520px",
          height: "100%",
          background: "#FFFFFF",
          color: "#111111",
          boxShadow: "-8px 0 28px rgba(0, 0, 0, 0.25)",
          display: "flex",
          flexDirection: "column",
          position: "relative",
          animation: "slideInRight 0.25s cubic-bezier(0.16, 1, 0.3, 1)"
        }}
        onClick={(e) => e.stopPropagation()}
      >
                <div
          style={{
            padding: "1rem 1.25rem",
            background: "#0D0D0D",
            color: "#FFFFFF",
            display: "flex",
            flexDirection: "column",
            gap: "0.5rem",
            borderBottom: "1px solid #262626"
          }}
        >
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <div
                style={{
                  width: "28px",
                  height: "28px",
                  borderRadius: "6px",
                  background: "#222222",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  border: "1px solid #444444"
                }}
              >
                <Bot size={16} color="#FFFFFF" />
              </div>
              <div>
                <h3 style={{ margin: 0, fontSize: "14px", fontWeight: "700", letterSpacing: "0.5px" }}>
                  CAPITAL GUARD AI COPILOT
                </h3>
                <div style={{ fontSize: "11px", color: "#A3A3A3" }}>
                  Quantitative Risk & Decision Explainer
                </div>
              </div>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <button
                onClick={handleClear}
                title="Clear Conversation History"
                style={{
                  background: "transparent",
                  border: "none",
                  color: "#888888",
                  cursor: "pointer",
                  padding: "4px",
                  borderRadius: "4px"
                }}
              >
                <Trash2 size={16} />
              </button>
              <button
                onClick={onClose}
                title="Close Copilot Drawer"
                style={{
                  background: "transparent",
                  border: "none",
                  color: "#D4D4D4",
                  cursor: "pointer",
                  padding: "4px",
                  borderRadius: "4px"
                }}
              >
                <X size={18} />
              </button>
            </div>
          </div>

                    <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              background: "#171717",
              padding: "0.35rem 0.65rem",
              borderRadius: "4px",
              fontSize: "11px",
              border: "1px solid #2B2B2B"
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "0.35rem", color: "#E5E5E5" }}>
              <Zap size={13} color="#FFFFFF" />
              <span>
                {engineStatus?.groq_active
                  ? "Groq LPU (Llama 3.3 70B · 0.3s)"
                  : "Institutional Air-Gapped Engine"}
              </span>
            </div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.25rem",
                color: "#10B981",
                fontSize: "10px",
                fontWeight: "600"
              }}
            >
              <Lock size={11} />
              <span>ZDR Zero-Leakage</span>
            </div>
          </div>

                    {portfolio && (
            <div
              style={{
                fontSize: "10px",
                color: "#999999",
                display: "flex",
                gap: "0.5rem",
                flexWrap: "wrap",
                borderTop: "1px dashed #2B2B2B",
                paddingTop: "0.35rem"
              }}
            >
              <span>🏛️ {portfolio.org_name || "Apex Reserve Bank"}</span>
              <span>•</span>
              <span>💰 {portfolio.currency} {(portfolio.total_capital / 10000000).toFixed(0)} Cr</span>
              <span>•</span>
              <span style={{ color: portfolio.status === "SAFE" ? "#34D399" : "#F87171" }}>
                {portfolio.status === "SAFE" ? "🟢 SAFE" : "🔴 BREACH"}
              </span>
            </div>
          )}
        </div>

                <div
          style={{
            flex: 1,
            overflowY: "auto",
            padding: "1rem",
            background: "#F9FAFB",
            display: "flex",
            flexDirection: "column",
            gap: "0.85rem"
          }}
        >
          {messages.map((msg, idx) => {
            const isUser = msg.role === "user";
            return (
              <div
                key={idx}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: isUser ? "flex-end" : "flex-start",
                  gap: "0.2rem"
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.35rem",
                    fontSize: "10px",
                    color: "#6B7280",
                    padding: "0 0.25rem"
                  }}
                >
                  {isUser ? (
                    <>
                      <span>CRO Officer</span>
                      <User size={11} />
                    </>
                  ) : (
                    <>
                      <Bot size={11} />
                      <span>Capital Copilot</span>
                      {msg.source_badge && (
                        <span
                          style={{
                            background: "#E5E7EB",
                            color: "#374151",
                            padding: "1px 5px",
                            borderRadius: "3px",
                            fontSize: "9px"
                          }}
                        >
                          {msg.source_badge}
                        </span>
                      )}
                    </>
                  )}
                </div>

                <div
                  style={{
                    maxWidth: "88%",
                    padding: "0.75rem 0.95rem",
                    borderRadius: isUser ? "12px 12px 2px 12px" : "12px 12px 12px 2px",
                    background: isUser ? "#111111" : "#FFFFFF",
                    color: isUser ? "#FFFFFF" : "#1F2937",
                    border: isUser ? "none" : "1px solid #E5E7EB",
                    boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
                    fontSize: "13px",
                    lineHeight: "1.55",
                    whiteSpace: "pre-wrap",
                    wordBreak: "break-word"
                  }}
                >
                  {renderFormattedMessage(msg.content)}
                </div>

                <div style={{ fontSize: "9px", color: "#9CA3AF", padding: "0 0.35rem" }}>
                  {msg.timestamp ? new Date(msg.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : ""}
                </div>
              </div>
            );
          })}

          {loading && (
            <div style={{ display: "flex", alignItems: "flex-start", gap: "0.5rem" }}>
              <div
                style={{
                  background: "#FFFFFF",
                  border: "1px solid #E5E7EB",
                  padding: "0.6rem 0.9rem",
                  borderRadius: "12px 12px 12px 2px",
                  fontSize: "12px",
                  color: "#6B7280",
                  display: "flex",
                  alignItems: "center",
                  gap: "0.5rem"
                }}
              >
                <div
                  style={{
                    width: "8px",
                    height: "8px",
                    borderRadius: "50%",
                    background: "#111111",
                    animation: "pulse 1s infinite"
                  }}
                />
                Analyzing CVXPY constraints, risk delta & FRED macro yields...
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

                <div
          style={{
            padding: "0.5rem 1rem",
            background: "#FFFFFF",
            borderTop: "1px solid #F3F4F6",
            overflowX: "auto",
            display: "flex",
            gap: "0.4rem",
            whiteSpace: "nowrap",
            scrollbarWidth: "none"
          }}
        >
          {SUGGESTED_PROMPTS.map((prompt, pIdx) => (
            <button
              key={pIdx}
              onClick={() => handleSend(prompt)}
              disabled={loading}
              style={{
                fontSize: "11px",
                padding: "0.3rem 0.65rem",
                borderRadius: "16px",
                background: "#F3F4F6",
                color: "#374151",
                border: "1px solid #E5E7EB",
                cursor: loading ? "not-allowed" : "pointer",
                display: "inline-flex",
                alignItems: "center",
                gap: "0.3rem",
                transition: "all 0.15s ease"
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "#111111";
                e.currentTarget.style.color = "#FFFFFF";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "#F3F4F6";
                e.currentTarget.style.color = "#374151";
              }}
            >
              <Sparkles size={11} />
              <span>{prompt}</span>
            </button>
          ))}
        </div>

                <div
          style={{
            padding: "0.85rem 1rem 1rem 1rem",
            background: "#FFFFFF",
            borderTop: "1px solid #E5E7EB"
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
              background: "#F9FAFB",
              border: "1px solid #D1D5DB",
              borderRadius: "8px",
              padding: "0.35rem 0.5rem 0.35rem 0.75rem"
            }}
          >
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={loading}
              placeholder="Ask Copilot about constraints, VaR, FRED yields, friction..."
              style={{
                flex: 1,
                border: "none",
                background: "transparent",
                fontSize: "13px",
                color: "#111111",
                outline: "none"
              }}
            />
            <button
              onClick={() => handleSend()}
              disabled={!inputMessage.trim() || loading}
              style={{
                background: inputMessage.trim() && !loading ? "#111111" : "#D1D5DB",
                color: "#FFFFFF",
                border: "none",
                borderRadius: "6px",
                width: "32px",
                height: "32px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: inputMessage.trim() && !loading ? "pointer" : "not-allowed",
                transition: "background 0.2s"
              }}
            >
              <Send size={15} />
            </button>
          </div>

          <div
            style={{
              marginTop: "0.45rem",
              fontSize: "10px",
              color: "#9CA3AF",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between"
            }}
          >
            <span style={{ display: "flex", alignItems: "center", gap: "0.25rem" }}>
              <ShieldCheck size={12} color="#10B981" />
              <span>Zero-Leakage Vector Masking · Enterprise ZDR Enforced</span>
            </span>
            <span>Press Enter to send</span>
          </div>
        </div>
      </div>
    </div>
  );
}
