"use client";

/**
 * FilesContext
 * ------------
 * Provides files data + handlers from the files layout to panel page routes.
 */

import { createContext, useContext } from "react";
import type { CommunityFile } from "@/models/community";
import type { ComposeSubmitPayload } from "@/components/shared/compose-box";
import type { CommunityVariant } from "@/components/containers/community/types";

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

export interface FilesContextValue {
  variant: CommunityVariant;
  group: string;
  basePath: string; // e.g. "/community" or "/community/<groupId>"
  files: CommunityFile[];
  selectedFileId: number | null;
  setSelectedFileId: (id: number | null) => void;
  recentFileQA: RecentFileQA[];
  handleAskFileQuestion: (payload: ComposeSubmitPayload) => void;
}

const FilesContext = createContext<FilesContextValue | null>(null);

export const FilesProvider = FilesContext.Provider;

export const useFilesContext = () => {
  const ctx = useContext(FilesContext);
  if (!ctx) throw new Error("useFilesContext must be used within a FilesProvider");
  return ctx;
};
