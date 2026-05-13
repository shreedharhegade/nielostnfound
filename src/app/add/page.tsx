"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { signIn } from "next-auth/react";

type FieldError = { field: string; message: string };

export default function AddItem() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [maxDatetime, setMaxDatetime] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [globalError, setGlobalError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  useEffect(() => {
    const now = new Date();
    const tzOffset = now.getTimezoneOffset() * 60000;
    const localISOTime = new Date(now.getTime() - tzOffset).toISOString().slice(0, 16);
    setMaxDatetime(localISOTime);
  }, []);

  if (status === "loading") return <main><div className="text-center mt-2">Loading...</div></main>;
  if (!session) {
    return (
      <main className="flex-center" style={{ minHeight: "60vh" }}>
        <div className="custom-card text-center" style={{ maxWidth: "400px" }}>
          <h2 className="mb-2" style={{ color: "var(--text-main)" }}>Login Required</h2>
          <p className="mb-2" style={{ color: "var(--text-muted)" }}>You must be logged in to report a lost or found item.</p>
          <button className="btn-primary" onClick={() => signIn("google")}>Login with Google</button>
        </div>
      </main>
    );
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});
    setGlobalError("");
    setSuccessMsg("");

    const formData = new FormData(e.currentTarget);
    try {
      const res = await fetch("/api/items", { method: "POST", body: formData });
      const data = await res.json();

      if (res.status === 429) {
        setGlobalError(data.error ?? "Too many requests. Please wait.");
        return;
      }
      if (res.status === 422 && data.errors) {
        const fieldErrors: Record<string, string> = {};
        (data.errors as FieldError[]).forEach(({ field, message }) => {
          fieldErrors[field] = message;
        });
        setErrors(fieldErrors);
        return;
      }
      if (!data.success) {
        setGlobalError(data.error ?? "Submission failed");
        return;
      }
      setSuccessMsg("Item reported successfully! Redirecting...");
      setTimeout(() => router.push("/"), 1200);
    } catch {
      setGlobalError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const fc = (field: string) => `form-control${errors[field] ? " input-error" : ""}`;

  return (
    <main style={{ display: "flex", justifyContent: "center" }}>
      <div className="custom-card" style={{ width: "100%", maxWidth: "768px" }}>
        <h2 className="page-title text-center" style={{ marginBottom: "0.2rem" }}>Report an Item</h2>
        <p className="text-center" style={{ color: "var(--text-muted)", marginBottom: "2rem" }}>
          Help us keep our campus community connected
        </p>

        {globalError && <div className="alert alert-error">{globalError}</div>}
        {successMsg && <div className="alert alert-success">{successMsg}</div>}

        <form onSubmit={handleSubmit}>
          <h3 className="form-section-title">Item Details</h3>
          <div className="form-grid">
            <div className="form-group">
              <label>Report Type</label>
              <select name="type" className={fc("type")} required defaultValue="lost">
                <option value="lost">LOST</option>
                <option value="found">FOUND</option>
              </select>
              {errors.type && <span className="field-error">{errors.type}</span>}
            </div>

            <div className="form-group">
              <label>Item Name</label>
              <input type="text" name="title" className={fc("title")} placeholder="E.g., Blue Backpack, Dell Laptop" maxLength={100} required />
              {errors.title && <span className="field-error">{errors.title}</span>}
            </div>

            <div className="form-group" style={{ gridColumn: "1 / -1" }}>
              <label>Description</label>
              <textarea name="description" className={fc("description")} rows={3} placeholder="Color, brand, identifying marks..." maxLength={500} required />
              {errors.description && <span className="field-error">{errors.description}</span>}
            </div>

            <div className="form-group">
              <label>Category</label>
              <select name="category" className={fc("category")} required>
                <option value="Electronics">Electronics</option>
                <option value="Keys">Keys</option>
                <option value="Documents">Documents/IDs</option>
                <option value="Clothing">Clothing</option>
                <option value="Other">Other</option>
              </select>
              {errors.category && <span className="field-error">{errors.category}</span>}
            </div>

            <div className="form-group">
              <label>Upload Image (Optional)</label>
              <input type="file" name="image" className="form-control" accept="image/*" style={{ padding: "0.5rem" }} />
              <small style={{ color: "var(--text-muted)", display: "block", marginTop: "0.3rem" }}>Max 5 MB</small>
            </div>
          </div>

          <h3 className="form-section-title">Where &amp; When</h3>
          <div className="form-grid">
            <div className="form-group">
              <label>Location</label>
              <input type="text" name="location" className={fc("location")} placeholder="E.g., Library 2nd Floor" maxLength={200} required />
              {errors.location && <span className="field-error">{errors.location}</span>}
            </div>

            <div className="form-group">
              <label>Date &amp; Time Lost/Found</label>
              <input type="datetime-local" name="date" className={fc("date")} max={maxDatetime || undefined} required />
              {errors.date && <span className="field-error">{errors.date}</span>}
            </div>
          </div>

          <h3 className="form-section-title">Contact Information</h3>
          <div className="form-grid">
            <div className="form-group" style={{ gridColumn: "1 / -1" }}>
              <label>Phone Number (Optional)</label>
              <input type="tel" name="phone" className={fc("phone")} placeholder="E.g., +91 9876543210" />
              {errors.phone && <span className="field-error">{errors.phone}</span>}
              <small style={{ color: "var(--text-muted)", display: "block", marginTop: "0.4rem" }}>
                If provided, people can contact you directly about this report.
              </small>
            </div>
          </div>

          <button type="submit" className="btn-primary" style={{ width: "100%", marginTop: "1rem", padding: "1rem" }} disabled={loading}>
            {loading ? "Submitting..." : "Submit Report"}
          </button>
        </form>
      </div>
    </main>
  );
}
