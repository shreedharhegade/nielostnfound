"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";

import { signIn } from "next-auth/react";

export default function AddItem() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  if (status === "loading") return <main><div className="text-center mt-2">Loading...</div></main>;
  if (!session) {
    return (
      <main className="flex-center" style={{ minHeight: '60vh' }}>
        <div className="glass-card text-center" style={{ maxWidth: '400px' }}>
          <h2 className="mb-2">Login Required</h2>
          <p className="mb-2" style={{ color: 'var(--text-muted)' }}>You must be logged in to report a lost or found item.</p>
          <button className="btn-primary" onClick={() => signIn("google")}>Login with Google</button>
        </div>
      </main>
    );
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    
    const formData = new FormData(e.currentTarget);
    try {
      const res = await fetch("/api/items", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (data.success) {
        router.push("/");
      } else {
        alert("Error: " + data.error);
      }
    } catch (err) {
      alert("Submission failed");
    }
    setLoading(false);
  };

  return (
    <main style={{ display: 'flex', justifyContent: 'center' }}>
      <div className="glass-card" style={{ width: "100%", maxWidth: "600px" }}>
        <h2 className="page-title text-center" style={{ fontSize: '2rem' }}>Report an Item</h2>
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Report Type</label>
            <select name="type" className="form-control" required defaultValue="lost">
              <option value="lost">Lost Item</option>
              <option value="found">Found Item</option>
            </select>
          </div>

          <div className="form-group">
            <label>Item Name / Title</label>
            <input type="text" name="title" className="form-control" placeholder="E.g., Blue Backpack, Dell Laptop" required />
          </div>

          <div className="form-group">
            <label>Category</label>
            <select name="category" className="form-control" required>
              <option value="Electronics">Electronics</option>
              <option value="Keys">Keys</option>
              <option value="Documents">Documents/IDs</option>
              <option value="Clothing">Clothing</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <div className="form-group">
            <label>Description (color, brand, any identifiable marks)</label>
            <textarea name="description" className="form-control" rows={4} required></textarea>
          </div>

          <div className="form-group">
            <label>Location (where was it lost/found?)</label>
            <input type="text" name="location" className="form-control" placeholder="E.g., Library 2nd Floor, Canteen" required />
          </div>

          <div className="form-group">
            <label>Date Lost/Found</label>
            <input type="date" name="date" className="form-control" required />
          </div>

          <div className="form-group">
            <label>Upload Image (optional)</label>
            <input type="file" name="image" className="form-control" accept="image/*" />
          </div>

          <button type="submit" className="btn-primary" style={{ width: "100%", marginTop: "1rem" }} disabled={loading}>
            {loading ? "Submitting..." : "Submit Report"}
          </button>
        </form>
      </div>
    </main>
  );
}
