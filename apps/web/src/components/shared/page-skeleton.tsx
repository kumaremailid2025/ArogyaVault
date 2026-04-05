/**
 * Page Skeleton
 * -------------
 * Lightweight loading skeletons used by loading.tsx files across
 * the (app) route group. These render as Server Components — no
 * client JS needed — so the URL updates instantly on navigation
 * and the user sees immediate visual feedback.
 */

/* ── Generic full-page skeleton with animated pulse bars ──────────── */
export const PageSkeleton = () => (
  <div className="h-full w-full p-5 lg:p-6 space-y-4 animate-pulse">
    {/* Banner skeleton */}
    <div className="h-24 rounded-2xl bg-muted/40" />
    {/* Content area */}
    <div className="flex gap-4 flex-1">
      <div className="flex-1 space-y-3">
        <div className="h-10 w-3/4 rounded-lg bg-muted/30" />
        <div className="h-32 rounded-xl bg-muted/30" />
        <div className="h-32 rounded-xl bg-muted/30" />
        <div className="h-32 rounded-xl bg-muted/30" />
      </div>
      <div className="hidden lg:block w-[320px] shrink-0 space-y-3">
        <div className="h-10 rounded-lg bg-muted/30" />
        <div className="h-48 rounded-xl bg-muted/30" />
      </div>
    </div>
  </div>
);

/* ── Community feed skeleton (banner + two-column feed layout) ───── */
export const CommunityFeedSkeleton = () => (
  <div className="h-full flex flex-col overflow-hidden animate-pulse">
    {/* Banner */}
    <div className="h-[104px] bg-muted/40 shrink-0" />
    {/* Two columns */}
    <div className="flex-1 flex overflow-hidden">
      {/* Left — compose + posts */}
      <div className="flex-1 p-5 space-y-3">
        <div className="h-16 rounded-xl bg-muted/30" />
        <div className="h-28 rounded-xl bg-muted/30" />
        <div className="h-28 rounded-xl bg-muted/30" />
        <div className="h-28 rounded-xl bg-muted/30" />
      </div>
      {/* Right panel */}
      <div className="w-px bg-border shrink-0" />
      <div className="hidden lg:block w-[320px] shrink-0 p-4 space-y-3">
        <div className="h-6 w-1/2 rounded bg-muted/30" />
        <div className="h-40 rounded-xl bg-muted/30" />
      </div>
    </div>
  </div>
);

/* ── Two-column skeleton (files / members tabs) ──────────────────── */
export const TwoColumnSkeleton = () => (
  <div className="h-full flex flex-col overflow-hidden animate-pulse">
    {/* Banner */}
    <div className="h-[104px] bg-muted/40 shrink-0" />
    {/* Two columns */}
    <div className="flex-1 flex overflow-hidden">
      <div className="flex-1 p-4 space-y-3">
        <div className="h-10 rounded-lg bg-muted/30" />
        <div className="h-16 rounded-xl bg-muted/30" />
        <div className="h-16 rounded-xl bg-muted/30" />
        <div className="h-16 rounded-xl bg-muted/30" />
        <div className="h-16 rounded-xl bg-muted/30" />
      </div>
      <div className="w-px bg-border shrink-0" />
      <div className="hidden lg:block w-[320px] shrink-0 p-4 space-y-3">
        <div className="h-6 w-1/2 rounded bg-muted/30" />
        <div className="h-40 rounded-xl bg-muted/30" />
      </div>
    </div>
  </div>
);

/* ── Vault skeleton (charts + vitals two-column) ─────────────────── */
export const VaultSkeleton = () => (
  <div className="h-full flex flex-col overflow-hidden animate-pulse">
    <div className="h-[104px] bg-muted/40 shrink-0" />
    <div className="flex-1 flex overflow-hidden">
      <div className="flex-1 p-5 space-y-4">
        <div className="h-8 w-48 rounded-lg bg-muted/30" />
        <div className="grid grid-cols-2 gap-4">
          <div className="h-40 rounded-xl bg-muted/30" />
          <div className="h-40 rounded-xl bg-muted/30" />
        </div>
        <div className="h-48 rounded-xl bg-muted/30" />
      </div>
      <div className="w-px bg-border shrink-0" />
      <div className="hidden lg:block w-[280px] shrink-0 p-4 space-y-3">
        <div className="h-6 w-1/2 rounded bg-muted/30" />
        <div className="h-32 rounded-xl bg-muted/30" />
        <div className="h-32 rounded-xl bg-muted/30" />
      </div>
    </div>
  </div>
);

