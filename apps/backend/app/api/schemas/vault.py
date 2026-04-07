"""
Pydantic schemas for vault endpoints — favorites, likes, replies, activity, tags.
Mirrors shared TS types from apps/web/src/models/vault.ts.

Uses offset pagination for all vault lists (bounded per-user data).
"""

from __future__ import annotations

from pydantic import BaseModel, Field
from app.api.schemas.community import OffsetPageMeta


# ══════════════════════════════════════════════════════════════════════════════
#  SHARED
# ══════════════════════════════════════════════════════════════════════════════


class FavoritePostSnapshot(BaseModel):
    """Lightweight post snapshot stored with a favorite/like/reply."""
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


# ══════════════════════════════════════════════════════════════════════════════
#  FAVORITES
# ══════════════════════════════════════════════════════════════════════════════


class FavoriteToggleRequest(BaseModel):
    """Toggle a post in/out of favorites."""
    post_id: int
    group_id: str | None = None


class FavoriteOut(BaseModel):
    uuid: str
    type_code: str
    entity_id: int
    favorited_at: str  # ISO-8601
    post: FavoritePostSnapshot


class FavoriteToggleResponse(BaseModel):
    favorited: bool
    entry: FavoriteOut | None = None


class FavoriteListResponse(BaseModel):
    items: list[FavoriteOut]
    meta: OffsetPageMeta


# ══════════════════════════════════════════════════════════════════════════════
#  LIKES
# ══════════════════════════════════════════════════════════════════════════════


class LikeToggleRequest(BaseModel):
    post_id: int
    group_id: str | None = None


class LikeOut(BaseModel):
    uuid: str
    type_code: str
    entity_id: int
    liked_at: str  # ISO-8601
    post: FavoritePostSnapshot


class LikeToggleResponse(BaseModel):
    liked: bool
    entry: LikeOut | None = None


class LikeListResponse(BaseModel):
    items: list[LikeOut]
    meta: OffsetPageMeta


# ══════════════════════════════════════════════════════════════════════════════
#  REPLIED
# ══════════════════════════════════════════════════════════════════════════════


class ReplyRecordRequest(BaseModel):
    post_id: int
    reply_text: str = Field(..., min_length=1, max_length=2000)
    group_id: str | None = None


class RepliedOut(BaseModel):
    uuid: str
    type_code: str
    entity_id: int
    replied_at: str  # ISO-8601
    reply_text: str
    post: FavoritePostSnapshot


class RepliedListResponse(BaseModel):
    items: list[RepliedOut]
    meta: OffsetPageMeta


# ══════════════════════════════════════════════════════════════════════════════
#  ACTIVITY
# ══════════════════════════════════════════════════════════════════════════════


class ActivityCreateRequest(BaseModel):
    type_code: str
    action_code: str
    entity_id: str | int
    group_id: str | None = None
    description: str | None = None
    meta: dict | None = None


class ActivityOut(BaseModel):
    id: str  # UUID
    type_code: str
    action_code: str
    entity_id: str | int
    datetime: str  # ISO-8601
    user_id: str | None = None
    group_id: str | None = None
    description: str | None = None
    meta: dict | None = None


class ActivityListResponse(BaseModel):
    items: list[ActivityOut]
    meta: OffsetPageMeta


# ══════════════════════════════════════════════════════════════════════════════
#  TAGS
# ══════════════════════════════════════════════════════════════════════════════


class TagInfo(BaseModel):
    tag: str
    slug: str
    post_count: int


class TagListResponse(BaseModel):
    items: list[TagInfo]
    count: int


class TagPostsResponse(BaseModel):
    tag: str
    slug: str
    posts: list[FavoritePostSnapshot]
    count: int
