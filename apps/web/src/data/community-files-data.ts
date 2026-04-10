/**
 * Community Files Data — hook-only (data lives in backend store).
 */

"use client";

import { useAppDataContext } from "@/providers/appdata-provider";
import type { CommunityFile } from "@/models/community";

/* ═══════════════════════════════════════════════════════════════════
   TYPES
═══════════════════════════════════════════════════════════════════ */

export type FileCategory = string;

export interface RecentFileQA {
  fileId: number;
  fileName: string;
  fileCategory: string;
  question: string;
  askedBy: string;
  askedByInitials: string;
  askedAt: string;
  answer: string;
}

interface CommunityFilesBundle {
  COMMUNITY_FILES: CommunityFile[];
  FILE_CATEGORIES: readonly FileCategory[];
  INVITED_FILES: Record<string, CommunityFile[]>;
  RECENT_FILE_QA: RecentFileQA[];
}

export const useCommunityFiles = (): CommunityFilesBundle => {
  const { data } = useAppDataContext();
  const src = (data.communityFiles || {}) as Record<string, unknown>;
  return {
    COMMUNITY_FILES: (src.COMMUNITY_FILES as CommunityFile[]) ?? [],
    FILE_CATEGORIES: (src.FILE_CATEGORIES as FileCategory[]) ?? [],
    INVITED_FILES:
      (src.INVITED_FILES as Record<string, CommunityFile[]>) ?? {},
    RECENT_FILE_QA: (src.RECENT_FILE_QA as RecentFileQA[]) ?? [],
  };
};
