"use client";

/**
 * /learn — Browse tab (default).
 * Three-column layout: topic list | landing or reader | quick tools.
 */

import * as React from "react";
import { useRouter } from "next/navigation";
import { BrowseTopicsPanel } from "@/components/learn/browse-topics-panel";
import { BrowseLanding } from "@/components/learn/browse-landing";
import { TopicReader } from "@/components/learn/topic-reader";
import { BrowseToolsPanel } from "@/components/learn/browse-tools-panel";

const LearnBrowsePage = () => {
  const router = useRouter();
  const [activeTopicId, setActiveTopicId] = React.useState<string | null>(null);

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
  );
};

export default LearnBrowsePage;
