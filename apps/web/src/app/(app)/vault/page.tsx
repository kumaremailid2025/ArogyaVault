"use client";

import dynamic from "next/dynamic";
import { YoursContent } from "@/components/community/yours-content";

const ContentTabs = dynamic(
  () => import("@/components/app/content-tabs").then((m) => ({ default: m.ContentTabs })),
  {
    loading: () => (
      <div className="flex gap-2 animate-pulse">
        <div className="h-10 w-24 bg-muted" />
        <div className="h-10 w-24 bg-muted" />
      </div>
    ),
  }
);

/**
 * /vault — Personal health records vault.
 * Displays the user's own uploaded documents, health summaries, etc.
 */
export default function MyVaultPage() {
  return (
    <div className="h-full flex flex-col overflow-hidden">
      <div className="shrink-0 px-5 pt-5 lg:px-6 lg:pt-6">
        <ContentTabs active="home" showGroupSettings={false} />
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="px-5 pb-5 pt-4 lg:px-6 lg:pb-6 max-w-4xl space-y-4">
          <YoursContent />
        </div>
      </div>
    </div>
  );
}
