/**
 * Favorites Store (Zustand) — API-Backed
 * ----------------------------------------
 * Thin client-side cache that syncs with /vault/favorites API.
 * Provides optimistic updates for instant UI feedback while
 * the API call completes in the background.
 *
 * Hydration: call hydrate(items) with data from useFavorites() query.
 * Mutations: toggleFavorite fires API + updates local state optimistically.
 */

import { create } from "zustand";
import { TypeCode } from "@/models/type-codes";
import type { CommunityPost, LinkedPost } from "@/models/community";
import type { FavoriteOut } from "@/models/vault";
import { vaultApi } from "@/lib/api/vault";

type AnyPost = CommunityPost | LinkedPost;

/** Re-export for backward compat with pages that import from here */
export type FavoriteEntry = FavoriteOut;

interface FavoritesState {
  /** Set of favorited post IDs for O(1) lookups */
  favoriteIds: Set<number>;
  /** Full favorite entries keyed by entity id */
  favorites: Map<number, FavoriteOut>;
  /** Whether the store has been hydrated from the API at least once */
  hydrated: boolean;

  /** Hydrate the store from API response */
  hydrate: (items: FavoriteOut[]) => void;
  /** Toggle a post in/out of favorites (calls API + optimistic update) */
  toggleFavorite: (post: AnyPost, groupId?: string) => void;
  /** Check if a post is favorited */
  isFavorited: (postId: number) => boolean;
  /** Get all favorite entries (most-recently-favorited first) */
  getFavorites: () => FavoriteOut[];
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
  hydrated: false,

  hydrate: (items) => {
    const nextIds = new Set<number>();
    const nextFavorites = new Map<number, FavoriteOut>();
    for (const item of items) {
      nextIds.add(item.entity_id);
      nextFavorites.set(item.entity_id, item);
    }
    set({ favoriteIds: nextIds, favorites: nextFavorites, hydrated: true });
  },

  toggleFavorite: (post, groupId) => {
    const state = get();
    const nextIds = new Set(state.favoriteIds);
    const nextFavorites = new Map(state.favorites);

    if (nextIds.has(post.id)) {
      /* ── Optimistic unfavorite ── */
      nextIds.delete(post.id);
      nextFavorites.delete(post.id);
      set({ favoriteIds: nextIds, favorites: nextFavorites });

      // Fire API (non-blocking)
      vaultApi.toggleFavorite({ post_id: post.id, group_id: groupId }).catch(() => {
        // Revert on failure
        const revert = get();
        const revertIds = new Set(revert.favoriteIds);
        const revertFavs = new Map(revert.favorites);
        revertIds.add(post.id);
        // We lost the entry, put a placeholder back
        revertFavs.set(post.id, {
          uuid: generateUUID(),
          type_code: TypeCode.POST,
          entity_id: post.id,
          favorited_at: new Date().toISOString(),
          post: post as unknown as FavoriteOut["post"],
        });
        set({ favoriteIds: revertIds, favorites: revertFavs });
      });
    } else {
      /* ── Optimistic favorite ── */
      const optimisticEntry: FavoriteOut = {
        uuid: generateUUID(),
        type_code: TypeCode.POST,
        entity_id: post.id,
        favorited_at: new Date().toISOString(),
        post: post as unknown as FavoriteOut["post"],
      };
      nextIds.add(post.id);
      nextFavorites.set(post.id, optimisticEntry);
      set({ favoriteIds: nextIds, favorites: nextFavorites });

      // Fire API — replace optimistic entry with server entry on success
      vaultApi.toggleFavorite({ post_id: post.id, group_id: groupId }).then((res) => {
        if (res.entry) {
          const current = get();
          const updatedFavs = new Map(current.favorites);
          updatedFavs.set(post.id, res.entry);
          set({ favorites: updatedFavs });
        }
      }).catch(() => {
        // Revert on failure
        const revert = get();
        const revertIds = new Set(revert.favoriteIds);
        const revertFavs = new Map(revert.favorites);
        revertIds.delete(post.id);
        revertFavs.delete(post.id);
        set({ favoriteIds: revertIds, favorites: revertFavs });
      });
    }
  },

  isFavorited: (postId) => get().favoriteIds.has(postId),

  getFavorites: () => {
    const entries = Array.from(get().favorites.values());
    return entries.sort(
      (a, b) => new Date(b.favorited_at).getTime() - new Date(a.favorited_at).getTime(),
    );
  },

  getFavoritePosts: () =>
    get()
      .getFavorites()
      .map((e) => e.post as unknown as AnyPost),
}));
