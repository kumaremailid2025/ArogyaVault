/* ─────────────────────────────────────────────────────
   Community & Linked-member data models
───────────────────────────────────────────────────── */

export type PostReply = {
  initials: string;
  author: string;
  time: string;
  text: string;
};

export type CommunityPost = {
  id: number;
  author: string;
  initials: string;
  location: string;
  time: string;
  text: string;
  likes: number;
  replyCount: number;
  tag: string;
  replies: PostReply[];
};

export type LinkedPost = {
  id: number;
  initials: string;
  author: string;
  time: string;
  text: string;
  likes: number;
  replyCount: number;
  tag: string;
  replies: PostReply[];
};

export type LinkedMember = {
  name: string;
  relation: string;
  direction: string;
  scope: string;
  badgeLabel: string;
  initials: string;
  posts: LinkedPost[];
};
