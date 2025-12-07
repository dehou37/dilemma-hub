"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

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
    fetch("http://localhost:5000/api/auth/me", { credentials: "include" })
      .then((r) => r.json())
      .then((data) => {
        if (data.user) setCurrentUser(data.user);
      })
      .catch(() => {});
  }, []);

  // Fetch dilemma
  useEffect(() => {
    fetch(`http://localhost:5000/api/dilemmas/${id}`)
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
    fetch(`http://localhost:5000/api/comments/dilemma/${id}`)
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
      const res = await fetch("http://localhost:5000/api/votes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ dilemmaId: id, option: optionIndex }),
      });

      if (res.ok) {
        setSelectedOption(optionIndex);
        setHasVoted(true);
        // Refresh dilemma to get updated vote counts
        const updated = await fetch(`http://localhost:5000/api/dilemmas/${id}`).then((r) => r.json());
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
      const res = await fetch("http://localhost:5000/api/comments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ dilemmaId: id, content: newComment }),
      });

      if (res.ok) {
        setNewComment("");
        // Refresh comments to show new comment with user info
        const updatedComments = await fetch(`http://localhost:5000/api/comments/dilemma/${id}`).then((r) => r.json());
        setComments(updatedComments || []);
        // Also refresh dilemma to update comment count
        const updatedDilemma = await fetch(`http://localhost:5000/api/dilemmas/${id}`).then((r) => r.json());
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
        <div className="text-lg text-zinc-500">Loading...</div>
      </div>
    );
  }

  if (!dilemma) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-zinc-800 mb-2">Dilemma not found</h2>
          <button
            onClick={() => router.push("/")}
            className="text-amber-600 hover:underline"
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
    <div className="min-h-screen bg-zinc-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Back button */}
        <button
          onClick={() => router.push("/")}
          className="mb-6 text-sm text-zinc-600 hover:text-zinc-900 flex items-center gap-1"
        >
          ← Back to dilemmas
        </button>

        {/* Dilemma Card */}
        <div className="bg-white rounded-xl shadow-md p-8 mb-6">
          {/* Category Badge */}
          <span
            className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${categoryStyle.bg} ${categoryStyle.text} mb-4`}
          >
            <span>{categoryStyle.emoji}</span>
            {dilemma.category}
          </span>

          {/* Title */}
          <h1 className="text-3xl font-bold text-zinc-900 mb-4">{dilemma.title}</h1>

          {/* Description */}
          <p className="text-zinc-700 text-lg mb-6 leading-relaxed">{dilemma.description}</p>

          {/* Meta info */}
          <div className="text-sm text-zinc-500 mb-8">
            Posted {new Date(dilemma.createdAt).toLocaleDateString()} • {totalVotes} votes • {comments.length} comments
          </div>

          {/* Voting Options */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-zinc-800 mb-3">Choose your stance:</h3>
            {dilemma.options.map((option, index) => {
              const percentage = getVotePercentage(index);
              const voteCount = getVoteCount(index);
              const isSelected = selectedOption === index;

              return (
                <div key={index} className="relative">
                  <button
                    onClick={() => handleVote(index)}
                    disabled={hasVoted}
                    className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
                      isSelected
                        ? "border-amber-500 bg-amber-50"
                        : hasVoted
                        ? "border-zinc-200 bg-zinc-50 cursor-not-allowed"
                        : "border-zinc-300 hover:border-amber-400 hover:bg-amber-50"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium text-zinc-900">{option}</span>
                      {hasVoted && (
                        <span className="text-sm font-semibold text-zinc-700">
                          {percentage}% ({voteCount})
                        </span>
                      )}
                    </div>

                    {/* Progress bar (only show after voting) */}
                    {hasVoted && (
                      <div className="w-full bg-zinc-200 rounded-full h-2 overflow-hidden">
                        <div
                          className={`h-full transition-all ${
                            isSelected ? "bg-amber-500" : "bg-zinc-400"
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
            <p className="mt-4 text-sm text-zinc-500 text-center">
              <a href="/login" className="text-amber-600 hover:underline">
                Log in
              </a>{" "}
              to vote and comment
            </p>
          )}
        </div>

        {/* Comments Section */}
        <div className="bg-white rounded-xl shadow-md p-8">
          <h2 className="text-2xl font-bold text-zinc-900 mb-6">
            Comments ({comments.length})
          </h2>

          {/* Comment Form */}
          {currentUser ? (
            <form onSubmit={handleCommentSubmit} className="mb-8">
              <textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Share your thoughts..."
                className="w-full border border-zinc-300 rounded-lg p-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-amber-500"
                rows={4}
              />
              <div className="flex justify-end mt-2">
                <button
                  type="submit"
                  disabled={submittingComment || !newComment.trim()}
                  className="px-4 py-2 bg-amber-500 text-white rounded-lg text-sm font-medium hover:bg-amber-600 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {submittingComment ? "Posting..." : "Post Comment"}
                </button>
              </div>
            </form>
          ) : (
            <div className="mb-8 p-4 bg-zinc-50 rounded-lg text-center">
              <p className="text-sm text-zinc-600">
                <a href="/login" className="text-amber-600 hover:underline font-medium">
                  Log in
                </a>{" "}
                to join the discussion
              </p>
            </div>
          )}

          {/* Comments List */}
          <div className="space-y-4">
            {loadingComments ? (
              <p className="text-zinc-500 text-center py-8">Loading comments...</p>
            ) : comments.length === 0 ? (
              <p className="text-zinc-500 text-center py-8">No comments yet. Be the first to share your thoughts!</p>
            ) : (
              comments.map((comment) => (
                <div key={comment.id} className="border-b border-zinc-200 pb-4 last:border-b-0">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-full bg-amber-500 flex items-center justify-center text-white font-semibold">
                      {comment.user?.username?.[0]?.toUpperCase() || "?"}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium text-zinc-900">
                          {comment.user?.username || "Anonymous"}
                        </span>
                        <span className="text-xs text-zinc-500">
                          {new Date(comment.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-zinc-700 text-sm leading-relaxed">{comment.content}</p>
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
