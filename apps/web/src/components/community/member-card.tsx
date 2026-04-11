"use client";

/**
 * Community member card component.
 *
 * @packageDocumentation
 * @category Components
 *
 * @remarks
 * Displays a single community member with name, role, status, and location.
 * Shows online/offline status with a colored dot. Component is memoized for performance.
 */

import * as React from "react";
import {
  MessageSquareIcon, FileUpIcon, HelpCircleIcon, ThumbsUpIcon,
} from "lucide-react";
import { Badge } from "@/core/ui/badge";
import { Avatar, AvatarFallback } from "@/core/ui/avatar";
import { cn } from "@/lib/utils";
import Typography from "@/components/ui/typography";
import type { CommunityMember } from "@/models/community";

/* Status indicator styles */

/**
 * Map of member status to status dot background color CSS class.
 *
 * @category Constants
 */
const STATUS_DOT: Record<CommunityMember["status"], string> = {
  online:   "bg-green-500",
  recently: "bg-amber-400",
  offline:  "bg-muted-foreground/40",
};

/* Component props */

/**
 * Props for {@link MemberCard}.
 *
 * @category Types
 */
interface MemberCardProps {
  /** Member to display. */
  member: CommunityMember;
  /** Whether this member is currently selected. */
  isActive: boolean;
  /** Handler when the member card is clicked. */
  onSelect: (memberId: string) => void;
}

/**
 * Render a community member card with status and role.
 *
 * @param props - Component props.
 * @returns The rendered member card.
 *
 * @category Components
 */
export const MemberCard = React.memo(
  ({ member, isActive, onSelect }: MemberCardProps): React.ReactElement => {
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
              <Typography variant="body" weight="medium" as="span" truncate={true}>{member.name}</Typography>
              <Badge
                variant="outline"
                className="text-[10px] border-primary/30 text-primary"
              >
                {member.role}
              </Badge>
            </div>

            {/* Row 2 — Status + location */}
            <div className="flex items-center gap-1.5 mt-0.5">
              <Typography variant="micro" color="muted" as="span">{member.statusLabel}</Typography>
              {member.location && (
                <>
                  <Typography variant="micro" color="muted" as="span">·</Typography>
                  <Typography variant="micro" color="muted" as="span">{member.location}</Typography>
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
