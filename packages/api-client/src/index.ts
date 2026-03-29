// ─────────────────────────────────────────────────────────────────────────────
// ArogyaVault — API Client
// Sprint 3: This will be auto-generated from the FastAPI OpenAPI spec.
// For now it exports base URL config and a typed fetch wrapper.
// ─────────────────────────────────────────────────────────────────────────────

export const API_BASE_URL =
  (typeof process !== "undefined" && process.env.NEXT_PUBLIC_API_URL) ||
  "http://localhost:8000";

export const AI_SERVICE_URL =
  (typeof process !== "undefined" && process.env.NEXT_PUBLIC_AI_SERVICE_URL) ||
  "http://localhost:8001";

export async function apiFetch<T>(
  path: string,
  options?: RequestInit
): Promise<T> {
  const res = await fetch(`${API_BASE_URL}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...options?.headers,
    },
    credentials: "include", // sends httpOnly cookies automatically
    ...options,
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({ message: res.statusText }));
    throw new Error(error.message || "API request failed");
  }

  return res.json() as Promise<T>;
}
