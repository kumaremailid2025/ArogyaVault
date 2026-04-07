/**
 * Community API
 * -------------
 * Typed wrappers for all /community endpoints.
 * Mirrors the Pydantic schemas from apps/backend/app/api/schemas/community.py.
 *
 * Industry-standard patterns:
 *   - Cursor-based pagination for post feeds
 *   - Offset pagination for bounded lists (files, members, replies)
 *   - Rich media attachments on posts & replies
 *   - Search, filter, and sort parameters
 */

import { apiClient } from "./client";
import { toQueryString } from "./utils";

/* ══════════════════════════════════════════════════════════════════════
   PAGINATION
   ══════════════════════════════════════════════════════════════════════ */

export interface CursorPageMeta {
  has_next: boolean;
  next_cursor: string | null;
  has_prev: boolean;
  prev_cursor: string | null;
  total: number;
}

export interface OffsetPageMeta {
  page: number;
  page_size: number;
  total: number;
  total_pages: number;
}

/* ══════════════════════════════════════════════════════════════════════
   ATTACHMENTS — rich media for posts & replies
   ══════════════════════════════════════════════════════════════════════ */

export type AttachmentType = "image" | "voice" | "document";

export interface Attachment {
  id: string;
  type: AttachmentType;
  url: string;
  filename?: string | null;
  mime_type?: string | null;
  size_bytes?: number | null;
  duration_seconds?: number | null;
  thumbnail_url?: string | null;
  transcription?: string | null;
  metadata?: Record<string, unknown> | null;
}

export interface AttachmentCreate {
  type: AttachmentType;
  url: string;
  filename?: string | null;
  mime_type?: string | null;
  size_bytes?: number | null;
  duration_seconds?: number | null;
  thumbnail_url?: string | null;
  transcription?: string | null;
}

/* ══════════════════════════════════════════════════════════════════════
   AUTHOR
   ══════════════════════════════════════════════════════════════════════ */

export interface AuthorOut {
  id: string;
  name: string;
  initials: string;
  role?: string | null;
  avatar_url?: string | null;
}

/* ══════════════════════════════════════════════════════════════════════
   POST TYPES
   ══════════════════════════════════════════════════════════════════════ */

export interface PostReplyOut {
  id: number;
  author: AuthorOut;
  time: string;
  text: string;
  attachments: Attachment[];
  likes: number;
  created_at?: string | null;
}

/** Post returned from list endpoint — no replies, lightweight */
export interface PostListOut {
  id: number;
  group_id: string;
  author: AuthorOut;
  location: string;
  time: string;
  text: string;
  likes: number;
  replyCount: number;
  tag: string;
  attachments: Attachment[];
  is_pinned: boolean;
  created_at?: string | null;
}

/** Full post with replies — returned from detail/create */
export interface PostOut extends PostListOut {
  replies: PostReplyOut[];
}

export interface PostCreate {
  text: string;
  tag?: string;
  attachments?: AttachmentCreate[];
}

export interface ReplyCreate {
  text: string;
  attachments?: AttachmentCreate[];
}

export interface LikeToggleResponse {
  post_id: number;
  liked: boolean;
  total_likes: number;
}

/* ── Paginated responses ─────────────────────────────────────────── */

export interface PostListResponse {
  items: PostListOut[];
  meta: CursorPageMeta;
}

export interface ReplyListResponse {
  items: PostReplyOut[];
  meta: OffsetPageMeta;
}

/* ══════════════════════════════════════════════════════════════════════
   AI TYPES
   ══════════════════════════════════════════════════════════════════════ */

export interface PostSummaryOut {
  post_id: number;
  summary: string;
  ai_response: string;
}

export interface RephraseResponse {
  original: string;
  rephrasings: string[];
}

/* ══════════════════════════════════════════════════════════════════════
   FILE TYPES
   ══════════════════════════════════════════════════════════════════════ */

export interface FileQAOut {
  id: number;
  question: string;
  askedBy: string;
  askedByInitials: string;
  askedAt: string;
  answer: string;
}

export interface FileOut {
  id: number;
  group_id: string;
  name: string;
  type: string;
  size: string;
  uploadedBy: string;
  uploadedByInitials: string;
  uploadedAt: string;
  category: string;
  aiSummary: string;
  qaCount: number;
  questions: FileQAOut[];
}

export interface FileUploadOut {
  id: number;
  group_id: string;
  name: string;
  type: string;
  size: string;
  uploadedBy: string;
  uploadedByInitials: string;
  uploadedAt: string;
  category: string;
  aiSummary: string;
}

export interface RecentFileQAOut {
  fileId: number;
  fileName: string;
  fileCategory: string;
  question: string;
  askedBy: string;
  askedByInitials: string;
  askedAt: string;
  answer: string;
}

