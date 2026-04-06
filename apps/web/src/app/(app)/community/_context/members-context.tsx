"use client";

/**
 * MembersContext
 * --------------
 * Provides members data from the members layout to panel page routes.
 */

import { createContext, useContext } from "react";
import type { CommunityMember } from "@/models/community";
import type { CommunityVariant } from "@/components/containers/community/types";

export interface MembersContextValue {
  variant: CommunityVariant;
  group: string;
  basePath: string; // e.g. "/community" or "/community/<groupId>"
  members: CommunityMember[];
  selectedMemberId: number | null;
  setSelectedMemberId: (id: number | null) => void;
  memberCount: string | number;
}

const MembersContext = createContext<MembersContextValue | null>(null);

export const MembersProvider = MembersContext.Provider;

export const useMembersContext = () => {
  const ctx = useContext(MembersContext);
  if (!ctx) throw new Error("useMembersContext must be used within a MembersProvider");
  return ctx;
};
