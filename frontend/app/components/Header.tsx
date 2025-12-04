"use client";
import { useEffect, useState } from "react";
import { fetchCurrentUser, logout } from "../../lib/auth";

export default function Header() {
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      const u = await fetchCurrentUser();
      if (mounted) setUser(u);
    })();
    return () => {
      mounted = false;
    };
  }, []);

  return (
    <header style={{ padding: 12, borderBottom: "1px solid #eee", marginBottom: 16 }}>
      <nav style={{ display: "flex", gap: 12, alignItems: "center" }}>
        <a href="/">Home</a>
        {user ? (
          <>
            <span>Hi, {user.username}</span>
            <button onClick={logout}>Logout</button>
          </>
        ) : (
          <>
            <a href="/login">Login</a>
            <a href="/register">Register</a>
          </>
        )}
      </nav>
    </header>
  );
}
