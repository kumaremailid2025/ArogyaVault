/**
 * Vault Types
 * -----------
 * Typed interfaces for all /vault API responses.
 * Mirrors Pydantic schemas from apps/backend/app/api/schemas/vault.py.
 *
 * All list responses now use OffsetPageMeta for consistent pagination.
 */

import type { OffsetPageMeta } from "@/lib/api/community";

/* ── Shared post snapshot (used across favorites, likes, replied) ─── */

export interface PostSnapshot {
  id: number;
  group_id: string;
  author: string;
  initials: string;
  location: string;
  time: string;
  text: string;
  likes: number;
  replyCount: number;
  tag: string;
}

/* ── Favorites ──────────────────────────────────────────────────────── */

export interface FavoriteOut {
  uuid: string;
  type_code: string;
  entity_id: number;
  favorited_at: string;
  post: PostSnapshot;
}

export interface FavoriteToggleRequest {
  post_id: number;
  group_id?: string | null;
}

export interface FavoriteToggleResponse {
  favorited: boolean;
  entry: FavoriteOut | null;
}

export interface FavoriteListResponse {
  items: FavoriteOut[];
  meta: OffsetPageMeta;
}

/* ── Likes ──────────────────────────────────────────────────────────── */

export interface LikeOut {
  uuid: string;
  type_code: string;
  entity_id: number;
  liked_at: string;
  post: PostSnapshot;
}

export interface LikeToggleRequest {
  post_id: number;
  group_id?: string | null;
}

export interface LikeToggleResponse {
  liked: boolean;
  entry: LikeOut | null;
}

export interface LikeListResponse {
  items: LikeOut[];
  meta: OffsetPageMeta;
}

/* ── Replied ────────────────────────────────────────────────────────── */

export interface RepliedOut {
  uuid: string;
  type_code: string;
  entity_id: number;
  replied_at: string;
  reply_text: string;
  post: PostSnapshot;
}

export interface ReplyRecordRequest {
  post_id: number;
  reply_text: string;
  group_id?: string | null;
}

export interface RepliedListResponse {
  items: RepliedOut[];
  meta: OffsetPageMeta;
}

/* ── Activity ───────────────────────────────────────────────────────── */

export interface ActivityOut {
  id: string;
  type_code: string;
  action_code: string;
  entity_id: string | number;
  datetime: string;
  user_id: string | null;
  group_id?: string | null;
  description?: string | null;
  meta?: Record<string, unknown> | null;
}

export interface ActivityCreateRequest {
  type_code: string;
  action_code: string;
  entity_id: string | number;
  group_id?: string | null;
  description?: string | null;
  meta?: Record<string, unknown> | null;
}

export interface ActivityListResponse {
  items: ActivityOut[];
  meta: OffsetPageMeta;
}

/* ── Tags ───────────────────────────────────────────────────────────── */

export interface TagInfo {
  tag: string;
  slug: string;
  post_count: number;
}

export interface TagListResponse {
  items: TagInfo[];
  count: number;
}

export interface TagPostsResponse {
  tag: string;
  slug: string;
  posts: PostSnapshot[];
  count: number;
}
