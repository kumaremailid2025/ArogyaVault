/**
 * Favorites Store (Zustand) — In-Memory Only
 * -------------------------------------------
 * Tracks which entities the user has favorited.
 * Each favorite record carries a UUID, TypeCode, and the original entity
 * snapshot. When the backend is ready, toggleFavorite will also sync
 * to the database.
 *
 * Also records FAVORITE / UNFAVORITE activity automatically.
 */

import { create } from "zustand";
import { TypeCode, ActionCode } from "@/models/type-codes";
import { recordActivity } from "@/stores/activity-store";
import type { CommunityPost, LinkedPost } from "@/models/community";

type AnyPost = CommunityPost | LinkedPost;

/** A persisted favorite entry with UUID + TypeCode metadata. */
export interface FavoriteEntry {
  /** UUID v4 for this favorite record */
  uuid: string;
  /** The TypeCode of the favorited entity (currently always POST) */
  typeCode: TypeCode;
  /** The numeric or string id of the entity */
  entityId: number;
  /** ISO-8601 timestamp when favorited */
  favoritedAt: string;
  /** Snapshot of the post at the time of favoriting */
  post: AnyPost;
}

interface FavoritesState {
  /** Set of favorited post IDs for O(1) lookups */
  favoriteIds: Set<number>;
  /** Full favorite entries keyed by entity id */
  favorites: Map<number, FavoriteEntry>;

  /** Toggle a post in/out of favorites (records activity automatically) */
  toggleFavorite: (post: AnyPost, groupId?: string) => void;
  /** Check if a post is favorited */
  isFavorited: (postId: number) => boolean;
  /** Get all favorite entries (most-recently-favorited first) */
  getFavorites: () => FavoriteEntry[];
  /** Get just the post snapshots (most-recently-favorited first) */
  getFavoritePosts: () => AnyPost[];
}

/** UUID v4 generator */
const generateUUID = (): string => {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
};

export const useFavoritesStore = create<FavoritesState>((set, get) => ({
  favoriteIds: new Set(),
  favorites: new Map(),

  toggleFavorite: (post, groupId) =>
    set((state) => {
      const nextIds = new Set(state.favoriteIds);
      const nextFavorites = new Map(state.favorites);

      if (nextIds.has(post.id)) {
        /* ── Unfavorite ── */
        nextIds.delete(post.id);
        nextFavorites.delete(post.id);

        recordActivity({
          typeCode: TypeCode.POST,
          actionCode: ActionCode.UNFAVORITE,
          entityId: post.id,
          groupId,
          description: `Unfavorited post by ${post.author}`,
          meta: { postText: post.text.slice(0, 100) },
        });
      } else {
        /* ── Favorite ── */
        const entry: FavoriteEntry = {
          uuid: generateUUID(),
          typeCode: TypeCode.POST,
          entityId: post.id,
          favoritedAt: new Date().toISOString(),
          post,
        };
        nextIds.add(post.id);
        nextFavorites.set(post.id, entry);

        recordActivity({
          typeCode: TypeCode.POST,
          actionCode: ActionCode.FAVORITE,
          entityId: post.id,
          groupId,
          description: `Favorited post by ${post.author}`,
          meta: { postText: post.text.slice(0, 100), favoriteUuid: entry.uuid },
        });
      }

      return { favoriteIds: nextIds, favorites: nextFavorites };
    }),

  isFavorited: (postId) => get().favoriteIds.has(postId),

  getFavorites: () => Array.from(get().favorites.values()).reverse(),

  getFavoritePosts: () =>
    Array.from(get().favorites.values())
      .reverse()
      .map((e) => e.post),
}));
