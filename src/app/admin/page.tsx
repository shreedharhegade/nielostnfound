"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

type SummaryData = {
  totalItems: number;
  openItems: number;
  resolvedItems: number;
  expiredItems: number;
  totalClaims: number;
  resolutionRate: number;
};

type CategoryStat = { _id: string; count: number };

type Item = {
  _id: string;
  title: string;
  type: string;
  category: string;
  status: string;
  reporterEmail: string;
  imageUrl?: string;
  createdAt: string;
  deletedAt: string | null;
};

type Log = {
  _id: string;
  adminEmail: string;
  action: string;
  targetId?: string;
  details?: string;
  createdAt: string;
};

type View = "analytics" | "items" | "logs";

export default function AdminPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [view, setView] = useState<View>("analytics");
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState<SummaryData | null>(null);
  const [byCategory, setByCategory] = useState<CategoryStat[]>([]);
  const [items, setItems] = useState<Item[]>([]);
  const [logs, setLogs] = useState<Log[]>([]);
  const [actionMsg, setActionMsg] = useState("");

  useEffect(() => {
    if (status === "unauthenticated") router.push("/");
  }, [status, router]);

  useEffect(() => {
    fetchView();
  }, [view]);

  async function fetchView() {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin?view=${view}`);
      if (res.status === 403) { router.push("/"); return; }
      const data = await res.json();
      if (!data.success) return;

      if (view === "analytics") {
        setSummary(data.data.summary);
        setByCategory(data.data.byCategory);
      } else if (view === "items") {
        setItems(data.data);
      } else {
        setLogs(data.data);
      }
    } finally {
      setLoading(false);
    }
  }

  async function handleItemAction(id: string, action: "resolve" | "delete") {
    const endpoint = `/api/items/${id}`;
    const body = action === "resolve" ? { status: "resolved" } : undefined;
    const method = action === "delete" ? "DELETE" : "PATCH";
    const res = await fetch(endpoint, {
      method,
      headers: { "Content-Type": "application/json" },
      body: body ? JSON.stringify(body) : undefined,
    });
    if (res.ok) {
      setActionMsg(`Item ${action === "delete" ? "deleted" : "resolved"} successfully`);
      fetchView();
      setTimeout(() => setActionMsg(""), 3000);
    }
  }

  if (status === "loading") return <main><div className="text-center mt-2">Loading...</div></main>;

  const navStyle = (v: View): React.CSSProperties => ({
    padding: "0.5rem 1.25rem",
    borderRadius: "8px",
    border: "none",
    cursor: "pointer",
    fontWeight: 500,
    background: view === v ? "var(--primary)" : "transparent",
    color: view === v ? "white" : "var(--text-muted)",
    transition: "all 0.2s",
  });

  return (
    <main>
      <div className="dashboard-header">
        <div>
          <h1 className="page-title">Admin Panel</h1>
          <p style={{ color: "var(--text-muted)" }}>Moderation &amp; analytics — NIE Lost &amp; Found</p>
        </div>
        <div style={{ display: "flex", gap: "0.5rem", background: "var(--surface-color)", padding: "0.4rem", borderRadius: "10px", border: "1px solid var(--border-color)" }}>
          <button style={navStyle("analytics")} onClick={() => setView("analytics")}>Analytics</button>
          <button style={navStyle("items")} onClick={() => setView("items")}>All Items</button>
          <button style={navStyle("logs")} onClick={() => setView("logs")}>Audit Logs</button>
        </div>
      </div>

      {actionMsg && <div className="alert alert-success">{actionMsg}</div>}

      {loading ? (
        <div className="text-center mt-2" style={{ color: "var(--text-muted)" }}>Loading...</div>
      ) : (
        <>
          {view === "analytics" && summary && (
            <div>
              {/* Summary cards */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))", gap: "1rem", marginBottom: "2rem" }}>
                {[
                  { label: "Total items", value: summary.totalItems, color: "var(--primary)" },
                  { label: "Open", value: summary.openItems, color: "#3b82f6" },
                  { label: "Resolved", value: summary.resolvedItems, color: "#10b981" },
                  { label: "Expired", value: summary.expiredItems, color: "#8c8176" },
                  { label: "Claims", value: summary.totalClaims, color: "#f59e0b" },
                  { label: "Resolution rate", value: `${summary.resolutionRate}%`, color: "#6366f1" },
                ].map(({ label, value, color }) => (
                  <div key={label} className="custom-card" style={{ padding: "1.25rem", textAlign: "center" }}>
                    <div style={{ fontSize: "2rem", fontWeight: 700, color }}>{value}</div>
                    <div style={{ fontSize: "0.8rem", color: "var(--text-muted)", marginTop: "0.25rem" }}>{label}</div>
                  </div>
                ))}
              </div>

              {/* Category breakdown */}
              <div className="custom-card">
                <h3 style={{ marginBottom: "1.25rem", color: "var(--text-main)" }}>Items by category</h3>
                {byCategory.map(({ _id, count }) => {
                  const pct = summary.totalItems > 0 ? Math.round((count / summary.totalItems) * 100) : 0;
                  return (
                    <div key={_id} style={{ marginBottom: "0.75rem" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.875rem", marginBottom: "0.3rem" }}>
                        <span>{_id}</span>
                        <span style={{ color: "var(--text-muted)" }}>{count} ({pct}%)</span>
                      </div>
                      <div style={{ height: "6px", background: "var(--border-color)", borderRadius: "3px", overflow: "hidden" }}>
                        <div style={{ width: `${pct}%`, height: "100%", background: "var(--primary)", borderRadius: "3px", transition: "width 0.6s ease" }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {view === "items" && (
            <div className="custom-card" style={{ padding: "0", overflow: "hidden" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.875rem" }}>
                <thead>
                  <tr style={{ background: "var(--bg-color)", borderBottom: "1px solid var(--border-color)" }}>
                    {["Title", "Image", "Type", "Category", "Status", "Reporter", "Created", "Actions"].map((h) => (
                      <th key={h} style={{ padding: "0.875rem 1rem", textAlign: "left", fontWeight: 600, color: "var(--text-muted)" }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {items.map((item) => (
                    <tr key={item._id} style={{ borderBottom: "1px solid var(--border-color)", opacity: item.deletedAt ? 0.5 : 1 }}>
                      <td style={{ padding: "0.75rem 1rem", maxWidth: "180px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{item.title}</td>
                      <td style={{ padding: "0.75rem 1rem" }}>
                        {item.imageUrl ? (
                          <a href={item.imageUrl} target="_blank" rel="noopener noreferrer">
                            <img 
                              src={item.imageUrl} 
                              alt="Thumbnail" 
                              style={{ width: "40px", height: "40px", objectFit: "cover", borderRadius: "4px", border: "1px solid var(--border-color)" }} 
                            />
                          </a>
                        ) : (
                          <span style={{ color: "var(--text-muted)", fontSize: "0.7rem" }}>No image</span>
                        )}
                      </td>
                      <td style={{ padding: "0.75rem 1rem" }}>
                        <span style={{ background: item.type === "lost" ? "rgba(220,38,38,0.1)" : "rgba(5,150,105,0.1)", color: item.type === "lost" ? "#dc2626" : "#059669", padding: "0.2rem 0.6rem", borderRadius: "12px", fontSize: "0.75rem", fontWeight: 600 }}>
                          {item.type.toUpperCase()}
                        </span>
                      </td>
                      <td style={{ padding: "0.75rem 1rem" }}>{item.category}</td>
                      <td style={{ padding: "0.75rem 1rem" }}>{item.deletedAt ? "deleted" : item.status}</td>
                      <td style={{ padding: "0.75rem 1rem", maxWidth: "160px", overflow: "hidden", textOverflow: "ellipsis" }}>{item.reporterEmail}</td>
                      <td style={{ padding: "0.75rem 1rem", whiteSpace: "nowrap" }}>{new Date(item.createdAt).toLocaleDateString()}</td>
                      <td style={{ padding: "0.75rem 1rem" }}>
                        {!item.deletedAt && (
                          <div style={{ display: "flex", gap: "0.4rem" }}>
                            {item.status !== "resolved" && (
                              <button onClick={() => handleItemAction(item._id, "resolve")} style={{ padding: "0.3rem 0.6rem", background: "#10b981", color: "white", border: "none", borderRadius: "4px", cursor: "pointer", fontSize: "0.75rem" }}>
                                Resolve
                              </button>
                            )}
                            <button onClick={() => handleItemAction(item._id, "delete")} style={{ padding: "0.3rem 0.6rem", background: "transparent", color: "var(--danger)", border: "1px solid var(--danger)", borderRadius: "4px", cursor: "pointer", fontSize: "0.75rem" }}>
                              Delete
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {view === "logs" && (
            <div className="custom-card" style={{ padding: "0", overflow: "hidden" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.875rem" }}>
                <thead>
                  <tr style={{ background: "var(--bg-color)", borderBottom: "1px solid var(--border-color)" }}>
                    {["Admin", "Action", "Target", "Details", "Time"].map((h) => (
                      <th key={h} style={{ padding: "0.875rem 1rem", textAlign: "left", fontWeight: 600, color: "var(--text-muted)" }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {logs.map((log) => (
                    <tr key={log._id} style={{ borderBottom: "1px solid var(--border-color)" }}>
                      <td style={{ padding: "0.75rem 1rem" }}>{log.adminEmail}</td>
                      <td style={{ padding: "0.75rem 1rem" }}>
                        <code style={{ background: "var(--bg-color)", padding: "0.15rem 0.4rem", borderRadius: "4px", fontSize: "0.8rem" }}>{log.action}</code>
                      </td>
                      <td style={{ padding: "0.75rem 1rem", fontSize: "0.75rem", color: "var(--text-muted)" }}>{log.targetId ?? "—"}</td>
                      <td style={{ padding: "0.75rem 1rem" }}>{log.details ?? "—"}</td>
                      <td style={{ padding: "0.75rem 1rem", whiteSpace: "nowrap", color: "var(--text-muted)" }}>{new Date(log.createdAt).toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
    </main>
  );
}
