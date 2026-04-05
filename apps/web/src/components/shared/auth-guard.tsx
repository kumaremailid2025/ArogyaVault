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
import { Loader2Icon } from "lucide-react";

export interface AuthGuardProps {
  children: React.ReactNode;
}

export const AuthGuard = ({ children }: AuthGuardProps) => {
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

  // Show loader while checking auth or redirecting
  if (!isHydrated || !isAuthenticated) {
    return (
      <div className="flex h-full w-full items-center justify-center">
        <Loader2Icon className="size-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return <>{children}</>;
};
