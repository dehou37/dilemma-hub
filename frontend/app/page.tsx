"use client";
import { useEffect, useState } from "react";

type Dilemma = {
  id: string;
  title: string;
  description: string;
  category?: string;
  authorId?: string;
  votes?: any[];
  comments?: any[];
};

export default function Home() {
  const [dilemmas, setDilemmas] = useState<Dilemma[]>([]);
  const [loading, setLoading] = useState(true);
  const categories = ["All", "ETHICS", "TECHNOLOGY", "PERSONAL", "WORK", "LIFESTYLE", "POLITICS", "OTHER"];
  const [active, setActive] = useState("All");

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res = await fetch("http://localhost:5000/api/dilemmas");
        const data = await res.json();
        if (!mounted) return;
        setDilemmas(data || []);
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

  const visible = active === "All" ? dilemmas : dilemmas.filter((d) => d.category === active);

  return (
    <div className="min-h-screen bg-zinc-50">
      <main className="mx-auto max-w-4xl px-6 py-10">
        <header className="mb-8 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-md bg-slate-900 text-white flex items-center justify-center font-semibold">⚖️</div>
              <div>
                <div className="text-lg font-bold">Ethical Forum</div>
                <div className="text-sm text-zinc-500">Explore moral questions</div>
              </div>
            </div>
          </div>
          <a href="/login" className="rounded-full bg-amber-500 px-4 py-2 text-sm font-medium text-white">Post Dilemma</a>
        </header>

        <section className="mb-6 text-center">
          <h1 className="text-4xl font-extrabold">What Would You Do?</h1>
          <p className="mt-2 text-zinc-600">A community for exploring life's most challenging moral questions. Share dilemmas, debate perspectives, and discover where you stand.</p>
        </section>

        <section className="mb-6">
          <div className="flex gap-3 overflow-x-auto py-2">
            {categories.map((c) => (
              <button
                key={c}
                onClick={() => setActive(c)}
                className={`whitespace-nowrap rounded-full px-4 py-2 text-sm ${active === c ? "bg-slate-800 text-white" : "bg-white text-zinc-700 shadow-sm"}`}
              >
                {c === "All" ? "All Dilemmas" : c.charAt(0) + c.slice(1).toLowerCase()}
              </button>
            ))}
          </div>
        </section>

        <section>
          <div className="flex items-center gap-3 mb-4">
            <div className="rounded-md bg-white p-3 shadow-sm">Hot</div>
            <div className="text-sm text-zinc-500">New & Top</div>
          </div>

          {loading ? (
            <div className="text-center text-zinc-500">Loading dilemmas…</div>
          ) : (
            <div className="space-y-4">
              {visible.map((d) => (
                <article key={d.id} className="rounded-lg bg-white p-4 shadow-sm">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-700">{d.category}</span>
                        <h2 className="mt-1 text-lg font-semibold">{d.title}</h2>
                      </div>
                      <p className="mt-2 text-sm text-zinc-600 line-clamp-2">{d.description}</p>
                      <div className="mt-3 flex items-center gap-4 text-sm text-zinc-500">
                        <span>{d.votes ? d.votes.length : 0} votes</span>
                        <span>{d.comments ? d.comments.length : 0} comments</span>
                      </div>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
