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
    <header className="sticky top-0 z-20 bg-white/80 backdrop-blur-sm">
      <div className="mx-auto flex max-w-4xl items-center justify-between gap-4 px-4 py-3">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-md bg-slate-900 text-white flex items-center justify-center font-semibold">⚖️</div>
          <div>
            <a href="/" className="text-lg font-bold">Ethical Forum</a>
            <div className="text-xs text-zinc-500">Explore moral questions</div>
          </div>
        </div>

        <nav className="flex items-center gap-3">
          
          {user ? (
            <div className="flex items-center gap-3">
              <span className="text-sm">Hi, <span className="font-medium">{user.username}</span></span>
              <button
                onClick={() => logout()}
                className="text-sm text-zinc-600 hover:text-zinc-800"
              >
                Logout
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <a href="/register" className="rounded-md bg-white px-3 py-1 text-sm text-amber-600 shadow-sm">Login/Sign Up</a>
            </div>
          )}
        </nav>
      </div>
    </header>
  );
}
