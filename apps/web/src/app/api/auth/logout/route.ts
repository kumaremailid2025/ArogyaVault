/**
 * POST /api/auth/logout
 * ---------------------
 * Server-side logout handler that:
 *   1. Calls the backend /auth/logout with the refresh_token cookie
 *   2. Clears both httpOnly cookies from the browser
 *
 * This ensures cookies are cleared even if the backend call fails.
 */

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

export const POST = async (request: NextRequest) => {
  const accessToken = request.cookies.get("access_token")?.value;
  const refreshToken = request.cookies.get("refresh_token")?.value;

  /* ── Call backend to revoke session in Redis ────────────────── */
  try {
    await fetch(`${API_BASE_URL}/auth/logout`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
      },
      body: JSON.stringify({ refresh_token: refreshToken ?? "" }),
    });
  } catch {
    // Backend might be down — still clear cookies client-side
  }

  /* ── Clear both httpOnly cookies ────────────────────────────── */
  const response = NextResponse.json({ message: "Logged out" });

  response.cookies.set("access_token", "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
    maxAge: 0,
  });

  response.cookies.set("refresh_token", "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
    maxAge: 0,
  });

  return response;
};
