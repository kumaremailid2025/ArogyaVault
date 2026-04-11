/**
 * Auth route-group layout.
 *
 * @packageDocumentation
 * @category Pages
 */

import * as React from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { HeartPulseIcon } from "lucide-react";
import { GuestGuard } from "@/components/shared/guest-guard";
import Typography from "@/components/ui/typography";

/* ══════════════════════════════════════════════════════════════════════
   METADATA
   ══════════════════════════════════════════════════════════════════════ */

/**
 * Static metadata applied to every route nested under the `(auth)`
 * route group (currently just `/sign-in`).
 *
 * @remarks
 * Defined at the layout level so individual pages don't have to repeat
 * it. Next.js merges this into the final `<head>` for every nested
 * page automatically.
 *
 * @category Constants
 */
export const metadata: Metadata = {
  title: "Sign In | ArogyaVault",
  description: "Sign in to ArogyaVault with your mobile number.",
};

/* ══════════════════════════════════════════════════════════════════════
   TYPES
   ══════════════════════════════════════════════════════════════════════ */

/**
 * Props accepted by {@link AuthLayout}.
 *
 * @category Types
 */
interface AuthLayoutProps {
  /**
   * The nested route content — rendered inside the `GuestGuard`
   * wrapper so already-signed-in users never see the auth pages.
   */
  children: React.ReactNode;
}

/* ══════════════════════════════════════════════════════════════════════
   LAYOUT
   ══════════════════════════════════════════════════════════════════════ */

/**
 * Shared chrome for all authentication routes.
 *
 * @remarks
 * Provides a minimal, non-scrolling top header with the product
 * lockup linking back to the marketing home, plus a full-height,
 * non-scrolling content area whose children are wrapped in
 * `GuestGuard` so that already-signed-in users are redirected away
 * from the auth flow.
 *
 * The wrapper uses `h-svh` (small viewport height) so mobile browser
 * chrome collapse does not leave dead space, and `overflow-hidden` so
 * internal panels own their own scrolling behavior.
 *
 * @param props - Layout props injected by the Next.js App Router.
 * @param props.children - The nested route page to render.
 * @returns The auth layout tree.
 *
 * @example
 * ```tsx
 * // Rendered automatically by Next.js for every route under (auth)/
 * // e.g. /sign-in → <AuthLayout><SignInPage/></AuthLayout>
 * ```
 *
 * @category Pages
 */
const AuthLayout = ({ children }: AuthLayoutProps): React.ReactElement => {
  return (
    <div className="flex h-svh flex-col overflow-hidden bg-background">
      {/* Minimal header — fixed height, never scrolls */}
      <header className="shrink-0 border-b border-border/40 px-4 py-3 sm:px-6 sm:py-4">
        <Link href="/" className="inline-flex items-center gap-2 font-bold text-primary">
          <div className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <HeartPulseIcon className="size-4" aria-hidden="true" />
          </div>
          <Typography variant="h3" as="span" className="tracking-tight">ArogyaVault</Typography>
        </Link>
      </header>

      {/* Content fills remaining space — no scroll on wrapper */}
      <main className="flex flex-1 overflow-hidden">
        <GuestGuard>{children}</GuestGuard>
      </main>
    </div>
  );
};

export default AuthLayout;
