"use client";

/**
 * Members Default Page
 * ────────────────────
 * Rendered when no member is selected. Shows "Community Pulse" overview.
 */

import { ZapIcon, MessageSquareIcon } from "lucide-react";
import Typography from "@/components/ui/typography";

const CommunityMembersDefaultPage = () => {
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

      {/* CTA */}
      <div className="rounded-xl border border-primary/20 bg-primary/5 p-3 text-center">
        <MessageSquareIcon className="size-5 text-primary/40 mx-auto mb-1.5" />
        <Typography variant="caption" color="muted">
          Select any member to see their profile, activity history, posts, uploads, and contributions.
        </Typography>
      </div>
    </div>
  );
};

export default CommunityMembersDefaultPage;
