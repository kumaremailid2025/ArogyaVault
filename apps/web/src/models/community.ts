/* ─────────────────────────────────────────────────────
   Community & Linked-member data models

   NOTE: These are the local/UI models used by components.
   The API layer types (AuthorOut, PostListOut, etc.) live
   in src/lib/api/community.ts. These models add compat
   helpers and local-only fields.
───────────────────────────────────────────────────── */

import type { AuthorOut, Attachment } from "@/lib/api/community";

export type PostReply = {
  id?: number;
  /** Author display name (string for direct JSX rendering) */
  author?: string;
  /** Structured author object from API — use for avatar, role, etc. */
  authorData?: AuthorOut;
  initials: string;
  authorName?: string;
  time: string;
  text: string;
  attachments?: Attachment[];
  likes?: number;
  created_at?: string;
};

export type CommunityPost = {
  id: number;
  group_id?: string;
  /** New: structured author from API */
  authorObj?: AuthorOut;
  /** Legacy flat fields — kept for backward compat */
  author: string;
  initials: string;
  location: string;
  time: string;
  text: string;
  likes: number;
  replyCount: number;
  tag: string;
  attachments?: Attachment[];
  is_pinned?: boolean;
  created_at?: string;
  /** Replies are NOT included in list responses — fetched on-demand per post */
  replies?: PostReply[];
};

export type LinkedPost = {
  id: number;
  /** New: structured author from API */
  authorObj?: AuthorOut;
  /** Legacy flat fields */
  initials: string;
  author: string;
  time: string;
  text: string;
  likes: number;
  replyCount: number;
  tag: string;
  attachments?: Attachment[];
  /** Replies are NOT included in list responses — fetched on-demand per post */
  replies?: PostReply[];
};

export type LinkedMember = {
  name: string;
  relation: string;
  direction: string;
  scope: string;
  badgeLabel: string;
  initials: string;
  posts: LinkedPost[];
  sharedFiles?: { name: string; size: string; date: string }[];
  memberCount?: number | string;
  members?: { name: string; role: string; initials: string; status: string }[];
};

/* ── Community File types ──────────────────────────────────────── */

export type FileQA = {
  id: number;
  question: string;
  askedBy: string;
  askedByInitials: string;
  askedAt: string;
  answer: string;
};

export type CommunityFile = {
  id: number;
  name: string;
  type: "pdf" | "xlsx" | "docx" | "jpg" | "png";
  size: string;
  uploadedBy: string;
  uploadedByInitials: string;
  uploadedAt: string;
  category: string;
  aiSummary: string;
  qaCount: number;
  questions: FileQA[];
};

/* ── Member Activity types ─────────────────────────────────────── */

export type MemberActivityType = "post" | "reply" | "upload" | "question" | "like";

export type MemberActivity = {
  id: number;
  type: MemberActivityType;
  time: string;
  text: string;
  context?: string;
  tag?: string;
};

export type CommunityMember = {
  id: number;
  name: string;
  initials: string;
  role: string;
  status: "online" | "recently" | "offline";
  statusLabel: string;
  joinedAt: string;
  location?: string;
  stats: {
    posts: number;
    replies: number;
    uploads: number;
    questions: number;
    likes: number;
  };
  activities: MemberActivity[];
};

/* ── Helpers: map API response → local model ───────────────────── */

/**
 * Convert API PostListOut (with AuthorOut) → flat CommunityPost
 * for backward compat with components that read post.author, post.initials.
 */
export function apiPostToLocal(
  apiPost: {
    id: number;
    group_id: string;
    author: AuthorOut;
    location: string;
    time: string;
    text: string;
    likes: number;
    replyCount: number;
    tag: string;
    attachments?: Attachment[];
    is_pinned?: boolean;
    created_at?: string;
  },
): CommunityPost {
  return {
    id: apiPost.id,
    group_id: apiPost.group_id,
    authorObj: apiPost.author,
    author: apiPost.author.name,
    initials: apiPost.author.initials,
    location: apiPost.location,
    time: apiPost.time,
    text: apiPost.text,
    likes: apiPost.likes,
    replyCount: apiPost.replyCount,
    tag: apiPost.tag,
    attachments: apiPost.attachments ?? [],
    is_pinned: apiPost.is_pinned ?? false,
    created_at: apiPost.created_at ?? undefined,
  };
}

/**
 * Convert API PostReplyOut (with AuthorOut) → flat PostReply
 */
export function apiReplyToLocal(
  apiReply: {
    id: number;
    author: AuthorOut;
    time: string;
    text: string;
    attachments?: Attachment[];
    likes?: number;
    created_at?: string;
  },
): PostReply {
  return {
    id: apiReply.id,
    author: apiReply.author.name,
    authorData: apiReply.author,
    initials: apiReply.author.initials,
    authorName: apiReply.author.name,
    time: apiReply.time,
    text: apiReply.text,
    attachments: apiReply.attachments ?? [],
    likes: apiReply.likes ?? 0,
    created_at: apiReply.created_at ?? undefined,
  };
}