export interface FileListResponse {
  items: FileOut[];
  meta: OffsetPageMeta;
}

/* ══════════════════════════════════════════════════════════════════════
   MEMBER TYPES
   ══════════════════════════════════════════════════════════════════════ */

export interface MemberStatsOut {
  posts: number;
  replies: number;
  uploads: number;
  questions: number;
  likes: number;
}

export interface MemberActivityOut {
  id: number;
  type: string;
  time: string;
  text: string;
  context?: string;
  tag?: string;
}

export interface MemberOut {
  id: number;
  name: string;
  initials: string;
  role: string;
  status: string;
  statusLabel: string;
  joinedAt: string;
  location?: string;
  stats: MemberStatsOut;
  activities: MemberActivityOut[];
}

export interface MemberListResponse {
  items: MemberOut[];
  meta: OffsetPageMeta;
}

/* ══════════════════════════════════════════════════════════════════════
   QUERY PARAMS
   ══════════════════════════════════════════════════════════════════════ */

export type PostSortField = "created" | "likes" | "replies";
export type SortOrder = "asc" | "desc";

export interface PostListParams {
  cursor?: string | null;
  limit?: number;
  q?: string;
  tag?: string;
  author?: string;
  sort?: PostSortField;
  order?: SortOrder;
}

export interface FileListParams {
  page?: number;
  page_size?: number;
  category?: string;
  q?: string;
}

export interface MemberListParams {
  page?: number;
  page_size?: number;
  q?: string;
  role?: string;
  status?: string;
}

export interface ReplyListParams {
  page?: number;
  page_size?: number;
}

/* ══════════════════════════════════════════════════════════════════════
   API FUNCTIONS
   ══════════════════════════════════════════════════════════════════════ */

export const communityApi = {
  /* ── Posts ── */

  listPosts: (groupId: string, params: PostListParams = {}) =>
    apiClient<PostListResponse>(
      `/community/${groupId}/posts${toQueryString(params)}`,
    ),

  getPost: (postId: number, groupId: string) =>
    apiClient<PostOut>(
      `/community/posts/${postId}?group_id=${groupId}`,
    ),

  createPost: (groupId: string, data: PostCreate) =>
    apiClient<PostOut>(`/community/${groupId}/posts`, {
      method: "POST",
      body: JSON.stringify(data),
    }),

  getReplies: (postId: number, groupId: string, params: ReplyListParams = {}) =>
    apiClient<ReplyListResponse>(
      `/community/posts/${postId}/replies${toQueryString({ group_id: groupId, ...params })}`,
    ),

  submitReply: (postId: number, groupId: string, data: ReplyCreate) =>
    apiClient<PostReplyOut>(
      `/community/posts/${postId}/replies?group_id=${groupId}`,
      {
        method: "POST",
        body: JSON.stringify(data),
      },
    ),

  toggleLike: (postId: number, groupId: string) =>
    apiClient<LikeToggleResponse>(
      `/community/posts/${postId}/like?group_id=${groupId}`,
      { method: "POST" },
    ),

  /* ── AI ── */

  getPostSummary: (postId: number, groupId: string) =>
    apiClient<PostSummaryOut>(
      `/community/posts/${postId}/summary?group_id=${groupId}`,
    ),

  rephrase: (text: string) =>
    apiClient<RephraseResponse>("/community/rephrase", {
      method: "POST",
      body: JSON.stringify({ text }),
    }),

  /* ── Files ── */

  listFiles: (groupId: string, params: FileListParams = {}) =>
    apiClient<FileListResponse>(
      `/community/${groupId}/files${toQueryString(params)}`,
    ),

  getFile: (fileId: number, groupId: string) =>
    apiClient<FileOut>(
      `/community/files/${fileId}?group_id=${groupId}`,
    ),

  uploadFile: (groupId: string, meta: { name: string; type?: string; size?: string; category?: string }) =>
    apiClient<FileUploadOut>(
      `/community/${groupId}/files${toQueryString(meta)}`,
      { method: "POST" },
    ),

  askFileQuestion: (fileId: number, groupId: string, question: string) =>
    apiClient<FileQAOut>(
      `/community/files/${fileId}/qa?group_id=${groupId}`,
      {
        method: "POST",
        body: JSON.stringify({ question }),
      },
    ),

  getRecentFileQA: (groupId: string) =>
    apiClient<RecentFileQAOut[]>(`/community/${groupId}/files/recent-qa`),

  /* ── Members ── */

  listMembers: (groupId: string, params: MemberListParams = {}) =>
    apiClient<MemberListResponse>(
      `/community/${groupId}/members${toQueryString(params)}`,
    ),

  getMember: (memberId: number, groupId: string) =>
    apiClient<MemberOut>(
      `/community/members/${memberId}?group_id=${groupId}`,
    ),
};
