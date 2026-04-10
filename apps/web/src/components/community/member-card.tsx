"use client";

import * as React from "react";
import {
  MessageSquareIcon, FileUpIcon, HelpCircleIcon, ThumbsUpIcon,
} from "lucide-react";
import { Badge } from "@/core/ui/badge";
import { Avatar, AvatarFallback } from "@/core/ui/avatar";
import { cn } from "@/lib/utils";
import type { CommunityMember } from "@/models/community";

/* ── Status dot color map ──────────────────────────────────────── */

const STATUS_DOT: Record<CommunityMember["status"], string> = {
  online:   "bg-green-500",
  recently: "bg-amber-400",
  offline:  "bg-muted-foreground/40",
};

/* ── Props ─────────────────────────────────────────────────────── */

interface MemberCardProps {
  member: CommunityMember;
  isActive: boolean;
  onSelect: (memberId: string) => void;
}

/* ── Component ─────────────────────────────────────────────────── */

export const MemberCard = React.memo(
  ({ member, isActive, onSelect }: MemberCardProps) => {
    return (
      <div
        onClick={() => onSelect(member.id)}
        className={cn(
          "rounded-xl border bg-background px-4 py-3 cursor-pointer transition-colors",
          isActive
            ? "border-primary/50 bg-primary/5"
            : "border-border hover:border-primary/20 hover:bg-muted/30",
        )}
      >
        <div className="flex items-start gap-3">
          {/* Avatar with status dot */}
          <div className="relative shrink-0">
            <Avatar className="size-9">
              <AvatarFallback className="text-xs font-semibold bg-primary/10 text-primary">
                {member.initials}
              </AvatarFallback>
            </Avatar>
            <span
              className={cn(
                "absolute bottom-0 right-0 size-2.5 rounded-full border-2 border-background",
                STATUS_DOT[member.status],
              )}
            />
          </div>

          <div className="flex-1 min-w-0">
            {/* Row 1 — Name + role badge */}
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-sm font-medium truncate">{member.name}</span>
              <Badge
                variant="outline"
                className="text-[10px] border-primary/30 text-primary"
              >
                {member.role}
              </Badge>
            </div>

            {/* Row 2 — Status + location */}
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="text-[11px] text-muted-foreground">{member.statusLabel}</span>
              {member.location && (
                <>
                  <span className="text-[11px] text-muted-foreground">·</span>
                  <span className="text-[11px] text-muted-foreground">{member.location}</span>
                </>
              )}
            </div>

            {/* Row 3 — Quick stats */}
            <div className="flex items-center gap-3 mt-1.5">
              <span className="inline-flex items-center gap-1 text-[10px] text-muted-foreground">
                <MessageSquareIcon className="size-3" />
                {member.stats.posts + member.stats.replies}
              </span>
              <span className="inline-flex items-center gap-1 text-[10px] text-muted-foreground">
                <FileUpIcon className="size-3" />
                {member.stats.uploads}
              </span>
              <span className="inline-flex items-center gap-1 text-[10px] text-muted-foreground">
                <HelpCircleIcon className="size-3" />
                {member.stats.questions}
              </span>
              <span className="inline-flex items-center gap-1 text-[10px] text-muted-foreground">
                <ThumbsUpIcon className="size-3" />
                {member.stats.likes}
              </span>
            </div>
          </div>
        </div>
      </div>
    );
  },
);

MemberCard.displayName = "MemberCard";
