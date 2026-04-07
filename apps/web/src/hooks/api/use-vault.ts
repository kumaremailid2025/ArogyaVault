/**
 * Vault Hooks (TanStack React Query)
 * ------------------------------------
 * Custom hooks wrapping all /vault API calls.
 *
 * All list queries now support offset-based pagination params.
 *
 * Queries:
 *   useFavorites        — paginated user favorites
 *   useLikedPosts       — paginated liked posts
 *   useRepliedPosts     — paginated replied posts
 *   useActivities       — paginated activity log with filters
 *   useVaultTags        — list all known tags
 *   useTagPosts         — list posts for a tag slug
 *
 * Mutations:
 *   useToggleFavoriteMut — toggle a favorite
 *   useToggleLikeMut     — toggle a like
 *   useRecordReplyMut    — record a reply
 *   useRecordActivityMut — record an activity
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { vaultApi } from "@/lib/api/vault";
import { vaultKeys } from "./query-keys";
import type {
  FavoriteToggleRequest,
  LikeToggleRequest,
  ReplyRecordRequest,
  ActivityCreateRequest,
} from "@/models/vault";

/* ── Shared pagination params ─────────────────────────────────── */
interface PaginationParams {
  page?: number;
  page_size?: number;
}

/* ══════════════════════════════════════════════════════════════════════
   FAVORITES
   ══════════════════════════════════════════════════════════════════════ */

export const useFavorites = (params: PaginationParams = {}, enabled = true) =>
  useQuery({
    queryKey: vaultKeys.favorites(params),
    queryFn: () => vaultApi.listFavorites(params),
    enabled,
    staleTime: 30_000,
  });

export const useToggleFavoriteMut = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: FavoriteToggleRequest) => vaultApi.toggleFavorite(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: vaultKeys.favorites() });
      queryClient.invalidateQueries({ queryKey: vaultKeys.activities() });
    },
  });
};

export const useRemoveFavoriteMut = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (postId: number) => vaultApi.removeFavorite(postId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: vaultKeys.favorites() });
      queryClient.invalidateQueries({ queryKey: vaultKeys.activities() });
    },
  });
};

/* ══════════════════════════════════════════════════════════════════════
   LIKES
   ══════════════════════════════════════════════════════════════════════ */

export const useLikedPosts = (params: PaginationParams = {}, enabled = true) =>
  useQuery({
    queryKey: vaultKeys.likes(params),
    queryFn: () => vaultApi.listLikes(params),
    enabled,
    staleTime: 30_000,
  });

export const useToggleLikeMut = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: LikeToggleRequest) => vaultApi.toggleLike(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: vaultKeys.likes() });
      queryClient.invalidateQueries({ queryKey: vaultKeys.activities() });
    },
  });
};

export const useRemoveLikeMut = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (postId: number) => vaultApi.removeLike(postId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: vaultKeys.likes() });
      queryClient.invalidateQueries({ queryKey: vaultKeys.activities() });
    },
  });
};

/* ══════════════════════════════════════════════════════════════════════
   REPLIED
   ══════════════════════════════════════════════════════════════════════ */

export const useRepliedPosts = (params: PaginationParams = {}, enabled = true) =>
  useQuery({
    queryKey: vaultKeys.replied(params),
    queryFn: () => vaultApi.listReplied(params),
    enabled,
    staleTime: 30_000,
  });

export const useRecordReplyMut = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: ReplyRecordRequest) => vaultApi.recordReply(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: vaultKeys.replied() });
      queryClient.invalidateQueries({ queryKey: vaultKeys.activities() });
    },
  });
};

/* ══════════════════════════════════════════════════════════════════════
   ACTIVITIES
   ══════════════════════════════════════════════════════════════════════ */

export const useActivities = (
  filters?: { type_code?: string; action_code?: string; page?: number; page_size?: number },
  enabled = true,
) =>
  useQuery({
    queryKey: vaultKeys.activities(filters),
    queryFn: () => vaultApi.listActivities(filters),
    enabled,
    staleTime: 15_000,
  });

export const useRecordActivityMut = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: ActivityCreateRequest) => vaultApi.recordActivity(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: vaultKeys.activities() });
    },
  });
};

/* ══════════════════════════════════════════════════════════════════════
   TAGS
   ══════════════════════════════════════════════════════════════════════ */

export const useVaultTags = (enabled = true) =>
  useQuery({
    queryKey: vaultKeys.tags(),
    queryFn: () => vaultApi.listTags(),
    enabled,
    staleTime: 60_000,
  });

export const useTagPosts = (slug: string, enabled = true) =>
  useQuery({
    queryKey: vaultKeys.tagPosts(slug),
    queryFn: () => vaultApi.getTagPosts(slug),
    enabled: !!slug && enabled,
    staleTime: 30_000,
  });
