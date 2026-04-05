"use client";

/**
 * AuthGuard
 * ---------
 * Protects authenticated routes. On mount, calls GET /api/auth/me
 * (which reads the httpOnly cookie server-side) to determine if the
 * user is authenticated.
 *
 *   - 200 → populate Zustand store → render children
 *   - 401 → redirect to /sign-in?callbackUrl=<current path>
 *
 * Shell-first rendering:
 *   Accepts optional header / sidebar / bottomBar props that render
 *   immediately (before auth resolves) so the user sees the app shell
 *   instantly. Only the page content area waits for auth.
 *
 * Also runs a lightweight heartbeat (every 4 min) that:
 *   - Confirms the session is still alive in Redis
 *   - Triggers proactive token refresh via the proxy
 *   - Clears user + redirects if session is truly dead
 *
 * No sessionStorage, no hydration race, no token in JS.
 */

import * as React from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuthStore } from "@/stores";
import { useHeartbeat } from "@/hooks/use-heartbeat";

export interface AuthGuardProps {
  children: React.ReactNode;
  /** Shell elements that render immediately (before auth resolves) */
  header?: React.ReactNode;
  sidebar?: React.ReactNode;
  bottomBar?: React.ReactNode;
}

export const AuthGuard = ({
  children,
  header,
  sidebar,
  bottomBar,
}: AuthGuardProps) => {
  const router = useRouter();
  const pathname = usePathname();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const isHydrated = useAuthStore((s) => s.isHydrated);
  const setUser = useAuthStore((s) => s.setUser);
  const clearUser = useAuthStore((s) => s.clearUser);

  // ── Heartbeat: periodic session liveness check ──────────────────
  useHeartbeat();

  React.useEffect(() => {
    // If already hydrated (e.g. navigating between protected pages), skip fetch
    if (isHydrated) return;

    let cancelled = false;

    const checkAuth = async () => {
      try {
        const res = await fetch("/api/auth/me", { credentials: "include" });

        if (cancelled) return;

        if (res.ok) {
          const data = await res.json();
          setUser(data.user);
        } else {
          clearUser();
        }
      } catch {
        if (!cancelled) clearUser();
      }
    };

    checkAuth();

    return () => {
      cancelled = true;
    };
  }, [isHydrated, setUser, clearUser]);

  // Redirect when hydration confirms user is NOT authenticated
  React.useEffect(() => {
    if (!isHydrated) return;

    if (!isAuthenticated) {
      const callbackUrl = encodeURIComponent(pathname);
      router.replace(`/sign-in?callbackUrl=${callbackUrl}`);
    }
  }, [isHydrated, isAuthenticated, pathname, router]);

  const isReady = isHydrated && isAuthenticated;
  const hasShell = header || sidebar || bottomBar;

  // ── Shell-first layout: shell renders immediately, content waits ──
  if (hasShell) {
    return (
      <div className="flex h-screen flex-col overflow-hidden">
        {/* Header — renders immediately */}
        {header}

        {/* Body: sidebar + scrollable content */}
        <div className="flex flex-1 overflow-hidden">
          {sidebar}

          {/* Content column */}
          <div className="flex flex-1 flex-col overflow-hidden">
            {/* Page content — shows skeleton while auth resolves */}
            <main className="flex-1 overflow-hidden">
              {isReady ? (
                children
              ) : (
                <div className="h-full animate-pulse bg-muted/30" />
              )}
            </main>
            {/* Bottom bar */}
            {bottomBar}
          </div>
        </div>
      </div>
    );
  }

  // ── Classic (no shell props): block everything until auth resolves ──
  if (!isReady) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <div className="h-full w-full animate-pulse bg-muted/30" />
      </div>
    );
  }

  return <>{children}</>;
};
