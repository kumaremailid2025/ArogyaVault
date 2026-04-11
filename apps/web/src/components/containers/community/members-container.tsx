"use client";

/**
 * Left panel container for the members tab.
 *
 * @packageDocumentation
 * @category Containers
 */

import * as React from "react";
import { SearchIcon, UsersIcon } from "lucide-react";
import { Button } from "@/core/ui/button";
import { cn } from "@/lib/utils";
import { MemberCard } from "@/components/community/member-card";
import { useCommunityMembers } from "@/data/community-members-data";
import type { MemberStatusFilter } from "@/data/community-members-data";
import type { CommunityMember } from "@/models/community";
import Typography from "@/components/ui/typography";

/* ══════════════════════════════════════════════════════════════════════
   TYPES
   ══════════════════════════════════════════════════════════════════════ */

/**
 * Props for the members container component.
 *
 * @category Types
 */
interface MembersContainerProps {
  /** Header title. */
  title: string;
  /** Count of members (for display in header). */
  memberCount: number | string;
  /** List of members to display. */
  members: CommunityMember[];
  /** Currently selected member ID. */
  selectedMemberId: string | null;
  /** Handler when a member is selected. */
  onSelectMember: (memberId: string) => void;
}

/* ══════════════════════════════════════════════════════════════════════
   CONSTANTS
   ══════════════════════════════════════════════════════════════════════ */

/**
 * Map from status filter name to allowed member statuses.
 * "All" (null) matches any status; others match specific statuses.
 */
const STATUS_FILTER_MAP: Record<MemberStatusFilter, CommunityMember["status"][] | null> = {
  All: null,
  Online: ["online"],
  "Recently Active": ["recently"],
  Offline: ["offline"],
};

/* ══════════════════════════════════════════════════════════════════════
   COMPONENT
   ══════════════════════════════════════════════════════════════════════ */

/**
 * Render the left panel for the members tab with list, search, and filters.
 *
 * @param props - Component props.
 * @param props.title - Header title.
 * @param props.memberCount - Count of members.
 * @param props.members - Members to display.
 * @param props.selectedMemberId - Currently selected member ID.
 * @param props.onSelectMember - Callback when member is selected.
 * @returns The rendered container.
 *
 * @category Containers
 */
export const MembersContainer = ({
  title,
  memberCount,
  members,
  selectedMemberId,
  onSelectMember,
}: MembersContainerProps): React.ReactElement => {
  const { MEMBER_STATUS_FILTERS } = useCommunityMembers();
  const [search, setSearch] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState<MemberStatusFilter>("All");

  /* ── Filtered members ── */
  const filtered = React.useMemo(() => {
    let result = members;
    const allowed = STATUS_FILTER_MAP[statusFilter];
    if (allowed) {
      result = result.filter((m) => allowed.includes(m.status));
    }
    if (search.trim()) {
      const q = search.toLowerCase().trim();
      result = result.filter(
        (m) =>
          m.name.toLowerCase().includes(q) ||
          m.role.toLowerCase().includes(q) ||
          (m.location?.toLowerCase().includes(q) ?? false),
      );
    }
    return result;
  }, [members, statusFilter, search]);

  /* ── Online count for badge ── */
  const onlineCount = React.useMemo(
    () => members.filter((m) => m.status === "online").length,
    [members],
  );

  return (
    <div className="flex-1 flex flex-col overflow-hidden min-h-0">

      {/* ── Pinned header: title + search + status filter ── */}
      <div className="shrink-0 px-5 pt-4 pb-2 lg:px-6 space-y-3">
        {/* Title row */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Typography variant="h4" as="h2">{title}</Typography>
            <Typography variant="caption" color="muted" as="span">
              {memberCount} members
            </Typography>
          </div>
          <span className="inline-flex items-center gap-1.5 text-xs text-green-600">
            <span className="size-2 rounded-full bg-green-500" />
            {onlineCount} online
          </span>
        </div>

        {/* Search bar */}
        <div className="relative">
          <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search members by name, role, or location…"
            className="w-full rounded-lg border border-border bg-background pl-9 pr-3 py-2 text-xs placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary/40 focus:border-primary/40 transition-colors"
          />
        </div>

        {/* Status filter chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5 scrollbar-none">
          {MEMBER_STATUS_FILTERS.map((f) => (
            <Button
              key={f}
              variant={statusFilter === f ? "default" : "outline"}
              size="sm"
              onClick={() => setStatusFilter(f)}
              className={cn(
                "shrink-0 rounded-full h-6 px-3 py-0 text-[11px] font-medium",
              )}
            >
              {f}
            </Button>
          ))}
        </div>
      </div>

      {/* ── Scrollable member list ── */}
      <div className="flex-1 overflow-y-auto px-5 pb-5 lg:px-6 min-h-0">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <UsersIcon className="size-10 text-muted-foreground/40 mb-3" />
            <Typography variant="body" weight="medium" color="muted">No members found</Typography>
            <Typography variant="caption" color="muted" className="/70 mt-1">
              Try adjusting your search or filter.
            </Typography>
          </div>
        ) : (
          <div className="space-y-2 pt-1">
            {filtered.map((m) => (
              <MemberCard
                key={m.id}
                member={m}
                isActive={selectedMemberId === m.id}
                onSelect={onSelectMember}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
