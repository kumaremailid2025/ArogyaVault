/**
 * API Client
 * ----------
 * Lightweight fetch wrapper for the ArogyaVault backend.
 *
 * - Attaches Bearer token from zustand store
 * - Automatically refreshes expired access tokens using the refresh token
 * - Retries the original request once after a successful refresh
 * - Redirects to sign-in if refresh also fails
 */

import { useAuthStore } from "@/stores";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

/* ── Types ────────────────────────────────────────────────────────── */

export interface ApiError {
  status: number;
  detail: string;
}

/* ── Refresh lock ─────────────────────────────────────────────────── */

// Prevent multiple concurrent refresh calls
let refreshPromise: Promise<boolean> | null = null;

async function refreshAccessToken(): Promise<boolean> {
  const { tokens, setAccessToken, logout } = useAuthStore.getState();
  const refreshToken = tokens?.refresh_token;

  if (!refreshToken) {
    logout();
    return false;
  }

  try {
    const res = await fetch(`${API_BASE_URL}/auth/refresh`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ refresh_token: refreshToken }),
    });

    if (!res.ok) {
      // Refresh failed — token expired or revoked
      logout();
      if (typeof window !== "undefined") {
        window.location.href = "/sign-in";
      }
      return false;
    }

    const data = await res.json();

    // Update access token in store
    setAccessToken(data.access_token, data.expires_in);

    // If server returned a rotated refresh token, update it too
    if (data.refresh_token) {
      const currentState = useAuthStore.getState();
      if (currentState.tokens) {
        useAuthStore.setState({
          tokens: {
            ...currentState.tokens,
            access_token: data.access_token,
            refresh_token: data.refresh_token,
            expires_in: data.expires_in,
          },
        });
      }
    }

    return true;
  } catch {
    logout();
    return false;
  }
}

/* ── Client ───────────────────────────────────────────────────────── */

export const apiClient = async <T>(
  path: string,
  options: RequestInit = {},
): Promise<T> => {
  const url = `${API_BASE_URL}${path}`;

  const makeRequest = async (token?: string): Promise<Response> => {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers as Record<string, string>),
    };

    return fetch(url, {
      ...options,
      headers,
      credentials: "include",
    });
  };

  // First attempt with current access token
  const accessToken = useAuthStore.getState().tokens?.access_token;
  let res = await makeRequest(accessToken);

  // If 401 → try refreshing the token and retry once
  if (res.status === 401 && accessToken) {
    // Use a shared promise so concurrent 401s only trigger one refresh
    if (!refreshPromise) {
      refreshPromise = refreshAccessToken().finally(() => {
        refreshPromise = null;
      });
    }

    const refreshed = await refreshPromise;

    if (refreshed) {
      // Retry with the new access token
      const newToken = useAuthStore.getState().tokens?.access_token;
      res = await makeRequest(newToken);
    } else {
      // Refresh failed — throw immediately
      const error: ApiError = { status: 401, detail: "Session expired. Please sign in again." };
      throw error;
    }
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
