"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { API_URL } from "../../lib/config";

const CATEGORIES = [
  "ETHICS",
  "TECHNOLOGY",
  "PERSONAL",
  "WORK",
  "POLITICS",
  "LIFESTYLE",
  "OTHER",
];

const categoryColors: Record<string, { bg: string; text: string; emoji: string }> = {
  ETHICS: { bg: "bg-red-100", text: "text-red-700", emoji: "⚖️" },
  LIFESTYLE: { bg: "bg-orange-100", text: "text-orange-700", emoji: "🏡" },
  POLITICS: { bg: "bg-lime-100", text: "text-lime-700", emoji: "🏛️" },
  WORK: { bg: "bg-violet-100", text: "text-violet-700", emoji: "💼" },
  PERSONAL: { bg: "bg-teal-100", text: "text-teal-700", emoji: "👤" },
  TECHNOLOGY: { bg: "bg-indigo-100", text: "text-indigo-700", emoji: "💻" },
  OTHER: { bg: "bg-zinc-200", text: "text-zinc-700", emoji: "📌" },
};

export default function CreateDilemmaPage() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("ETHICS");
  const [options, setOptions] = useState(["", ""]);

  useEffect(() => {
    // Check if user is logged in
    fetch(`${API_URL}/api/auth/me`, { credentials: "include" })
      .then((r) => r.json())
      .then((data) => {
        if (data.user) {
          setCurrentUser(data.user);
        } else {
          router.push("/login");
        }
      })
      .catch(() => router.push("/login"));
  }, [router]);

  const handleAddOption = () => {
    if (options.length < 6) {
      setOptions([...options, ""]);
    }
  };

  const handleRemoveOption = (index: number) => {
    if (options.length > 2) {
      setOptions(options.filter((_, i) => i !== index));
    }
  };

  const handleOptionChange = (index: number, value: string) => {
    const newOptions = [...options];
    newOptions[index] = value;
    setOptions(newOptions);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validation
    if (!title.trim()) {
      setError("Title is required");
      return;
    }
    if (!description.trim()) {
      setError("Description is required");
      return;
    }
    const validOptions = options.filter((opt) => opt.trim() !== "");
    if (validOptions.length < 2) {
      setError("At least 2 options are required");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/dilemmas`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          title: title.trim(),
          description: description.trim(),
          category,
          options: validOptions,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to create dilemma");
      }

      // Redirect to the new dilemma page
      router.push(`/dilemma/${data.id}`);
    } catch (err: any) {
      setError(err.message || "An error occurred");
      setLoading(false);
    }
  };

  if (!currentUser) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg text-zinc-500">Loading...</div>
      </div>
    );
  }

  const categoryStyle = categoryColors[category];

  return (
    <div className="min-h-screen bg-zinc-50 py-8">
      <div className="max-w-3xl mx-auto px-4">
        <div className="mb-6">
          <button
            onClick={() => router.push("/")}
            className="text-sm text-zinc-600 hover:text-zinc-900 flex items-center gap-1 mb-4"
          >
            ← Back to home
          </button>
          <h1 className="text-3xl font-bold text-zinc-900">Post a Dilemma</h1>
          <p className="text-zinc-600 mt-2">
            Share a moral question or ethical dilemma with the community
          </p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-md p-8 space-y-6">
          {/* Title */}
          <div>
            <label className="block text-sm font-semibold text-zinc-800 mb-2">
              Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Should I report my colleague's unethical behavior?"
              className="w-full border border-zinc-300 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
              maxLength={200}
            />
            <p className="text-xs text-zinc-500 mt-1">{title.length}/200 characters</p>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-semibold text-zinc-800 mb-2">
              Description <span className="text-red-500">*</span>
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Provide context and details about your dilemma..."
              className="w-full border border-zinc-300 rounded-lg px-4 py-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-amber-500"
              rows={6}
              maxLength={2000}
            />
            <p className="text-xs text-zinc-500 mt-1">{description.length}/2000 characters</p>
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm font-semibold text-zinc-800 mb-2">
              Category <span className="text-red-500">*</span>
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {CATEGORIES.map((cat) => {
                const style = categoryColors[cat];
                const isSelected = category === cat;
                return (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setCategory(cat)}
                    className={`px-4 py-3 rounded-lg border-2 transition-all text-sm font-medium ${
                      isSelected
                        ? `${style.bg} ${style.text} border-current`
                        : "bg-white text-zinc-700 border-zinc-200 hover:border-zinc-400"
                    }`}
                  >
                    <div className="flex flex-col items-center gap-1">
                      <span className="text-lg">{style.emoji}</span>
                      <span>{cat}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Options */}
          <div>
            <label className="block text-sm font-semibold text-zinc-800 mb-2">
              Options <span className="text-red-500">*</span>
            </label>
            <p className="text-xs text-zinc-600 mb-3">
              Provide at least 2 possible responses or choices for this dilemma
            </p>
            <div className="space-y-3">
              {options.map((option, index) => (
                <div key={index} className="flex items-center gap-2">
                  <div className="flex-1">
                    <input
                      type="text"
                      value={option}
                      onChange={(e) => handleOptionChange(index, e.target.value)}
                      placeholder={`Option ${index + 1}`}
                      className="w-full border border-zinc-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                      maxLength={200}
                    />
                  </div>
                  {options.length > 2 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveOption(index)}
                      className="px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      ✕
                    </button>
                  )}
                </div>
              ))}
            </div>
            {options.length < 6 && (
              <button
                type="button"
                onClick={handleAddOption}
                className="mt-3 text-sm text-amber-600 hover:text-amber-700 font-medium"
              >
                + Add another option
              </button>
            )}
          </div>

          {/* Error message */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          {/* Submit buttons */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t">
            <button
              type="button"
              onClick={() => router.push("/")}
              className="px-6 py-2 text-zinc-700 hover:text-zinc-900 font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-amber-500 text-white rounded-lg font-medium hover:bg-amber-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Posting..." : "Post Dilemma"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
