"use client";
import { useState } from "react";
import { GoogleLogin } from "@react-oauth/google";
import { jwtDecode } from "jwt-decode";

export default function RegisterPage() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("http://localhost:5000/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ username, email, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Registration failed");
      // Server sets httpOnly cookies; frontend doesn't store tokens in localStorage
      window.location.href = "/";
    } catch (err: any) {
      setError(err.message || "An error occurred");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4">
      <div className="w-full max-w-md rounded-xl bg-white p-8 shadow-md">
        <div className="mb-6 text-center">
          <h2 className="text-2xl font-semibold text-black">Create your account</h2>
          <p className="text-sm text-zinc-500">Join Ethical Forum to share and discuss dilemmas</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-black">Username</label>
            <input
              className="w-full rounded-md border px-3 py-2 text-sm"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-black">Email</label>
            <input
              className="w-full rounded-md border px-3 py-2 text-sm"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              type="email"
              required
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-black">Password</label>
            <input
              className="w-full rounded-md border px-3 py-2 text-sm"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              type="password"
              required
            />
          </div>

          {error && <div className="text-sm text-red-600">{error}</div>}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-md bg-amber-500 px-4 py-2 text-sm font-medium text-black hover:bg-amber-600 disabled:opacity-60"
          >
            {loading ? "Creating account..." : "Create account"}
          </button>
        </form>

        <div className="my-4 flex items-center gap-3">
          <div className="flex-1 border-t"></div>
          <span className="text-xs text-zinc-500">or</span>
          <div className="flex-1 border-t"></div>
        </div>

        <div className="flex justify-center">
          <GoogleLogin onSuccess={(credentialResponse: any) => {
            const decoded: any = jwtDecode(credentialResponse.credential);
            fetch("http://localhost:5000/api/auth/google/callback", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              credentials: "include",
              body: JSON.stringify({ email: decoded.email, name: decoded.name, googleId: decoded.sub }),
            })
              .then(r => r.json())
              .then(data => { if (data.user) window.location.href = "/"; else setError(data.error); })
              .catch(() => setError("Google sign-up failed"));
          }} onError={() => setError("Google sign-up failed")} />
        </div>

        <div className="mt-4 text-center text-sm text-zinc-600">
          Already have an account? <a href="/login" className="text-amber-600">Sign in</a>
        </div>
      </div>
    </div>
  );
}
