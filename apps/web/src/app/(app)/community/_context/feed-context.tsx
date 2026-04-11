"use client";

/**
 * Context provider for community feed data and handlers.
 *
 * @packageDocumentation
 * @category Context
 *
 * @remarks
 * Provides feed data and event handlers from the feed layout down to
 * the nested panel page routes (post detail, replies, summary). The
 * layout owns all hooks and state; child panel pages consume via this
 * context instead of re-fetching or re-deriving.
 *
 * This keeps the panel pages thin and avoids prop-drilling through the
 * App Router layout tree.
 *
 * @example
 * ```tsx
 * <FeedProvider value={contextValue}>
 *   {children}
 * </FeedProvider>
 *
 * const { posts, toggleLike } = useFeedContext();
 * ```
 */

import { createContext, useContext } from "react";
import type { CommunityPost, LinkedPost } from "@/models/community";
import type { ComposeSubmitPayload } from "@/components/shared/compose-box";
import type { CommunityVariant } from "@/components/containers/community/types";

/* ══════════════════════════════════════════════════════════════════════
   TYPES
   ══════════════════════════════════════════════════════════════════════ */

/**
 * Index of the active rephrasing version in the reply-preview step.
 *
 * `0` = user's original text, `1` / `2` = AI rephrasings.
 *
 * @category Types
 */
export type RephraseVersionIndex = 0 | 1 | 2;

/**
 * Pair of AI rephrasings for a draft reply.
 *
 * Kept as a fixed-length tuple so consumers can index
 * into it without worrying about missing entries.
 *
 * @category Types
 */
export type RephrasingPair = readonly [string, string];

/**
 * State for a reply in preview mode.
 *
 * Carried while the user is previewing a reply before sending.
 *
 * @category Types
 */
export interface ReplyPreviewState {
  /** The original text the user typed. */
  readonly original: string;
  /** The two AI-rewritten alternatives. */
  readonly rephrasings: RephrasingPair;
}

/**
 * Full shape of the feed context value. Every field is required; the
 * provider should never pass partial values.
 */
export interface FeedContextValue {
  /** Whether this feed is the user's own community or an invited group. */
  variant: CommunityVariant;
  /** Human-readable group label (e.g. `"community"`, `"ravi"`). */
  group: string;
  /** URL prefix — `/community` or `/community/<groupId>`. */
  basePath: string;
  /** Feed items (may be a mix of own-posts and cross-group linked posts). */
  posts: (CommunityPost | LinkedPost)[];
  /** Set of post ids the current user has liked. */
  likedPosts: Set<number>;
  /** Toggle like on a post (drives surgical cache patching). */
  toggleLike: (postId: number) => void;
  /** Open the replies panel for a post. */
  openReplies: (postId: number) => void;
  /** Open the AI summary panel for a post. */
  openSummary: (postId: number) => void;

  /* ── Reply flow — consumed by the replies panel ────────────────── */

  /** The draft reply the user is currently previewing, if any. */
  pendingReply: ComposeSubmitPayload | null;
  /** Which rephrasing version is currently selected. */
  selectedVersion: RephraseVersionIndex;
  /** Setter for the selected rephrasing version. */
  setSelectedVersion: (v: RephraseVersionIndex) => void;
  /** Called with the raw draft to compute AI rephrasings and show preview. */
  handlePreviewSend: (payload: ComposeSubmitPayload) => void;
  /** Return from the preview back to the compose box (edit mode). */
  handleBackToCompose: () => void;
  /** Submit the currently-selected version of the reply. */
  handleSubmitReply: () => void;
  /** Current preview state (original + rephrasings) or null when hidden. */
  replyPreviewState: ReplyPreviewState | null;

  /* ── Summary panel data ────────────────────────────────────────── */

  /** The linked post summary string (empty while loading). */
  linkedSummary: string;
  /** The linked AI response / Q&A string (empty while loading). */
  linkedAiResponse: string;
}

/* ══════════════════════════════════════════════════════════════════════
   CONTEXT
   ══════════════════════════════════════════════════════════════════════ */

const FeedContext = createContext<FeedContextValue | null>(null);

/** Provider component — pass through your layout-level context value. */
export const FeedProvider = FeedContext.Provider;

/**
 * Hook for reading the feed context. Throws (rather than returning
 * null) so misuse surfaces as a dev-time error instead of silently
 * crashing deep inside the tree.
 */
export const useFeedContext = (): FeedContextValue => {
  const ctx = useContext(FeedContext);
  if (!ctx) {
    throw new Error("useFeedContext must be used within a FeedProvider");
  }
  return ctx;
};
