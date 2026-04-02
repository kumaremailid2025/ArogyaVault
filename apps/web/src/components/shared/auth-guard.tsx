"use client";

/**
 * AuthGuard
 * ---------
 * Client-side route protection component.
 * Reads authentication state from the zustand store (sessionStorage-backed)
 * and redirects unauthenticated users to /sign-in.
 *
 * Usage: Wrap the children of any layout that requires authentication.
 *
 *   <AuthGuard>
 *     {children}
 *   </AuthGuard>
 */

import * as React from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuthStore } from "@/stores";
import { Loader2Icon } from "lucide-react";

export interface AuthGuardProps {
  children: React.ReactNode;
}

export const AuthGuard = ({ children }: AuthGuardProps) => {
  const router = useRouter();
  const pathname = usePathname();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const [isReady, setIsReady] = React.useState(false);

  React.useEffect(() => {
    // Zustand persist hydrates async from sessionStorage.
    // After hydration we know the true auth state.
    const unsubscribe = useAuthStore.persist.onFinishHydration(() => {
      setIsReady(true);
    });

    // If already hydrated (e.g. fast render), mark ready immediately
    if (useAuthStore.persist.hasHydrated()) {
      setIsReady(true);
    }

    return () => {
      unsubscribe();
    };
  }, []);

  React.useEffect(() => {
    if (!isReady) return;

    if (!isAuthenticated) {
      const callbackUrl = encodeURIComponent(pathname);
      router.replace(`/sign-in?callbackUrl=${callbackUrl}`);
    }
  }, [isReady, isAuthenticated, pathname, router]);

  // Show loading spinner while hydrating or redirecting
  if (!isReady || !isAuthenticated) {
    return (
      <div className="flex h-full w-full items-center justify-center">
        <Loader2Icon className="size-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return <>{children}</>;
};
