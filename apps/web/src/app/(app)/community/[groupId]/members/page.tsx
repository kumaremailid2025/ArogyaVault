"use client";

/**
 * Members Default Page — Invited Group
 * ─────────────────────────────────────
 * Rendered when no member is selected. Shows "Group Pulse" overview.
 */

import { ZapIcon, MessageSquareIcon } from "lucide-react";
import { useMembersContext } from "@/app/(app)/community/_context/members-context";

const GroupMembersDefaultPage = () => {
  const { memberCount } = useMembersContext();

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-5">
      {/* Group Pulse */}
      <div>
        <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-2 flex items-center gap-1">
          <ZapIcon className="size-3 text-primary" /> Group Pulse
        </p>
        <div className="grid grid-cols-3 gap-2">
          {[
            { label: "Members", value: String(memberCount) },
            { label: "Posts", value: "—" },
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

      {/* CTA */}
      <div className="rounded-xl border border-primary/20 bg-primary/5 p-3 text-center">
        <MessageSquareIcon className="size-5 text-primary/40 mx-auto mb-1.5" />
        <p className="text-xs text-muted-foreground leading-snug">
          Select any member to see their profile, activity history, posts, uploads, and contributions.
        </p>
      </div>
    </div>
  );
};

export default GroupMembersDefaultPage;
