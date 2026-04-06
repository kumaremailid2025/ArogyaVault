/**
 * Replied Store (Zustand) — In-Memory
 * -------------------------------------
 * Tracks which posts the user has replied to, with post snapshots
 * and the reply text, so the /replied page can render them.
 */

import { create } from "zustand";
import { TypeCode } from "@/models/type-codes";
import type { CommunityPost, LinkedPost } from "@/models/community";

type AnyPost = CommunityPost | LinkedPost;

export interface RepliedEntry {
  uuid: string;
  typeCode: TypeCode;
  entityId: number;
  repliedAt: string;
  replyText: string;
  post: AnyPost;
}

interface RepliedState {
  repliedIds: Set<number>;
  replies: Map<number, RepliedEntry>;
  /** Record that the user replied to a post */
  addReply: (post: AnyPost, replyText: string, groupId?: string) => void;
  hasReplied: (postId: number) => boolean;
  getReplies: () => RepliedEntry[];
}

const generateUUID = (): string => {
  if (typeof crypto !== "undefined" && crypto.randomUUID) return crypto.randomUUID();
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
};

export const useRepliedStore = create<RepliedState>((set, get) => ({
  repliedIds: new Set(),
  replies: new Map(),

  addReply: (post, replyText) =>
    set((state) => {
      const nextIds = new Set(state.repliedIds);
      const nextReplies = new Map(state.replies);

      const entry: RepliedEntry = {
        uuid: generateUUID(),
        typeCode: TypeCode.REPLY,
        entityId: post.id,
        repliedAt: new Date().toISOString(),
        replyText,
        post,
      };

      nextIds.add(post.id);
      /* If user replies again to the same post, update the entry */
      nextReplies.set(post.id, entry);

      return { repliedIds: nextIds, replies: nextReplies };
    }),

  hasReplied: (postId) => get().repliedIds.has(postId),
  getReplies: () => Array.from(get().replies.values()).reverse(),
}));
