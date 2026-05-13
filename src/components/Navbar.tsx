"use client";

import Link from "next/link";
import { signIn, signOut, useSession } from "next-auth/react";
import { useState, useEffect } from "react";
import "./Navbar.css";

const ADMIN_EMAILS = (process.env.NEXT_PUBLIC_ADMIN_EMAILS ?? "")
  .split(",").map(e => e.trim().toLowerCase());

export default function Navbar() {
  const { data: session } = useSession();
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [dark, setDark] = useState(false);
  const isAdmin = session?.user?.email &&
    ADMIN_EMAILS.includes(session.user.email.toLowerCase());

  // Load saved theme on mount
  useEffect(() => {
    const saved = localStorage.getItem("theme");
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const isDark = saved ? saved === "dark" : prefersDark;
    setDark(isDark);
    document.documentElement.setAttribute("data-theme", isDark ? "dark" : "light");
  }, []);

  const toggleTheme = () => {
    const next = !dark;
    setDark(next);
    document.documentElement.setAttribute("data-theme", next ? "dark" : "light");
    localStorage.setItem("theme", next ? "dark" : "light");
  };

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest(".user-menu")) setShowProfileMenu(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

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
                <Link href="/admin" className="nav-link nav-link-admin">Admin</Link>
              )}
              <Link href="/history" className="nav-link">My Items</Link>
              <Link href="/add" className="btn-primary nav-report-btn">+ Report Item</Link>
            </>
          )}

          {/* Dark mode toggle */}
          <button className="theme-toggle" onClick={toggleTheme} title={dark ? "Switch to light mode" : "Switch to dark mode"} aria-label="Toggle dark mode">
            {dark ? (
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/>
                <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
                <line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/>
                <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
              </svg>
            ) : (
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
              </svg>
            )}
          </button>

          {!session ? (
            <button className="btn-secondary" onClick={() => signIn("google")}>
              Login with Google
            </button>
          ) : (
            <div className="user-menu">
              <div className="profile-trigger" onClick={() => setShowProfileMenu(s => !s)}>
                <div className="avatar-wrapper">
                  {session.user?.image ? (
                    <img src={session.user.image} alt={session.user.name ?? ""} className="avatar-img" />
                  ) : (
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="avatar-icon">
                      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                      <circle cx="12" cy="7" r="4"/>
                    </svg>
                  )}
                </div>
              </div>
              {showProfileMenu && (
                <div className="profile-dropdown">
                  <div className="user-info">
                    <p className="user-name">{session.user?.name}</p>
                    <p className="user-email">{session.user?.email}</p>
                  </div>
                  <div className="dropdown-divider" />
                  <Link href="/history" className="dropdown-link" onClick={() => setShowProfileMenu(false)}>My Reports</Link>
                  <Link href="/add" className="dropdown-link" onClick={() => setShowProfileMenu(false)}>Report Item</Link>
                  {isAdmin && <Link href="/admin" className="dropdown-link" onClick={() => setShowProfileMenu(false)}>Admin Panel</Link>}
                  <div className="dropdown-divider" />
                  <button className="btn-logout-full" onClick={() => signOut()}>Logout</button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
