"use client";

import { Avatar, AvatarFallback } from "@/core/ui/avatar";
import { Badge } from "@/core/ui/badge";

/* ── Types ──────────────────────────────────────────────────────── */

export interface MemberItem {
  name: string;
  role: string;
  initials: string;
  status: string;
}

interface MembersContainerProps {
  /** Heading — e.g. "Community Members" or "Group Members" */
  title: string;
  /** Total count shown on the right of the header */
  memberCount: number | string;
  /** Members to display; falls back to placeholder data when omitted */
  members?: MemberItem[];
}

/* ── Defaults ───────────────────────────────────────────────────── */

const DEFAULT_COMMUNITY_MEMBERS: MemberItem[] = [
  { name: "Dr. Anjali Mehta", role: "Moderator",     initials: "AM", status: "Active now" },
  { name: "Ravi Kumar",       role: "Member",         initials: "RK", status: "Active 2h ago" },
  { name: "Priya Singh",      role: "Member",         initials: "PS", status: "Active 5h ago" },
  { name: "Dr. Sharma",       role: "Health Expert",  initials: "DS", status: "Active 1d ago" },
  { name: "Neha Gupta",       role: "Member",         initials: "NG", status: "Active 1d ago" },
  { name: "Arjun Patel",      role: "Member",         initials: "AP", status: "Active 3d ago" },
];

/* ── Component ──────────────────────────────────────────────────── */

export function MembersContainer({ title, memberCount, members }: MembersContainerProps) {
  const items = members ?? DEFAULT_COMMUNITY_MEMBERS;

  return (
    <div className="flex-1 overflow-y-auto px-5 pb-5 lg:px-6 pt-4">
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold">{title}</h2>
          <span className="text-xs text-muted-foreground">{memberCount} members</span>
        </div>

        {/* Member list */}
        {items.map((m) => (
          <div
            key={m.name}
            className="flex items-center gap-3 rounded-xl border border-border bg-background p-3 hover:border-primary/20 hover:bg-muted/30 cursor-pointer transition-colors"
          >
            <Avatar className="size-9 shrink-0">
              <AvatarFallback className="text-xs font-semibold bg-primary/10 text-primary">
                {m.initials}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <p className="text-sm font-medium truncate">{m.name}</p>
                <Badge variant="outline" className="text-[10px] border-primary/30 text-primary">
                  {m.role}
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground">{m.status}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
