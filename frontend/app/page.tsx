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
  imageUrl?: string | null;
  imagePrompt?: string | null;
};

export default function Home() {
  const [dilemmas, setDilemmas] = useState<Dilemma[]>([]);
  const [loading, setLoading] = useState(true);
  const [active, setActive] = useState("All");
  const [categories, setCategories] = useState<string[]>([]);
  const [timeFilter, setTimeFilter] = useState("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [stats, setStats] = useState({ totalDilemmas: 0, totalVotes: 0, totalComments: 0 });
  const [trendingDilemmas, setTrendingDilemmas] = useState<Dilemma[]>([]);

  // Fetch global stats
  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(`${API_URL}/api/dilemmas/stats`);
        const data = await res.json();
        setStats(data);
      } catch (err) {
        console.error(err);
      }
    })();
  }, []);

  // Fetch categories
  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(`${API_URL}/api/dilemmas/categories`);
        const data = await res.json();
        setCategories(data);
      } catch (err) {
        console.error(err);
      }
    })();
  }, []);

  // Fetch trending dilemmas
  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(`${API_URL}/api/dilemmas/trending`);
        const data = await res.json();
        setTrendingDilemmas(data);
      } catch (err) {
        console.error(err);
      }
    })();
  }, []);

  // ✅ Fetch dilemmas
  useEffect(() => {
    let mounted = true;

    (async () => {
      try {
        const params = new URLSearchParams();
        
        if (searchQuery) {
          params.append("search", searchQuery);
        }

        const url = `${API_URL}/api/dilemmas${params.toString() ? '?' + params.toString() : ''}`;
        const res = await fetch(url);
        const dilemmas = await res.json();

        if (!mounted) return;

        setDilemmas(dilemmas);
      } catch (err) {
        console.error(err);
      } finally {
        if (mounted) setLoading(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, [searchQuery]);

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

    // 3️⃣ Maintain chronological order (latest first, already sorted by backend)
    // No additional sorting needed - backend returns dilemmas ordered by createdAt desc
    return filtered;
  }

  const visible = applyFilters(dilemmas);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchQuery(searchInput);
    setLoading(true);
  };

  const handleClearSearch = () => {
    setSearchInput("");
    setSearchQuery("");
    setLoading(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-rose-50 relative overflow-visible">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(251,191,36,0.15),transparent_50%),radial-gradient(circle_at_70%_60%,rgba(249,115,22,0.15),transparent_50%)] z-0" />

      <main className="relative z-10 container mx-auto px-4 py-8">
        <section className="text-center mb-16 animate-fadeInUp">
          <div className="inline-block bg-gradient-to-r from-amber-100 to-orange-100 rounded-full px-5 py-2 mb-6 shadow-sm border border-amber-200">
            <span className="text-sm font-bold text-amber-900">
              🔥 {stats.totalDilemmas} Dilemmas Shared
            </span>
          </div>
          <h1 className="text-6xl font-extrabold bg-gradient-to-r from-slate-900 via-amber-900 to-orange-900 bg-clip-text text-transparent mb-4 animate-gradient">
            What Would You Do?
          </h1>
          <p className="mt-4 text-lg text-zinc-700 max-w-2xl mx-auto leading-relaxed">
            A community for exploring life's most challenging moral questions.
            Share dilemmas, debate perspectives, and discover where you stand.
          </p>
          
          {/* Stats Dashboard */}
          {stats.totalDilemmas > 0 && (
            <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-2xl mx-auto">
              <div className="bg-white rounded-xl p-4 shadow-md border border-zinc-100 hover:shadow-lg transition-all animate-scaleIn">
                <div className="text-3xl font-bold bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent">
                  {stats.totalDilemmas}
                </div>
                <div className="text-sm text-zinc-600 font-medium">Dilemmas</div>
              </div>
              <div className="bg-white rounded-xl p-4 shadow-md border border-zinc-100 hover:shadow-lg transition-all animate-scaleIn" style={{animationDelay: '0.1s'}}>
                <div className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                  {stats.totalVotes}
                </div>
                <div className="text-sm text-zinc-600 font-medium">Total Votes</div>
              </div>
              <div className="bg-white rounded-xl p-4 shadow-md border border-zinc-100 hover:shadow-lg transition-all animate-scaleIn" style={{animationDelay: '0.2s'}}>
                <div className="text-3xl font-bold bg-gradient-to-r from-green-600 to-teal-600 bg-clip-text text-transparent">
                  {stats.totalComments}
                </div>
                <div className="text-sm text-zinc-600 font-medium">Comments</div>
              </div>
            </div>
          )}
        </section>

        {/* Trending Section */}
        {trendingDilemmas.length > 0 && (
          <section className="mb-10 animate-fadeIn">
            <div className="flex items-center gap-3 mb-4">
              <h2 className="text-2xl font-bold text-zinc-900">🔥 Trending Now</h2>
              <div className="h-px flex-1 bg-gradient-to-r from-amber-200 to-transparent"></div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {trendingDilemmas.map((d, idx) => {
                const colors = getCategoryColor(d.category);
                return (
                  <a
                    key={d.id}
                    href={`/dilemma/${d.id}`}
                    className="group relative overflow-hidden rounded-xl bg-gradient-to-br from-white to-zinc-50 p-5 shadow-md hover:shadow-2xl transition-all transform hover:-translate-y-2 border border-zinc-200 hover:border-amber-300"
                    style={{animationDelay: `${idx * 0.1}s`}}
                  >
                    <div className="absolute top-3 right-3 w-8 h-8 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 text-white flex items-center justify-center text-xs font-bold shadow-lg">
                      #{idx + 1}
                    </div>
                    <span className={`inline-block mb-3 px-2.5 py-1 rounded-full text-xs font-bold ${colors.bg} ${colors.text}`}>
                      {d.category}
                    </span>
                    <h3 className="text-base font-bold text-zinc-900 mb-2 line-clamp-2 group-hover:text-amber-600 transition-colors">
                      {d.title}
                    </h3>
                    <div className="flex items-center gap-3 text-xs text-zinc-500 mt-3">
                      <span className="flex items-center gap-1 font-semibold text-amber-600">
                        🗳️ {d.votes?.length || 0}
                      </span>
                      <span className="flex items-center gap-1 font-semibold text-blue-600">
                        💬 {d.comments?.length || 0}
                      </span>
                    </div>
                  </a>
                );
              })}
            </div>
          </section>
        )}

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
          <div className="flex items-center gap-3 mb-5">
            <h2 className="text-2xl font-bold text-zinc-900">💭 All Dilemmas</h2>
            <div className="h-px flex-1 bg-gradient-to-r from-zinc-200 to-transparent"></div>
          </div>
          
          {loading ? (
            <div className="space-y-5">
              {[1, 2, 3].map((i) => (
                <div key={i} className="rounded-2xl bg-white p-6 shadow-md border border-zinc-100">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 space-y-3">
                      <div className="w-24 h-6 skeleton rounded-full"></div>
                      <div className="w-3/4 h-7 skeleton rounded"></div>
                      <div className="w-full h-4 skeleton rounded"></div>
                      <div className="w-5/6 h-4 skeleton rounded"></div>
                      <div className="flex gap-4 mt-4">
                        <div className="w-20 h-4 skeleton rounded"></div>
                        <div className="w-20 h-4 skeleton rounded"></div>
                        <div className="w-16 h-4 skeleton rounded"></div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-5">
              {visible.map((d, idx) => {
                const colors = getCategoryColor(d.category);
                const isHot = (d.votes?.length || 0) >= 5;
                return (
                  <a
                    key={d.id}
                    href={`/dilemma/${d.id}`}
                    className="group block rounded-2xl bg-white p-6 shadow-md hover:shadow-2xl transition-all cursor-pointer border border-zinc-100 hover:border-amber-300 transform hover:-translate-y-2 relative overflow-hidden animate-fadeInUp"
                    style={{animationDelay: `${idx * 0.05}s`}}
                  >
                    {isHot && (
                      <div className="absolute top-3 right-3 bg-gradient-to-r from-red-500 to-orange-500 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg flex items-center gap-1 animate-pulse z-10">
                        🔥 Hot
                      </div>
                    )}
                    <div className="flex items-start justify-between gap-6">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-3">
                          {d.category && (
                            <span
                              className={`rounded-full px-3 py-1.5 text-xs font-semibold ${colors.bg} ${colors.text} shadow-sm`}
                            >
                              {d.category.toUpperCase()}
                            </span>
                          )}
                        </div>

                        <h2 className="text-xl font-bold text-slate-900 mb-3 group-hover:text-amber-600 transition-colors leading-snug">
                          {d.title}
                        </h2>

                        <p className="text-sm text-zinc-600 line-clamp-2 leading-relaxed mb-4">
                          {d.description}
                        </p>

                        <div className="flex items-center gap-4 text-xs text-zinc-500 flex-wrap">
                          <span className="font-medium text-zinc-700 flex items-center gap-1.5">
                            <span className="text-base">✍️</span>
                            {d.author?.username || "Anonymous"}
                          </span>
                          <span className="text-zinc-300">•</span>
                          <span className="flex items-center gap-1.5">
                            <span className="text-base">📅</span>
                            {d.createdAt
                              ? new Date(d.createdAt).toLocaleDateString(
                                  "en-US",
                                  { month: 'short', day: 'numeric', year: 'numeric' }
                                )
                              : "—"}
                          </span>
                          <span className="text-zinc-300">•</span>
                          <span className="flex items-center gap-1.5 font-semibold text-amber-600 bg-amber-50 px-2 py-1 rounded">
                            <span className="text-base">🗳️</span>
                            {d.votes?.length ?? 0}
                          </span>
                          <span className="text-zinc-300">•</span>
                          <span className="flex items-center gap-1.5 font-semibold text-blue-600 bg-blue-50 px-2 py-1 rounded">
                            <span className="text-base">💬</span>
                            {d.comments?.length ?? 0}
                          </span>
                        </div>
                      </div>
                      
                      {/* AI Generated Image Thumbnail */}
                      {d.imageUrl && (
                        <div className="flex-shrink-0 w-32 h-32 relative">
                          <img
                            src={d.imageUrl}
                            alt="AI Generated"
                            className="w-full h-full object-cover rounded-lg shadow-md border-2 border-purple-200"
                          />
                          <div className="absolute top-1 right-1 bg-purple-500 text-white px-1.5 py-0.5 rounded text-[10px] font-bold shadow flex items-center gap-0.5">
                            <span>✨</span>
                            <span>AI</span>
                          </div>
                        </div>
                      )}
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
      </main>
    </div>
  );
}
