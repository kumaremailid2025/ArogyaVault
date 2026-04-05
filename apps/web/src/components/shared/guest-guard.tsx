"use client";

/**
 * GuestGuard
 * ----------
 * Opposite of AuthGuard — protects guest-only pages (like /sign-in).
 * On mount, calls GET /api/auth/me to check if user is already
 * authenticated. If yes, redirects to /community.
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
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const isHydrated = useAuthStore((s) => s.isHydrated);
  const setUser = useAuthStore((s) => s.setUser);
  const clearUser = useAuthStore((s) => s.clearUser);

  React.useEffect(() => {
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

  // Redirect when hydration confirms user IS authenticated
  React.useEffect(() => {
    if (!isHydrated) return;

    if (isAuthenticated) {
      router.replace("/community");
    }
  }, [isHydrated, isAuthenticated, router]);

  // Show loader while checking or redirecting
  if (!isHydrated || isAuthenticated) {
    return (
      <div className="flex h-full w-full items-center justify-center">
        <Loader2Icon className="size-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return <>{children}</>;
};
