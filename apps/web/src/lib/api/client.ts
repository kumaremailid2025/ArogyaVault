/**
 * API Client
 * ----------
 * Lightweight fetch wrapper that routes all requests through the
 * Next.js API proxy at /api/proxy/[...path].
 *
 * WHY a proxy?
 *   - JWT access_token lives in an httpOnly cookie (JS cannot read it)
 *   - The proxy reads the cookie server-side and forwards with
 *     Authorization: Bearer header to the Python backend
 *   - Token refresh is handled transparently by the proxy (client never
 *     sees tokens)
 *
 * USAGE:
 *   const posts = await apiClient<Post[]>("/community/posts");
 *   const post  = await apiClient<Post>("/community/posts", {
 *     method: "POST",
 *     body: JSON.stringify({ content: "Hello" }),
 *   });
 */

import { useAuthStore } from "@/stores";

/* ── Types ────────────────────────────────────────────────────────── */

export interface ApiError {
  status: number;
  detail: string;
}

/**
 * Platform identifier sent with every API request.
 *
 * This tells the backend which client is calling so it can adapt
 * response shapes, pagination defaults, and push behaviour.
 *
 * Values: "web" | "ios" | "android" | "api"
 *
 * Mobile apps (React Native / Capacitor) should set this to
 * "ios" or "android" in their own client setup. The web app
 * always sends "web".
 */
const PLATFORM = "web";

/* ── Client ───────────────────────────────────────────────────────── */

export const apiClient = async <T>(
  path: string,
  options: RequestInit = {},
): Promise<T> => {
  // Route through the Next.js proxy which adds Bearer from httpOnly cookie
  const url = `/api/proxy${path}`;

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    "X-Platform": PLATFORM,
    ...(options.headers as Record<string, string>),
  };

  const res = await fetch(url, {
    ...options,
    headers,
    credentials: "include", // sends httpOnly cookies to the proxy
  });

  // If 401, the proxy already tried to refresh and failed
  // Clear client-side auth state and let the guard redirect
  if (res.status === 401) {
    useAuthStore.getState().clearUser();
    const error: ApiError = {
      status: 401,
      detail: "Session expired. Please sign in again.",
    };
    throw error;
  }

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    const error: ApiError = {
      status: res.status,
      detail: body.detail ?? body.message ?? "Something went wrong",
    };
    throw error;
  }

  return res.json() as Promise<T>;
};
