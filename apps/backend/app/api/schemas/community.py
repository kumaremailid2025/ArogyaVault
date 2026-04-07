"""
Pydantic schemas for community endpoints.
Mirrors shared TS types from apps/web/src/models/community.ts.

Industry-standard patterns:
  - Cursor-based pagination for feeds (scalable, no offset drift)
  - Offset pagination for bounded lists (files, members)
  - Rich media attachments for posts & replies (images, voice, documents)
  - Consistent response envelopes
"""

from __future__ import annotations

from pydantic import BaseModel, Field
from enum import Enum


# ══════════════════════════════════════════════════════════════════════════════
#  ENUMS
# ══════════════════════════════════════════════════════════════════════════════


class AttachmentType(str, Enum):
    IMAGE = "image"
    VOICE = "voice"
    DOCUMENT = "document"


class PostSortField(str, Enum):
    CREATED = "created"
    LIKES = "likes"
    REPLIES = "replies"


class SortOrder(str, Enum):
    ASC = "asc"
    DESC = "desc"


# ══════════════════════════════════════════════════════════════════════════════
#  PAGINATION
# ══════════════════════════════════════════════════════════════════════════════


class CursorPageMeta(BaseModel):
    """Cursor-based pagination metadata — ideal for feeds."""
    has_next: bool = False
    next_cursor: str | None = None
    has_prev: bool = False
    prev_cursor: str | None = None
    total: int = 0


class OffsetPageMeta(BaseModel):
    """Offset-based pagination metadata — ideal for bounded lists."""
    page: int = 1
    page_size: int = 20
    total: int = 0
    total_pages: int = 0


# ══════════════════════════════════════════════════════════════════════════════
#  ATTACHMENTS — rich media for posts & replies
# ══════════════════════════════════════════════════════════════════════════════


class Attachment(BaseModel):
    """A media attachment on a post or reply."""
    id: str
    type: AttachmentType
    url: str  # signed URL or relative path
    filename: str | None = None
    mime_type: str | None = None
    size_bytes: int | None = None
    duration_seconds: float | None = None  # voice recordings
    thumbnail_url: str | None = None  # image/document preview
    transcription: str | None = None  # voice → text
    metadata: dict | None = None


class AttachmentCreate(BaseModel):
    """Client sends this when creating a post/reply with attachments."""
    type: AttachmentType
    url: str
    filename: str | None = None
    mime_type: str | None = None
    size_bytes: int | None = None
    duration_seconds: float | None = None
    thumbnail_url: str | None = None
    transcription: str | None = None


# ══════════════════════════════════════════════════════════════════════════════
#  POSTS
# ══════════════════════════════════════════════════════════════════════════════


class AuthorOut(BaseModel):
    """Author info embedded in posts/replies."""
    id: str
    name: str
    initials: str
    role: str | None = None
    avatar_url: str | None = None


class PostReplyOut(BaseModel):
    id: int
    author: AuthorOut
    time: str
    text: str
    attachments: list[Attachment] = []
    likes: int = 0
    created_at: str | None = None

    # Keep flat initials/author for backward compat
    @property
    def initials(self) -> str:
        return self.author.initials

    @property
    def author_name(self) -> str:
        return self.author.name


class PostListOut(BaseModel):
    """Post in list view — no replies, lightweight."""
    id: int
    group_id: str
    author: AuthorOut
    location: str
    time: str
    text: str
    likes: int = 0
    replyCount: int = 0
    tag: str
    attachments: list[Attachment] = []
    is_pinned: bool = False
    created_at: str | None = None


class PostOut(BaseModel):
    """Full post detail with embedded replies."""
    id: int
    group_id: str
    author: AuthorOut
    location: str
    time: str
    text: str
    likes: int = 0
    replyCount: int = 0
    tag: str
    attachments: list[Attachment] = []
    replies: list[PostReplyOut] = []
    is_pinned: bool = False
    created_at: str | None = None


class PostCreate(BaseModel):
    text: str = Field(..., min_length=1, max_length=5000)
    tag: str = "Discussion"
    attachments: list[AttachmentCreate] = []


class ReplyCreate(BaseModel):
    text: str = Field(..., min_length=1, max_length=2000)
    attachments: list[AttachmentCreate] = []


class LikeToggleResponse(BaseModel):
    post_id: int
    liked: bool
    total_likes: int


# ── Paginated responses ──────────────────────────────────────────────────────

class PostListResponse(BaseModel):
    """Cursor-paginated post feed."""
    items: list[PostListOut]
    meta: CursorPageMeta


class ReplyListResponse(BaseModel):
    """Offset-paginated replies for a post."""
    items: list[PostReplyOut]
    meta: OffsetPageMeta


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


class FileUploadOut(BaseModel):
    """Response after uploading a file."""
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


class FileListResponse(BaseModel):
    """Offset-paginated file list."""
    items: list[FileOut]
    meta: OffsetPageMeta


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


class MemberListResponse(BaseModel):
    """Offset-paginated member list."""
    items: list[MemberOut]
    meta: OffsetPageMeta
