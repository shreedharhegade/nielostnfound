"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import "./page.css";

type Item = {
  _id: string;
  title: string;
  description: string;
  type: "lost" | "found";
  category: string;
  location: string;
  date: string;
  imageUrl?: string;
  reporterName: string;
  reporterEmail: string;
  reporterPhone?: string;
  status: string;
};

type Pagination = { page: number; pageSize: number; total: number; totalPages: number };

const CATEGORIES = ["All", "Electronics", "Keys", "Documents", "Clothing", "Other"];

function SkeletonCard() {
  return (
    <div className="custom-card item-card skeleton-card">
      <div className="skeleton skeleton-image" />
      <div className="item-content">
        <div className="skeleton skeleton-title" />
        <div className="skeleton skeleton-text" />
        <div className="skeleton skeleton-text short" />
        <div className="meta-actions" style={{ marginTop: "1.5rem" }}>
          <div className="skeleton" style={{ height: "32px", flex: 1 }} />
          <div className="skeleton" style={{ height: "32px", flex: 1 }} />
        </div>
      </div>
    </div>
  );
}

function ItemDetailModal({ item, onClose }: { item: Item; onClose: () => void }) {
  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", handler);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handler);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  return (
    <div
      className="modal-overlay item-detail-overlay"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
      role="dialog"
      aria-modal="true"
      aria-label={item.title}
    >
      <div className="item-detail-modal">
        {/* Close button */}
        <button className="detail-close-btn" onClick={onClose} aria-label="Close">
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" width="20" height="20">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Image section */}
        <div className="detail-image-section">
          <img
            src={item.imageUrl || "/default-item.svg"}
            alt={item.title}
            className="detail-image"
          />
          <div className="detail-badges">
            <span className={item.type === "lost" ? "item-badge-lost detail-badge" : "item-badge-found detail-badge"}>
              {item.type.toUpperCase()}
            </span>
            <span className="category-badge detail-badge">{item.category}</span>
          </div>
        </div>

        {/* Info section */}
        <div className="detail-info-section">
          <h2 className="detail-title">{item.title}</h2>
          <p className="detail-description">{item.description}</p>

          <div className="detail-meta-grid">
            <div className="detail-meta-item">
              <div className="detail-meta-label">
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" width="15" height="15">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.243-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                Location
              </div>
              <div className="detail-meta-value">{item.location}</div>
            </div>

            <div className="detail-meta-item">
              <div className="detail-meta-label">
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" width="15" height="15">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                Date &amp; Time
              </div>
              <div className="detail-meta-value">
                {new Date(item.date).toLocaleString("en-GB", { day: "2-digit", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit", hour12: true })}
              </div>
            </div>

            <div className="detail-meta-item">
              <div className="detail-meta-label">
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" width="15" height="15">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                Reported By
              </div>
              <div className="detail-meta-value">{item.reporterName}</div>
            </div>

            <div className="detail-meta-item">
              <div className="detail-meta-label">
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" width="15" height="15">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                </svg>
                Status
              </div>
              <div className="detail-meta-value">
                <span className={`status-pill status-${item.status}`}>{item.status.toUpperCase()}</span>
              </div>
            </div>
          </div>

          <div className="detail-actions">
            <Link href={`/claim/${item._id}`} className="btn-primary detail-claim-btn">
              {item.type === "lost" ? "📬 Respond to this Report" : "✋ Claim this Item"}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Home() {
  const [items, setItems] = useState<Item[]>([]);
  const [filter, setFilter] = useState<"all" | "lost" | "found">("all");
  const [category, setCategory] = useState("All");
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [page, setPage] = useState(1);

  // Detail modal
  const [selectedItem, setSelectedItem] = useState<Item | null>(null);

  // Reporting states
  const [reportingItemId, setReportingItemId] = useState<string | null>(null);
  const [reportReason, setReportReason] = useState("");
  const [submittingReport, setSubmittingReport] = useState(false);
  const [reportError, setReportError] = useState("");
  const [reportSuccess, setReportSuccess] = useState(false);

  const fetchItems = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filter !== "all") params.set("type", filter);
      if (category !== "All") params.set("category", category);
      if (search) params.set("search", search);
      params.set("page", String(page));

      const res = await fetch(`/api/items?${params.toString()}`);
      const data = await res.json();
      if (data.success) {
        setItems(data.data);
        setPagination(data.pagination);
      }
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  }, [filter, category, search, page]);

  const handleReportSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reportingItemId) return;
    setSubmittingReport(true);
    setReportError("");

    try {
      const res = await fetch("/api/reports", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ itemId: reportingItemId, reason: reportReason }),
      });
      const data = await res.json();
      if (data.success) {
        setReportSuccess(true);
        setReportReason("");
      } else {
        setReportError(data.error || "Failed to submit report");
      }
    } catch (err: any) {
      setReportError(err.message);
    } finally {
      setSubmittingReport(false);
    }
  };

  useEffect(() => { setPage(1); }, [filter, category, search]);
  useEffect(() => { fetchItems(); }, [fetchItems]);

  // Debounce search input
  useEffect(() => {
    const t = setTimeout(() => setSearch(searchInput), 400);
    return () => clearTimeout(t);
  }, [searchInput]);

  return (
    <main>
      <div className="dashboard-header">
        <div>
          <h1 className="page-title">Campus Hub</h1>
          <p style={{ color: "var(--text-muted)" }}>Lost &amp; Found listings at NIE</p>
        </div>
        <div className="filters">
          {(["all", "lost", "found"] as const).map((f) => (
            <button
              key={f}
              className={`filter-btn ${filter === f ? "active" : ""}`}
              onClick={() => setFilter(f)}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Search + Category bar */}
      <div className="search-bar">
        <div className="search-input-wrapper">
          <svg className="search-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            className="search-input"
            placeholder="Search items..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            aria-label="Search items"
          />
          {searchInput && (
            <button className="search-clear" onClick={() => { setSearchInput(""); setSearch(""); }} aria-label="Clear search">✕</button>
          )}
        </div>
        <div className="category-tabs" role="group" aria-label="Filter by category">
          {CATEGORIES.map((c) => (
            <button
              key={c}
              className={`category-btn ${category === c ? "active" : ""}`}
              onClick={() => setCategory(c)}
              aria-pressed={category === c}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="items-grid">
          {Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)}
        </div>
      ) : (
        <>
          {pagination && (
            <p className="results-count">
              {pagination.total} Report{pagination.total !== 1 ? "s" : ""} found
            </p>
          )}
          <div className="items-grid">
            {items.length === 0 ? (
              <div className="empty-state custom-card">
                <div className="empty-icon">🔍</div>
                <h3 style={{ color: "var(--text-main)", marginBottom: "0.5rem" }}>No items found</h3>
                <p>Try adjusting your filters or search terms.</p>
              </div>
            ) : (
              items.map((item) => (
                <div
                  key={item._id}
                  className="custom-card item-card"
                  onClick={() => setSelectedItem(item)}
                  role="button"
                  tabIndex={0}
                  aria-label={`View details for ${item.title}`}
                  onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); setSelectedItem(item); } }}
                >
                  <span className={item.type === "lost" ? "item-badge-lost" : "item-badge-found"}>
                    {item.type.toUpperCase()}
                  </span>
                  <span className="category-badge">{item.category}</span>

                  <div className="item-image-wrapper">
                    <img
                      src={item.imageUrl || "/default-item.svg"}
                      alt={item.title}
                      className="item-image"
                      loading="lazy"
                    />
                    <div className="card-hover-hint">
                      <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" width="20" height="20">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                      View Details
                    </div>
                  </div>

                  <div className="item-content">
                    <h3 className="item-title">{item.title}</h3>
                    <p className="item-desc">{item.description}</p>

                    <div className="item-meta">
                      <div className="meta-row">
                        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.243-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        {item.location}
                      </div>
                      <div className="meta-row">
                        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        {new Date(item.date).toLocaleString("en-GB", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit", hour12: true }).toUpperCase()}
                      </div>
                      <div className="meta-row">
                        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                        {item.reporterName}
                      </div>

                      <div className="meta-actions" onClick={(e) => e.stopPropagation()}>
                        <Link
                          href={`/claim/${item._id}`}
                          className="btn-contact btn-contact-claim"
                          onClick={(e) => e.stopPropagation()}
                        >
                          {item.type === "lost" ? "Respond" : "Claim"}
                        </Link>
                        <button
                          className="btn-report-flag"
                          onClick={(e) => { e.stopPropagation(); setReportingItemId(item._id); }}
                          title="Report this item"
                          aria-label="Report this item"
                        >
                          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" width="20" height="20">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 21v-4m0 0V5a2 2 0 012-2h6.5l1 1H21l-3 6 3 6h-8.5l-1-1H5a2 2 0 00-2 2zm9-13.5V9" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Pagination */}
          {pagination && pagination.totalPages > 1 && (
            <div className="pagination">
              <button
                className="page-btn"
                disabled={page <= 1}
                onClick={() => setPage((p) => p - 1)}
              >
                ← Prev
              </button>
              <span className="page-info">Page {page} of {pagination.totalPages}</span>
              <button
                className="page-btn"
                disabled={page >= pagination.totalPages}
                onClick={() => setPage((p) => p + 1)}
              >
                Next →
              </button>
            </div>
          )}
        </>
      )}

      {/* Item Detail Modal */}
      {selectedItem && (
        <ItemDetailModal item={selectedItem} onClose={() => setSelectedItem(null)} />
      )}

      {/* Report Modal */}
      {reportingItemId && (
        <div className="modal-overlay" onClick={() => { setReportingItemId(null); setReportSuccess(false); }}>
          <div className="modal-content report-modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Report Item</h2>
              <button className="close-btn" onClick={() => { setReportingItemId(null); setReportSuccess(false); }} aria-label="Close">✕</button>
            </div>
            {reportSuccess ? (
              <div style={{ textAlign: "center", padding: "2rem 1rem" }}>
                <div style={{ color: "#10b981", marginBottom: "1rem" }}>
                  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" width="48" height="48" style={{ margin: "0 auto", display: "block" }}>
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 style={{ marginBottom: "0.5rem", color: "var(--text-main)", fontSize: "1.25rem" }}>Report Submitted Successfully</h3>
                <p style={{ color: "var(--text-muted)", marginBottom: "1.5rem" }}>Thank you. Our team will review this item shortly.</p>
                <button type="button" className="btn-contact-claim" onClick={() => { setReportingItemId(null); setReportSuccess(false); }} style={{ padding: "0.6rem 1.25rem", borderRadius: "8px", fontWeight: 600, border: "none", cursor: "pointer" }}>
                  Close
                </button>
              </div>
            ) : (
              <form onSubmit={handleReportSubmit}>
                <p style={{ marginBottom: "1.5rem", color: "var(--text-muted)", fontSize: "0.95rem" }}>
                  If you believe this item is spam, contains misinformation, or is inappropriate, please let us know.
                </p>
                {reportError && <div className="alert alert-error" style={{ marginBottom: "1rem" }}>{reportError}</div>}
                <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                  <label htmlFor="reportReason" style={{ fontWeight: 600 }}>Reason for reporting</label>
                  <textarea
                    id="reportReason"
                    required
                    rows={4}
                    className="search-input"
                    style={{ height: "auto", padding: "1rem" }}
                    placeholder="Please provide details about why you are reporting this item..."
                    value={reportReason}
                    onChange={e => setReportReason(e.target.value)}
                  />
                </div>
                <div style={{ marginTop: "1.5rem", display: "flex", gap: "1rem", justifyContent: "flex-end" }}>
                  <button type="button" className="page-btn" onClick={() => { setReportingItemId(null); setReportSuccess(false); }}>Cancel</button>
                  <button type="submit" className="btn-contact-claim" disabled={submittingReport} style={{ padding: "0.6rem 1.25rem", borderRadius: "8px", fontWeight: 600, border: "none", cursor: submittingReport ? "not-allowed" : "pointer", opacity: submittingReport ? 0.7 : 1 }}>
                    {submittingReport ? "Submitting..." : "Submit Report"}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </main>
  );
}
