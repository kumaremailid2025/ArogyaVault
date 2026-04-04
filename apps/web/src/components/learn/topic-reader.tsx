"use client";

import * as React from "react";
import {
  ArrowLeftIcon, ExternalLinkIcon, SparklesIcon,
  BookOpenIcon, ClockIcon, CheckCircle2Icon,
} from "lucide-react";
import { Button } from "@/core/ui/button";
import { cn } from "@/lib/utils";
import { EDU_TOPICS, LEVEL_CONFIG } from "@/data/learn-data";
import type { EduLevel } from "@/models/learn";

/* ═══════════════════════════════════════════════════════════════════
   TOPIC READER — full content view for a selected topic
   Shows: header, key facts, AI perspective, source, level badges
═══════════════════════════════════════════════════════════════════ */

interface TopicReaderProps {
  topicId: string;
  onBack: () => void;
}

export const TopicReader = ({ topicId, onBack }: TopicReaderProps) => {
  const topic = EDU_TOPICS.find((t) => t.id === topicId);
  const [activeLevel, setActiveLevel] = React.useState<EduLevel>("patient");

  React.useEffect(() => {
    if (topic) {
      setActiveLevel(topic.levels[0]);
    }
  }, [topic]);

  if (!topic) {
    return (
      <div className="flex items-center justify-center h-full text-muted-foreground text-sm">
        Topic not found.
      </div>
    );
  }

  const Icon = topic.categoryIcon;

  return (
    <div className="max-w-3xl mx-auto py-4 space-y-5">
      {/* Back button */}
      <Button
        variant="ghost"
        size="sm"
        onClick={onBack}
        className="gap-1.5 text-xs text-muted-foreground hover:text-foreground -ml-2"
      >
        <ArrowLeftIcon className="size-3.5" />
        Back to topics
      </Button>

      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-2">
          <Icon className={cn("size-4", topic.categoryColor)} />
          <span className={cn("text-xs font-medium", topic.categoryColor)}>{topic.category}</span>
          <span className="text-xs text-muted-foreground">·</span>
          <ClockIcon className="size-3 text-muted-foreground" />
          <span className="text-xs text-muted-foreground">{topic.readTime} read</span>
        </div>
        <h1 className="text-xl font-bold leading-tight">{topic.title}</h1>

        {/* Level pills */}
        <div className="flex items-center gap-1.5 mt-3">
          {topic.levels.map((lvl) => {
            const config = LEVEL_CONFIG[lvl];
            return (
              <button
                key={lvl}
                onClick={() => setActiveLevel(lvl)}
                className={cn(
                  "px-2.5 py-1 rounded-full text-[11px] font-medium border transition-colors cursor-pointer",
                  activeLevel === lvl
                    ? cn(config.bg, config.color, config.border)
                    : "border-border text-muted-foreground hover:border-primary/40"
                )}
              >
                {config.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Summary */}
      <div className="rounded-xl border border-border p-4 bg-muted/20">
        <div className="flex items-center gap-1.5 mb-2">
          <BookOpenIcon className="size-3.5 text-primary" />
          <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Summary</span>
        </div>
        <p className="text-sm leading-relaxed">{topic.summary}</p>
      </div>

      {/* Key Facts */}
      <div className="rounded-xl border border-border p-4">
        <div className="flex items-center gap-1.5 mb-3">
          <CheckCircle2Icon className="size-3.5 text-emerald-500" />
          <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Key Facts</span>
        </div>
        <div className="space-y-2">
          {topic.keyFacts.map((fact, i) => (
            <div key={i} className="flex items-start gap-2.5">
              <span className="text-primary text-sm font-bold mt-0.5 shrink-0">{i + 1}</span>
              <p className="text-sm leading-relaxed">{fact}</p>
            </div>
          ))}
        </div>
      </div>

      {/* AI Perspective */}
      <div className="rounded-xl border border-primary/20 bg-primary/5 p-4">
        <div className="flex items-center gap-1.5 mb-2">
          <SparklesIcon className="size-3.5 text-primary" />
          <span className="text-xs font-semibold uppercase tracking-wider text-primary">AI Perspective</span>
          <span className="text-[9px] text-muted-foreground ml-1">{LEVEL_CONFIG[activeLevel].label} level</span>
        </div>
        <p className="text-sm leading-relaxed">{topic.aiPerspective}</p>
      </div>

      {/* Source */}
      <div className="flex items-center gap-2 text-xs text-muted-foreground pt-2 border-t border-border">
        <ExternalLinkIcon className="size-3 shrink-0" />
        <span className="font-medium">Source:</span>
        <span className="truncate">{topic.sourceLabel}</span>
      </div>
    </div>
  );
};
