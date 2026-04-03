/**
 * Community Hooks (TanStack React Query)
 * ---------------------------------------
 * Custom hooks wrapping all /community API calls.
 *
 * Queries:
 *   usePosts            — list posts for a group
 *   usePostSummary      — AI summary for a post (on-demand)
 *   useFiles            — list files for a group
 *   useRecentFileQA     — recent Q&A across files
 *   useMembers          — list members for a group
 *
 * Mutations:
 *   useCreatePost       — create a new post
 *   useSubmitReply      — reply to a post
 *   useToggleLike       — toggle like on a post
 *   useRephrase         — get AI rephrasings
 *   useAskFileQuestion  — ask a Q&A question on a file
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { communityApi, type ApiError } from "@/lib/api";
import { communityKeys } from "./query-keys";

/* ══════════════════════════════════════════════════════════════════════
   POSTS
   ══════════════════════════════════════════════════════════════════════ */

export const usePosts = (groupId: string, enabled = true) =>
  useQuery({
    queryKey: communityKeys.posts(groupId),
    queryFn: () => communityApi.listPosts(groupId),
    enabled: !!groupId && enabled,
    staleTime: 30_000,
  });

export const useCreatePost = (groupId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: { text: string; tag?: string }) =>
      communityApi.createPost(groupId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: communityKeys.posts(groupId) });
    },
  });
};

export const useSubmitReply = (groupId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ postId, text }: { postId: number; text: string }) =>
      communityApi.submitReply(postId, groupId, { text }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: communityKeys.posts(groupId) });
    },
  });
};

export const useToggleLike = (groupId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (postId: number) => communityApi.toggleLike(postId, groupId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: communityKeys.posts(groupId) });
    },
  });
};

/* ══════════════════════════════════════════════════════════════════════
   AI — summary & rephrase
   ══════════════════════════════════════════════════════════════════════ */

export const usePostSummary = (
  groupId: string,
  postId: number | null,
  enabled = true,
) =>
  useQuery({
    queryKey: communityKeys.postSummary(groupId, postId ?? -1),
    queryFn: () => communityApi.getPostSummary(postId!, groupId),
    enabled: !!groupId && postId !== null && enabled,
    staleTime: 60_000,
  });

export const useRephrase = () =>
  useMutation({
    mutationFn: (text: string) => communityApi.rephrase(text),
  });

/* ══════════════════════════════════════════════════════════════════════
   FILES
   ══════════════════════════════════════════════════════════════════════ */

export const useFiles = (groupId: string, enabled = true) =>
  useQuery({
    queryKey: communityKeys.files(groupId),
    queryFn: () => communityApi.listFiles(groupId),
    enabled: !!groupId && enabled,
    staleTime: 30_000,
  });

export const useRecentFileQA = (groupId: string, enabled = true) =>
  useQuery({
    queryKey: communityKeys.recentQA(groupId),
    queryFn: () => communityApi.getRecentFileQA(groupId),
    enabled: !!groupId && enabled,
    staleTime: 30_000,
  });

export const useAskFileQuestion = (groupId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ fileId, question }: { fileId: number; question: string }) =>
      communityApi.askFileQuestion(fileId, groupId, question),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: communityKeys.files(groupId) });
      queryClient.invalidateQueries({
        queryKey: communityKeys.recentQA(groupId),
      });
    },
  });
};

/* ══════════════════════════════════════════════════════════════════════
   MEMBERS
   ══════════════════════════════════════════════════════════════════════ */

export const useMembers = (groupId: string, enabled = true) =>
  useQuery({
    queryKey: communityKeys.members(groupId),
    queryFn: () => communityApi.listMembers(groupId),
    enabled: !!groupId && enabled,
    staleTime: 60_000,
  });
