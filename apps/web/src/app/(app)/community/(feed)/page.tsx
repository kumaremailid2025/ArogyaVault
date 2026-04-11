"use client";

/**
 * Default Feed Panel
 * ------------------
 * Community Pulse stats when no post is selected.
 */

import { MessageSquareIcon, ZapIcon, FlameIcon, SparklesIcon } from "lucide-react";
import { Button } from "@/core/ui/button";
import { useCommunity } from "@/data/community-data";
import Typography from "@/components/ui/typography";

/**
 * Render the default feed panel (community pulse, trending topics).
 * @returns React element.
 */
const CommunityFeedPage = (): React.ReactElement => {
  const { TRENDING_TOPICS } = useCommunity();
  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-5">
      {/* Community Pulse */}
      <div>
        <Typography variant="overline" color="muted">
          <ZapIcon className="size-3 text-primary" /> Community Pulse
        </Typography>
        <div className="grid grid-cols-3 gap-2">
          {[
            { label: "Members", value: "12,847" },
            { label: "Today", value: "23 posts" },
            { label: "Active now", value: "156" },
          ].map((s) => (
            <div
              key={s.label}
              className="rounded-lg border border-border bg-background p-2 text-center"
            >
              <Typography variant="body" weight="bold" color="primary">{s.value}</Typography>
              <Typography variant="micro" color="muted">{s.label}</Typography>
            </div>
          ))}
        </div>
      </div>

      {/* Trending Topics */}
      <div>
        <Typography variant="overline" color="muted">
          <FlameIcon className="size-3 text-orange-500" /> Trending Topics
        </Typography>
        <div className="space-y-2">
          {TRENDING_TOPICS.map((t) => (
            <div key={t.topic}>
              <div className="flex items-center justify-between mb-0.5">
                <Typography variant="caption" as="span" truncate={true} className="flex-1">{t.topic}</Typography>
                <Typography variant="micro" color="muted" as="span" className="ml-1 shrink-0">
                  {t.count}
                </Typography>
              </div>
              <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                <div
                  className="h-full rounded-full bg-primary/60 transition-all"
                  style={{ width: `${t.pct}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Help CTA */}
      <div className="rounded-xl border border-primary/20 bg-primary/5 p-3 text-center">
        <MessageSquareIcon className="size-5 text-primary/40 mx-auto mb-1.5" />
        <Typography variant="caption" color="muted" className="mb-2 leading-snug">
          Click any post to read replies or tap{" "}
          <SparklesIcon className="size-3 inline-block text-violet-500 mx-0.5" /> AI
          Summary for a quick digest.
        </Typography>
        <Button size="sm" variant="outline" className="text-xs border-primary/30 text-primary w-full">
          Ask the Community
        </Button>
      </div>
    </div>
  );
};

export default CommunityFeedPage;
