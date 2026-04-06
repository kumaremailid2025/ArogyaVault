"use client";

/**
 * Member Detail Page — Invited Group
 * ───────────────────────────────────
 * Shows profile, stats, and activity for a selected member.
 */

import Link from "next/link";
import {
  XIcon, MessageSquareIcon, ZapIcon,
  HelpCircleIcon, FileUpIcon, ThumbsUpIcon,
  PenLineIcon, MapPinIcon, CalendarIcon,
} from "lucide-react";
import { Button } from "@/core/ui/button";
import { Badge } from "@/core/ui/badge";
import { Avatar, AvatarFallback } from "@/core/ui/avatar";
import { cn } from "@/lib/utils";

import { useMembersContext } from "@/app/(app)/community/_context/members-context";
import { ACTIVITY_ICON_MAP } from "@/components/containers/community/right-panel-shared";

interface GroupMemberDetailPageProps {
  params: {
    memberId: string;
  };
}

export default function GroupMemberDetailPage({ params }: GroupMemberDetailPageProps) {
  const { members, basePath } = useMembersContext();
  const memberId = parseInt(params.memberId, 10);
  const activeMember = members.find((m) => m.id === memberId);

  if (!activeMember) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-4">
        <p className="text-sm text-muted-foreground">Member not found</p>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* ── Pinned header: member profile card ── */}
      <div className="shrink-0 px-4 pt-4 pb-3 border-b border-border space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-sm font-semibold">Member Profile</span>
          <Link href={`${basePath}/members`}>
            <Button
              variant="ghost"
              size="sm"
              className="h-7 w-7 p-0 text-muted-foreground hover:text-foreground transition-colors"
            >
              <XIcon className="size-4" />
            </Button>
          </Link>
        </div>

        {/* Profile row */}
        <div className="flex items-center gap-3">
          <div className="relative shrink-0">
            <Avatar className="size-10">
              <AvatarFallback className="text-sm font-bold bg-primary/10 text-primary">
                {activeMember.initials}
              </AvatarFallback>
            </Avatar>
            <span
              className={cn(
                "absolute bottom-0 right-0 size-2.5 rounded-full border-2 border-background",
                activeMember.status === "online" ? "bg-green-500" :
                activeMember.status === "recently" ? "bg-amber-400" : "bg-muted-foreground/40",
              )}
            />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold truncate">{activeMember.name}</span>
              <Badge variant="outline" className="text-[10px] border-primary/30 text-primary">
                {activeMember.role}
              </Badge>
            </div>
            <div className="flex items-center gap-2 mt-0.5 text-[10px] text-muted-foreground">
              <span className="flex items-center gap-0.5">
                <span
                  className={cn(
                    "size-1.5 rounded-full",
                    activeMember.status === "online" ? "bg-green-500" :
                    activeMember.status === "recently" ? "bg-amber-400" : "bg-muted-foreground/40",
                  )}
                />
                {activeMember.statusLabel}
              </span>
              {activeMember.location && (
                <>
                  <span>·</span>
                  <span className="flex items-center gap-0.5">
                    <MapPinIcon className="size-2.5" />
                    {activeMember.location}
                  </span>
                </>
              )}
              <span>·</span>
              <span className="flex items-center gap-0.5">
                <CalendarIcon className="size-2.5" />
                Joined {activeMember.joinedAt}
              </span>
            </div>
          </div>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-5 gap-1.5">
          {[
            { label: "Posts", value: activeMember.stats.posts, icon: PenLineIcon },
            { label: "Replies", value: activeMember.stats.replies, icon: MessageSquareIcon },
            { label: "Uploads", value: activeMember.stats.uploads, icon: FileUpIcon },
            { label: "Q&A", value: activeMember.stats.questions, icon: HelpCircleIcon },
            { label: "Likes", value: activeMember.stats.likes, icon: ThumbsUpIcon },
          ].map((s) => (
            <div key={s.label} className="rounded-lg border border-border bg-background p-1.5 text-center">
              <s.icon className="size-3 text-primary/60 mx-auto mb-0.5" />
              <p className="text-xs font-bold text-primary leading-tight">{s.value}</p>
              <p className="text-[9px] text-muted-foreground">{s.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ── Scrollable activity feed ── */}
      <div className="flex-1 overflow-y-auto min-h-0">
        <div className="px-4 py-3">
          <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-1.5">
            <ZapIcon className="size-3 text-primary" />
            Recent Activity
          </p>

          {activeMember.activities.length === 0 ? (
            <div className="rounded-lg border border-dashed border-border bg-muted/20 p-4 text-center">
              <p className="text-xs text-muted-foreground">No recent activity.</p>
            </div>
          ) : (
            <div className="relative">
              {/* Timeline line */}
              <div className="absolute left-[11px] top-2 bottom-2 w-px bg-border" />

              <div className="space-y-0">
                {activeMember.activities.map((activity) => {
                  const iconConfig = ACTIVITY_ICON_MAP[activity.type];
                  const ActivityIcon = iconConfig.icon;

                  return (
                    <div key={activity.id} className="relative flex gap-3 pb-4">
                      {/* Timeline dot */}
                      <div className={cn(
                        "relative z-10 flex size-[22px] shrink-0 items-center justify-center rounded-full border-2 border-background",
                        iconConfig.bg,
                      )}>
                        <ActivityIcon className={cn("size-3", iconConfig.color)} />
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0 pt-0.5">
                        <div className="flex items-center gap-1.5 mb-0.5">
                          <span className="text-[10px] font-semibold text-muted-foreground uppercase">
                            {iconConfig.label}
                          </span>
                          {activity.tag && (
                            <Badge variant="outline" className="text-[9px] border-primary/20 text-primary">
                              {activity.tag}
                            </Badge>
                          )}
                          <span className="text-[10px] text-muted-foreground ml-auto shrink-0">
                            {activity.time}
                          </span>
                        </div>
                        <p className="text-xs leading-relaxed">{activity.text}</p>
                        {activity.context && (
                          <p className="text-[10px] text-muted-foreground mt-0.5 italic">
                            {activity.context}
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
