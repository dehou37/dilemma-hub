import { API_URL } from "./config";

export async function fetchCurrentUser(): Promise<any | null> {
  if (typeof window === "undefined") return null;
  try {
    const res = await fetch(`${API_URL}/api/auth/me`, {
      method: "GET",
      credentials: "include",
    });
    if (!res.ok) return null;
    const data = await res.json();
    return data.user || null;
  } catch (err) {
    return null;
  }
}

export async function logout() {
  if (typeof window === "undefined") return;
  try {
    await fetch(`${API_URL}/api/auth/logout`, {
      method: "POST",
      credentials: "include",
    });
    // Force reload to clear any cached user state
    window.location.href = "/";
  } catch (err) {
    // Even if logout fails, redirect to clear local state
    window.location.href = "/";
  }
}
