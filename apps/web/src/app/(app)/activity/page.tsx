"use client";

/**
 * Activity Page — /activity
 * --------------------------
 * Shows a chronological feed of every action the user has performed
 * in the app (likes, favorites, replies, views, etc.).
 * Data comes from the in-memory Zustand activity store.
 */

import * as React from "react";
import Link from "next/link";
import {
  ActivityIcon, ArrowLeftIcon, ThumbsUpIcon, StarIcon,
  MessageSquareIcon, SparklesIcon, EyeIcon, PenLineIcon,
  TagIcon, LogInIcon, LogOutIcon, UploadIcon, SearchIcon,
  FilterIcon,
} from "lucide-react";
import { Badge } from "@/core/ui/badge";
import { Button } from "@/core/ui/button";
import { PageBanner } from "@/components/shared/page-banner";
import { useActivityStore } from "@/stores";
import {
  TypeCode, ActionCode,
  TYPE_CODE_LABELS, ACTION_CODE_LABELS,
} from "@/models/type-codes";

/* ── Icon + color mapping per ActionCode ──────────────────────────── */

const ACTION_ICON_MAP: Partial<Record<ActionCode, { icon: React.ElementType; color: string }>> = {
  [ActionCode.LIKE]:             { icon: ThumbsUpIcon,     color: "text-primary" },
  [ActionCode.UNLIKE]:           { icon: ThumbsUpIcon,     color: "text-muted-foreground" },
  [ActionCode.FAVORITE]:         { icon: StarIcon,         color: "text-amber-500" },
  [ActionCode.UNFAVORITE]:       { icon: StarIcon,         color: "text-muted-foreground" },
  [ActionCode.REPLY_SUBMIT]:     { icon: MessageSquareIcon, color: "text-blue-500" },
  [ActionCode.REPLY_REPHRASE]:   { icon: PenLineIcon,      color: "text-violet-500" },
  [ActionCode.POST_CREATE]:      { icon: PenLineIcon,      color: "text-green-600" },
  [ActionCode.POST_VIEW]:        { icon: EyeIcon,          color: "text-primary" },
  [ActionCode.AI_SUMMARY_VIEW]:  { icon: SparklesIcon,     color: "text-violet-500" },
  [ActionCode.AI_CHAT_SEND]:     { icon: SparklesIcon,     color: "text-violet-500" },
  [ActionCode.FILE_VIEW]:        { icon: EyeIcon,          color: "text-primary" },
  [ActionCode.FILE_UPLOAD]:      { icon: UploadIcon,       color: "text-green-600" },
  [ActionCode.TAG_VIEW]:         { icon: TagIcon,          color: "text-primary" },
  [ActionCode.SIGN_IN]:          { icon: LogInIcon,        color: "text-green-600" },
  [ActionCode.SIGN_OUT]:         { icon: LogOutIcon,       color: "text-destructive" },
  [ActionCode.MEMBER_VIEW]:      { icon: EyeIcon,          color: "text-primary" },
};

const DEFAULT_ICON = { icon: ActivityIcon, color: "text-muted-foreground" };

/* ── Filter options ───────────────────────────────────────────────── */

const FILTER_OPTIONS: { label: string; value: string; codes: ActionCode[] }[] = [
  { label: "All",       value: "all",       codes: [] },
  { label: "Likes",     value: "likes",     codes: [ActionCode.LIKE, ActionCode.UNLIKE] },
  { label: "Favorites", value: "favorites", codes: [ActionCode.FAVORITE, ActionCode.UNFAVORITE] },
  { label: "Replies",   value: "replies",   codes: [ActionCode.REPLY_SUBMIT, ActionCode.REPLY_REPHRASE] },
  { label: "Posts",     value: "posts",     codes: [ActionCode.POST_CREATE, ActionCode.POST_VIEW] },
  { label: "AI",        value: "ai",        codes: [ActionCode.AI_SUMMARY_VIEW, ActionCode.AI_CHAT_SEND] },
  { label: "Tags",      value: "tags",      codes: [ActionCode.TAG_VIEW] },
];

/* ── Helpers ──────────────────────────────────────────────────────── */

const formatTime = (iso: string): string => {
  const d = new Date(iso);
  const now = new Date();
  const diff = now.getTime() - d.getTime();

  if (diff < 60_000) return "Just now";
  if (diff < 3_600_000) return `${Math.floor(diff / 60_000)}m ago`;
  if (diff < 86_400_000) return `${Math.floor(diff / 3_600_000)}h ago`;
  return d.toLocaleDateString(undefined, { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });
};

