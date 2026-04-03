"""
Pydantic schemas for community endpoints.
Mirrors shared TS types from apps/web/src/models/community.ts.
"""

from __future__ import annotations

from pydantic import BaseModel, Field


# ══════════════════════════════════════════════════════════════════════════════
#  POSTS
# ══════════════════════════════════════════════════════════════════════════════


class PostReplyOut(BaseModel):
    id: int
    initials: str
    author: str
    time: str
    text: str


class PostOut(BaseModel):
    id: int
    group_id: str
    author: str
    initials: str
    location: str
    time: str
    text: str
    likes: int = 0
    replyCount: int = 0
    tag: str
    replies: list[PostReplyOut] = []


class PostCreate(BaseModel):
    text: str = Field(..., min_length=1, max_length=2000)
    tag: str = "Discussion"


class ReplyCreate(BaseModel):
    text: str = Field(..., min_length=1, max_length=2000)


class LikeToggleResponse(BaseModel):
    post_id: int
    liked: bool
    total_likes: int


# ══════════════════════════════════════════════════════════════════════════════
#  AI — summaries, rephrasings
# ══════════════════════════════════════════════════════════════════════════════


class PostSummaryOut(BaseModel):
    post_id: int
    summary: str
    ai_response: str


class RephraseRequest(BaseModel):
    text: str = Field(..., min_length=1, max_length=2000)


class RephraseResponse(BaseModel):
    original: str
    rephrasings: list[str]


# ══════════════════════════════════════════════════════════════════════════════
#  FILES
# ══════════════════════════════════════════════════════════════════════════════


class FileQAOut(BaseModel):
    id: int
    question: str
    askedBy: str
    askedByInitials: str
    askedAt: str
    answer: str


class FileOut(BaseModel):
    id: int
    group_id: str
    name: str
    type: str
    size: str
    uploadedBy: str
    uploadedByInitials: str
    uploadedAt: str
    category: str
    aiSummary: str
    qaCount: int = 0
    questions: list[FileQAOut] = []


class FileQACreate(BaseModel):
    question: str = Field(..., min_length=1, max_length=1000)


class RecentFileQAOut(BaseModel):
    fileId: int
    fileName: str
    fileCategory: str
    question: str
    askedBy: str
    askedByInitials: str
    askedAt: str
    answer: str


# ══════════════════════════════════════════════════════════════════════════════
#  MEMBERS
# ══════════════════════════════════════════════════════════════════════════════


class MemberActivityOut(BaseModel):
    id: int
    type: str  # "post" | "reply" | "upload" | "question" | "like"
    time: str
    text: str
    context: str | None = None
    tag: str | None = None


class MemberStatsOut(BaseModel):
    posts: int = 0
    replies: int = 0
    uploads: int = 0
    questions: int = 0
    likes: int = 0


class MemberOut(BaseModel):
    id: int
    name: str
    initials: str
    role: str
    status: str  # "online" | "recently" | "offline"
    statusLabel: str
    joinedAt: str
    location: str | None = None
    stats: MemberStatsOut
    activities: list[MemberActivityOut] = []
