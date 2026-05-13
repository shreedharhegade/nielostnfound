"use client";

import { useEffect, useState, useCallback } from "react";
import { useSession } from "next-auth/react";
import { signIn } from "next-auth/react";
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
      </div>
    </div>
  );
}

function ItemDetailModal({ item, onClose, isLoggedIn }: { item: Item; onClose: () => void; isLoggedIn: boolean }) {
  // Close on Escape key
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", handler);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handler);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  const formattedDate = new Date(item.date).toLocaleString("en-IN", {
    weekday: "long", day: "numeric", month: "long", year: "numeric",
    hour: "2-digit", minute: "2-digit", hour12: true,
  });

  return (
    <div className="detail-overlay" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="detail-modal">
        {/* Close button */}
        <button className="detail-close" onClick={onClose} aria-label="Close">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        </button>

        <div className="detail-inner">
          {/* Image */}
          <div className="detail-image-wrapper">
            <img
              src={item.imageUrl || "/default-item.svg"}
              alt={item.title}
              className="detail-image"
            />
            <span className={item.type === "lost" ? "item-badge-lost detail-badge" : "item-badge-found detail-badge"}>
              {item.type.toUpperCase()}
            </span>
            <span className="category-badge detail-cat-badge">{item.category}</span>
          </div>

          {/* Content */}
          <div className="detail-content">
            <h2 className="detail-title">{item.title}</h2>
            <p className="detail-desc">{item.description}</p>

            <div className="detail-meta">
              <div className="detail-meta-row">
                <div className="detail-meta-icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M17.657 16.657L13.414 20.9a2 2 0 01-2.827 0l-4.243-4.243a8 8 0 1111.314 0z"/>
                    <path d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
                  </svg>
                </div>
                <div>
                  <span className="detail-meta-label">Location</span>
                  <span className="detail-meta-value">{item.location}</span>
                </div>
              </div>

              <div className="detail-meta-row">
                <div className="detail-meta-icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                    <line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/>
                    <line x1="3" y1="10" x2="21" y2="10"/>
                  </svg>
                </div>
                <div>
                  <span className="detail-meta-label">Date &amp; Time</span>
                  <span className="detail-meta-value">{formattedDate}</span>
                </div>
              </div>

              <div className="detail-meta-row">
                <div className="detail-meta-icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/>
                    <circle cx="12" cy="7" r="4"/>
                  </svg>
                </div>
                <div>
                  <span className="detail-meta-label">Reported by</span>
                  <span className="detail-meta-value">{item.reporterName}</span>
                </div>
              </div>

              <div className="detail-meta-row">
                <div className="detail-meta-icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20.59 13.41l-7.17 7.17a2 2 0 01-2.83 0L2 12V2h10l8.59 8.59a2 2 0 010 2.82z"/>
                    <line x1="7" y1="7" x2="7.01" y2="7"/>
                  </svg>
                </div>
                <div>
                  <span className="detail-meta-label">Category</span>
                  <span className="detail-meta-value">{item.category}</span>
                </div>
              </div>
            </div>

            {/* Contact section */}
            <div className="detail-contact">
              <h3 className="detail-contact-title">Contact Reporter</h3>
              {isLoggedIn ? (
                <div className="detail-contact-btns">
                  {item.reporterPhone && (
                    <a href={`tel:${item.reporterPhone}`} className="detail-btn-phone">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 9.8a19.79 19.79 0 01-3.07-8.64A2 2 0 012 1h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.09 8.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z"/>
                      </svg>
                      Call {item.reporterPhone}
                    </a>
                  )}
                  <a href={`mailto:${item.reporterEmail}`} className="detail-btn-email">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                      <polyline points="22,6 12,13 2,6"/>
                    </svg>
                    Email {item.reporterEmail}
                  </a>
                </div>
              ) : (
                <div className="detail-login-prompt">
                  <p>Login to view contact details and reach out to the reporter.</p>
                  <button className="btn-primary" onClick={() => signIn("google")}>
                    Login with Google
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Home() {
  const { data: session } = useSession();
  const [items, setItems] = useState<Item[]>([]);
  const [filter, setFilter] = useState<"all" | "lost" | "found">("all");
  const [category, setCategory] = useState("All");
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [page, setPage] = useState(1);
  const [selectedItem, setSelectedItem] = useState<Item | null>(null);

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
    } catch (e) { console.error(e); }
    setLoading(false);
  }, [filter, category, search, page]);

  useEffect(() => { setPage(1); }, [filter, category, search]);
  useEffect(() => { fetchItems(); }, [fetchItems]);
  useEffect(() => {
    const t = setTimeout(() => setSearch(searchInput), 400);
    return () => clearTimeout(t);
  }, [searchInput]);

  return (
    <main>
      {/* Header */}
      <div className="dashboard-header">
        <div>
          <h1 className="page-title">Campus Hub</h1>
          <p style={{ color: "var(--text-muted)", fontSize: "0.95rem" }}>Lost &amp; Found listings at NIE</p>
        </div>
        <div className="filters">
          {(["all", "lost", "found"] as const).map((f) => (
            <button key={f} className={`filter-btn ${filter === f ? "active" : ""}`} onClick={() => setFilter(f)}>
              {f === "all" ? "All" : f === "lost" ? "🔍 Lost" : "📦 Found"}
            </button>
          ))}
        </div>
      </div>

      {/* Search + Category */}
      <div className="search-bar">
        <div className="search-input-wrapper">
          <svg className="search-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            className="search-input"
            placeholder="Search by title, description..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
          />
          {searchInput && (
            <button className="search-clear" onClick={() => { setSearchInput(""); setSearch(""); }}>✕</button>
          )}
        </div>
        <div className="category-tabs">
          {CATEGORIES.map((c) => (
            <button key={c} className={`category-btn ${category === c ? "active" : ""}`} onClick={() => setCategory(c)}>
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
              {pagination.total} report{pagination.total !== 1 ? "s" : ""} found
              {search && <> for &ldquo;<strong>{search}</strong>&rdquo;</>}
            </p>
          )}

          <div className="items-grid">
            {items.length === 0 ? (
              <div className="empty-state custom-card">
                <div className="empty-icon">🔎</div>
                <h3>No items found</h3>
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
                  onKeyDown={(e) => e.key === "Enter" && setSelectedItem(item)}
                  aria-label={`View details for ${item.title}`}
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
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                        <circle cx="12" cy="12" r="3"/>
                      </svg>
                      View details
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
                        {new Date(item.date).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}
                      </div>
                      <div className="meta-row">
                        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                        {item.reporterName}
                      </div>
                    </div>

                    <div className="card-tap-hint">Tap to see contact details →</div>
                  </div>
                </div>
              ))
            )}
          </div>

          {pagination && pagination.totalPages > 1 && (
            <div className="pagination">
              <button className="page-btn" disabled={page <= 1} onClick={() => setPage(p => p - 1)}>← Prev</button>
              <span className="page-info">Page {page} of {pagination.totalPages}</span>
              <button className="page-btn" disabled={page >= pagination.totalPages} onClick={() => setPage(p => p + 1)}>Next →</button>
            </div>
          )}
        </>
      )}

      {/* Fullscreen item detail modal */}
      {selectedItem && (
        <ItemDetailModal
          item={selectedItem}
          onClose={() => setSelectedItem(null)}
          isLoggedIn={!!session}
        />
      )}
    </main>
  );
}
