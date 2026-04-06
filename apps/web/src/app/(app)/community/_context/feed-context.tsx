"use client";

/**
 * FeedContext
 * -----------
 * Provides feed data + handlers from the feed layout to panel page routes.
 * The layout owns hooks/state, panel pages consume via this context.
 */

import { createContext, useContext } from "react";
import type { CommunityPost, LinkedPost } from "@/models/community";
import type { ComposeSubmitPayload } from "@/components/shared/compose-box";
import type { CommunityVariant } from "@/components/containers/community/types";

export interface FeedContextValue {
  variant: CommunityVariant;
  group: string;
  basePath: string; // e.g. "/community" or "/community/<groupId>"
  posts: (CommunityPost | LinkedPost)[];
  likedPosts: Set<number>;
  toggleLike: (postId: number) => void;
  openReplies: (postId: number) => void;
  openSummary: (postId: number) => void;

  /* Reply flow — used by replies panel */
  pendingReply: ComposeSubmitPayload | null;
  selectedVersion: 0 | 1 | 2;
  setSelectedVersion: (v: 0 | 1 | 2) => void;
  handlePreviewSend: (payload: ComposeSubmitPayload) => void;
  handleBackToCompose: () => void;
  handleSubmitReply: () => void;
  replyPreviewState: { original: string; rephrasings: [string, string] } | null;

  /* Summary data */
  linkedSummary: string;
  linkedAiResponse: string;
}

const FeedContext = createContext<FeedContextValue | null>(null);

export const FeedProvider = FeedContext.Provider;

export const useFeedContext = () => {
  const ctx = useContext(FeedContext);
  if (!ctx) throw new Error("useFeedContext must be used within a FeedProvider");
  return ctx;
};