/* ── AI chat skeleton (three-column) ─────────────────────────────── */
export const AiChatSkeleton = () => (
  <div className="h-full flex flex-col overflow-hidden animate-pulse">
    <div className="h-[88px] bg-muted/40 shrink-0" />
    <div className="flex-1 flex overflow-hidden">
      {/* Left sessions */}
      <div className="w-[240px] shrink-0 border-r border-border p-3 space-y-2">
        <div className="h-8 rounded-lg bg-muted/30" />
        <div className="h-14 rounded-lg bg-muted/30" />
        <div className="h-14 rounded-lg bg-muted/30" />
        <div className="h-14 rounded-lg bg-muted/30" />
      </div>
      {/* Center chat */}
      <div className="flex-1 p-5 space-y-4">
        <div className="h-20 w-3/4 rounded-2xl bg-muted/30 ml-auto" />
        <div className="h-32 w-3/4 rounded-2xl bg-muted/30" />
      </div>
      {/* Right context */}
      <div className="hidden lg:block w-[280px] shrink-0 border-l border-border p-3 space-y-3">
        <div className="h-6 w-1/2 rounded bg-muted/30" />
        <div className="h-24 rounded-xl bg-muted/30" />
        <div className="h-24 rounded-xl bg-muted/30" />
      </div>
    </div>
  </div>
);

/* ── Learn skeleton (tabs + content) ─────────────────────────────── */
export const LearnSkeleton = () => (
  <div className="h-full flex flex-col overflow-hidden animate-pulse">
    <div className="h-[104px] bg-muted/40 shrink-0" />
    <div className="flex-1 p-5 space-y-4">
      <div className="flex gap-2">
        <div className="h-9 w-24 rounded-lg bg-muted/30" />
        <div className="h-9 w-24 rounded-lg bg-muted/30" />
        <div className="h-9 w-24 rounded-lg bg-muted/30" />
        <div className="h-9 w-24 rounded-lg bg-muted/30" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="h-40 rounded-xl bg-muted/30" />
        <div className="h-40 rounded-xl bg-muted/30" />
        <div className="h-40 rounded-xl bg-muted/30" />
        <div className="h-40 rounded-xl bg-muted/30" />
        <div className="h-40 rounded-xl bg-muted/30" />
        <div className="h-40 rounded-xl bg-muted/30" />
      </div>
    </div>
  </div>
);

/* ── Learn content skeleton (no banner — layout handles it) ──────── */
export const LearnContentSkeleton = () => (
  <div className="h-full flex overflow-hidden animate-pulse">
    <div className="w-[260px] shrink-0 border-r border-border/30 p-4 space-y-3">
      <div className="h-9 rounded-lg bg-muted/30" />
      <div className="h-12 rounded-lg bg-muted/20" />
      <div className="h-12 rounded-lg bg-muted/20" />
      <div className="h-12 rounded-lg bg-muted/20" />
      <div className="h-12 rounded-lg bg-muted/20" />
    </div>
    <div className="flex-1 p-5 space-y-4">
      <div className="h-10 w-3/4 rounded-lg bg-muted/30" />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="h-40 rounded-xl bg-muted/30" />
        <div className="h-40 rounded-xl bg-muted/30" />
        <div className="h-40 rounded-xl bg-muted/30" />
        <div className="h-40 rounded-xl bg-muted/30" />
      </div>
    </div>
    <div className="w-[260px] shrink-0 border-l border-border/30 p-4 space-y-3">
      <div className="h-9 rounded-lg bg-muted/30" />
      <div className="h-24 rounded-lg bg-muted/20" />
      <div className="h-24 rounded-lg bg-muted/20" />
    </div>
  </div>
);

/* ── Profile skeleton ─────────────────────────────────────────────── */
export const ProfileSkeleton = () => (
  <div className="h-full w-full p-5 lg:p-6 animate-pulse">
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <div className="size-16 rounded-full bg-muted/40" />
        <div className="space-y-2">
          <div className="h-5 w-32 rounded bg-muted/30" />
          <div className="h-4 w-48 rounded bg-muted/30" />
        </div>
      </div>
      <div className="h-px bg-border" />
      <div className="space-y-4">
        <div className="h-12 rounded-lg bg-muted/30" />
        <div className="h-12 rounded-lg bg-muted/30" />
        <div className="h-12 rounded-lg bg-muted/30" />
      </div>
    </div>
  </div>
);
