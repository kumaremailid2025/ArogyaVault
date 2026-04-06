/**
 * File Detail Loading Skeleton
 * ────────────────────────────
 * Displayed while file detail content is loading.
 */

export default function FileDetailLoading() {
  return (
    <div className="flex-1 flex flex-col overflow-hidden animate-pulse">
      {/* Header skeleton */}
      <div className="shrink-0 px-4 pt-4 pb-3 border-b border-border space-y-3">
        <div className="flex items-center justify-between mb-2">
          <div className="h-5 w-20 bg-muted rounded" />
          <div className="h-7 w-7 bg-muted rounded" />
        </div>
        <div className="flex items-center gap-2.5">
          <div className="h-9 w-9 bg-muted rounded-lg shrink-0" />
          <div className="flex-1 space-y-1">
            <div className="h-4 w-32 bg-muted rounded" />
            <div className="h-3 w-48 bg-muted rounded" />
          </div>
        </div>
      </div>

      {/* Content skeleton */}
      <div className="flex-1 overflow-y-auto min-h-0">
        <div className="px-4 py-3 space-y-4">
          {/* AI Summary skeleton */}
          <div className="rounded-xl border border-violet-200 bg-violet-50/50 p-3 space-y-2">
            <div className="h-4 w-24 bg-muted rounded" />
            <div className="space-y-1">
              <div className="h-3 w-full bg-muted rounded" />
              <div className="h-3 w-5/6 bg-muted rounded" />
            </div>
          </div>

          {/* Q&A Section skeleton */}
          <div className="space-y-3">
            <div className="h-4 w-32 bg-muted rounded" />
            {[1, 2, 3].map((i) => (
              <div key={i} className="rounded-lg border border-border bg-background p-3 space-y-2">
                <div className="h-4 w-5/6 bg-muted rounded" />
                <div className="space-y-1">
                  <div className="h-3 w-full bg-muted rounded" />
                  <div className="h-3 w-4/5 bg-muted rounded" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Compose skeleton */}
      <div className="shrink-0 border-t border-border px-4 pt-2 pb-3">
        <div className="h-10 bg-muted rounded" />
      </div>
    </div>
  );
}
