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
          <h1 className="page-title">Campus Dashboard</h1>
          <p style={{ color: "var(--text-muted)" }}>Recent lost and found reports at NIE</p>
        </div>
        <div className="filters">
          <button className={`filter-btn ${filter === "all" ? "active" : ""}`} onClick={() => setFilter("all")}>All</button>
          <button className={`filter-btn ${filter === "lost" ? "active" : ""}`} onClick={() => setFilter("lost")}>Lost Items</button>
          <button className={`filter-btn ${filter === "found" ? "active" : ""}`} onClick={() => setFilter("found")}>Found Items</button>
        </div>
      </div>

      {loading ? (
        <div className="text-center mt-2">Loading items...</div>
      ) : (
        <div className="items-grid">
          {items.length === 0 ? (
            <div className="empty-state glass-card">
              <h3>No items found</h3>
              <p>Everything seems to be in its right place.</p>
            </div>
          ) : (
            items.map((item) => (
              <div key={item._id} className="glass-card item-card" style={{ position: "relative" }}>
                {item.type === "lost" ? (
                  <span className="item-badge-lost">LOST</span>
                ) : (
                  <span className="item-badge-found">FOUND</span>
                )}
                
                <img 
                  src={item.imageUrl ? item.imageUrl : "https://via.placeholder.com/400x200?text=No+Image"} 
                  alt={item.title} 
                  className="item-image" 
                />
                
                <div className="item-content">
                  <h3 className="item-title">{item.title}</h3>
                  <p className="item-desc">{item.description}</p>
                  
                  <div className="item-meta">
                    <div className="meta-row">
                      <span>📍</span> {item.location}
                    </div>
                    <div className="meta-row">
                      <span>📅</span> {new Date(item.date).toLocaleDateString()}
                    </div>
                    <div className="meta-row">
                      <span>👤</span> {item.reporterName} ({item.reporterEmail})
                    </div>
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
