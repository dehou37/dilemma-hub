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
    <header className="sticky top-0 z-20 bg-white/90 backdrop-blur-md border-b border-zinc-200/50 shadow-sm">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 text-white flex items-center justify-center font-semibold text-2xl shadow-lg transform hover:scale-105 transition-transform">⚖️</div>
          <div>
            <a href="/" className="text-xl font-bold bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent hover:from-amber-700 hover:to-orange-700">DilemmaHub</a>
            <div className="text-xs text-zinc-600 font-medium">Where tough choices meet community wisdom</div>
          </div>
        </div>

        <nav className="flex items-center gap-3">
          
          {user ? (
            <div className="flex items-center gap-3">
              <a
                href="/create"
                className="px-5 py-2.5 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-lg text-sm font-semibold shadow-md hover:shadow-lg hover:from-amber-600 hover:to-orange-600 transform hover:scale-105 transition-all"
              >
                ✨ Post Dilemma
              </a>
              <a
                href="/my-posts"
                className="text-sm text-zinc-700 hover:text-amber-600 font-medium hover:underline underline-offset-4"
              >
                My Posts
              </a>
              <a
                href="/profile"
                className="text-sm text-zinc-700 hover:text-amber-600 font-medium hover:underline underline-offset-4"
              >
                Profile
              </a>
              <div className="flex items-center gap-2 px-3 py-1.5 bg-amber-50 rounded-lg border border-amber-200">
                <span className="text-sm">👋 <span className="font-semibold text-amber-700">{user.username}</span></span>
              </div>
              <button
                onClick={() => logout()}
                className="text-sm text-zinc-600 hover:text-red-600 font-medium hover:underline underline-offset-4"
              >
                Logout
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <a href="/login" className="rounded-lg bg-gradient-to-r from-amber-500 to-orange-500 px-5 py-2.5 text-sm font-semibold text-white shadow-md hover:shadow-lg hover:from-amber-600 hover:to-orange-600 transform hover:scale-105 transition-all">Login / Sign Up</a>
            </div>
          )}
        </nav>
      </div>
    </header>
  );
}
