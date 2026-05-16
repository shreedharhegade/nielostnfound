"use client";

import Link from "next/link";
import { signIn, signOut, useSession } from "next-auth/react";
import { useState, useEffect } from "react";
import "./Navbar.css";

const ADMIN_EMAILS = (process.env.NEXT_PUBLIC_ADMIN_EMAILS ?? "").split(",").map(e => e.trim().toLowerCase());

export default function Navbar() {
  const { data: session } = useSession();
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [isDark, setIsDark] = useState(false);
  const isAdmin = session?.user?.email && ADMIN_EMAILS.includes(session.user.email.toLowerCase());

  // Initialize theme from localStorage
  useEffect(() => {
    const saved = localStorage.getItem("theme");
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const dark = saved ? saved === "dark" : prefersDark;
    setIsDark(dark);
    document.documentElement.setAttribute("data-theme", dark ? "dark" : "light");
  }, []);

  const toggleTheme = () => {
    const next = !isDark;
    setIsDark(next);
    document.documentElement.setAttribute("data-theme", next ? "dark" : "light");
    localStorage.setItem("theme", next ? "dark" : "light");
  };

  // Close profile menu when clicking outside
  useEffect(() => {
    if (!showProfileMenu) return;
    const handler = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest(".user-menu")) setShowProfileMenu(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [showProfileMenu]);

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link href="/" className="logo">
          NIE <span className="logo-highlight">Lost &amp; Found</span>
        </Link>
        <div className="nav-links">
          {session && (
            <>
              {isAdmin && (
                <Link href="/admin" className="nav-item" style={{ padding: "0.5rem 1rem", color: "var(--primary)", textDecoration: "none", fontWeight: 600, borderRadius: "8px", border: "1px solid var(--primary)", fontSize: "0.875rem" }}>
                  Admin
                </Link>
              )}
              <Link href="/history" className="nav-item" style={{ padding: "0.5rem 1rem", color: "var(--text-main)", textDecoration: "none", fontWeight: "500", borderRadius: "8px" }}>
                My History
              </Link>
              <Link href="/add" className="btn-primary">
                Report Item
              </Link>
            </>
          )}

          {/* Dark mode toggle */}
          <button
            className="theme-toggle"
            onClick={toggleTheme}
            title={isDark ? "Switch to light mode" : "Switch to dark mode"}
            aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
          >
            {isDark ? (
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            ) : (
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
              </svg>
            )}
          </button>

          {!session ? (
            <button className="btn-secondary" onClick={() => signIn("google")}>
              Login with Google
            </button>
          ) : (
            <div className="user-menu">
              <div className="profile-trigger" onClick={() => setShowProfileMenu(!showProfileMenu)}>
                <div className="avatar-wrapper">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="avatar-icon">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                    <circle cx="12" cy="7" r="4" />
                  </svg>
                </div>
                {showProfileMenu && (
                  <div className="profile-dropdown">
                    <div className="user-info">
                      <p className="user-name">{session.user?.name}</p>
                      <p className="user-email">{session.user?.email}</p>
                    </div>
                    <div className="dropdown-divider" />
                    <button className="btn-logout-full" onClick={() => signOut()}>
                      Logout
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
