"use client";

/**
 * Context provider for community members data and selection state.
 *
 * @packageDocumentation
 * @category Context
 *
 * @remarks
 * Provides members data and selection state from the members layout
 * down to the nested member detail panel route. Mirrors the pattern
 * used by `FeedContext` / `FilesContext`.
 *
 * @example
 * ```tsx
 * <MembersProvider value={contextValue}>
 *   {children}
 * </MembersProvider>
 *
 * const { members, setSelectedMemberId } = useMembersContext();
 * ```
 */

import { createContext, useContext } from "react";
import type { CommunityMember } from "@/models/community";
import type { CommunityVariant } from "@/components/containers/community/types";

/* ══════════════════════════════════════════════════════════════════════
   TYPES
   ══════════════════════════════════════════════════════════════════════ */

/**
 * Members context value shape.
 *
 * All fields are required.
 *
 * @category Types
 */
export interface MembersContextValue {
  /** Whether this is the own community or an invited linked group. */
  variant: CommunityVariant;
  /** Human-readable group label. */
  group: string;
  /** URL prefix — `/community` or `/community/<groupId>`. */
  basePath: string;
  /** Paginated members currently loaded for the group. */
  members: CommunityMember[];
  /** Id of the member currently selected in the right panel (null = none). */
  selectedMemberId: string | null;
  /** Select (or clear) the active member. */
  setSelectedMemberId: (id: string | null) => void;
  /**
   * Display-friendly count of members in the group. May be a number
   * (exact count) or a string like "12+" when the total is truncated.
   */
  memberCount: string | number;
}

/* ══════════════════════════════════════════════════════════════════════
   CONTEXT
   ══════════════════════════════════════════════════════════════════════ */

const MembersContext = createContext<MembersContextValue | null>(null);

/** Provider component — pass through your layout-level context value. */
export const MembersProvider = MembersContext.Provider;

/**
 * Hook for reading the members context. Throws rather than returning
 * null so misuse surfaces as a dev-time error.
 */
export const useMembersContext = (): MembersContextValue => {
  const ctx = useContext(MembersContext);
  if (!ctx) {
    throw new Error("useMembersContext must be used within a MembersProvider");
  }
  return ctx;
};
