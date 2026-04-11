"use client";

import * as React from "react";
import { SearchIcon, BookOpenIcon, SparklesIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { useLearn } from "@/data/learn-data";
import { resolveIcon } from "@/lib/icon-resolver";
import type { EduLevel } from "@/models/learn";
import Typography from "@/components/ui/typography";

/* ═══════════════════════════════════════════════════════════════════
   BROWSE TOPICS PANEL — left column
   Filterable list of education topics with category + level filters.
═══════════════════════════════════════════════════════════════════ */

interface BrowseTopicsPanelProps {
  activeTopicId: string | null;
  onSelectTopic: (topicId: string) => void;
}

export const BrowseTopicsPanel = ({ activeTopicId, onSelectTopic }: BrowseTopicsPanelProps) => {
  const { EDU_TOPICS, EDU_CATEGORIES, LEVEL_CONFIG } = useLearn();
  const [search, setSearch] = React.useState("");
  const [selectedCategory, setSelectedCategory] = React.useState("all");
  const [selectedLevel, setSelectedLevel] = React.useState<EduLevel | "all">("all");

  const filtered = React.useMemo(() => {
    let topics = EDU_TOPICS;

    if (selectedCategory !== "all") {
      topics = topics.filter((t) => t.category === selectedCategory);
    }
    if (selectedLevel !== "all") {
      topics = topics.filter((t) => t.levels.includes(selectedLevel));
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      topics = topics.filter(
        (t) =>
          t.title.toLowerCase().includes(q) ||
          t.summary.toLowerCase().includes(q) ||
          t.category.toLowerCase().includes(q)
      );
    }
    return topics;
  }, [search, selectedCategory, selectedLevel]);

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Search */}
      <div className="px-2 pt-2 pb-1">
        <div className="relative">
          <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search topics..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full h-8 pl-8 pr-2 rounded-lg border border-border bg-muted/40 text-xs placeholder:text-muted-foreground/60 focus:outline-none focus:ring-1 focus:ring-primary/40"
          />
        </div>
      </div>

      {/* Category filter chips */}
      <div className="px-2 py-1.5 flex flex-wrap gap-1">
        {EDU_CATEGORIES.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setSelectedCategory(cat.id)}
            className={cn(
              "px-2 py-0.5 rounded-full text-[10px] font-medium transition-colors cursor-pointer border",
              selectedCategory === cat.id
                ? "bg-primary text-primary-foreground border-primary"
                : "border-border text-muted-foreground hover:border-primary/40 hover:text-foreground"
            )}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Level filter chips */}
      <div className="px-2 pb-1.5 flex gap-1">
        <button
          onClick={() => setSelectedLevel("all")}
          className={cn(
            "px-2 py-0.5 rounded-full text-[10px] font-medium transition-colors cursor-pointer border",
            selectedLevel === "all"
              ? "bg-primary text-primary-foreground border-primary"
              : "border-border text-muted-foreground hover:border-primary/40"
          )}
        >
          All Levels
        </button>
        {(Object.keys(LEVEL_CONFIG) as EduLevel[]).map((lvl) => (
          <button
            key={lvl}
            onClick={() => setSelectedLevel(lvl)}
            className={cn(
              "px-2 py-0.5 rounded-full text-[10px] font-medium transition-colors cursor-pointer border",
              selectedLevel === lvl
                ? "bg-primary text-primary-foreground border-primary"
                : "border-border text-muted-foreground hover:border-primary/40"
            )}
          >
            {LEVEL_CONFIG[lvl].label}
          </button>
        ))}
      </div>

      {/* Section label */}
      <div className="px-3 py-1 flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground border-t border-border">
        <BookOpenIcon className="size-3" />
        {filtered.length} Topics
      </div>

      {/* Topic list */}
      <div className="flex-1 overflow-y-auto px-1.5 space-y-0.5 pb-2">
        {filtered.map((topic) => {
          const Icon = resolveIcon(topic.categoryIcon);
          return (
            <button
              key={topic.id}
              onClick={() => onSelectTopic(topic.id)}
              className={cn(
                "w-full text-left px-2.5 py-2.5 rounded-lg transition-colors cursor-pointer group",
                activeTopicId === topic.id
                  ? "bg-primary/10 ring-1 ring-primary/30"
                  : "hover:bg-muted/60"
              )}
            >
              <div className="flex items-start gap-2">
                <Icon className={cn("size-3.5 mt-0.5 shrink-0", topic.categoryColor)} />
                <div className="flex-1 min-w-0">
                  <Typography variant="caption" weight="medium" as="h4">{topic.title}</Typography>
                  <Typography variant="micro" color="muted">{topic.summary}</Typography>
                  <div className="flex items-center gap-1.5 mt-1">
                    <Typography variant="micro" color="muted" as="span" className="px-1.5 py-0.5 rounded-full bg-muted">
                      {topic.category}
                    </Typography>
                    <Typography variant="micro" color="muted" as="span">{topic.readTime}</Typography>
                    {topic.levels.includes("clinical") && (
                      <SparklesIcon className="size-2.5 text-violet-500 ml-auto" />
                    )}
                  </div>
                </div>
              </div>
            </button>
          );
        })}

        {filtered.length === 0 && (
          <div className="py-6 text-center text-xs text-muted-foreground">
            No topics match your filters.
          </div>
        )}
      </div>
    </div>
  );
};
