export async function fetchCurrentUser(): Promise<any | null> {
  if (typeof window === "undefined") return null;
  try {
    const res = await fetch("http://localhost:5000/api/auth/me", {
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
    await fetch("http://localhost:5000/api/auth/logout", {
      method: "POST",
      credentials: "include",
    });
  } catch (err) {
    // ignore
  }
  window.location.href = "/";
}
