/**
 * API Proxy — /api/proxy/[...path]
 * ---------------------------------
 * Proxies requests from the Next.js client to the Python backend.
 *
 * WHY:
 *   The JWT lives in an httpOnly cookie that JavaScript cannot read.
 *   This proxy reads the cookie server-side and forwards the request
 *   to the backend with an Authorization: Bearer header.
 *
 * USAGE (client-side):
 *   fetch("/api/proxy/community/posts", { method: "GET", credentials: "include" })
 *   → proxied to → http://localhost:8000/community/posts with Bearer token
 *
 * Supports: GET, POST, PUT, PATCH, DELETE
 */

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";
const ACCESS_TOKEN_COOKIE = "access_token";
const REFRESH_TOKEN_COOKIE = "refresh_token";

/* ── Helpers ─────────────────────────────────────────────────────── */

const proxyRequest = async (
  request: NextRequest,
  params: { path: string[] } | Promise<{ path: string[] }>,
): Promise<NextResponse> => {
  const resolvedParams = params instanceof Promise ? await params : params;
  const backendPath = `/${resolvedParams.path.join("/")}`;
  const url = new URL(backendPath, API_BASE_URL);

  // Preserve query params
  request.nextUrl.searchParams.forEach((value, key) => {
    url.searchParams.set(key, value);
  });

  const accessToken = request.cookies.get(ACCESS_TOKEN_COOKIE)?.value;

  if (!accessToken) {
    return NextResponse.json(
      { detail: "Not authenticated" },
      { status: 401 },
    );
  }

  /* ── Forward headers ─────────────────────────────────────────── */
  const headers: Record<string, string> = {
    Authorization: `Bearer ${accessToken}`,
  };

  // Forward content-type if present (skip for GET/HEAD)
  const contentType = request.headers.get("content-type");
  if (contentType) {
    headers["Content-Type"] = contentType;
  }

  /* ── Forward body (for non-GET methods) ──────────────────────── */
  const hasBody = !["GET", "HEAD"].includes(request.method);
  let body: string | undefined;
  if (hasBody) {
    try {
      body = await request.text();
    } catch {
      body = undefined;
    }
  }

  /* ── Make backend request ────────────────────────────────────── */
  try {
    const backendRes = await fetch(url.toString(), {
      method: request.method,
      headers,
      body,
      cache: "no-store",
    });

    /* ── Handle 401 — attempt token refresh ──────────────────── */
    if (backendRes.status === 401) {
      const refreshToken = request.cookies.get(REFRESH_TOKEN_COOKIE)?.value;

      if (refreshToken) {
        const refreshRes = await fetch(`${API_BASE_URL}/auth/refresh`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ refresh_token: refreshToken }),
        });

        if (refreshRes.ok) {
          const refreshData = await refreshRes.json();
          const newAccessToken = refreshData.access_token as string;

          // Retry original request with new token
          const retryRes = await fetch(url.toString(), {
            method: request.method,
            headers: { ...headers, Authorization: `Bearer ${newAccessToken}` },
            body,
            cache: "no-store",
          });

          const retryBody = await retryRes.text();
          const response = new NextResponse(retryBody, {
            status: retryRes.status,
            headers: { "Content-Type": retryRes.headers.get("Content-Type") ?? "application/json" },
          });

          // Set refreshed access_token cookie
          response.cookies.set("access_token", newAccessToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            path: "/",
            maxAge: refreshData.expires_in ?? 900,
          });

          // If backend rotated the refresh token, update that too
          if (refreshData.refresh_token) {
            response.cookies.set("refresh_token", refreshData.refresh_token as string, {
              httpOnly: true,
              secure: process.env.NODE_ENV === "production",
              sameSite: "lax",
              path: "/",
              maxAge: 7 * 24 * 60 * 60, // 7 days
            });
          }

          return response;
        }
      }

      // Refresh failed or no refresh token — return 401
      return NextResponse.json(
        { detail: "Session expired. Please sign in again." },
        { status: 401 },
      );
    }

    /* ── Forward successful response ─────────────────────────── */
    const responseBody = await backendRes.text();
    return new NextResponse(responseBody, {
      status: backendRes.status,
      headers: {
        "Content-Type": backendRes.headers.get("Content-Type") ?? "application/json",
      },
    });
  } catch {
    return NextResponse.json(
      { detail: "Backend service unavailable" },
      { status: 503 },
    );
  }
};

/* ── Route exports ───────────────────────────────────────────────── */

type RouteCtx = { params: Promise<{ path: string[] }> };

export const GET = (req: NextRequest, ctx: RouteCtx) =>
  proxyRequest(req, ctx.params);

export const POST = (req: NextRequest, ctx: RouteCtx) =>
  proxyRequest(req, ctx.params);

export const PUT = (req: NextRequest, ctx: RouteCtx) =>
  proxyRequest(req, ctx.params);

export const PATCH = (req: NextRequest, ctx: RouteCtx) =>
  proxyRequest(req, ctx.params);

export const DELETE = (req: NextRequest, ctx: RouteCtx) =>
  proxyRequest(req, ctx.params);
