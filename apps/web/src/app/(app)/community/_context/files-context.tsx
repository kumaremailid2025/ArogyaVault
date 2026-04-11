"use client";

/**
 * Context provider for community files data and handlers.
 *
 * @packageDocumentation
 * @category Context
 *
 * @remarks
 * Provides files data and interaction handlers from the community
 * files layout down to the nested panel page routes (file detail,
 * file Q&A). Mirrors the pattern used by `FeedContext` — the layout
 * owns the state and provides it here so nested routes don't need to
 * re-fetch.
 *
 * @example
 * ```tsx
 * <FilesProvider value={contextValue}>
 *   {children}
 * </FilesProvider>
 *
 * const { files, setSelectedFileId } = useFilesContext();
 * ```
 */

import { createContext, useContext } from "react";
import type { CommunityFile } from "@/models/community";
import type { ComposeSubmitPayload } from "@/components/shared/compose-box";
import type { CommunityVariant } from "@/components/containers/community/types";

/* ══════════════════════════════════════════════════════════════════════
   TYPES
   ══════════════════════════════════════════════════════════════════════ */

/**
 * A recent Q&A entry shown in the right panel.
 *
 * Each row represents one question the user (or a group member) previously
 * asked against an uploaded file.
 *
 * @category Types
 */
export interface RecentFileQA {
  /** Internal numeric id of the file the question was asked against. */
  fileId: number;
  /** Display name of the file for the Q&A card header. */
  fileName: string;
  /** File category tag, used for grouping / color coding. */
  fileCategory: string;
  /** The question the user asked. */
  question: string;
  /** Display name of the person who asked. */
  askedBy: string;
  /** Two-letter initials rendered in the avatar. */
  askedByInitials: string;
  /** Relative time string, already formatted by the server. */
  askedAt: string;
  /** The AI-generated answer, already formatted for display. */
  answer: string;
}

/**
 * Full shape of the files context value. All fields are required.
 */
export interface FilesContextValue {
  /** Whether this is the own community or an invited linked group. */
  variant: CommunityVariant;
  /** Human-readable group label. */
  group: string;
  /** URL prefix — `/community` or `/community/<groupId>`. */
  basePath: string;
  /** Paginated files currently loaded for the group. */
  files: CommunityFile[];
  /** Numeric id of the file currently selected in the right panel (null = none). */
  selectedFileId: number | null;
  /** Select (or clear) the active file. */
  setSelectedFileId: (id: number | null) => void;
  /** Recent Q&A entries across all files in the group. */
  recentFileQA: RecentFileQA[];
  /** Submit a new question against the currently selected file. */
  handleAskFileQuestion: (payload: ComposeSubmitPayload) => void;
}

/* ══════════════════════════════════════════════════════════════════════
   CONTEXT
   ══════════════════════════════════════════════════════════════════════ */

const FilesContext = createContext<FilesContextValue | null>(null);

/** Provider component — pass through your layout-level context value. */
export const FilesProvider = FilesContext.Provider;

/**
 * Hook for reading the files context. Throws rather than returning
 * null so misuse surfaces as a dev-time error.
 */
export const useFilesContext = (): FilesContextValue => {
  const ctx = useContext(FilesContext);
  if (!ctx) {
    throw new Error("useFilesContext must be used within a FilesProvider");
  }
  return ctx;
};
