import { API_URL } from "./config";

export async function authenticatedFetch(url: string, options: RequestInit = {}) {
  const token = localStorage.getItem("token");
  
  const headers = {
    ...options.headers,
    ...(token ? { "Authorization": `Bearer ${token}` } : {}),
  };

  return fetch(url, {
    ...options,
    headers,
    credentials: "include",
  });
}

export { API_URL };
