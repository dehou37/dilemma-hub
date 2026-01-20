"use client";
import { useEffect, useState } from "react";
import { fetchCurrentUser, logout } from "../../lib/auth";

export default function Header() {
  const [user, setUser] = useState<any>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = () => {
      setMobileMenuOpen(false);
    };
    
    if (mobileMenuOpen) {
      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
    }
  }, [mobileMenuOpen]);

  return (
    <>
    <header className="sticky top-0 z-50 glass border-b border-zinc-200/50 shadow-sm backdrop-blur-xl">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-6 py-4">
        {/* Logo */}
        <div className="flex items-center gap-3 animate-fadeIn">
          <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 text-white flex items-center justify-center font-semibold text-2xl shadow-lg transform hover:scale-110 hover:rotate-6 transition-all">
            ⚖️
          </div>
          <div>
            <a href="/" className="text-xl font-bold bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent hover:from-amber-700 hover:to-orange-700 transition-all">
              DilemmaHub
            </a>
            <div className="text-xs text-zinc-600 font-medium hidden sm:block">Where tough choices meet community wisdom</div>
          </div>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-3">
          {user ? (
            <>
              <a
                href="/create"
                className="px-5 py-2.5 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-lg text-sm font-semibold shadow-md hover:shadow-xl hover:from-amber-600 hover:to-orange-600 transform hover:scale-105 transition-all flex items-center gap-2"
              >
                <span className="text-base">✨</span>
                Post Dilemma
              </a>
              <a
                href="/my-posts"
                className="text-sm text-zinc-700 hover:text-amber-600 font-medium hover:underline underline-offset-4 px-3 py-2 rounded-lg hover:bg-amber-50 transition-all"
              >
                My Posts
              </a>
              
              {/* Username Display - Click to go to profile */}
              <a
                href="/profile"
                className="flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-amber-50 to-orange-50 rounded-lg border border-amber-200 hover:border-amber-300 transition-all hover:shadow-md"
              >
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-white font-bold text-sm shadow-md">
                  {user.username[0]?.toUpperCase()}
                </div>
                <span className="text-sm font-semibold text-zinc-800">{user.username}</span>
              </a>
              
              <button
                onClick={() => logout()}
                className="text-sm text-red-600 hover:text-red-700 font-medium hover:underline underline-offset-4 px-3 py-2 rounded-lg hover:bg-red-50 transition-all"
              >
                Logout
              </button>
            </>
          ) : (
            <a 
              href="/login" 
              className="rounded-lg bg-gradient-to-r from-amber-500 to-orange-500 px-5 py-2.5 text-sm font-semibold text-white shadow-md hover:shadow-xl hover:from-amber-600 hover:to-orange-600 transform hover:scale-105 transition-all"
            >
              Login / Sign Up
            </a>
          )}
        </nav>

        {/* Mobile Menu Button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            setMobileMenuOpen(!mobileMenuOpen);
          }}
          className="md:hidden p-2 rounded-lg hover:bg-zinc-100 transition-colors"
        >
          <div className="w-6 h-5 flex flex-col justify-between">
            <span className={`h-0.5 w-full bg-zinc-700 transition-all ${mobileMenuOpen ? 'rotate-45 translate-y-2' : ''}`}></span>
            <span className={`h-0.5 w-full bg-zinc-700 transition-all ${mobileMenuOpen ? 'opacity-0' : ''}`}></span>
            <span className={`h-0.5 w-full bg-zinc-700 transition-all ${mobileMenuOpen ? '-rotate-45 -translate-y-2' : ''}`}></span>
          </div>
        </button>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-zinc-200 bg-white animate-fadeIn">
          <nav className="px-6 py-4 space-y-2">
            {user ? (
              <>
                <div className="flex items-center gap-3 pb-3 border-b border-zinc-200 mb-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-white font-bold shadow-md">
                    {user.username[0]?.toUpperCase()}
                  </div>
                  <div>
                    <div className="font-semibold text-zinc-900">{user.username}</div>
                    <div className="text-xs text-zinc-500">{user.email}</div>
                  </div>
                </div>
                <a
                  href="/create"
                  className="block w-full px-4 py-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-lg text-sm font-semibold shadow-md text-center"
                >
                  ✨ Post Dilemma
                </a>
                <a
                  href="/my-posts"
                  className="block px-4 py-2 text-sm text-zinc-700 hover:bg-zinc-50 rounded-lg transition-colors"
                >
                  📝 My Posts
                </a>
                <a
                  href="/profile"
                  className="block px-4 py-2 text-sm text-zinc-700 hover:bg-zinc-50 rounded-lg transition-colors"
                >
                  👤 Profile
                </a>
                <button
                  onClick={() => logout()}
                  className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                >
                  🚪 Logout
                </button>
              </>
            ) : (
              <a 
                href="/login" 
                className="block w-full px-4 py-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-lg text-sm font-semibold shadow-md text-center"
              >
                Login / Sign Up
              </a>
            )}
          </nav>
        </div>
      )}
    </header>
    </>
  );
}
