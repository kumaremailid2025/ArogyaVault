/**
 * Community API
 * -------------
 * Typed wrappers for all /community endpoints.
 * Mirrors the Pydantic schemas from apps/backend/app/api/schemas/community.py.
 */

import { apiClient } from "./client";

/* ── Post types ──────────────────────────────────────────────────── */

export interface PostReplyOut {
  id: number;
  initials: string;
  author: string;
  time: string;
  text: string;
}

export interface PostOut {
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
  replies: PostReplyOut[];
}

export interface PostCreate {
  text: string;
  tag?: string;
}

export interface ReplyCreate {
  text: string;
}

export interface LikeToggleResponse {
  post_id: number;
  liked: boolean;
  total_likes: number;
}

/* ── AI types ────────────────────────────────────────────────────── */

export interface PostSummaryOut {
  post_id: number;
  summary: string;
  ai_response: string;
}

export interface RephraseResponse {
  original: string;
  rephrasings: string[];
}

/* ── File types ──────────────────────────────────────────────────── */

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

/* ── Member types ────────────────────────────────────────────────── */

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

/* ── API functions ───────────────────────────────────────────────── */

export const communityApi = {
  /* ── Posts ── */

  listPosts: (groupId: string) =>
    apiClient<PostOut[]>(`/community/${groupId}/posts`),

  createPost: (groupId: string, data: PostCreate) =>
    apiClient<PostOut>(`/community/${groupId}/posts`, {
      method: "POST",
      body: JSON.stringify(data),
    }),

  getReplies: (postId: number, groupId: string) =>
    apiClient<PostReplyOut[]>(
      `/community/posts/${postId}/replies?group_id=${groupId}`,
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

  listFiles: (groupId: string) =>
    apiClient<FileOut[]>(`/community/${groupId}/files`),

  getFile: (fileId: number, groupId: string) =>
    apiClient<FileOut>(
      `/community/files/${fileId}?group_id=${groupId}`,
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

  listMembers: (groupId: string) =>
    apiClient<MemberOut[]>(`/community/${groupId}/members`),

  getMember: (memberId: number, groupId: string) =>
    apiClient<MemberOut>(
      `/community/members/${memberId}?group_id=${groupId}`,
    ),
};
