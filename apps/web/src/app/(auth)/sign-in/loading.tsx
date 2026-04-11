import * as React from "react";
import { Loader2Icon } from "lucide-react";

/**
 * Loading state for sign-in page.
 *
 * @packageDocumentation
 * @category Pages
 *
 * @remarks
 * Next.js automatically renders this component inside a React
 * Suspense boundary while `page.tsx` (and any data it awaits) is
 * loading. A centered spinner keeps the visual footprint identical to
 * the auth layout's empty state so there is no jarring reflow when the
 * real sign-in form mounts.
 *
 * This file intentionally has no state and no props — Next.js owns
 * the lifecycle.
 *
 * @returns A centered spinner loading indicator.
 *
 * @category Pages
 */
export default function Loading(): React.ReactElement {
  return (
    <div
      className="flex min-h-screen items-center justify-center"
      role="status"
      aria-live="polite"
      aria-label="Loading sign-in"
    >
      <Loader2Icon
        className="size-6 animate-spin text-muted-foreground"
        aria-hidden="true"
      />
    </div>
  );
}
