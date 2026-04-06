"use client";

/**
 * Default Feed Panel — Invited Group
 * -----------------------------------
 * Group Pulse stats when no post is selected.
 */

import { MessageSquareIcon, ZapIcon, SparklesIcon } from "lucide-react";
import { Button } from "@/core/ui/button";
import { useFeedContext } from "@/app/(app)/community/_context/feed-context";

const GroupFeedPage = () => {
  const { group, posts } = useFeedContext();

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-5">
      {/* Group Pulse */}
      <div>
        <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-2 flex items-center gap-1">
          <ZapIcon className="size-3 text-primary" /> Group Pulse
        </p>
        <div className="grid grid-cols-3 gap-2">
          {[
            { label: "Members", value: "—" },
            { label: "Posts", value: `${posts.length}` },
            { label: "Active now", value: "—" },
          ].map((s) => (
            <div
              key={s.label}
              className="rounded-lg border border-border bg-background p-2 text-center"
            >
              <p className="text-sm font-bold text-primary leading-tight">{s.value}</p>
              <p className="text-[10px] text-muted-foreground mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Help CTA */}
      <div className="rounded-xl border border-primary/20 bg-primary/5 p-3 text-center">
        <MessageSquareIcon className="size-5 text-primary/40 mx-auto mb-1.5" />
        <p className="text-xs text-muted-foreground mb-2 leading-snug">
          Click any post to read replies or tap{" "}
          <SparklesIcon className="size-3 inline-block text-violet-500 mx-0.5" /> AI
          Summary for a quick digest.
        </p>
        <Button size="sm" variant="outline" className="text-xs border-primary/30 text-primary w-full">
          Ask the Group
        </Button>
      </div>
    </div>
  );
};

export default GroupFeedPage;
