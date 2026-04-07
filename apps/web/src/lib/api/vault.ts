/**
 * Vault API
 * ---------
 * Typed wrappers for all /vault endpoints.
 * Mirrors Pydantic schemas from apps/backend/app/api/schemas/vault.py.
 *
 * All list endpoints now accept pagination params and return
 * { items, meta: OffsetPageMeta }.
 */

import { apiClient } from "./client";
import { toQueryString } from "./utils";
import type {
  FavoriteListResponse,
  FavoriteToggleRequest,
  FavoriteToggleResponse,
  LikeListResponse,
  LikeToggleRequest,
  LikeToggleResponse,
  RepliedListResponse,
  ReplyRecordRequest,
  RepliedOut,
  ActivityListResponse,
  ActivityCreateRequest,
  ActivityOut,
  TagListResponse,
  TagPostsResponse,
} from "@/models/vault";

export const vaultApi = {
  /* ── Favorites ── */

  listFavorites: (params?: { page?: number; page_size?: number }) =>
    apiClient<FavoriteListResponse>(`/vault/favorites${toQueryString(params ?? {})}`),

  toggleFavorite: (data: FavoriteToggleRequest) =>
    apiClient<FavoriteToggleResponse>("/vault/favorites", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  removeFavorite: (postId: number) =>
    apiClient<{ removed: boolean }>(`/vault/favorites/${postId}`, {
      method: "DELETE",
    }),

  /* ── Likes ── */

  listLikes: (params?: { page?: number; page_size?: number }) =>
    apiClient<LikeListResponse>(`/vault/likes${toQueryString(params ?? {})}`),

  toggleLike: (data: LikeToggleRequest) =>
    apiClient<LikeToggleResponse>("/vault/likes", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  removeLike: (postId: number) =>
    apiClient<{ removed: boolean }>(`/vault/likes/${postId}`, {
      method: "DELETE",
    }),

  /* ── Replied ── */

  listReplied: (params?: { page?: number; page_size?: number }) =>
    apiClient<RepliedListResponse>(`/vault/replied${toQueryString(params ?? {})}`),

  recordReply: (data: ReplyRecordRequest) =>
    apiClient<RepliedOut>("/vault/replied", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  /* ── Activities ── */

  listActivities: (params?: {
    type_code?: string;
    action_code?: string;
    page?: number;
    page_size?: number;
  }) =>
    apiClient<ActivityListResponse>(`/vault/activities${toQueryString(params ?? {})}`),

  recordActivity: (data: ActivityCreateRequest) =>
    apiClient<ActivityOut>("/vault/activities", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  /* ── Tags ── */

  listTags: () =>
    apiClient<TagListResponse>("/vault/tags"),

  getTagPosts: (slug: string) =>
    apiClient<TagPostsResponse>(`/vault/tags/${slug}/posts`),
};
