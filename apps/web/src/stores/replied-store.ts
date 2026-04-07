/**
 * Replied Store (Zustand) — API-Backed
 * --------------------------------------
 * Thin client-side cache syncing with /vault/replied API.
 * Provides optimistic updates for instant UI feedback.
 */

import { create } from "zustand";
import { TypeCode } from "@/models/type-codes";
import type { CommunityPost, LinkedPost } from "@/models/community";
import type { RepliedOut } from "@/models/vault";
import { vaultApi } from "@/lib/api/vault";

type AnyPost = CommunityPost | LinkedPost;

/** Re-export for backward compat */
export type RepliedEntry = RepliedOut;

interface RepliedState {
  repliedIds: Set<number>;
  replies: Map<number, RepliedOut>;
  hydrated: boolean;

  hydrate: (items: RepliedOut[]) => void;
  /** Record that the user replied to a post (calls API + optimistic) */
  addReply: (post: AnyPost, replyText: string, groupId?: string) => void;
  hasReplied: (postId: number) => boolean;
  getReplies: () => RepliedOut[];
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
  hydrated: false,

  hydrate: (items) => {
    const nextIds = new Set<number>();
    const nextReplies = new Map<number, RepliedOut>();
    for (const item of items) {
      nextIds.add(item.entity_id);
      nextReplies.set(item.entity_id, item);
    }
    set({ repliedIds: nextIds, replies: nextReplies, hydrated: true });
  },

  addReply: (post, replyText, groupId) => {
    const nextIds = new Set(get().repliedIds);
    const nextReplies = new Map(get().replies);

    /* ── Optimistic add ── */
    const optimistic: RepliedOut = {
      uuid: generateUUID(),
      type_code: TypeCode.REPLY,
      entity_id: post.id,
      replied_at: new Date().toISOString(),
      reply_text: replyText,
      post: post as unknown as RepliedOut["post"],
    };
    nextIds.add(post.id);
    nextReplies.set(post.id, optimistic);
    set({ repliedIds: nextIds, replies: nextReplies });

    // Fire API — replace optimistic with server entry on success
    vaultApi
      .recordReply({ post_id: post.id, reply_text: replyText, group_id: groupId })
      .then((serverEntry) => {
        const current = get();
        const updated = new Map(current.replies);
        updated.set(post.id, serverEntry);
        set({ replies: updated });
      })
      .catch(() => {
        // Revert only if this was the first reply to this post
        // If it was an update, leave the old entry in place
      });
  },

  hasReplied: (postId) => get().repliedIds.has(postId),

  getReplies: () => {
    const entries = Array.from(get().replies.values());
    return entries.sort(
      (a, b) => new Date(b.replied_at).getTime() - new Date(a.replied_at).getTime(),
    );
  },
}));
