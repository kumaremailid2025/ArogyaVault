/**
 * POST /api/auth/verify-otp
 * -------------------------
 * Proxies the verify-otp request to the backend and sets httpOnly
 * cookies on the Next.js origin (localhost:3000).
 *
 * WHY:
 *   The backend runs on a different origin (localhost:8000 in dev).
 *   Cookies set by the backend would be scoped to that origin and
 *   invisible to localhost:3000. This route reads the token values
 *   from the backend JSON response and re-issues them as httpOnly
 *   cookies on the correct origin.
 *
 * FLOW:
 *   Browser → POST /api/auth/verify-otp (Next.js, same origin)
 *           → POST localhost:8000/auth/verify-otp (backend)
 *           ← { message, user, access_token, refresh_token, ... }
 *           → Set httpOnly cookies on localhost:3000
 *           ← { message, user } (tokens stripped from client response)
 */

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

export const POST = async (request: NextRequest) => {
  try {
    const body = await request.text();

    const backendRes = await fetch(`${API_BASE_URL}/auth/verify-otp`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body,
    });

    const data = await backendRes.json();

    // Forward error responses as-is
    if (!backendRes.ok) {
      return NextResponse.json(data, { status: backendRes.status });
    }

    // ── Extract tokens from response body ────────────────────────────
    const accessToken = data.access_token as string;
    const refreshToken = data.refresh_token as string;
    const accessExpiresIn = (data.access_expires_in as number) ?? 900;
    const refreshExpiresIn = (data.refresh_expires_in as number) ?? 7 * 24 * 60 * 60;

    // ── Build client response (strip tokens — client only needs user) ──
    const clientResponse = NextResponse.json(
      { message: data.message, user: data.user },
      { status: 200 },
    );

    // ── Set httpOnly cookies on the Next.js origin ───────────────────
    if (accessToken) {
      clientResponse.cookies.set("access_token", accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: accessExpiresIn,
      });
    }

    if (refreshToken) {
      clientResponse.cookies.set("refresh_token", refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: refreshExpiresIn,
      });
    }

    return clientResponse;
  } catch {
    return NextResponse.json(
      { detail: "Auth service unavailable" },
      { status: 503 },
    );
  }
};
