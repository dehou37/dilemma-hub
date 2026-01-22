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
  const [generateAIImage, setGenerateAIImage] = useState(false);
  const [imagePrompt, setImagePrompt] = useState("");
  const [imageStyle, setImageStyle] = useState<"vivid" | "natural">("vivid");
  const [generatingImage, setGeneratingImage] = useState(false);
  const [previewImageUrl, setPreviewImageUrl] = useState<string | null>(null);

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
          generateAIImage,
          imagePrompt: generateAIImage ? imagePrompt.trim() : undefined,
          imageStyle: generateAIImage ? imageStyle : undefined,
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

  const handleGeneratePreview = async () => {
    if (!imagePrompt.trim()) {
      setError("Please enter an image prompt");
      return;
    }

    setGeneratingImage(true);
    setError(null);

    try {
      const res = await fetch(`${API_URL}/api/ai/generate-image`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          prompt: imagePrompt.trim(),
          style: imageStyle,
          size: "1024x1024",
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to generate image");
      }

      setPreviewImageUrl(data.imageUrl);
    } catch (err: any) {
      setError(err.message || "Failed to generate preview image");
    } finally {
      setGeneratingImage(false);
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
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-rose-50 relative overflow-hidden py-8">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(251,191,36,0.15),transparent_50%),radial-gradient(circle_at_70%_60%,rgba(249,115,22,0.15),transparent_50%)] z-0" />
      <div className="relative z-10 max-w-3xl mx-auto px-4">
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

          {/* AI Image Generation */}
          <div className="border-t pt-6">
            <div className="flex items-center gap-3 mb-4">
              <input
                type="checkbox"
                id="generateAI"
                checked={generateAIImage}
                onChange={(e) => setGenerateAIImage(e.target.checked)}
                className="w-4 h-4 text-amber-500 border-zinc-300 rounded focus:ring-amber-500"
              />
              <label htmlFor="generateAI" className="text-sm font-semibold text-zinc-800 cursor-pointer">
                ✨ Generate AI Image/Comic
              </label>
            </div>

            {generateAIImage && (
              <div className="space-y-4 pl-7">
                <div>
                  <label className="block text-sm font-medium text-zinc-700 mb-2">
                    Image Prompt
                  </label>
                  <textarea
                    value={imagePrompt}
                    onChange={(e) => setImagePrompt(e.target.value)}
                    placeholder="Describe the image you want to generate (e.g., 'A comic-style illustration of a person at a crossroads')"
                    className="w-full border border-zinc-300 rounded-lg px-4 py-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-amber-500"
                    rows={3}
                    maxLength={1000}
                  />
                  <p className="text-xs text-zinc-500 mt-1">{imagePrompt.length}/1000 characters</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-zinc-700 mb-2">
                    Image Style
                  </label>
                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={() => setImageStyle("vivid")}
                      className={`flex-1 px-4 py-2 rounded-lg border-2 text-sm font-medium transition-all ${
                        imageStyle === "vivid"
                          ? "bg-purple-100 text-purple-700 border-purple-500"
                          : "bg-white text-zinc-700 border-zinc-200 hover:border-zinc-400"
                      }`}
                    >
                      🎨 Vivid (Comic-style)
                    </button>
                    <button
                      type="button"
                      onClick={() => setImageStyle("natural")}
                      className={`flex-1 px-4 py-2 rounded-lg border-2 text-sm font-medium transition-all ${
                        imageStyle === "natural"
                          ? "bg-green-100 text-green-700 border-green-500"
                          : "bg-white text-zinc-700 border-zinc-200 hover:border-zinc-400"
                      }`}
                    >
                      📷 Natural (Realistic)
                    </button>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleGeneratePreview}
                  disabled={generatingImage || !imagePrompt.trim()}
                  className="w-full px-4 py-2 bg-purple-500 text-white rounded-lg font-medium hover:bg-purple-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {generatingImage ? "Generating Preview..." : "🔮 Generate Preview"}
                </button>

                {previewImageUrl && (
                  <div className="mt-4 border-2 border-purple-200 rounded-lg p-4 bg-purple-50">
                    <p className="text-sm font-medium text-purple-900 mb-2">Preview:</p>
                    <img
                      src={previewImageUrl}
                      alt="AI Generated Preview"
                      className="w-full rounded-lg shadow-md"
                    />
                    <p className="text-xs text-purple-700 mt-2">
                      This image will be attached to your dilemma when you post it.
                    </p>
                  </div>
                )}
              </div>
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
