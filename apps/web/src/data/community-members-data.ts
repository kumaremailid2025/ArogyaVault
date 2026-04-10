/**
 * Community Members Data — hook-only (data lives in backend store).
 */

"use client";

import { useAppDataContext } from "@/providers/appdata-provider";
import type { CommunityMember } from "@/models/community";

export type MemberStatusFilter = string;

interface CommunityMembersBundle {
  COMMUNITY_MEMBERS: CommunityMember[];
  MEMBER_STATUS_FILTERS: readonly MemberStatusFilter[];
  INVITED_GROUP_MEMBERS: Record<string, CommunityMember[]>;
}

export const useCommunityMembers = (): CommunityMembersBundle => {
  const { data } = useAppDataContext();
  const src = (data.communityMembers || {}) as Record<string, unknown>;
  return {
    COMMUNITY_MEMBERS: (src.COMMUNITY_MEMBERS as CommunityMember[]) ?? [],
    MEMBER_STATUS_FILTERS:
      (src.MEMBER_STATUS_FILTERS as MemberStatusFilter[]) ?? [],
    INVITED_GROUP_MEMBERS:
      (src.INVITED_GROUP_MEMBERS as Record<string, CommunityMember[]>) ?? {},
  };
};
