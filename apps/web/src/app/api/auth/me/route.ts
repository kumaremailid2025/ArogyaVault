/**
 * GET /api/auth/me
 * ----------------
 * Reads the `access_token` httpOnly cookie, decodes the JWT payload,
 * and returns the user profile. Used by AuthGuard / GuestGuard on mount
 * to hydrate the Zustand auth store without exposing the token to JS.
 *
 * Returns:
 *   200 — { user: AuthUser }
 *   401 — { detail: "Not authenticated" }
 */

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/* ── Cookie + Backend config ─────────────────────────────────────── */

const ACCESS_TOKEN_COOKIE = "access_token";
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

/* ── Helpers ─────────────────────────────────────────────────────── */

/**
 * Decode a JWT payload without verification (verification is done by
 * the backend). We only extract the user claim here for convenience.
 * If the token is malformed we return null.
 */
const decodeJwtPayload = (token: string): Record<string, unknown> | null => {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return null;
    const payload = Buffer.from(parts[1], "base64url").toString("utf-8");
    return JSON.parse(payload) as Record<string, unknown>;
  } catch {
    return null;
  }
};

/* ── Route handler ───────────────────────────────────────────────── */

export const GET = async (request: NextRequest) => {
  const token = request.cookies.get(ACCESS_TOKEN_COOKIE)?.value;

  if (!token) {
    return NextResponse.json(
      { detail: "Not authenticated" },
      { status: 401 },
    );
  }

  /* ── Strategy 1: Decode JWT locally (fast, no backend call) ──── */
  const payload = decodeJwtPayload(token);

  if (payload && payload.sub) {
    return NextResponse.json({
      user: {
        id: payload.sub as string,
        name: (payload.name as string) ?? null,
        role: (payload.role as string) ?? "member",
        created_at: (payload.created_at as string) ?? "",
        // phone_masked comes from the JWT (already masked in the token)
        phone_masked: (payload.phone as string) ?? "****",
      },
    });
  }

  /* ── Strategy 2: Fallback — call backend /auth/me with Bearer ── */
  try {
    const res = await fetch(`${API_BASE_URL}/auth/me`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      cache: "no-store",
    });

    if (!res.ok) {
      return NextResponse.json(
        { detail: "Not authenticated" },
        { status: 401 },
      );
    }

    const data = await res.json();
    return NextResponse.json({ user: data });
  } catch {
    return NextResponse.json(
      { detail: "Auth service unavailable" },
      { status: 503 },
    );
  }
};
