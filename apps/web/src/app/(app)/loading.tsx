/**
 * App-Level Loading Skeleton
 * --------------------------
 * This is the critical Suspense boundary for cross-section navigation
 * (e.g., /community → /learn, /learn → /vault).
 *
 * Without this file, Next.js keeps the old page visible until the new
 * section's layout.tsx + page.tsx bundles fully download. With this file,
 * Next.js immediately updates the URL and shows this skeleton while the
 * new section loads.
 *
 * This is a Server Component — zero JS, renders instantly.
 */

const AppLoading = () => (
  <div className="h-full w-full animate-pulse p-5 lg:p-6 space-y-4">
    {/* Banner placeholder */}
    <div className="h-24 rounded-2xl bg-muted/40" />

    {/* Three-column content placeholder */}
    <div className="flex gap-4 flex-1">
      {/* Left sidebar */}
      <div className="hidden lg:block w-[260px] shrink-0 space-y-3">
        <div className="h-9 rounded-lg bg-muted/30" />
        <div className="h-14 rounded-lg bg-muted/20" />
        <div className="h-14 rounded-lg bg-muted/20" />
        <div className="h-14 rounded-lg bg-muted/20" />
        <div className="h-14 rounded-lg bg-muted/20" />
      </div>

      {/* Center content */}
      <div className="flex-1 space-y-3">
        <div className="h-10 w-3/4 rounded-lg bg-muted/30" />
        <div className="h-32 rounded-xl bg-muted/25" />
        <div className="h-32 rounded-xl bg-muted/25" />
        <div className="h-32 rounded-xl bg-muted/25" />
      </div>

      {/* Right sidebar */}
      <div className="hidden lg:block w-[260px] shrink-0 space-y-3">
        <div className="h-9 rounded-lg bg-muted/30" />
        <div className="h-24 rounded-xl bg-muted/20" />
        <div className="h-24 rounded-xl bg-muted/20" />
      </div>
    </div>
  </div>
);

export default AppLoading;
