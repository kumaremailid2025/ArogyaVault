/**
 * Linked Member Data — hook-only (data lives in backend store).
 */

"use client";

import { useAppDataContext } from "@/providers/appdata-provider";
import type { LinkedMember } from "@/models/community";

interface LinkedMembersBundle {
  LINKED_MEMBER_DATA: Record<string, LinkedMember>;
  LINKED_POST_SUMMARIES: Record<string, Record<number, string>>;
  LINKED_POST_AI_RESPONSES: Record<string, Record<number, string>>;
}

export const useLinkedMembers = (): LinkedMembersBundle => {
  const { data } = useAppDataContext();
  const src = (data.linkedMembers || {}) as Record<string, unknown>;
  return {
    LINKED_MEMBER_DATA:
      (src.LINKED_MEMBER_DATA as Record<string, LinkedMember>) ?? {},
    LINKED_POST_SUMMARIES:
      (src.LINKED_POST_SUMMARIES as Record<string, Record<number, string>>) ??
      {},
    LINKED_POST_AI_RESPONSES:
      (src.LINKED_POST_AI_RESPONSES as Record<
        string,
        Record<number, string>
      >) ?? {},
  };
};
