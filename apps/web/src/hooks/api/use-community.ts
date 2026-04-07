/**
 * Community Hooks (TanStack React Query)
 * ---------------------------------------
 * Custom hooks wrapping all /community API calls.
 *
 * Queries:
 *   usePosts            — cursor-paginated post feed with search/filter/sort
 *   usePost             — single post detail with replies
 *   usePostReplies      — on-demand paginated replies for a post
 *   usePostSummary      — AI summary for a post
 *   useFiles            — offset-paginated files with filter
 *   useRecentFileQA     — recent Q&A across files
 *   useMembers          — offset-paginated members with search
 *
 * Mutations:
 *   useCreatePost       — create a new post (with attachments)
 *   useSubmitReply      — reply to a post (with attachments)
 *   useToggleLike       — toggle like on a post
 *   useRephrase         — get AI rephrasings
 *   useAskFileQuestion  — ask a Q&A question on a file
 *   useUploadFile       — upload a file to a group
 */

import { useQuery, useInfiniteQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  communityApi,
  type PostListParams,
  type PostListResponse,
  type FileListParams,
  type MemberListParams,
  type ReplyListParams,
} from "@/lib/api/community";
import type { ApiError } from "@/lib/api/client";
import { communityKeys } from "./query-keys";
import { apiPostToLocal, apiReplyToLocal } from "@/models/community";

/* ══════════════════════════════════════════════════════════════════════
   POSTS — cursor-paginated feed
   ══════════════════════════════════════════════════════════════════════ */

/**
 * Fetch posts for a group with cursor-based pagination.
 *
 * For simple usage (single page), use this. The response contains
 * `items` and `meta.next_cursor` for manual "load more".
 */
export const usePosts = (groupId: string, params: PostListParams = {}, enabled = true) =>
  useQuery({
    queryKey: communityKeys.posts(groupId, params),
    queryFn: () => communityApi.listPosts(groupId, params),
    select: (data) => ({
      ...data,
      items: data.items.map(apiPostToLocal),
    }),
    enabled: !!groupId && enabled,
    staleTime: 30_000,
  });

/**
 * Infinite query for the post feed — automatically handles cursor
 * pagination for "load more" / infinite scroll patterns.
 */
export const useInfinitePosts = (groupId: string, params: Omit<PostListParams, "cursor"> = {}) =>
  useInfiniteQuery<PostListResponse, ApiError>({
    queryKey: communityKeys.postsInfinite(groupId, params),
    queryFn: ({ pageParam }) =>
      communityApi.listPosts(groupId, { ...params, cursor: pageParam as string | undefined }),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) =>
      lastPage.meta.has_next ? (lastPage.meta.next_cursor ?? undefined) : undefined,
    select: (data) => ({
      ...data,
      pages: data.pages.map((page) => ({
        ...page,
        items: page.items.map(apiPostToLocal),
      })),
    }),
    enabled: !!groupId,
    staleTime: 30_000,
  });

/**
 * Fetch a single post with all replies.
 */
export const usePost = (groupId: string, postId: number | null, enabled = true) =>
  useQuery({
    queryKey: communityKeys.post(groupId, postId ?? -1),
    queryFn: () => communityApi.getPost(postId!, groupId),
    select: (data) => {
      const post = apiPostToLocal(data);
      return {
        ...post,
        replies: (data.replies ?? []).map(apiReplyToLocal),
      };
    },
    enabled: !!groupId && postId !== null && enabled,
    staleTime: 30_000,
  });

export const useCreatePost = (groupId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: { text: string; tag?: string; attachments?: Parameters<typeof communityApi.createPost>[1]["attachments"] }) =>
      communityApi.createPost(groupId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: communityKeys.all });
    },
  });
};

/**
 * Fetch paginated replies for a post (on-demand).
 */
export const usePostReplies = (
  groupId: string,
  postId: number | null,
  params: ReplyListParams = {},
  enabled = true,
) =>
  useQuery({
    queryKey: communityKeys.postReplies(groupId, postId ?? -1, params),
    queryFn: () => communityApi.getReplies(postId!, groupId, params),
    select: (data) => ({
      ...data,
      items: data.items.map(apiReplyToLocal),
    }),
    enabled: !!groupId && postId !== null && enabled,
    staleTime: 15_000,
  });

export const useSubmitReply = (groupId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ postId, text, attachments }: {
      postId: number;
      text: string;
      attachments?: Parameters<typeof communityApi.submitReply>[2]["attachments"];
    }) =>
      communityApi.submitReply(postId, groupId, { text, attachments }),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: communityKeys.all });
    },
  });
};

export const useToggleLike = (groupId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (postId: number) => communityApi.toggleLike(postId, groupId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: communityKeys.all });
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
   FILES — offset-paginated
   ══════════════════════════════════════════════════════════════════════ */

export const useFiles = (groupId: string, params: FileListParams = {}, enabled = true) =>
  useQuery({
    queryKey: communityKeys.files(groupId, params),
    queryFn: () => communityApi.listFiles(groupId, params),
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

export const useUploadFile = (groupId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (meta: { name: string; type?: string; size?: string; category?: string }) =>
      communityApi.uploadFile(groupId, meta),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: communityKeys.files(groupId) });
    },
  });
};

/* ══════════════════════════════════════════════════════════════════════
   MEMBERS — offset-paginated with search
   ══════════════════════════════════════════════════════════════════════ */

export const useMembers = (groupId: string, params: MemberListParams = {}, enabled = true) =>
  useQuery({
    queryKey: communityKeys.members(groupId, params),
    queryFn: () => communityApi.listMembers(groupId, params),
    enabled: !!groupId && enabled,
    staleTime: 60_000,
  });
