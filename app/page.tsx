"use client";

import { useState } from "react";

const TOKENS = [
  { label: "Admin (Alice)", value: "token-admin", role: "admin" },
  { label: "Editor (Bob)", value: "token-editor", role: "editor" },
  { label: "Viewer (Carol)", value: "token-viewer", role: "viewer" },
  { label: "Guest (Dave)", value: "token-guest", role: "guest" },
  { label: "Viewer + reports:write (Eve)", value: "token-viewer-plus", role: "viewer" },
];

const ENDPOINTS = [
  { label: "GET /api/dashboard", method: "GET", path: "/api/dashboard", action: "dashboard:read" },
  { label: "GET /api/reports", method: "GET", path: "/api/reports", action: "reports:read" },
  { label: "POST /api/reports/export", method: "POST", path: "/api/reports/export", action: "reports:export" },
  { label: "GET /api/admin", method: "GET", path: "/api/admin", action: "admin:read" },
];

const ROLE_COLORS: Record<string, string> = {
  admin: "#22c55e",
  editor: "#3b82f6",
  viewer: "#a78bfa",
  guest: "#94a3b8",
};

export default function Home() {
  const [selectedToken, setSelectedToken] = useState(TOKENS[0].value);
  const [results, setResults] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState<Record<string, boolean>>({});

  const currentUser = TOKENS.find((t) => t.value === selectedToken)!;

  async function callEndpoint(endpoint: (typeof ENDPOINTS)[0]) {
    setLoading((p) => ({ ...p, [endpoint.path]: true }));
    try {
      const res = await fetch(`${endpoint.path}?token=${selectedToken}`, {
        method: endpoint.method,
      });
      const data = await res.json();
      setResults((p) => ({
        ...p,
        [endpoint.path]: { status: res.status, ok: res.ok, data },
      }));
    } catch (e: any) {
      setResults((p) => ({
        ...p,
        [endpoint.path]: { status: 0, ok: false, data: { error: e.message } },
      }));
    } finally {
      setLoading((p) => ({ ...p, [endpoint.path]: false }));
    }
  }

  async function callAll() {
    for (const ep of ENDPOINTS) {
      await callEndpoint(ep);
    }
  }

  return (
    <main style={{ minHeight: "100vh", background: "#0a0a0f", color: "#e2e8f0", fontFamily: "'Berkeley Mono', 'Fira Code', 'Courier New', monospace" }}>
      {/* Header */}
      <div style={{ borderBottom: "1px solid #1e293b", padding: "24px 40px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div>
          <div style={{ fontSize: "11px", letterSpacing: "0.2em", color: "#475569", marginBottom: "4px" }}>AUTHORIZATION PLAYGROUND</div>
          <h1 style={{ margin: 0, fontSize: "20px", fontWeight: 600, color: "#f1f5f9" }}>Next.js × OPA</h1>
        </div>
        <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
          <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#22c55e", boxShadow: "0 0 8px #22c55e" }} />
          <span style={{ fontSize: "12px", color: "#64748b" }}>OPA running on :8181</span>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "320px 1fr", minHeight: "calc(100vh - 73px)" }}>

        {/* Left panel - identity selector */}
        <div style={{ borderRight: "1px solid #1e293b", padding: "32px 24px" }}>
          <div style={{ fontSize: "11px", letterSpacing: "0.15em", color: "#475569", marginBottom: "16px" }}>IDENTITY</div>

          {TOKENS.map((t) => (
            <button
              key={t.value}
              onClick={() => { setSelectedToken(t.value); setResults({}); }}
              style={{
                width: "100%",
                padding: "12px 16px",
                marginBottom: "8px",
                background: selectedToken === t.value ? "#0f172a" : "transparent",
                border: `1px solid ${selectedToken === t.value ? ROLE_COLORS[t.role] : "#1e293b"}`,
                borderRadius: "6px",
                color: selectedToken === t.value ? "#f1f5f9" : "#64748b",
                cursor: "pointer",
                textAlign: "left",
                transition: "all 0.15s",
              }}
            >
              <div style={{ fontSize: "13px", marginBottom: "4px" }}>{t.label}</div>
              <div style={{ fontSize: "11px", color: ROLE_COLORS[t.role], letterSpacing: "0.1em" }}>
                {t.role.toUpperCase()}
              </div>
            </button>
          ))}

          <div style={{ marginTop: "32px", padding: "16px", background: "#0f172a", border: "1px solid #1e293b", borderRadius: "6px" }}>
            <div style={{ fontSize: "11px", color: "#475569", marginBottom: "8px", letterSpacing: "0.1em" }}>TOKEN</div>
            <code style={{ fontSize: "11px", color: "#94a3b8", wordBreak: "break-all" }}>{selectedToken}</code>
          </div>

          <div style={{ marginTop: "16px", padding: "16px", background: "#0f172a", border: "1px solid #1e293b", borderRadius: "6px" }}>
            <div style={{ fontSize: "11px", color: "#475569", marginBottom: "8px", letterSpacing: "0.1em" }}>HOW IT WORKS</div>
            <p style={{ fontSize: "12px", color: "#64748b", lineHeight: 1.6, margin: 0 }}>
              Token is passed as <code style={{ color: "#94a3b8" }}>?token=</code> query param.
              Middleware extracts the user, calls OPA at <code style={{ color: "#94a3b8" }}>/v1/data/authz</code>,
              and either forwards the request or returns 401/403.
              Route handlers have zero auth logic.
            </p>
          </div>
        </div>

        {/* Right panel - endpoints */}
        <div style={{ padding: "32px 40px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
            <div style={{ fontSize: "11px", letterSpacing: "0.15em", color: "#475569" }}>PROTECTED ENDPOINTS</div>
            <button
              onClick={callAll}
              style={{
                padding: "8px 20px",
                background: "transparent",
                border: "1px solid #334155",
                borderRadius: "6px",
                color: "#94a3b8",
                cursor: "pointer",
                fontSize: "12px",
                letterSpacing: "0.05em",
              }}
            >
              Test All →
            </button>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            {ENDPOINTS.map((ep) => {
              const result = results[ep.path];
              const isLoading = loading[ep.path];

              return (
                <div
                  key={ep.path}
                  style={{
                    border: "1px solid #1e293b",
                    borderRadius: "8px",
                    overflow: "hidden",
                  }}
                >
                  {/* Endpoint header */}
                  <div style={{ padding: "16px 20px", background: "#0d1117", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                      <span style={{
                        fontSize: "10px",
                        padding: "3px 8px",
                        borderRadius: "4px",
                        background: ep.method === "GET" ? "#1e3a5f" : "#3b1f5e",
                        color: ep.method === "GET" ? "#60a5fa" : "#c084fc",
                        letterSpacing: "0.1em",
                        fontWeight: 700,
                      }}>
                        {ep.method}
                      </span>
                      <code style={{ fontSize: "14px", color: "#e2e8f0" }}>{ep.path}</code>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                      <span style={{ fontSize: "11px", color: "#475569" }}>
                        requires: <code style={{ color: "#fb923c" }}>{ep.action}</code>
                      </span>
                      <button
                        onClick={() => callEndpoint(ep)}
                        disabled={isLoading}
                        style={{
                          padding: "6px 16px",
                          background: isLoading ? "#1e293b" : "#1e3a5f",
                          border: "1px solid #2d4a7a",
                          borderRadius: "4px",
                          color: "#60a5fa",
                          cursor: isLoading ? "default" : "pointer",
                          fontSize: "12px",
                        }}
                      >
                        {isLoading ? "..." : "Send"}
                      </button>
                    </div>
                  </div>

                  {/* Response */}
                  {result && (
                    <div style={{ padding: "16px 20px", background: "#080d12", borderTop: "1px solid #1e293b" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "12px" }}>
                        <span style={{
                          fontSize: "12px",
                          fontWeight: 700,
                          color: result.ok ? "#22c55e" : result.status === 401 ? "#f59e0b" : "#ef4444",
                          padding: "2px 8px",
                          border: `1px solid ${result.ok ? "#166534" : result.status === 401 ? "#78350f" : "#7f1d1d"}`,
                          borderRadius: "4px",
                        }}>
                          {result.status} {result.ok ? "OK" : result.status === 401 ? "UNAUTHORIZED" : "FORBIDDEN"}
                        </span>
                        {!result.ok && result.data.requiredAction && (
                          <span style={{ fontSize: "11px", color: "#64748b" }}>
                            {currentUser.label} ({currentUser.role}) lacks <code style={{ color: "#fb923c" }}>{result.data.requiredAction}</code>
                          </span>
                        )}
                      </div>
                      <pre style={{
                        margin: 0,
                        fontSize: "12px",
                        color: "#94a3b8",
                        lineHeight: 1.6,
                        overflow: "auto",
                        maxHeight: "200px",
                      }}>
                        {JSON.stringify(result.data, null, 2)}
                      </pre>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </main>
  );
}
