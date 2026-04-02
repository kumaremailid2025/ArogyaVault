/**
 * API Client
 * ----------
 * Lightweight fetch wrapper for the ArogyaVault backend.
 * All requests go through this so we have a single place to
 * set base URL, headers, and handle errors.
 *
 * - Attaches Bearer token from zustand store for authenticated API calls
 * - Uses credentials: "include" so the browser sends/receives
 *   the httpOnly auth cookie set by the backend
 */

import { useAuthStore } from "@/stores";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

/* ── Types ────────────────────────────────────────────────────────── */

export interface ApiError {
  status: number;
  detail: string;
}

/* ── Client ───────────────────────────────────────────────────────── */

export const apiClient = async <T>(
  path: string,
  options: RequestInit = {},
): Promise<T> => {
  const url = `${API_BASE_URL}${path}`;

  // Read the access token from the zustand store (outside React)
  const accessToken = useAuthStore.getState().tokens?.access_token;

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
    ...(options.headers as Record<string, string>),
  };

  const res = await fetch(url, {
    ...options,
    headers,
    credentials: "include", // send/receive httpOnly cookies
  });

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
