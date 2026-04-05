"use client";

/**
 * GuestGuard
 * ----------
 * Opposite of AuthGuard — protects guest-only pages (like /sign-in).
 * ALWAYS calls GET /api/auth/me on mount to verify the actual cookie
 * state, regardless of the Zustand store. This prevents infinite
 * redirects when the store says "authenticated" but the cookie is missing.
 *
 *   - 200 → user is logged in → redirect to /community
 *   - 401 → user is a guest → render children (sign-in form)
 *
 * No sessionStorage, no hydration race.
 */

import * as React from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/stores";
import { Loader2Icon } from "lucide-react";

export interface GuestGuardProps {
  children: React.ReactNode;
}

export const GuestGuard = ({ children }: GuestGuardProps) => {
  const router = useRouter();
  const setUser = useAuthStore((s) => s.setUser);
  const clearUser = useAuthStore((s) => s.clearUser);

  const [checked, setChecked] = React.useState(false);
  const [isLoggedIn, setIsLoggedIn] = React.useState(false);

  React.useEffect(() => {
    let cancelled = false;

    const checkAuth = async () => {
      try {
        const res = await fetch("/api/auth/me", { credentials: "include" });

        if (cancelled) return;

        if (res.ok) {
          const data = await res.json();
          setUser(data.user);
          setIsLoggedIn(true);
        } else {
          // Cookie missing or invalid — clear any stale Zustand state
          clearUser();
          setIsLoggedIn(false);
        }
      } catch {
        if (!cancelled) {
          clearUser();
          setIsLoggedIn(false);
        }
      } finally {
        if (!cancelled) setChecked(true);
      }
    };

    checkAuth();

    return () => {
      cancelled = true;
    };
  }, [setUser, clearUser]);

  // Redirect when check confirms user IS authenticated
  React.useEffect(() => {
    if (!checked) return;

    if (isLoggedIn) {
      router.replace("/community");
    }
  }, [checked, isLoggedIn, router]);

  // Show loader while checking or redirecting
  if (!checked || isLoggedIn) {
    return (
      <div className="flex h-full w-full items-center justify-center">
        <Loader2Icon className="size-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return <>{children}</>;
};
