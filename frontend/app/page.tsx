"use client";
import { useEffect, useState } from "react";
import { API_URL } from "../lib/config";

// ✅ Fixed unique colors for each category
const categoryColors: Record<string, { bg: string; text: string }> = {
  ETHICS: { bg: "bg-red-100", text: "text-red-700" },
  LIFESTYLE: { bg: "bg-orange-100", text: "text-orange-700" },
  POLITICS: { bg: "bg-lime-100", text: "text-lime-700" },
  WORK: { bg: "bg-violet-100", text: "text-violet-700" },
  PERSONAL: { bg: "bg-teal-100", text: "text-teal-700" },
  TECHNOLOGY: { bg: "bg-indigo-100", text: "text-indigo-700" },
  OTHER: { bg: "bg-zinc-200", text: "text-zinc-700" },
};

function getCategoryColor(category?: string) {
  if (!category) return categoryColors.OTHER;
  return categoryColors[category.toUpperCase()] ?? categoryColors.OTHER;
}

type Dilemma = {
  id: string;
  title: string;
  description: string;
  category?: string;
  authorId?: string;
  author?: { id: string; username: string; email: string };
  votes?: any[];
  comments?: any[];
  createdAt: string;
};

export default function Home() {
  const [dilemmas, setDilemmas] = useState<Dilemma[]>([]);
  const [loading, setLoading] = useState(true);
  const [active, setActive] = useState("All");
  const [categories, setCategories] = useState<string[]>([]);
  const [timeFilter, setTimeFilter] = useState("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const ITEMS_PER_PAGE = 10;

  // ✅ Fetch dilemmas with pagination
  useEffect(() => {
    let mounted = true;

    (async () => {
      try {
        const params = new URLSearchParams({
          page: page.toString(),
          limit: ITEMS_PER_PAGE.toString(),
        });
        
        if (searchQuery) {
          params.append("search", searchQuery);
        }

        const url = `${API_URL}/api/dilemmas?${params.toString()}`;
        const res = await fetch(url);
        const result = await res.json();

        if (!mounted) return;

        const list: Dilemma[] = result.data || [];
        setDilemmas(list);
        
        if (result.pagination) {
          setTotalPages(result.pagination.totalPages);
          setHasMore(result.pagination.hasMore);
        }

        // ✅ derive categories dynamically
        const cats = Array.from(
          new Set(
            list.map((d) =>
              d.category ? String(d.category).toUpperCase() : "OTHER"
            )
          )
        ).filter(Boolean);
        
        const hasOther = cats.includes("OTHER");
        const nonOther = cats.filter((c) => c !== "OTHER");

        setCategories(["All", ...nonOther, ...(hasOther ? ["OTHER"] : [])]);
      } catch (err) {
        console.error(err);
      } finally {
        if (mounted) setLoading(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, [searchQuery, page]);

  // ✅ Time constants in milliseconds
  const MS_PER_DAY = 24 * 60 * 60 * 1000;
  const MS_PER_WEEK = 7 * MS_PER_DAY;
  const MS_PER_MONTH = 30 * MS_PER_DAY;
  const MS_PER_YEAR = 365 * MS_PER_DAY;

  // ✅ Combined category + time filter + sort OTHER last
  function applyFilters(list: Dilemma[]) {
    const now = Date.now();

    const filtered = list.filter((d) => {
      // 1️⃣ Category filter
      if (
        active !== "All" &&
        String(d.category ?? "OTHER").toUpperCase() !== active.toUpperCase()
      ) {
        return false;
      }

      // 2️⃣ Time filter
      if (!timeFilter || timeFilter === "ALL") return true;
      if (!d.createdAt) return false;

      const createdMs = new Date(d.createdAt).getTime();
      if (Number.isNaN(createdMs)) return false;

      const ageMs = now - createdMs;

      switch (timeFilter) {
        case "DAY":
          return ageMs <= MS_PER_DAY;
        case "WEEK":
          return ageMs <= MS_PER_WEEK;
        case "MONTH":
          return ageMs <= MS_PER_MONTH;
        case "YEAR":
          return ageMs <= MS_PER_YEAR;
        default:
          return true;
      }
    });

    // 3️⃣ Sort OTHER last
    return filtered.sort((a, b) => {
      if ((a.category ?? "OTHER").toUpperCase() === "OTHER") return 1;
      if ((b.category ?? "OTHER").toUpperCase() === "OTHER") return -1;
      return 0;
    });
  }

  const visible = applyFilters(dilemmas);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchQuery(searchInput);
    setPage(1);
    setLoading(true);
  };

  const handleClearSearch = () => {
    setSearchInput("");
    setSearchQuery("");
    setPage(1);
    setLoading(true);
  };

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    setLoading(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="min-h-screen">
      <main className="mx-auto max-w-6xl px-6 py-12">
        {/* HERO */}
        <section className="mb-10 text-center">
          <h1 className="text-5xl font-extrabold bg-gradient-to-r from-slate-900 via-amber-900 to-orange-900 bg-clip-text text-transparent mb-3">
            What Would You Do?
          </h1>
          <p className="mt-3 text-lg text-zinc-700 max-w-2xl mx-auto leading-relaxed">
            A community for exploring life's most challenging moral questions.
            Share dilemmas, debate perspectives, and discover where you stand.
          </p>
        </section>

        {/* SEARCH BAR */}
        <section className="mb-8">
          <form onSubmit={handleSearch} className="relative">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400">
              🔍
            </div>
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Search dilemmas by title, description, or author..."
              className="w-full pl-12 pr-28 py-4 rounded-xl border-2 border-zinc-200 bg-white focus:outline-none focus:border-amber-400 focus:ring-4 focus:ring-amber-100 text-sm shadow-sm hover:shadow-md transition-all"
            />
            <div className="absolute right-2 top-1/2 -translate-y-1/2 flex gap-2">
              {searchQuery && (
                <button
                  type="button"
                  onClick={handleClearSearch}
                  className="px-4 py-2 bg-zinc-100 text-zinc-700 rounded-lg text-sm font-medium hover:bg-zinc-200 transition-colors"
                >
                  Clear
                </button>
              )}
              <button
                type="submit"
                className="px-4 py-2 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-lg text-sm font-semibold hover:from-amber-600 hover:to-orange-600 shadow-sm"
              >
                Search
              </button>
            </div>
          </form>
          {searchQuery && (
            <p className="mt-3 text-sm text-zinc-600 flex items-center gap-2">
              <span>🔍 Searching for:</span>
              <span className="font-semibold text-amber-700 bg-amber-50 px-2 py-1 rounded">"{searchQuery}"</span>
            </p>
          )}
        </section>

        {/* CATEGORY FILTERS */}
        <section className="mb-6">
          <h3 className="text-sm font-semibold text-zinc-700 mb-3">🏷️ Categories</h3>
          <div className="flex gap-3 overflow-x-auto py-2 scrollbar-hide">
            {categories.map((c) => {
              const categoryEmojis: Record<string, string> = {
                All: "🌐",
                ETHICS: "⚖️",
                LIFESTYLE: "🏡",
                POLITICS: "🏛️",
                WORK: "💼",
                PERSONAL: "👤",
                TECHNOLOGY: "💻",
                OTHER: "📌"
              };
              return (
                <button
                  key={c}
                  onClick={() => setActive(c)}
                  className={`whitespace-nowrap rounded-full px-5 py-2.5 text-sm font-medium transition-all ${
                    active === c
                      ? "bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-md scale-105"
                      : "bg-white text-zinc-700 shadow-sm hover:shadow-md hover:scale-105 border border-zinc-200"
                  }`}
                >
                  <span className="mr-1.5">{categoryEmojis[c] || categoryEmojis.OTHER}</span>
                  {c === "All"
                    ? "All Dilemmas"
                    : c.charAt(0) + c.slice(1).toLowerCase()}
                </button>
              );
            })}
          </div>
        </section>

        {/* TIME FILTERS */}
        <section className="mb-8">
          <h3 className="text-sm font-semibold text-zinc-700 mb-3">🕒 Time Period</h3>
          <div className="flex gap-3 overflow-x-auto scrollbar-hide">
            {[
              { label: "All Time", value: "ALL", emoji: "♾️" },
              { label: "Past Day", value: "DAY", emoji: "☀️" },
              { label: "Past Week", value: "WEEK", emoji: "📅" },
              { label: "Past Month", value: "MONTH", emoji: "🗓️" },
              { label: "Past Year", value: "YEAR", emoji: "🎆" },
            ].map((item) => (
              <button
                key={item.value}
                onClick={() => setTimeFilter(item.value)}
                className={`rounded-full px-5 py-2.5 text-sm font-medium transition-all ${
                  timeFilter === item.value
                    ? "bg-gradient-to-r from-slate-700 to-slate-900 text-white shadow-md scale-105"
                    : "bg-white text-zinc-700 shadow-sm hover:shadow-md hover:scale-105 border border-zinc-200"
                }`}
              >
                <span className="mr-1.5">{item.emoji}</span>
                {item.label}
              </button>
            ))}
          </div>
        </section>

        {/* DILEMMA LIST */}
        <section>
          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-amber-500 border-t-transparent"></div>
              <p className="mt-4 text-zinc-500 font-medium">Loading dilemmas…</p>
            </div>
          ) : (
            <div className="space-y-5">
              {visible.map((d) => {
                const colors = getCategoryColor(d.category);
                return (
                  <a
                    key={d.id}
                    href={`/dilemma/${d.id}`}
                    className="block rounded-2xl bg-white p-6 shadow-md hover:shadow-xl transition-all cursor-pointer border border-zinc-100 hover:border-amber-200 transform hover:-translate-y-1"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-3">
                          {d.category && (
                            <span
                              className={`rounded-full px-3 py-1 text-xs font-semibold ${colors.bg} ${colors.text} shadow-sm`}
                            >
                              {d.category.toUpperCase()}
                            </span>
                          )}
                        </div>

                        <h2 className="text-xl font-bold text-slate-900 mb-2 hover:text-amber-600 transition-colors">
                          {d.title}
                        </h2>

                        <p className="text-sm text-zinc-600 line-clamp-2 leading-relaxed mb-4">
                          {d.description}
                        </p>

                        <div className="flex items-center gap-4 text-xs text-zinc-500">
                          <span className="font-medium text-zinc-700 flex items-center gap-1">
                            <span>✍️</span>
                            {d.author?.username || "Anonymous"}
                          </span>
                          <span>•</span>
                          <span className="flex items-center gap-1">
                            <span>📅</span>
                            {d.createdAt
                              ? new Date(d.createdAt).toLocaleDateString(
                                  "en-US",
                                  { month: 'short', day: 'numeric', year: 'numeric' }
                                )
                              : "—"}
                          </span>
                          <span>•</span>
                          <span className="flex items-center gap-1 font-medium text-amber-600">
                            <span>🗳️</span>
                            {d.votes?.length ?? 0}
                          </span>
                          <span>•</span>
                          <span className="flex items-center gap-1 font-medium text-blue-600">
                            <span>💬</span>
                            {d.comments?.length ?? 0}
                          </span>
                        </div>
                      </div>
                    </div>
                  </a>
                );
              })}

              {visible.length === 0 && !loading && (
                <div className="text-center py-16 px-6">
                  <div className="text-6xl mb-4">🔍</div>
                  <h3 className="text-xl font-bold text-zinc-800 mb-2">
                    {searchQuery ? "No results found" : "No dilemmas found"}
                  </h3>
                  <p className="text-sm text-zinc-600 mb-6 max-w-md mx-auto">
                    {searchQuery
                      ? `No dilemmas match "${searchQuery}". Try a different search term.`
                      : "No dilemmas found for this filter. Try adjusting your filters."}
                  </p>
                  {searchQuery && (
                    <button
                      onClick={handleClearSearch}
                      className="px-5 py-2.5 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-lg text-sm font-semibold shadow-md hover:shadow-lg hover:from-amber-600 hover:to-orange-600"
                    >
                      Clear search
                    </button>
                  )}
                </div>
              )}
            </div>
          )}
        </section>

        {/* PAGINATION */}
        {!loading && totalPages > 1 && (
          <section className="mt-10 flex justify-center items-center gap-3">
            <button
              onClick={() => handlePageChange(page - 1)}
              disabled={page === 1}
              className={`px-5 py-2.5 rounded-lg text-sm font-semibold transition-all ${
                page === 1
                  ? "bg-zinc-100 text-zinc-400 cursor-not-allowed"
                  : "bg-white text-zinc-700 hover:bg-zinc-50 shadow-md hover:shadow-lg border border-zinc-200"
              }`}
            >
              ← Previous
            </button>

            <div className="flex gap-2">
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let pageNum: number;
                
                if (totalPages <= 5) {
                  pageNum = i + 1;
                } else if (page <= 3) {
                  pageNum = i + 1;
                } else if (page >= totalPages - 2) {
                  pageNum = totalPages - 4 + i;
                } else {
                  pageNum = page - 2 + i;
                }

                return (
                  <button
                    key={pageNum}
                    onClick={() => handlePageChange(pageNum)}
                    className={`w-11 h-11 rounded-lg text-sm font-semibold transition-all ${
                      page === pageNum
                        ? "bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-md scale-110"
                        : "bg-white text-zinc-700 hover:bg-zinc-50 shadow-sm hover:shadow-md border border-zinc-200"
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}
            </div>

            <button
              onClick={() => handlePageChange(page + 1)}
              disabled={!hasMore}
              className={`px-5 py-2.5 rounded-lg text-sm font-semibold transition-all ${
                !hasMore
                  ? "bg-zinc-100 text-zinc-400 cursor-not-allowed"
                  : "bg-white text-zinc-700 hover:bg-zinc-50 shadow-md hover:shadow-lg border border-zinc-200"
              }`}
            >
              Next →
            </button>
          </section>
        )}
      </main>
    </div>
  );
}
