/**
 * Query Keys Factory
 * ------------------
 * Centralised query key definitions for TanStack React Query.
 * Follows the factory pattern recommended by TkDodo:
 *   https://tkdodo.eu/blog/effective-react-query-keys
 *
 * Structure: [feature, scope, ...params]
 *
 * Usage:
 *   queryKey: authKeys.checkRegistration("+919876543210")
 *   queryKey: communityKeys.posts("b3a1f5d2-...", { tag: "Diabetes" })
 *   queryClient.invalidateQueries({ queryKey: communityKeys.all })
 */

export const authKeys = {
  all: ["auth"] as const,
  checkRegistration: (phone: string) =>
    [...authKeys.all, "check-registration", phone] as const,
};

export const communityKeys = {
  all: ["community"] as const,

  /* ── Posts (cursor-paginated feed) ── */
  posts: (groupId: string, params?: Record<string, unknown>) =>
    [...communityKeys.all, "posts", groupId, params ?? {}] as const,
  postsInfinite: (groupId: string, params?: Record<string, unknown>) =>
    [...communityKeys.all, "posts-infinite", groupId, params ?? {}] as const,
  post: (groupId: string, postId: number) =>
    [...communityKeys.all, "post", groupId, postId] as const,
  postReplies: (groupId: string, postId: number, params?: Record<string, unknown>) =>
    [...communityKeys.all, "replies", groupId, postId, params ?? {}] as const,
  postSummary: (groupId: string, postId: number) =>
    [...communityKeys.all, "summary", groupId, postId] as const,

  /* ── Files (offset-paginated) ── */
  files: (groupId: string, params?: Record<string, unknown>) =>
    [...communityKeys.all, "files", groupId, params ?? {}] as const,
  file: (groupId: string, fileId: number) =>
    [...communityKeys.all, "file", groupId, fileId] as const,
  recentQA: (groupId: string) =>
    [...communityKeys.all, "recent-qa", groupId] as const,

  /* ── Members (offset-paginated) ── */
  members: (groupId: string, params?: Record<string, unknown>) =>
    [...communityKeys.all, "members", groupId, params ?? {}] as const,
  member: (groupId: string, memberId: string) =>
    [...communityKeys.all, "member", groupId, memberId] as const,
};

export const inviteKeys = {
  all: ["invites"] as const,

  /* ── List (with direction/status/pagination filters) ── */
  list: (params?: Record<string, unknown>) =>
    [...inviteKeys.all, "list", params ?? {}] as const,

  /* ── Counts for dashboard badges ── */
  counts: () => [...inviteKeys.all, "counts"] as const,

  /* ── Single invite detail ── */
  detail: (inviteId: string) =>
    [...inviteKeys.all, "detail", inviteId] as const,
};

export const vaultKeys = {
  all: ["vault"] as const,

  /* ── Favorites ── */
  favorites: (params?: { page?: number; page_size?: number }) =>
    [...vaultKeys.all, "favorites", params ?? {}] as const,

  /* ── Likes ── */
  likes: (params?: { page?: number; page_size?: number }) =>
    [...vaultKeys.all, "likes", params ?? {}] as const,

  /* ── Replied ── */
  replied: (params?: { page?: number; page_size?: number }) =>
    [...vaultKeys.all, "replied", params ?? {}] as const,

  /* ── Activities ── */
  activities: (filters?: { type_code?: string; action_code?: string; page?: number }) =>
    [...vaultKeys.all, "activities", filters ?? {}] as const,

  /* ── Tags ── */
  tags: () => [...vaultKeys.all, "tags"] as const,
  tagPosts: (slug: string) => [...vaultKeys.all, "tags", slug, "posts"] as const,
};