const groupByDate = (activities: { datetime: string }[]): Map<string, typeof activities> => {
  const map = new Map<string, typeof activities>();
  for (const a of activities) {
    const key = new Date(a.datetime).toLocaleDateString(undefined, {
      weekday: "long", month: "long", day: "numeric",
    });
    const arr = map.get(key) ?? [];
    arr.push(a);
    map.set(key, arr);
  }
  return map;
};

/* ── Page ─────────────────────────────────────────────────────────── */

const ActivityPage = () => {
  const activities = useActivityStore((s) => s.activities);
  const [filter, setFilter] = React.useState("all");

  const filtered = filter === "all"
    ? activities
    : activities.filter((a) => {
        const opt = FILTER_OPTIONS.find((o) => o.value === filter);
        return opt?.codes.includes(a.actionCode);
      });

  const grouped = groupByDate(filtered);

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Banner */}
      <PageBanner
        icon={
          <div className="flex size-7 items-center justify-center rounded-full bg-white/20">
            <ActivityIcon className="size-4" />
          </div>
        }
        title="Activity"
        badges={[
          { label: `${activities.length} ${activities.length === 1 ? "action" : "actions"}`, icon: <ActivityIcon className="size-2.5" /> },
        ]}
        description={
          <p className="text-sm text-primary-foreground/80 leading-relaxed">
            A chronological record of every action you have taken across the app.
          </p>
        }
      />

      {/* Filter bar */}
      <div className="shrink-0 flex items-center gap-1.5 px-5 py-2.5 border-b border-border/60 overflow-x-auto lg:px-6">
        <FilterIcon className="size-3 text-muted-foreground shrink-0 mr-1" />
        {FILTER_OPTIONS.map((opt) => (
          <button
            key={opt.value}
            onClick={() => setFilter(opt.value)}
            className={`shrink-0 rounded-full px-2.5 py-1 text-[11px] font-medium transition-colors cursor-pointer ${
              filter === opt.value
                ? "bg-primary text-primary-foreground"
                : "bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground"
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-5 py-4 lg:px-6">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <ActivityIcon className="size-10 text-muted-foreground/30 mb-3" />
            <p className="text-sm font-medium text-muted-foreground">
              {filter === "all" ? "No activity yet" : "No matching activity"}
            </p>
            <p className="text-xs text-muted-foreground/70 mt-1 max-w-xs">
              {filter === "all"
                ? "Your actions across the app will be recorded here."
                : "Try a different filter to see other activities."}
            </p>
            {filter !== "all" && (
              <Button variant="outline" size="sm" className="mt-4" onClick={() => setFilter("all")}>
                Show all
              </Button>
            )}
          </div>
        ) : (
          <div className="space-y-6">
            {Array.from(grouped.entries()).map(([dateLabel, items]) => (
              <div key={dateLabel}>
                {/* Date group header */}
                <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-2.5">
                  {dateLabel}
                </p>

                {/* Timeline */}
                <div className="relative ml-3 border-l-2 border-border/60 pl-4 space-y-0">
                  {(items as typeof activities).map((activity) => {
                    const iconCfg = ACTION_ICON_MAP[activity.actionCode] ?? DEFAULT_ICON;
                    const Icon = iconCfg.icon;

                    return (
                      <div key={activity.id} className="relative pb-4 last:pb-0">
                        {/* Timeline dot */}
                        <div className="absolute -left-[22px] top-0.5 flex size-5 items-center justify-center rounded-full bg-background border-2 border-border/60">
                          <Icon className={`size-2.5 ${iconCfg.color}`} />
                        </div>

                        {/* Content */}
                        <div className="flex items-start justify-between gap-3 min-w-0">
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-medium leading-snug">
                              {ACTION_CODE_LABELS[activity.actionCode]}
                            </p>
                            {activity.description && (
                              <p className="text-[11px] text-muted-foreground mt-0.5 leading-relaxed line-clamp-2">
                                {activity.description}
                              </p>
                            )}
                            {activity.meta?.textSnippet && (
                              <p className="text-[11px] text-muted-foreground/70 mt-0.5 italic line-clamp-1">
                                &ldquo;{String(activity.meta.textSnippet)}&rdquo;
                              </p>
                            )}
                            <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                              <Badge variant="outline" className="text-[9px] px-1.5 py-0">
                                {TYPE_CODE_LABELS[activity.typeCode]}
                              </Badge>
                              {activity.groupId && (
                                <Badge variant="outline" className="text-[9px] px-1.5 py-0 text-muted-foreground border-muted-foreground/30">
                                  {activity.groupId}
                                </Badge>
                              )}
                            </div>
                          </div>
                          <span className="text-[10px] text-muted-foreground shrink-0 mt-0.5">
                            {formatTime(activity.datetime)}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ActivityPage;
