"use client";
import { resolveIcon } from "@/lib/icon-resolver";

import * as React from "react";
import {
  SparklesIcon, TrendingUpIcon, BookOpenIcon,
  ArrowRightIcon, ClockIcon, AlertTriangleIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useLearn } from "@/data/learn-data";
import { useLearnContext } from "@/data/learn-context-data";

/* ═══════════════════════════════════════════════════════════════════
   BROWSE LANDING — personalized dashboard for the Browse tab center
   Shows: featured hero, recommended for you, continue reading,
   category cards, trending topics.
═══════════════════════════════════════════════════════════════════ */

interface BrowseLandingProps {
  onSelectTopic: (topicId: string) => void;
}

/* Tailwind-like color tokens for the Featured Hero gradient.
   We can't pass `from-<color> to-<color>` classes dynamically to
   Tailwind (the JIT only scans static source strings, so runtime
   values from JSON never get compiled), which left the hero
   rendering as an empty transparent rectangle. Instead, parse the
   gradient string from JSON and build a real CSS linear-gradient. */
const TW_COLORS: Record<string, string> = {
  "blue-600": "#2563eb",
  "blue-700": "#1d4ed8",
  "indigo-600": "#4f46e5",
  "indigo-700": "#4338ca",
  "purple-600": "#9333ea",
  "purple-700": "#7e22ce",
  "emerald-600": "#059669",
  "emerald-700": "#047857",
  "rose-600": "#e11d48",
  "rose-700": "#be123c",
  "amber-600": "#d97706",
  "amber-700": "#b45309",
  "cyan-600": "#0891b2",
  "cyan-700": "#0e7490",
};

const gradientFromString = (g: string | undefined): string => {
  if (!g) return "linear-gradient(to bottom right, #2563eb, #4338ca)";
  const fromMatch = g.match(/from-([a-z]+-\d{3})/);
  const toMatch = g.match(/to-([a-z]+-\d{3})/);
  const fromColor = (fromMatch && TW_COLORS[fromMatch[1]]) || "#2563eb";
  const toColor = (toMatch && TW_COLORS[toMatch[1]]) || "#4338ca";
  return `linear-gradient(to bottom right, ${fromColor}, ${toColor})`;
};

const timeAgo = (iso: string) => {
  const diff = Date.now() - new Date(iso).getTime();
  const hrs = Math.floor(diff / 3600000);
  if (hrs < 1) return "Just now";
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days === 1) return "Yesterday";
  return `${days}d ago`;
};

