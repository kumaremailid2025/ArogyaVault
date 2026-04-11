"use client";

/**
 * Auth route-group error boundary.
 *
 * @packageDocumentation
 * @category Pages
 */

import * as React from "react";
import { AlertTriangle, RotateCcw } from "lucide-react";
import Link from "next/link";
import { Button } from "@/core/ui/button";
import Typography from "@/components/ui/typography";

/* ══════════════════════════════════════════════════════════════════════
   TYPES
   ══════════════════════════════════════════════════════════════════════ */

/**
 * Props injected by Next.js into every route-level `error.tsx`.
 *
 * @see https://nextjs.org/docs/app/api-reference/file-conventions/error
 *
 * @category Types
 */
interface AuthErrorProps {
  /**
   * The error that bubbled up.
   *
   * @remarks
   * Next.js augments this with an optional `digest` field in
   * production so the fallback UI can be correlated with server logs.
   */
  error: Error & { digest?: string };
  /**
   * Reset handler. Calling it re-mounts the segment and gives React
   * another chance to render the route without the error.
   */
  reset: () => void;
}

/* ══════════════════════════════════════════════════════════════════════
   COMPONENT
   ══════════════════════════════════════════════════════════════════════ */

/**
 * Next.js App Router error boundary for every route nested under the
 * `(auth)` route group.
 *
 * @remarks
 * Rendered automatically when an unhandled error is thrown while
 * rendering or fetching data inside the sign-in flow. Responsibilities:
 *
 * - Log the error (with any Next.js digest) to the console so it
 *   shows up in client-side observability.
 * - Show a friendly fallback UI with two escape hatches: "Try again"
 *   calls Next.js `reset()` to re-mount the segment; "Back to home"
 *   navigates to the marketing home.
 * - In development, display the raw error message to aid debugging.
 *
 * This file MUST be a client component — Next.js requires error
 * boundaries declared at the route level to opt in via `"use client"`.
 *
 * @param props - Error boundary props injected by Next.js.
 * @param props.error - The thrown error, augmented with an optional
 *   `digest` field in production.
 * @param props.reset - Re-mount callback supplied by Next.js.
 * @returns The fallback error UI.
 *
 * @category Pages
 */
const AuthError = ({ error, reset }: AuthErrorProps): React.ReactElement => {
  /* Log the error whenever it changes so devs see it in the console. */
  React.useEffect(() => {
    console.error("[AuthError]", error);
  }, [error]);

  /** Show the raw error body only when running against a dev build. */
  const isDev: boolean = process.env.NODE_ENV === "development";

  return (
    <div className="flex h-full items-center justify-center p-6">
      <div className="max-w-sm text-center space-y-4">
        <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-destructive/10">
          <AlertTriangle className="size-6 text-destructive" aria-hidden="true" />
        </div>

        <div className="space-y-1.5">
          <Typography variant="h2">Sign-in error</Typography>
          <Typography variant="body" color="muted">
            Something went wrong during sign-in. Please try again.
          </Typography>
        </div>

        <div className="flex items-center justify-center gap-3">
          <Button variant="outline" size="sm" onClick={reset}>
            <RotateCcw className="size-3.5" aria-hidden="true" />
            Try again
          </Button>
          <Button asChild size="sm">
            <Link href="/">Back to home</Link>
          </Button>
        </div>

        {isDev && error.message && (
          <pre className="mt-4 max-h-40 overflow-auto rounded-lg bg-muted/50 p-3 text-left text-xs text-muted-foreground">
            {error.message}
          </pre>
        )}
      </div>
    </div>
  );
};

export default AuthError;
