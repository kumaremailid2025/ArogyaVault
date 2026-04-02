"use client";

/**
 * GuestGuard
 * ----------
 * Opposite of AuthGuard — redirects authenticated users away from
 * guest-only pages (like /sign-in) to /liveboard.
 *
 * Usage: Wrap the children of the (auth) layout.
 *
 *   <GuestGuard>
 *     {children}
 *   </GuestGuard>
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
  const [isReady, setIsReady] = React.useState(false);

  React.useEffect(() => {
    const unsubscribe = useAuthStore.persist.onFinishHydration(() => {
      setIsReady(true);
    });

    if (useAuthStore.persist.hasHydrated()) {
      setIsReady(true);
    }

    return () => {
      unsubscribe();
    };
  }, []);

  React.useEffect(() => {
    if (!isReady) return;

    if (isAuthenticated) {
      router.replace("/liveboard");
    }
  }, [isReady, isAuthenticated, router]);

  // Show loading spinner while hydrating or redirecting
  if (!isReady) {
    return (
      <div className="flex h-full w-full items-center justify-center">
        <Loader2Icon className="size-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  // If authenticated, show spinner while redirect happens
  if (isAuthenticated) {
    return (
      <div className="flex h-full w-full items-center justify-center">
        <Loader2Icon className="size-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return <>{children}</>;
};