export const BrowseLanding = ({ onSelectTopic }: BrowseLandingProps) => {
  const { EDU_TOPICS, EDU_CATEGORIES } = useLearn();
  const {
    RECOMMENDED_TOPICS,
    FEATURED_TOPIC,
    TRENDING_TOPICS,
    CONTINUE_READING,
  } = useLearnContext();
  if (!FEATURED_TOPIC) return null;
  return (
    <div className="max-w-4xl mx-auto space-y-6 py-4">
      {/* ── Featured Hero ── */}
      <button
        onClick={() => onSelectTopic(FEATURED_TOPIC.id)}
        style={{ backgroundImage: gradientFromString(FEATURED_TOPIC.gradient) }}
        className="w-full rounded-2xl p-6 text-left transition-all cursor-pointer text-white shadow-lg hover:shadow-xl hover:scale-[1.01]"
      >
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <span className="text-[10px] uppercase tracking-widest font-semibold opacity-80">
              Featured for you
            </span>
            <h2 className="text-xl font-bold mt-1">{FEATURED_TOPIC.title}</h2>
            <p className="text-sm mt-2 opacity-90 leading-relaxed">{FEATURED_TOPIC.subtitle}</p>
            <div className="flex items-center gap-3 mt-3">
              <span className="text-xs opacity-70">{FEATURED_TOPIC.category}</span>
              <span className="text-xs opacity-70">·</span>
              <span className="text-xs opacity-70">{FEATURED_TOPIC.readTime} read</span>
            </div>
          </div>
          <ArrowRightIcon className="size-6 mt-2 shrink-0 opacity-60" />
        </div>
      </button>

      {/* ── Recommended for You ── */}
      <div>
        <div className="flex items-center gap-1.5 mb-3">
          <SparklesIcon className="size-4 text-primary" />
          <h3 className="text-sm font-semibold">Recommended for You</h3>
          <span className="text-[10px] text-muted-foreground ml-1">Based on your health data</span>
        </div>
        <div className="grid grid-cols-2 gap-2">
          {RECOMMENDED_TOPICS.slice(0, 6).map((rec) => {
            const topic = EDU_TOPICS.find((t) => t.id === rec.topicId);
            if (!topic) return null;
            const Icon = resolveIcon(topic.categoryIcon);
            return (
              <button
                key={rec.topicId}
                onClick={() => onSelectTopic(rec.topicId)}
                className={cn(
                  "rounded-xl border p-3 text-left transition-all cursor-pointer hover:shadow-sm",
                  rec.urgency === "high"
                    ? "border-amber-200 dark:border-amber-800/40 hover:border-amber-300"
                    : "border-border hover:border-primary/30"
                )}
              >
                <div className="flex items-start gap-2">
                  <Icon className={cn("size-4 mt-0.5 shrink-0", topic.categoryColor)} />
                  <div className="flex-1 min-w-0">
                    <h4 className="text-xs font-medium leading-tight line-clamp-1">{topic.title}</h4>
                    <p className="text-[10px] text-muted-foreground mt-0.5 line-clamp-1">{rec.reason}</p>
                    <div className="flex items-center gap-1 mt-1.5">
                      {rec.urgency === "high" && (
                        <AlertTriangleIcon className="size-2.5 text-amber-500" />
                      )}
                      <span className={cn(
                        "text-[9px] font-medium px-1.5 py-0.5 rounded-full",
                        rec.urgency === "high"
                          ? "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"
                          : rec.urgency === "medium"
                            ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
                            : "bg-muted text-muted-foreground"
                      )}>
                        {rec.urgency === "high" ? "Priority" : rec.urgency === "medium" ? "Suggested" : "Related"}
                      </span>
                      <span className="text-[9px] text-muted-foreground ml-auto">{topic.readTime}</span>
                    </div>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Continue Reading ── */}
      {CONTINUE_READING.length > 0 && (
        <div>
          <div className="flex items-center gap-1.5 mb-3">
            <ClockIcon className="size-4 text-muted-foreground" />
            <h3 className="text-sm font-semibold">Continue Reading</h3>
          </div>
          <div className="flex gap-2">
            {CONTINUE_READING.map((cr) => {
              const topic = EDU_TOPICS.find((t) => t.id === cr.topicId);
              if (!topic) return null;
              return (
                <button
                  key={cr.topicId}
                  onClick={() => onSelectTopic(cr.topicId)}
                  className="flex-1 rounded-xl border border-border p-3 text-left transition-all cursor-pointer hover:border-primary/30 hover:shadow-sm"
                >
                  <h4 className="text-xs font-medium line-clamp-1">{topic.title}</h4>
                  <div className="flex items-center gap-2 mt-2">
                    <div className="flex-1 h-1.5 rounded-full bg-muted overflow-hidden">
                      <div
                        className="h-full rounded-full bg-primary transition-all"
                        style={{ width: `${cr.progress}%` }}
                      />
                    </div>
                    <span className="text-[10px] text-muted-foreground shrink-0">{cr.progress}%</span>
                  </div>
                  <span className="text-[9px] text-muted-foreground mt-1 block">{timeAgo(cr.lastRead)}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* ── Category Cards ── */}
      <div>
        <div className="flex items-center gap-1.5 mb-3">
          <BookOpenIcon className="size-4 text-primary" />
          <h3 className="text-sm font-semibold">Browse by Category</h3>
        </div>
        <div className="grid grid-cols-3 gap-2">
          {EDU_CATEGORIES.filter((c) => c.id !== "all").map((cat) => {
            const Icon = resolveIcon(cat.icon);
            const count = EDU_TOPICS.filter((t) => t.category === cat.id).length;
            return (
              <button
                key={cat.id}
                onClick={() => {
                  const firstTopic = EDU_TOPICS.find((t) => t.category === cat.id);
                  if (firstTopic) onSelectTopic(firstTopic.id);
                }}
                className="rounded-xl border border-border p-3 text-center transition-all cursor-pointer hover:border-primary/30 hover:shadow-sm group"
              >
                <Icon className={cn("size-5 mx-auto", cat.color)} />
                <h4 className="text-xs font-medium mt-1.5">{cat.label}</h4>
                <span className="text-[10px] text-muted-foreground">{count} topics</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Trending Topics ── */}
      <div>
        <div className="flex items-center gap-1.5 mb-3">
          <TrendingUpIcon className="size-4 text-emerald-500" />
          <h3 className="text-sm font-semibold">Trending</h3>
        </div>
        <div className="space-y-1.5">
          {TRENDING_TOPICS.map((tt, i) => (
            <button
              key={tt.id}
              onClick={() => onSelectTopic(tt.id)}
              className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-muted/60 transition-colors cursor-pointer text-left"
            >
              <span className="text-sm font-bold text-muted-foreground/50 w-5 text-right shrink-0">
                {i + 1}
              </span>
              <div className="flex-1 min-w-0">
                <h4 className="text-xs font-medium truncate">{tt.title}</h4>
                <span className="text-[10px] text-muted-foreground">{tt.category}</span>
              </div>
              <span className="text-[10px] text-muted-foreground shrink-0">
                {(tt.readers / 1000).toFixed(1)}k readers
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
