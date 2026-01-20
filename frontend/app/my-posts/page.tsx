"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { API_URL } from "../../lib/config";

type Dilemma = {
  id: string;
  title: string;
  description: string;
  category: string;
  options: string[];
  createdAt: string;
  votes: any[];
  comments: any[];
};

const categoryColors: Record<string, { bg: string; text: string; emoji: string }> = {
  ETHICS: { bg: "bg-red-100", text: "text-red-700", emoji: "⚖️" },
  LIFESTYLE: { bg: "bg-orange-100", text: "text-orange-700", emoji: "🏡" },
  POLITICS: { bg: "bg-lime-100", text: "text-lime-700", emoji: "🏛️" },
  WORK: { bg: "bg-violet-100", text: "text-violet-700", emoji: "💼" },
  PERSONAL: { bg: "bg-teal-100", text: "text-teal-700", emoji: "👤" },
  TECHNOLOGY: { bg: "bg-indigo-100", text: "text-indigo-700", emoji: "💻" },
  OTHER: { bg: "bg-zinc-200", text: "text-zinc-700", emoji: "📌" },
};

function getCategoryStyle(category: string) {
  return categoryColors[category.toUpperCase()] || categoryColors.OTHER;
}

export default function MyPostsPage() {
  const router = useRouter();
  const [dilemmas, setDilemmas] = useState<Dilemma[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    // Check if user is logged in and fetch their posts
    fetch(`${API_URL}/api/auth/me`, { credentials: "include" })
      .then((r) => r.json())
      .then((data) => {
        if (data.user) {
          setCurrentUser(data.user);
          // Fetch user's dilemmas using the dedicated endpoint
          return fetch(`${API_URL}/api/dilemmas/my-posts`, { credentials: "include" });
        } else {
          router.push("/login");
          throw new Error("Not authenticated");
        }
      })
      .then((r) => r?.json())
      .then((data) => {
        if (data) {
          setDilemmas(data);
        }
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
      });
  }, [router]);

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!confirm("Are you sure you want to delete this dilemma? This action cannot be undone.")) {
      return;
    }

    setDeletingId(id);
    try {
      const res = await fetch(`${API_URL}/api/dilemmas/${id}`, {
        method: "DELETE",
        credentials: "include",
      });

      if (res.ok) {
        // Remove from local state
        setDilemmas(dilemmas.filter((d) => d.id !== id));
      } else {
        const data = await res.json();
        alert(data.error || "Failed to delete dilemma");
      }
    } catch (err) {
      alert("Failed to delete dilemma");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-rose-50 relative overflow-hidden py-8">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(251,191,36,0.15),transparent_50%),radial-gradient(circle_at_70%_60%,rgba(249,115,22,0.15),transparent_50%)] z-0" />
      <div className="relative z-10 max-w-4xl mx-auto px-4">
        <div className="mb-6">
          <button
            onClick={() => router.push("/")}
            className="text-sm text-zinc-600 hover:text-zinc-900 flex items-center gap-1 mb-4"
          >
            ← Back to home
          </button>
          <h1 className="text-3xl font-bold text-zinc-900">My Posts</h1>
          <p className="text-zinc-600 mt-2">
            View and manage the dilemmas you've shared with the community
          </p>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="text-lg text-zinc-500">Loading your posts...</div>
          </div>
        ) : dilemmas.length === 0 ? (
          <div className="bg-white rounded-xl shadow-md p-12 text-center">
            <div className="text-5xl mb-4">📝</div>
            <h2 className="text-xl font-semibold text-zinc-800 mb-2">No posts yet</h2>
            <p className="text-zinc-600 mb-6">
              You haven't created any dilemmas yet. Share your first moral question with the community!
            </p>
            <a
                href="/create"
                className="px-4 py-2 bg-amber-500 text-white rounded-lg text-sm font-medium hover:bg-amber-600"
              >
                + Post Dilemma
              </a>
          </div>
        ) : (
          <div className="space-y-4">
            {dilemmas.map((dilemma) => {
              const categoryStyle = getCategoryStyle(dilemma.category);
              
              return (
                <div
                  key={dilemma.id}
                  className="bg-white rounded-lg shadow-md p-6"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${categoryStyle.bg} ${categoryStyle.text}`}
                        >
                          <span>{categoryStyle.emoji}</span>
                          {dilemma.category}
                        </span>
                      </div>
                      
                      <a href={`/dilemma/${dilemma.id}`} className="block">
                        <h2 className="text-xl font-semibold text-zinc-900 mb-2 hover:text-amber-600">
                          {dilemma.title}
                        </h2>
                      </a>
                      
                      <p className="text-zinc-600 text-sm mb-4 line-clamp-2">
                        {dilemma.description}
                      </p>

                      <div className="flex items-center gap-4 text-sm text-zinc-500 mb-4">
                        <span>
                          Posted {new Date(dilemma.createdAt).toLocaleDateString()}
                        </span>
                        <span>•</span>
                        <span>{dilemma.votes?.length || 0} votes</span>
                        <span>•</span>
                        <span>{dilemma.comments?.length || 0} comments</span>
                      </div>

                      {/* Show options */}
                      <div className="space-y-2">
                        {dilemma.options.map((option, idx) => (
                          <div
                            key={idx}
                            className="text-sm text-zinc-700 bg-zinc-50 px-3 py-2 rounded"
                          >
                            Option {idx + 1}: {option}
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Action buttons */}
                    <div className="flex flex-col gap-2">
                      <a
                        href={`/edit/${dilemma.id}`}
                        className="px-4 py-2 bg-blue-500 text-white rounded-lg text-sm font-medium hover:bg-blue-600 text-center"
                      >
                        Edit
                      </a>
                      <button
                        onClick={(e) => handleDelete(dilemma.id, e)}
                        disabled={deletingId === dilemma.id}
                        className="px-4 py-2 bg-red-500 text-white rounded-lg text-sm font-medium hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {deletingId === dilemma.id ? "Deleting..." : "Delete"}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
