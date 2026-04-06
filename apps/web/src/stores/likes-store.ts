/**
 * Likes Store (Zustand) — In-Memory
 * -----------------------------------
 * Tracks which posts the user has liked, with full post snapshots
 * so the /likes page can render them without feed context.
 * Also records LIKE / UNLIKE activity automatically.
 */

import { create } from "zustand";
import { TypeCode, ActionCode } from "@/models/type-codes";
import { recordActivity } from "@/stores/activity-store";
import type { CommunityPost, LinkedPost } from "@/models/community";

type AnyPost = CommunityPost | LinkedPost;

export interface LikeEntry {
  uuid: string;
  typeCode: TypeCode;
  entityId: number;
  likedAt: string;
  post: AnyPost;
}

interface LikesState {
  likedIds: Set<number>;
  likes: Map<number, LikeEntry>;
  toggleLike: (post: AnyPost, groupId?: string) => void;
  isLiked: (postId: number) => boolean;
  getLikes: () => LikeEntry[];
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

  toggleLike: (post, groupId) =>
    set((state) => {
      const nextIds = new Set(state.likedIds);
      const nextLikes = new Map(state.likes);

      if (nextIds.has(post.id)) {
        nextIds.delete(post.id);
        nextLikes.delete(post.id);
        recordActivity({
          typeCode: TypeCode.POST,
          actionCode: ActionCode.UNLIKE,
          entityId: post.id,
          groupId,
          description: `Unliked post by ${post.author}`,
        });
      } else {
        const entry: LikeEntry = {
          uuid: generateUUID(),
          typeCode: TypeCode.POST,
          entityId: post.id,
          likedAt: new Date().toISOString(),
          post,
        };
        nextIds.add(post.id);
        nextLikes.set(post.id, entry);
        recordActivity({
          typeCode: TypeCode.POST,
          actionCode: ActionCode.LIKE,
          entityId: post.id,
          groupId,
          description: `Liked post by ${post.author}`,
          meta: { likeUuid: entry.uuid },
        });
      }

      return { likedIds: nextIds, likes: nextLikes };
    }),

  isLiked: (postId) => get().likedIds.has(postId),
  getLikes: () => Array.from(get().likes.values()).reverse(),
  getLikedPosts: () => Array.from(get().likes.values()).reverse().map((e) => e.post),
}));
