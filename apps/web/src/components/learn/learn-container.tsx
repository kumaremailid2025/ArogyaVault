"use client";

import * as React from "react";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { Loader2Icon } from "lucide-react";
import { LearnBanner, type LearnTab } from "@/components/learn/learn-banner";
import { BrowseTopicsPanel } from "@/components/learn/browse-topics-panel";
import { BrowseLanding } from "@/components/learn/browse-landing";
import { TopicReader } from "@/components/learn/topic-reader";
import { BrowseToolsPanel } from "@/components/learn/browse-tools-panel";

/* ── Lazy-loaded tab components (only one renders at a time) ────── */

const LazyLoader = () => (
  <div className="flex h-full w-full items-center justify-center">
    <Loader2Icon className="size-6 animate-spin text-muted-foreground" />
  </div>
);

const SystemsTab = dynamic(
  () => import("@/components/learn/systems-tab").then((m) => ({ default: m.SystemsTab })),
  { loading: LazyLoader }
);

const DepartmentsTab = dynamic(
  () => import("@/components/learn/departments-tab").then((m) => ({ default: m.DepartmentsTab })),
  { loading: LazyLoader }
);

const DrugCheckTab = dynamic(
  () => import("@/components/learn/drug-check-tab").then((m) => ({ default: m.DrugCheckTab })),
  { loading: LazyLoader }
);

const PdfQaTab = dynamic(
  () => import("@/components/learn/pdf-qa-tab").then((m) => ({ default: m.PdfQaTab })),
  { loading: LazyLoader }
);

/* ═══════════════════════════════════════════════════════════════════
   LEARN CONTAINER — orchestrates banner + tab content
   Consistent three-column pattern used across Vault & ArogyaAI.
═══════════════════════════════════════════════════════════════════ */

export const LearnContainer = () => {
  const router = useRouter();
  const [activeTab, setActiveTab] = React.useState<LearnTab>("browse");
  const [activeTopicId, setActiveTopicId] = React.useState<string | null>(null);

  const handleTabChange = (tab: LearnTab) => {
    setActiveTab(tab);
    setActiveTopicId(null);
  };

  const handleSelectTopic = (topicId: string) => {
    if (topicId === "__ask_ai__") {
      router.push("/arogya-ai");
      return;
    }
    setActiveTopicId(topicId);
  };

  const handleBackToLanding = () => {
    setActiveTopicId(null);
  };

  return (
    <div className="h-full flex flex-col overflow-hidden">
      {/* Banner */}
      <LearnBanner activeTab={activeTab} onTabChange={handleTabChange} />

      {/* Content area */}
      <div className="flex-1 overflow-hidden">
        {activeTab === "browse" && (
          <div className="h-full flex overflow-hidden">
            {/* Left — Topic list */}
            <div className="w-[260px] shrink-0 border-r border-border overflow-hidden">
              <BrowseTopicsPanel
                activeTopicId={activeTopicId}
                onSelectTopic={handleSelectTopic}
              />
            </div>

            {/* Center — Landing or Reader */}
            <div className="flex-1 overflow-y-auto px-4">
              {activeTopicId ? (
                <TopicReader topicId={activeTopicId} onBack={handleBackToLanding} />
              ) : (
                <BrowseLanding onSelectTopic={handleSelectTopic} />
              )}
            </div>

            {/* Right — Quick tools */}
            <div className="w-[260px] shrink-0 border-l border-border overflow-hidden">
              <BrowseToolsPanel
                onSelectTopic={handleSelectTopic}
                activeTopicId={activeTopicId}
              />
            </div>
          </div>
        )}

        {activeTab === "systems" && <SystemsTab />}
        {activeTab === "departments" && <DepartmentsTab />}
        {activeTab === "drug-check" && <DrugCheckTab />}
        {activeTab === "pdf-qa" && <PdfQaTab />}
      </div>
    </div>
  );
};
