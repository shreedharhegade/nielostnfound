"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import "./history.css";
// import main css to reuse classes
import "../page.css";

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
  status: "open" | "resolved";
};

export default function History() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingItem, setEditingItem] = useState<Item | null>(null);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/");
    }
  }, [status, router]);

  useEffect(() => {
    if (session?.user?.email) {
      fetchUserItems(session.user.email);
    }
  }, [session]);

  const fetchUserItems = async (email: string) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/items?reporterEmail=${email}`);
      const data = await res.json();
      if (data.success) {
        setItems(data.data);
      }
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  const handleToggleStatus = async (id: string, currentStatus: string) => {
    const newStatus = currentStatus === "open" ? "resolved" : "open";
    try {
      const res = await fetch(`/api/items/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus })
      });
      if (res.ok) {
        setItems(items.map(item => item._id === id ? { ...item, status: newStatus } : item));
      }
    } catch (e) {
      console.error("Failed to toggle status", e);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this item?")) return;
    try {
      const res = await fetch(`/api/items/${id}`, {
        method: "DELETE"
      });
      if (res.ok) {
        setItems(items.filter(item => item._id !== id));
      }
    } catch (e) {
      console.error("Failed to delete", e);
    }
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem) return;
    
    try {
      const res = await fetch(`/api/items/${editingItem._id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: editingItem.title,
          description: editingItem.description,
          location: editingItem.location
        })
      });
      
      if (res.ok) {
        const { data } = await res.json();
        setItems(items.map(item => item._id === data._id ? data : item));
        setEditingItem(null);
      }
    } catch (e) {
      console.error("Failed to update", e);
    }
  };

  if (status === "loading" || loading) {
    return <div className="text-center mt-2" style={{ color: "var(--text-muted)", fontWeight: "500", marginTop: "4rem" }}>Loading history...</div>;
  }

  return (
    <main>
      <div className="dashboard-header">
        <div>
          <h1 className="page-title">My Tracked Items</h1>
          <p style={{ color: "var(--text-muted)" }}>Manage the items you have reported</p>
        </div>
      </div>

      <div className="items-grid">
        {items.length === 0 ? (
          <div className="empty-state custom-card">
            <h3 style={{ color: "var(--text-main)", marginBottom: "0.5rem" }}>No items reported</h3>
            <p>You haven't reported any lost or found items yet.</p>
          </div>
        ) : (
          items.map((item) => (
            <div key={item._id} className={`custom-card item-card ${item.status === 'resolved' ? 'item-resolved' : ''}`}>
              <span className={item.type === "lost" ? "item-badge-lost" : "item-badge-found"}>
                {item.type.toUpperCase()}
              </span>
              {item.status === 'resolved' && (
                <div className="resolved-banner">
                  RECOVERED
                </div>
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
                </div>

                <div className="history-actions" style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem', borderTop: '1px solid var(--border)', paddingTop: '1rem' }}>
                  <button 
                    onClick={() => handleToggleStatus(item._id, item.status)} 
                    className="btn-action" 
                    style={{ flex: 1, padding: '0.4rem', backgroundColor: item.status === 'open' ? '#10b981' : 'var(--text-muted)', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: '500' }}>
                    {item.status === 'open' ? 'Mark Recovered' : 'Reopen'}
                  </button>
                  <button 
                    onClick={() => setEditingItem(item)} 
                    className="btn-action" 
                    style={{ flex: 1, padding: '0.4rem', border: '1px solid var(--primary)', background: 'transparent', color: 'var(--primary)', borderRadius: '4px', cursor: 'pointer', fontWeight: '500' }}>
                    Edit
                  </button>
                  <button 
                    onClick={() => handleDelete(item._id)} 
                    className="btn-action" 
                    style={{ padding: '0.4rem 0.6rem', border: '1px solid #ef4444', background: 'transparent', color: '#ef4444', borderRadius: '4px', cursor: 'pointer', fontWeight: '500' }}>
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {editingItem && (
        <div className="modal-overlay">
          <div className="modal-content custom-card">
            <h2 style={{ marginBottom: '1rem' }}>Edit Item</h2>
            <form onSubmit={handleEditSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '0.25rem', fontWeight: '500' }}>Title</label>
                <input 
                  type="text" 
                  value={editingItem.title} 
                  onChange={e => setEditingItem({...editingItem, title: e.target.value})}
                  style={{ width: '100%', padding: '0.5rem', border: '1px solid var(--border)', borderRadius: '4px' }}
                  required
                />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '0.25rem', fontWeight: '500' }}>Description</label>
                <textarea 
                  value={editingItem.description} 
                  onChange={e => setEditingItem({...editingItem, description: e.target.value})}
                  style={{ width: '100%', padding: '0.5rem', border: '1px solid var(--border)', borderRadius: '4px', minHeight: '80px' }}
                  required
                />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '0.25rem', fontWeight: '500' }}>Location</label>
                <input 
                  type="text" 
                  value={editingItem.location} 
                  onChange={e => setEditingItem({...editingItem, location: e.target.value})}
                  style={{ width: '100%', padding: '0.5rem', border: '1px solid var(--border)', borderRadius: '4px' }}
                  required
                />
              </div>
              <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end', marginTop: '1rem' }}>
                <button type="button" onClick={() => setEditingItem(null)} style={{ padding: '0.5rem 1rem', border: '1px solid var(--border)', background: 'transparent', borderRadius: '4px', cursor: 'pointer' }}>Cancel</button>
                <button type="submit" style={{ padding: '0.5rem 1rem', background: 'var(--primary)', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Save Changes</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}
