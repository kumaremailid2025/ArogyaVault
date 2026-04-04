"use client";

import * as React from "react";
import { SearchIcon, UsersIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { MemberCard } from "@/components/community/member-card";
import { MEMBER_STATUS_FILTERS } from "@/data/community-members-data";
import type { MemberStatusFilter } from "@/data/community-members-data";
import type { CommunityMember } from "@/models/community";

/* ── Props ─────────────────────────────────────────────────────── */

interface MembersContainerProps {
  title: string;
  memberCount: number | string;
  members: CommunityMember[];
  selectedMemberId: number | null;
  onSelectMember: (memberId: number) => void;
}

/* ── Status filter → member.status mapping ─────────────────────── */

const STATUS_FILTER_MAP: Record<MemberStatusFilter, CommunityMember["status"][] | null> = {
  All: null,
  Online: ["online"],
  "Recently Active": ["recently"],
  Offline: ["offline"],
};

/* ── Component ─────────────────────────────────────────────────── */

export const MembersContainer = ({
  title,
  memberCount,
  members,
  selectedMemberId,
  onSelectMember,
}: MembersContainerProps) => {
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
            <h2 className="text-sm font-semibold">{title}</h2>
            <span className="text-xs text-muted-foreground">
              {memberCount} members
            </span>
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
            <button
              key={f}
              type="button"
              onClick={() => setStatusFilter(f)}
              className={cn(
                "shrink-0 rounded-full px-3 py-1 text-[11px] font-medium transition-colors border",
                statusFilter === f
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-background text-muted-foreground border-border hover:border-primary/30 hover:text-foreground",
              )}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* ── Scrollable member list ── */}
      <div className="flex-1 overflow-y-auto px-5 pb-5 lg:px-6 min-h-0">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <UsersIcon className="size-10 text-muted-foreground/40 mb-3" />
            <p className="text-sm font-medium text-muted-foreground">No members found</p>
            <p className="text-xs text-muted-foreground/70 mt-1">
              Try adjusting your search or filter.
            </p>
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
