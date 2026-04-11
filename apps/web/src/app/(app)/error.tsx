"use client";

import { useEffect } from "react";
import { AlertTriangle, RotateCcw, Home } from "lucide-react";
import Link from "next/link";
import Typography from "@/components/ui/typography";

const AppError = ({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) => {
  useEffect(() => {
    // Log to error reporting service in production
    console.error("[AppError]", error);
  }, [error]);

  return (
    <div className="flex h-full items-center justify-center p-6">
      <div className="max-w-md text-center space-y-4">
        <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-destructive/10">
          <AlertTriangle className="size-6 text-destructive" />
        </div>

        <div className="space-y-1.5">
          <Typography variant="h2">Something went wrong</Typography>
          <Typography variant="body" color="muted">
            An unexpected error occurred. Please try again or return to the
            home page.
          </Typography>
        </div>

        <div className="flex items-center justify-center gap-3">
          <button
            onClick={reset}
            className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-background px-4 py-2 text-sm font-medium hover:bg-muted transition-colors"
          >
            <RotateCcw className="size-3.5" />
            Try again
          </button>
          <Link
            href="/community"
            className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
          >
            <Home className="size-3.5" />
            Home
          </Link>
        </div>

        {process.env.NODE_ENV === "development" && error.message && (
          <pre className="mt-4 max-h-40 overflow-auto rounded-lg bg-muted/50 p-3 text-left text-xs text-muted-foreground">
            {error.message}
          </pre>
        )}
      </div>
    </div>
  );
};

export default AppError;
