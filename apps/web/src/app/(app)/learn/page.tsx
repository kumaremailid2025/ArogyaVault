"use client";

import dynamic from "next/dynamic";
import { ArogyaLearnContent } from "@/app/(app)/community/page";

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
 * /learn — Evidence-based medical knowledge hub.
 * Browse health topics, check drug interactions, explore medical systems, and chat with PDFs.
 */
export default function ArogyaLearnPage() {
  return (
    <div className="h-full flex flex-col overflow-hidden">
      <div className="shrink-0 px-5 pt-5 lg:px-6 lg:pt-6">
        <ContentTabs active="home" showGroupSettings={false} />
      </div>

      <div className="flex-1 overflow-hidden min-h-0">
        <ArogyaLearnContent />
      </div>
    </div>
  );
}
