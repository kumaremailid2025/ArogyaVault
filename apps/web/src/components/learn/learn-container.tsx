"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { LearnBanner, type LearnTab } from "@/components/learn/learn-banner";
import { BrowseTopicsPanel } from "@/components/learn/browse-topics-panel";
import { BrowseLanding } from "@/components/learn/browse-landing";
import { TopicReader } from "@/components/learn/topic-reader";
import { BrowseToolsPanel } from "@/components/learn/browse-tools-panel";
import { SystemsTab } from "@/components/learn/systems-tab";
import { DepartmentsTab } from "@/components/learn/departments-tab";
import { DrugCheckTab } from "@/components/learn/drug-check-tab";
import { PdfQaTab } from "@/components/learn/pdf-qa-tab";

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
