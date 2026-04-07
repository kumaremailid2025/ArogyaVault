/**
 * Likes Store (Zustand) — API-Backed
 * ------------------------------------
 * Thin client-side cache that syncs with /vault/likes API.
 * Provides optimistic updates for instant UI feedback.
 *
 * Hydration: call hydrate(items) with data from useLikedPosts() query.
 */

import { create } from "zustand";
import { TypeCode } from "@/models/type-codes";
import type { CommunityPost, LinkedPost } from "@/models/community";
import type { LikeOut } from "@/models/vault";
import { vaultApi } from "@/lib/api/vault";

type AnyPost = CommunityPost | LinkedPost;

/** Re-export for backward compat */
export type LikeEntry = LikeOut;

interface LikesState {
  likedIds: Set<number>;
  likes: Map<number, LikeOut>;
  hydrated: boolean;

  hydrate: (items: LikeOut[]) => void;
  toggleLike: (post: AnyPost, groupId?: string) => void;
  isLiked: (postId: number) => boolean;
  getLikes: () => LikeOut[];
  getLikedPosts: () => AnyPost[];
}

const generateUUID = (): string => {
  if (typeof crypto !== "undefined" && crypto.randomUUID) return crypto.randomUUID();
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
};

export const useLikesStore = create<LikesState>((set, get) => ({
  likedIds: new Set(),
  likes: new Map(),
  hydrated: false,

  hydrate: (items) => {
    const nextIds = new Set<number>();
    const nextLikes = new Map<number, LikeOut>();
    for (const item of items) {
      nextIds.add(item.entity_id);
      nextLikes.set(item.entity_id, item);
    }
    set({ likedIds: nextIds, likes: nextLikes, hydrated: true });
  },

  toggleLike: (post, groupId) => {
    const state = get();
    const nextIds = new Set(state.likedIds);
    const nextLikes = new Map(state.likes);

    if (nextIds.has(post.id)) {
      /* ── Optimistic unlike ── */
      nextIds.delete(post.id);
      nextLikes.delete(post.id);
      set({ likedIds: nextIds, likes: nextLikes });

      vaultApi.toggleLike({ post_id: post.id, group_id: groupId }).catch(() => {
        const revert = get();
        const revertIds = new Set(revert.likedIds);
        const revertLikes = new Map(revert.likes);
        revertIds.add(post.id);
        revertLikes.set(post.id, {
          uuid: generateUUID(),
          type_code: TypeCode.POST,
          entity_id: post.id,
          liked_at: new Date().toISOString(),
          post: post as unknown as LikeOut["post"],
        });
        set({ likedIds: revertIds, likes: revertLikes });
      });
    } else {
      /* ── Optimistic like ── */
      const optimistic: LikeOut = {
        uuid: generateUUID(),
        type_code: TypeCode.POST,
        entity_id: post.id,
        liked_at: new Date().toISOString(),
        post: post as unknown as LikeOut["post"],
      };
      nextIds.add(post.id);
      nextLikes.set(post.id, optimistic);
      set({ likedIds: nextIds, likes: nextLikes });

      vaultApi.toggleLike({ post_id: post.id, group_id: groupId }).then((res) => {
        if (res.entry) {
          const current = get();
          const updatedLikes = new Map(current.likes);
          updatedLikes.set(post.id, res.entry);
          set({ likes: updatedLikes });
        }
      }).catch(() => {
        const revert = get();
        const revertIds = new Set(revert.likedIds);
        const revertLikes = new Map(revert.likes);
        revertIds.delete(post.id);
        revertLikes.delete(post.id);
        set({ likedIds: revertIds, likes: revertLikes });
      });
    }
  },

  isLiked: (postId) => get().likedIds.has(postId),

  getLikes: () => {
    const entries = Array.from(get().likes.values());
    return entries.sort(
      (a, b) => new Date(b.liked_at).getTime() - new Date(a.liked_at).getTime(),
    );
  },

  getLikedPosts: () =>
    get()
      .getLikes()
      .map((e) => e.post as unknown as AnyPost),
}));
