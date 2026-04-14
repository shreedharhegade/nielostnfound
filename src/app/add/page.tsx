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
        <div className="custom-card text-center" style={{ maxWidth: '400px' }}>
          <h2 className="mb-2" style={{ color: 'var(--text-main)' }}>Login Required</h2>
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
      <div className="custom-card" style={{ width: "100%", maxWidth: "768px" }}>
        <h2 className="page-title text-center" style={{ marginBottom: "0.2rem" }}>Report an Item</h2>
        <p className="text-center" style={{ color: "var(--text-muted)", marginBottom: "2rem" }}>Help us keep our campus community connected</p>

        <form onSubmit={handleSubmit}>

          <h3 className="form-section-title">Item Details</h3>
          <div className="form-grid">
            <div className="form-group">
              <label>Report Type</label>
              <select name="type" className="form-control" required defaultValue="lost">
                <option value="lost">LOST</option>
                <option value="found">FOUND</option>
              </select>
            </div>

            <div className="form-group">
              <label>Item Name</label>
              <input type="text" name="title" className="form-control" placeholder="E.g., Blue Backpack, Dell Laptop" required />
            </div>

            <div className="form-group" style={{ gridColumn: "1 / -1" }}>
              <label>Description</label>
              <textarea name="description" className="form-control" rows={3} placeholder="Color, brand, identifying marks..." required></textarea>
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
              <label>Upload Image (Optional)</label>
              <input type="file" name="image" className="form-control" accept="image/*" style={{ padding: "0.5rem" }} />
            </div>
          </div>

          <h3 className="form-section-title">Where & When</h3>
          <div className="form-grid">
            <div className="form-group">
              <label>Location</label>
              <input type="text" name="location" className="form-control" placeholder="E.g., Library 2nd Floor" required />
            </div>

            <div className="form-group">
              <label>Date Lost/Found</label>
              <input type="date" name="date" className="form-control" required />
            </div>
          </div>

          <h3 className="form-section-title">Contact Information</h3>
          <div className="form-grid">
            <div className="form-group" style={{ gridColumn: "1 / -1" }}>
              <label>Phone Number (Optional)</label>
              <input type="tel" name="phone" className="form-control" placeholder="E.g., +91 9876543210" pattern="[0-9\+\-\s\(\)]*" />
              <small style={{ color: "var(--text-muted)", display: "block", marginTop: "0.4rem" }}>If provided, people can easily contact you regarding this report.</small>
            </div>
          </div>

          <button type="submit" className="btn-primary" style={{ width: "100%", marginTop: "1rem", padding: "1rem" }} disabled={loading}>
            {loading ? "Submitting Request..." : "Submit Report"}
          </button>
        </form>
      </div>
    </main>
  );
}
