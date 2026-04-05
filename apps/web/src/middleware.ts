/**
 * Next.js Middleware — Route Protection
 * --------------------------------------
 * Runs on the edge for every matched route BEFORE the page renders.
 * Reads the httpOnly `access_token` cookie set by the backend.
 *
 * Protected routes (app group):  /community, /vault, /learn, /records, /profile, /groups, /arogya-ai
 * Public routes:                 /sign-in, /, /about, /features, etc.
 *
 * Logic:
 *   - If user is NOT authenticated and visits a protected route → redirect to /sign-in
 *   - If user IS authenticated and visits /sign-in → redirect to /community
 */

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/* ── Cookie name (must match backend Set-Cookie name) ────────────── */

const ACCESS_TOKEN_COOKIE = "access_token";

/* ── Route definitions ───────────────────────────────────────────── */

const PROTECTED_ROUTES = [
  "/community",
  "/vault",
  "/learn",
  "/records",
  "/profile",
  "/groups",
  "/arogya-ai",
];

const AUTH_ROUTES = ["/sign-in"];

/* ── Middleware ───────────────────────────────────────────────────── */

export const middleware = (request: NextRequest) => {
  const { pathname } = request.nextUrl;
  const accessToken = request.cookies.get(ACCESS_TOKEN_COOKIE)?.value;
  const isAuthenticated = !!accessToken;

  // Protected route without auth → redirect to sign-in
  const isProtectedRoute = PROTECTED_ROUTES.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`),
  );

  if (isProtectedRoute && !isAuthenticated) {
    const signInUrl = new URL("/sign-in", request.url);
    signInUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(signInUrl);
  }

  // Auth route with active session → redirect to community
  const isAuthRoute = AUTH_ROUTES.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`),
  );

  if (isAuthRoute && isAuthenticated) {
    return NextResponse.redirect(new URL("/community", request.url));
  }

  return NextResponse.next();
};

/* ── Matcher ─────────────────────────────────────────────────────── */

export const config = {
  matcher: [
    /*
     * Match all routes except:
     *   - _next/static, _next/image (Next.js internals)
     *   - favicon.ico, icons, images
     *   - api routes (handled by route handlers)
     */
    "/((?!_next/static|_next/image|favicon.ico|api/|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
