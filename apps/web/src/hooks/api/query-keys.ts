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
 *   queryKey: communityKeys.posts("b3a1f5d2-...")
 *   queryClient.invalidateQueries({ queryKey: communityKeys.all })
 */

export const authKeys = {
  all: ["auth"] as const,
  checkRegistration: (phone: string) =>
    [...authKeys.all, "check-registration", phone] as const,
};

export const communityKeys = {
  all: ["community"] as const,

  /* ── Posts ── */
  posts: (groupId: string) =>
    [...communityKeys.all, "posts", groupId] as const,
  postReplies: (groupId: string, postId: number) =>
    [...communityKeys.all, "replies", groupId, postId] as const,
  postSummary: (groupId: string, postId: number) =>
    [...communityKeys.all, "summary", groupId, postId] as const,

  /* ── Files ── */
  files: (groupId: string) =>
    [...communityKeys.all, "files", groupId] as const,
  file: (groupId: string, fileId: number) =>
    [...communityKeys.all, "file", groupId, fileId] as const,
  recentQA: (groupId: string) =>
    [...communityKeys.all, "recent-qa", groupId] as const,

  /* ── Members ── */
  members: (groupId: string) =>
    [...communityKeys.all, "members", groupId] as const,
  member: (groupId: string, memberId: number) =>
    [...communityKeys.all, "member", groupId, memberId] as const,
};
