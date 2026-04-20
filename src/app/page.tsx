"use client";

import { useEffect, useState } from "react";
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
};

export default function Home() {
  const [items, setItems] = useState<Item[]>([]);
  const [filter, setFilter] = useState<"all" | "lost" | "found">("all");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchItems(filter);
  }, [filter]);

  const fetchItems = async (typeFilter: string) => {
    setLoading(true);
    try {
      const url = typeFilter === "all" ? "/api/items" : `/api/items?type=${typeFilter}`;
      const res = await fetch(url);
      const data = await res.json();
      if (data.success) {
        setItems(data.data);
      }
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  return (
    <main>
      <div className="dashboard-header">
        <div>
          <h1 className="page-title">Campus Hub</h1>
          <p style={{ color: "var(--text-muted)" }}>Lost & Found listings at NIE</p>
        </div>
        <div className="filters">
          <button className={`filter-btn ${filter === "all" ? "active" : ""}`} onClick={() => setFilter("all")}>All</button>
          <button className={`filter-btn ${filter === "lost" ? "active" : ""}`} onClick={() => setFilter("lost")}>Lost</button>
          <button className={`filter-btn ${filter === "found" ? "active" : ""}`} onClick={() => setFilter("found")}>Found</button>
        </div>
      </div>

      {loading ? (
        <div className="text-center mt-2" style={{ color: "var(--text-muted)", fontWeight: "500" }}>Refreshing listings...</div>
      ) : (
        <div className="items-grid">
          {items.length === 0 ? (
            <div className="empty-state custom-card">
              <h3 style={{ color: "var(--text-main)", marginBottom: "0.5rem" }}>No items found</h3>
              <p>Everything seems to be in its right place.</p>
            </div>
          ) : (
            items.map((item) => (
              <div key={item._id} className="custom-card item-card">
                {item.type === "lost" ? (
                  <span className="item-badge-lost">LOST</span>
                ) : (
                  <span className="item-badge-found">FOUND</span>
                )}
                
                <div className="item-image-wrapper">
                  <img 
                    src={item.imageUrl ? (item.imageUrl.startsWith('/uploads/') ? `/api${item.imageUrl}` : item.imageUrl) : "/default-item.svg"} 
                    alt={item.title} 
                    className="item-image" 
                  />
                </div>
                
                <div className="item-content">
                  <h3 className="item-title">{item.title}</h3>
                  <p className="item-desc">{item.description}</p>
                  
                  <div className="item-meta">
                    <div className="meta-row">
                      <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.243-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                      {item.location}
                    </div>
                    <div className="meta-row">
                      <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                      {new Date(item.date).toLocaleDateString('en-GB')}
                    </div>
                    <div className="meta-row">
                      <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                      {item.reporterName}
                    </div>
                    {(item.reporterPhone || item.reporterEmail) && (
                      <div className="meta-actions" style={{ display: 'flex', gap: '0.5rem', marginTop: '0.75rem' }}>
                        {item.reporterPhone && (
                          <a href={`tel:${item.reporterPhone}`} className="btn-contact btn-contact-phone" style={{ flex: 1, padding: '0.4rem', border: '1px solid var(--primary)', borderRadius: '4px', textAlign: 'center', textDecoration: 'none', color: 'var(--primary)', fontSize: '0.85rem', fontWeight: '500' }}>
                            Call
                          </a>
                        )}
                        {item.reporterEmail && (
                          <a href={`mailto:${item.reporterEmail}`} className="btn-contact btn-contact-email" style={{ flex: 1, padding: '0.4rem', backgroundColor: 'var(--primary)', color: 'white', borderRadius: '4px', textAlign: 'center', textDecoration: 'none', fontSize: '0.85rem', fontWeight: '500' }}>
                            Email
                          </a>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </main>
  );
}
