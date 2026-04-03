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
  /** Primary text — post text, reply text, question text, etc. */
  text: string;
  /** Optional context — e.g. "replied to Meena R.'s post", "uploaded CBC Report.pdf" */
  context?: string;
  /** Tag/category for the activity */
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
  /** Aggregate stats */
  stats: {
    posts: number;
    replies: number;
    uploads: number;
    questions: number;
    likes: number;
  };
  activities: MemberActivity[];
};
