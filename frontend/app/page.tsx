"use client";
import { useEffect, useState } from "react";

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
  votes?: any[];
  comments?: any[];
  createdAt: string;
};

export default function Home() {
  const [dilemmas, setDilemmas] = useState<Dilemma[]>([]);
  const [loading, setLoading] = useState(true);
  const [active, setActive] = useState("All");
  const [categories, setCategories] = useState<string[]>([]);
  const [timeFilter, setTimeFilter] = useState("ALL"); // Time filter

  // ✅ Fetch dilemmas
  useEffect(() => {
    let mounted = true;

    (async () => {
      try {
        const res = await fetch("http://localhost:5000/api/dilemmas");
        const data = await res.json();

        if (!mounted) return;

        const list: Dilemma[] = data || [];
        setDilemmas(list);

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
  }, []);

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

  return (
    <div className="min-h-screen bg-zinc-50">
      <main className="mx-auto max-w-4xl px-6 py-10">
        {/* HERO */}
        <section className="mb-6 text-center">
          <h1 className="text-4xl font-extrabold text-slate-900">
            What Would You Do?
          </h1>
          <p className="mt-2 text-zinc-600">
            A community for exploring life's most challenging moral questions.
            Share dilemmas, debate perspectives, and discover where you stand.
          </p>
        </section>

        {/* CATEGORY FILTERS */}
        <section className="mb-6">
          <div className="flex gap-3 overflow-x-auto py-2">
            {categories.map((c) => (
              <button
                key={c}
                onClick={() => setActive(c)}
                className={`whitespace-nowrap rounded-full px-4 py-2 text-sm ${
                  active === c
                    ? "bg-slate-800 text-white"
                    : "bg-white text-zinc-700 shadow-sm"
                }`}
              >
                {c === "All"
                  ? "All Dilemmas"
                  : c.charAt(0) + c.slice(1).toLowerCase()}
              </button>
            ))}
          </div>
        </section>

        {/* TIME FILTERS */}
        <section className="mb-6">
          <div className="flex gap-3 overflow-x-auto">
            {[
              { label: "All Time", value: "ALL" },
              { label: "Past Day", value: "DAY" },
              { label: "Past 7 Days", value: "WEEK" },
              { label: "Past Month", value: "MONTH" },
              { label: "Past Year", value: "YEAR" },
            ].map((item) => (
              <button
                key={item.value}
                onClick={() => setTimeFilter(item.value)}
                className={`rounded-full px-4 py-2 text-sm ${
                  timeFilter === item.value
                    ? "bg-slate-800 text-white"
                    : "bg-white text-zinc-700 shadow-sm"
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
        </section>

        {/* DILEMMA LIST */}
        <section>
          {loading ? (
            <div className="text-center text-zinc-500">
              Loading dilemmas…
            </div>
          ) : (
            <div className="space-y-4">
              {visible.map((d) => {
                const colors = getCategoryColor(d.category);

                return (
                  <article
                    key={d.id}
                    className="rounded-lg bg-white p-4 shadow-sm"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          {d.category && (
                            <span
                              className={`rounded-full px-2 py-0.5 text-xs font-medium ${colors.bg} ${colors.text}`}
                            >
                              {d.category.toUpperCase()}
                            </span>
                          )}

                          <h2 className="mt-1 text-lg font-semibold text-slate-900">
                            {d.title}
                          </h2>
                        </div>

                        <p className="mt-2 text-sm text-zinc-600 line-clamp-2">
                          {d.description}
                        </p>

                        <div className="mt-3 flex items-center gap-4 text-sm text-zinc-500">
                          <span>
                            {d.createdAt
                              ? new Date(d.createdAt).toLocaleDateString(
                                  "en-CA"
                                )
                              : "—"}
                          </span>
                          <span>{d.votes?.length ?? 0} votes</span>
                          <span>{d.comments?.length ?? 0} comments</span>
                        </div>
                      </div>
                    </div>
                  </article>
                );
              })}

              {visible.length === 0 && (
                <div className="text-center text-sm text-zinc-500">
                  No dilemmas found for this filter.
                </div>
              )}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
