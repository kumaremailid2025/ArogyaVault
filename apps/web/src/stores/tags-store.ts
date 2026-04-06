/**
 * Tags Store (Zustand) — In-Memory
 * ----------------------------------
 * Collects every unique tag seen across community + linked posts.
 * Provides the master tag list for the profile dropdown submenu
 * and the /tags/[tag] filtered page.
 *
 * Tags are slugified for URL use (e.g. "Lab Report" → "lab-report").
 */

import { create } from "zustand";
import type { CommunityPost, LinkedPost } from "@/models/community";

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

  /** Register posts — extracts and indexes their tags */
  registerPosts: (posts: AnyPost[]) => void;
  /** Get all posts matching a tag slug */
  getPostsBySlug: (slug: string) => AnyPost[];
  /** Get all posts matching a tag label */
  getPostsByTag: (tag: string) => AnyPost[];
  /** Get sorted tag list (alphabetical) */
  getSortedTags: () => string[];
}

export const useTagsStore = create<TagsState>((set, get) => ({
  tags: [],
  slugMap: new Map(),
  postsByTag: new Map(),

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
        // Avoid duplicates by checking id
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
}));
