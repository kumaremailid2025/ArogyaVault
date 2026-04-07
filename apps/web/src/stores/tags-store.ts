/**
 * Tags Store (Zustand) — API-Backed
 * -----------------------------------
 * Collects every unique tag seen across community + linked posts.
 * Now syncs with /vault/tags and /vault/tags/{slug}/posts APIs.
 *
 * Tags are slugified for URL use (e.g. "Lab Report" → "lab-report").
 */

import { create } from "zustand";
import type { CommunityPost, LinkedPost } from "@/models/community";
import type { TagInfo, TagPostsResponse } from "@/models/vault";
import { vaultApi } from "@/lib/api/vault";

type AnyPost = CommunityPost | LinkedPost;

/* ── Helpers ──────────────────────────────────────────────────────── */

/** Convert a tag label into a URL-safe slug */
export const tagToSlug = (tag: string): string =>
  tag
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

/** Convert a slug back to the display label (best-effort via store) */
export const slugToTag = (slug: string, slugMap: Map<string, string>): string =>
  slugMap.get(slug) ?? slug;

/* ── Store ────────────────────────────────────────────────────────── */

interface TagsState {
  /** All unique tag labels seen so far */
  tags: string[];
  /** slug → display label map */
  slugMap: Map<string, string>;
  /** tag → array of posts */
  postsByTag: Map<string, AnyPost[]>;
  /** Whether hydrated from API */
  hydrated: boolean;

  /** Hydrate from API tag list */
  hydrateTags: (items: TagInfo[]) => void;
  /** Hydrate posts for a specific tag from API */
  hydrateTagPosts: (slug: string, data: TagPostsResponse) => void;
  /** Register posts — extracts and indexes their tags (local fallback) */
  registerPosts: (posts: AnyPost[]) => void;
  /** Get all posts matching a tag slug */
  getPostsBySlug: (slug: string) => AnyPost[];
  /** Get all posts matching a tag label */
  getPostsByTag: (tag: string) => AnyPost[];
  /** Get sorted tag list (alphabetical) */
  getSortedTags: () => string[];
  /** Fetch tags from API */
  fetchTags: () => Promise<void>;
  /** Fetch posts for a slug from API */
  fetchTagPosts: (slug: string) => Promise<AnyPost[]>;
}

export const useTagsStore = create<TagsState>((set, get) => ({
  tags: [],
  slugMap: new Map(),
  postsByTag: new Map(),
  hydrated: false,

  hydrateTags: (items) => {
    const nextSlugMap = new Map(get().slugMap);
    const tagSet = new Set(get().tags);

    for (const item of items) {
      tagSet.add(item.tag);
      nextSlugMap.set(item.slug, item.tag);
    }

    set({
      tags: Array.from(tagSet),
      slugMap: nextSlugMap,
      hydrated: true,
    });
  },

  hydrateTagPosts: (slug, data) => {
    const nextPostsByTag = new Map(get().postsByTag);
    nextPostsByTag.set(data.tag, data.posts as unknown as AnyPost[]);
    set({ postsByTag: nextPostsByTag });
  },

  registerPosts: (posts) =>
    set((state) => {
      const nextSlugMap = new Map(state.slugMap);
      const nextPostsByTag = new Map(state.postsByTag);
      const tagSet = new Set(state.tags);

      for (const post of posts) {
        const tag = post.tag;
        if (!tag) continue;

        tagSet.add(tag);
        nextSlugMap.set(tagToSlug(tag), tag);

        const existing = nextPostsByTag.get(tag) ?? [];
        if (!existing.some((p) => p.id === post.id)) {
          nextPostsByTag.set(tag, [...existing, post]);
        }
      }

      return {
        tags: Array.from(tagSet),
        slugMap: nextSlugMap,
        postsByTag: nextPostsByTag,
      };
    }),

  getPostsBySlug: (slug) => {
    const { slugMap, postsByTag } = get();
    const tag = slugMap.get(slug);
    return tag ? (postsByTag.get(tag) ?? []) : [];
  },

  getPostsByTag: (tag) => get().postsByTag.get(tag) ?? [],

  getSortedTags: () => [...get().tags].sort((a, b) => a.localeCompare(b)),

  fetchTags: async () => {
    try {
      const res = await vaultApi.listTags();
      get().hydrateTags(res.items);
    } catch {
      // Silently fail — local tags still work
    }
  },

  fetchTagPosts: async (slug) => {
    try {
      const res = await vaultApi.getTagPosts(slug);
      get().hydrateTagPosts(slug, res);
      return res.posts as unknown as AnyPost[];
    } catch {
      // Fallback to local
      return get().getPostsBySlug(slug);
    }
  },
}));
