"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { API_URL } from "../../../lib/config";

type User = {
  id: string;
  username: string;
  email: string;
};

type Vote = {
  id: string;
  userId: string;
  option: number;
  user?: User;
};

type Comment = {
  id: string;
  content: string;
  userId: string;
  createdAt: string;
  user?: User;
};

type Dilemma = {
  id: string;
  title: string;
  description: string;
  category: string;
  options: string[];
  authorId: string;
  createdAt: string;
  votes: Vote[];
  comments: Comment[];
  author?: User;
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

export default function DilemmaPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [dilemma, setDilemma] = useState<Dilemma | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [hasVoted, setHasVoted] = useState(false);
  const [newComment, setNewComment] = useState("");
  const [submittingComment, setSubmittingComment] = useState(false);
  const [comments, setComments] = useState<Comment[]>([]);
  const [loadingComments, setLoadingComments] = useState(true);

  // Fetch current user
  useEffect(() => {
    fetch(`${API_URL}/api/auth/me`, { credentials: "include" })
      .then((r) => r.json())
      .then((data) => {
        if (data.user) setCurrentUser(data.user);
      })
      .catch(() => {});
  }, []);

  // Fetch dilemma
  useEffect(() => {
    fetch(`${API_URL}/api/dilemmas/${id}`)
      .then((r) => r.json())
      .then((data) => {
        setDilemma(data);
        // Check if current user has voted
        if (currentUser && data.votes) {
          const userVote = data.votes.find((v: Vote) => v.userId === currentUser.id);
          if (userVote) {
            setSelectedOption(userVote.option);
            setHasVoted(true);
          }
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [id, currentUser]);

  // Fetch comments separately
  useEffect(() => {
    fetch(`${API_URL}/api/comments/dilemma/${id}`)
      .then((r) => r.json())
      .then((data) => {
        setComments(data || []);
        setLoadingComments(false);
      })
      .catch(() => setLoadingComments(false));
  }, [id]);

  const handleVote = async (optionIndex: number) => {
    if (!currentUser) {
      router.push("/login");
      return;
    }
    if (hasVoted) return;

    try {
      const res = await fetch(`${API_URL}/api/votes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ dilemmaId: id, option: optionIndex }),
      });

      if (res.ok) {
        setSelectedOption(optionIndex);
        setHasVoted(true);
        // Refresh dilemma to get updated vote counts
        const updated = await fetch(`${API_URL}/api/dilemmas/${id}`).then((r) => r.json());
        setDilemma(updated);
      }
    } catch (err) {
      console.error("Vote failed:", err);
    }
  };

  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) {
      router.push("/login");
      return;
    }
    if (!newComment.trim()) return;

    setSubmittingComment(true);
    try {
      const res = await fetch(`${API_URL}/api/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ dilemmaId: id, content: newComment }),
      });

      if (res.ok) {
        setNewComment("");
        // Refresh comments to show new comment with user info
        const updatedComments = await fetch(`${API_URL}/api/comments/dilemma/${id}`).then((r) => r.json());
        setComments(updatedComments || []);
        // Also refresh dilemma to update comment count
        const updatedDilemma = await fetch(`${API_URL}/api/dilemmas/${id}`).then((r) => r.json());
        setDilemma(updatedDilemma);
      }
    } catch (err) {
      console.error("Comment failed:", err);
    } finally {
      setSubmittingComment(false);
    }
  };

  const getVotePercentage = (optionIndex: number) => {
    if (!dilemma || !dilemma.votes.length) return 0;
    const count = dilemma.votes.filter((v) => v.option === optionIndex).length;
    return Math.round((count / dilemma.votes.length) * 100);
  };

  const getVoteCount = (optionIndex: number) => {
    if (!dilemma) return 0;
    return dilemma.votes.filter((v) => v.option === optionIndex).length;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-16 w-16 border-4 border-amber-500 border-t-transparent mb-4"></div>
          <p className="text-lg text-zinc-600 font-medium">Loading dilemma...</p>
        </div>
      </div>
    );
  }

  if (!dilemma) {
    return (
      <div className="min-h-screen flex items-center justify-center px-6">
        <div className="text-center">
          <div className="text-6xl mb-4">😕</div>
          <h2 className="text-3xl font-bold text-zinc-800 mb-3">Dilemma not found</h2>
          <p className="text-zinc-600 mb-6">This dilemma may have been removed or doesn't exist.</p>
          <button
            onClick={() => router.push("/")}
            className="px-6 py-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-lg font-semibold shadow-md hover:shadow-lg hover:from-amber-600 hover:to-orange-600 transition-all"
          >
            ← Back to home
          </button>
        </div>
      </div>
    );
  }

  const categoryStyle = getCategoryStyle(dilemma.category);
  const totalVotes = dilemma.votes.length;

  return (
    <div className="min-h-screen py-10">
      <div className="max-w-4xl mx-auto px-6">
        {/* Back button */}
        <button
          onClick={() => router.push("/")}
          className="mb-6 text-sm text-zinc-700 hover:text-amber-600 flex items-center gap-2 font-medium transition-colors"
        >
          ← Back to dilemmas
        </button>

        {/* Dilemma Card */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-8 border border-zinc-100">
          {/* Category Badge */}
          <span
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold ${categoryStyle.bg} ${categoryStyle.text} mb-5 shadow-sm`}
          >
            <span className="text-lg">{categoryStyle.emoji}</span>
            {dilemma.category}
          </span>

          {/* Title */}
          <h1 className="text-4xl font-bold text-slate-900 mb-5 leading-tight">{dilemma.title}</h1>

          {/* Description */}
          <p className="text-zinc-700 text-lg mb-8 leading-relaxed">{dilemma.description}</p>

          {/* Meta info */}
          <div className="flex items-center gap-4 text-sm text-zinc-600 mb-8 flex-wrap">
            <span className="flex items-center gap-1">
              <span>✍️</span>
              <span className="font-semibold text-zinc-800">{dilemma.author?.username || "Anonymous"}</span>
            </span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <span>📅</span>
              {new Date(dilemma.createdAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
            </span>
            <span>•</span>
            <span className="flex items-center gap-1 font-semibold text-amber-600">
              <span>🗳️</span>
              {totalVotes} {totalVotes === 1 ? 'vote' : 'votes'}
            </span>
            <span>•</span>
            <span className="flex items-center gap-1 font-semibold text-blue-600">
              <span>💬</span>
              {comments.length} {comments.length === 1 ? 'comment' : 'comments'}
            </span>
          </div>

          {/* Voting Options */}
          <div className="space-y-4">
            <h3 className="text-xl font-bold text-zinc-900 mb-4">⚡ Choose your stance:</h3>
            {dilemma.options.map((option, index) => {
              const percentage = getVotePercentage(index);
              const voteCount = getVoteCount(index);
              const isSelected = selectedOption === index;

              return (
                <div key={index} className="relative">
                  <button
                    onClick={() => handleVote(index)}
                    disabled={hasVoted}
                    className={`w-full text-left p-5 rounded-xl border-2 transition-all transform ${
                      isSelected
                        ? "border-amber-500 bg-gradient-to-r from-amber-50 to-orange-50 shadow-md scale-[1.02]"
                        : hasVoted
                        ? "border-zinc-200 bg-zinc-50 cursor-not-allowed opacity-75"
                        : "border-zinc-300 hover:border-amber-400 hover:bg-amber-50 hover:shadow-md hover:scale-[1.01] shadow-sm"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <span className={`font-semibold ${
                        isSelected ? "text-amber-900" : "text-zinc-900"
                      }`}>
                        {isSelected && "✅ "}{option}
                      </span>
                      {hasVoted && (
                        <span className={`text-sm font-bold ${
                          isSelected ? "text-amber-700" : "text-zinc-600"
                        }`}>
                          {percentage}% <span className="text-xs font-normal">({voteCount} {voteCount === 1 ? 'vote' : 'votes'})</span>
                        </span>
                      )}
                    </div>

                    {/* Progress bar (only show after voting) */}
                    {hasVoted && (
                      <div className="w-full bg-zinc-200 rounded-full h-3 overflow-hidden shadow-inner">
                        <div
                          className={`h-full transition-all duration-500 ease-out ${
                            isSelected ? "bg-gradient-to-r from-amber-500 to-orange-500" : "bg-gradient-to-r from-zinc-400 to-zinc-500"
                          }`}
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    )}
                  </button>
                </div>
              );
            })}
          </div>

          {!currentUser && (
            <div className="mt-6 text-center p-5 bg-amber-50 rounded-xl border border-amber-200">
              <p className="text-sm text-zinc-700 mb-3 font-medium">
                🔒 Sign in to cast your vote and join the discussion
              </p>
              <button
                onClick={() => router.push("/login")}
                className="px-6 py-2.5 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-lg font-semibold shadow-md hover:shadow-lg hover:from-amber-600 hover:to-orange-600 transition-all"
              >
                Login / Sign Up
              </button>
            </div>
          )}
        </div>

        {/* Comments Section */}
        <div className="bg-white rounded-2xl shadow-xl p-8 border border-zinc-100">
          <h2 className="text-2xl font-bold text-zinc-900 mb-6 flex items-center gap-2">
            💬 Discussion ({comments.length})
          </h2>

          {/* Comment Form */}
          {currentUser ? (
            <form onSubmit={handleCommentSubmit} className="mb-8">
              <textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Share your thoughts and perspective..."
                className="w-full border-2 border-zinc-200 rounded-xl p-4 text-sm resize-none focus:outline-none focus:border-amber-400 focus:ring-4 focus:ring-amber-100 transition-all shadow-sm"
                rows={4}
              />
              <div className="flex justify-end mt-3">
                <button
                  type="submit"
                  disabled={submittingComment || !newComment.trim()}
                  className="px-6 py-2.5 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-lg text-sm font-semibold shadow-md hover:shadow-lg hover:from-amber-600 hover:to-orange-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  {submittingComment ? "📝 Posting..." : "✨ Post Comment"}
                </button>
              </div>
            </form>
          ) : (
            <div className="mb-8 p-5 bg-amber-50 rounded-xl text-center border border-amber-200">
              <p className="text-sm text-zinc-700 mb-3 font-medium">
                👋 Join the conversation!
              </p>
              <button
                onClick={() => router.push("/login")}
                className="px-6 py-2.5 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-lg font-semibold shadow-md hover:shadow-lg hover:from-amber-600 hover:to-orange-600 transition-all"
              >
                Login / Sign Up
              </button>
            </div>
          )}

          {/* Comments List */}
          <div className="space-y-5">
            {loadingComments ? (
              <div className="text-center py-12">
                <div className="inline-block animate-spin rounded-full h-10 w-10 border-4 border-amber-500 border-t-transparent mb-3"></div>
                <p className="text-zinc-500 font-medium">Loading comments...</p>
              </div>
            ) : comments.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-5xl mb-3">👋</div>
                <p className="text-zinc-600 font-medium">No comments yet.</p>
                <p className="text-sm text-zinc-500 mt-1">Be the first to share your thoughts!</p>
              </div>
            ) : (
              comments.map((comment) => (
                <div key={comment.id} className="p-5 bg-zinc-50 rounded-xl border border-zinc-200 hover:border-amber-200 transition-colors">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-white font-bold text-lg shadow-md">
                      {comment.user?.username?.[0]?.toUpperCase() || "?"}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="font-semibold text-zinc-900">
                          {comment.user?.username || "Anonymous"}
                        </span>
                        <span className="text-xs text-zinc-500 flex items-center gap-1">
                          <span>📅</span>
                          {new Date(comment.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </span>
                      </div>
                      <p className="text-zinc-700 leading-relaxed">{comment.content}</p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
