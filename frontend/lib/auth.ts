import { API_URL } from "./config";

export async function fetchCurrentUser(): Promise<any | null> {
  if (typeof window === "undefined") return null;
  try {
    const token = localStorage.getItem("token");
    if (!token) return null;

    const res = await fetch(`${API_URL}/api/auth/me`, {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${token}`
      },
      credentials: "include",
    });
    if (!res.ok) {
      localStorage.removeItem("token");
      localStorage.removeItem("refreshToken");
      return null;
    }
    const data = await res.json();
    return data.user || null;
  } catch (err) {
    return null;
  }
}

export async function logout() {
  if (typeof window === "undefined") return;
  try {
    const token = localStorage.getItem("token");
    await fetch(`${API_URL}/api/auth/logout`, {
      method: "POST",
      headers: token ? { "Authorization": `Bearer ${token}` } : {},
      credentials: "include",
    });
  } catch (err) {
    // ignore
  }
  localStorage.removeItem("token");
  localStorage.removeItem("refreshToken");
  window.location.href = "/";
}
