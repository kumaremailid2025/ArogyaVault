"use client";

/**
 * MembersLayoutContent
 * --------------------
 * Shared two-column members layout used by both main /community and /community/[groupId].
 * LEFT: MembersContainer with member list and search
 * RIGHT: {children} (route-driven panel)
 */

import * as React from "react";
import { useRouter, usePathname } from "next/navigation";

import type { CommunityMember } from "@/models/community";
import type { CommunityVariant } from "@/components/containers/community/types";

import { MembersProvider } from "@/app/(app)/community/_context/members-context";
import { MembersContainer } from "@/components/containers/community/members-container";

/* ── API hooks ────────────────────────────────────────────────── */
import { useMembers } from "@/hooks/api";

/* ── Mock data ────────────────────────────────────────────────── */
import { useLinkedMembers } from "@/data/linked-member-data";
import { useCommunityMembers } from "@/data/community-members-data";
import { GROUP_SLUG_TO_UUID } from "@/components/containers/community/types";

interface MembersLayoutContentProps {
  variant: CommunityVariant;
  group: string;
  basePath: string; // "/community" or "/community/<uuid>"
  children: React.ReactNode;
}

export const MembersLayoutContent = ({ variant, group, basePath, children }: MembersLayoutContentProps) => {
  const { LINKED_MEMBER_DATA } = useLinkedMembers();
  const { INVITED_GROUP_MEMBERS } = useCommunityMembers();
  const router = useRouter();
  const pathname = usePathname();

  const isCommunity = variant === "community";
  const groupId = GROUP_SLUG_TO_UUID[group] ?? group;

  /* ── API hooks ── */
  const membersQuery = useMembers(groupId, {}, isCommunity);

  /* ── State ── */
  const [selectedMemberId, setSelectedMemberId] = React.useState<number | null>(null);

  /* ── Derive selectedMemberId from URL ── */
  React.useEffect(() => {
    const match = pathname.match(/\/members\/(\d+)$/);
    if (match) {
      setSelectedMemberId(parseInt(match[1], 10));
    } else {
      setSelectedMemberId(null);
    }
  }, [pathname]);

  /* ── Resolved data ── */
  const membersList: CommunityMember[] = isCommunity
    ? ((membersQuery.data?.items as unknown as CommunityMember[]) ?? [])
    : (INVITED_GROUP_MEMBERS[group] ?? []);

  /* ── Titles ── */
  const membersTitle = isCommunity ? "Community Members" : "Group Members";
  const memberCount = isCommunity ? "12,847" : membersList.length;

  /* ── Handlers ── */
  const handleSelectMember = React.useCallback((memberId: number) => {
    setSelectedMemberId(memberId);
    router.push(`${basePath}/members/${memberId}`);
  }, [router, basePath]);

  /* ── Context value ── */
  const contextValue = React.useMemo(
    () => ({
      variant,
      group,
      basePath,
      members: membersList,
      selectedMemberId,
      setSelectedMemberId,
      memberCount,
    }),
    [variant, group, basePath, membersList, selectedMemberId, memberCount],
  );

  /* ── Render ── */
  return (
    <MembersProvider value={contextValue}>
      <>
        {/* LEFT — Members list with search/filter */}
        <MembersContainer
          title={membersTitle}
          memberCount={memberCount}
          members={membersList}
          selectedMemberId={selectedMemberId}
          onSelectMember={handleSelectMember}
        />

        {/* Vertical divider */}
        <div className="w-px bg-border shrink-0" />

        {/* RIGHT — Child panel page */}
        <div className="w-[360px] shrink-0 border-l border-border overflow-hidden flex flex-col">
          {children}
        </div>
      </>
    </MembersProvider>
  );
};
