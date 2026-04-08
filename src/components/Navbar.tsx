"use client";

import Link from "next/link";
import { signIn, signOut, useSession } from "next-auth/react";
import "./Navbar.css"; // We will add scoped styles or use globals

export default function Navbar() {
  const { data: session } = useSession();

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link href="/" className="logo">
          NIE <span className="logo-highlight">Lost & Found</span>
        </Link>
        <div className="nav-links">
          <Link href="/" className="nav-link">Home</Link>
          {session && (
            <Link href="/add" className="btn-primary">
              Report Item
            </Link>
          )}
          {!session ? (
            <button className="btn-secondary" onClick={() => signIn("google")}>
              Login with Google
            </button>
          ) : (
            <div className="user-menu">
              <img src={session.user?.image || ""} alt="Profile" className="avatar" />
              <button className="btn-logout" onClick={() => signOut()}>
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
