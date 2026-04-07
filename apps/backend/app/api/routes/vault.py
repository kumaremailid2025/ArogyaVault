"""
Vault API routes — favorites, likes, replies, activity, tags.

All data lives in the in-memory store (app.api.store).
Uses dependency injection for the current user (ready for JWT auth).
All list endpoints use offset-based pagination with consistent meta.
Platform-aware pagination defaults (mobile=10, web=20).
"""

from __future__ import annotations

import uuid
from datetime import datetime, timezone
from typing import Annotated

from fastapi import APIRouter, Depends, Query

from app.api.helpers import paginate_offset, record_activity
from app.api.store import (
    COMMUNITY_POSTS,
    USER_FAVORITES,
    USER_LIKES,
    USER_REPLIED,
    USER_ACTIVITIES,
    TAG_INDEX,
    TAG_SLUG_MAP,
    _post_snapshot,
    _tag_to_slug,
)
from app.api.schemas.vault import (
    # Favorites
    FavoriteToggleRequest,
    FavoriteOut,
    FavoriteToggleResponse,
    FavoriteListResponse,
    # Likes
    LikeToggleRequest,
    LikeOut,
    LikeToggleResponse,
    LikeListResponse,
    # Replied
    ReplyRecordRequest,
    RepliedOut,
    RepliedListResponse,
    # Activity
    ActivityCreateRequest,
    ActivityOut,
    ActivityListResponse,
    # Tags
    TagInfo,
    TagListResponse,
    TagPostsResponse,
)
from app.core.deps import get_current_user, get_platform, PlatformContext
from app.core.exceptions import NotFoundError

router = APIRouter(prefix="/vault", tags=["vault"])

# Type aliases for dependency injection
CurrentUser = Annotated[dict, Depends(get_current_user)]
Platform = Annotated[PlatformContext, Depends(get_platform)]


# ══════════════════════════════════════════════════════════════════════════════
#  HELPERS
# ══════════════════════════════════════════════════════════════════════════════


def _find_post(post_id: int, group_id: str | None = None) -> dict | None:
    """Find a post across all groups (or within a specific group)."""
    if group_id:
        posts = COMMUNITY_POSTS.get(group_id, [])
        return next((p for p in posts if p["id"] == post_id), None)
    for posts in COMMUNITY_POSTS.values():
        post = next((p for p in posts if p["id"] == post_id), None)
        if post:
            return post
    return None


# ══════════════════════════════════════════════════════════════════════════════
#  FAVORITES
# ══════════════════════════════════════════════════════════════════════════════


@router.get("/favorites", response_model=FavoriteListResponse)
async def list_favorites(
    user: CurrentUser,
    ctx: Platform,
    page: int = Query(1, ge=1),
    page_size: int | None = Query(default=None, ge=1, le=100),
):
    """Return paginated favorites for the current user, newest first."""
    if page_size is None:
        page_size = ctx.page_size()

    user_favs = USER_FAVORITES.get(user["id"], {})
    all_items = sorted(user_favs.values(), key=lambda x: x["favorited_at"], reverse=True)
    items, meta = paginate_offset(all_items, page, page_size)
    return FavoriteListResponse(items=items, meta=meta)


@router.post("/favorites", response_model=FavoriteToggleResponse)
async def toggle_favorite(body: FavoriteToggleRequest, user: CurrentUser):
    """Toggle a post in/out of favorites."""
    user_id = user["id"]
    user_favs = USER_FAVORITES.setdefault(user_id, {})

    if body.post_id in user_favs:
        del user_favs[body.post_id]
        record_activity(
            user_id=user_id,
            type_code="POST",
            action_code="UNFAVORITE",
            entity_id=body.post_id,
            group_id=body.group_id,
            description=f"Unfavorited post #{body.post_id}",
        )
        return FavoriteToggleResponse(favorited=False, entry=None)

    post = _find_post(body.post_id, body.group_id)
    if not post:
        raise NotFoundError("Post")

    entry = {
        "uuid": str(uuid.uuid4()),
        "type_code": "POST",
        "entity_id": body.post_id,
        "favorited_at": datetime.now(timezone.utc).isoformat(),
        "post": _post_snapshot(post),
    }
    user_favs[body.post_id] = entry

    record_activity(
        user_id=user_id,
        type_code="POST",
        action_code="FAVORITE",
        entity_id=body.post_id,
        group_id=body.group_id,
        description=f"Favorited post by {post['author']}",
        meta={"postText": post["text"][:100]},
    )
    return FavoriteToggleResponse(favorited=True, entry=entry)


@router.delete("/favorites/{post_id}")
async def remove_favorite(post_id: int, user: CurrentUser):
    """Remove a post from favorites (explicit delete)."""
    user_id = user["id"]
    user_favs = USER_FAVORITES.get(user_id, {})
    if post_id not in user_favs:
        raise NotFoundError("Favorite")
    del user_favs[post_id]
    record_activity(
        user_id=user_id,
        type_code="POST",
        action_code="UNFAVORITE",
        entity_id=post_id,
        description=f"Removed favorite post #{post_id}",
    )
    return {"removed": True}


# ══════════════════════════════════════════════════════════════════════════════
#  LIKES
# ══════════════════════════════════════════════════════════════════════════════


@router.get("/likes", response_model=LikeListResponse)
async def list_likes(
    user: CurrentUser,
    ctx: Platform,
    page: int = Query(1, ge=1),
    page_size: int | None = Query(default=None, ge=1, le=100),
):
    """Return paginated liked posts for the current user, newest first."""
    if page_size is None:
        page_size = ctx.page_size()

    user_likes = USER_LIKES.get(user["id"], {})
    all_items = sorted(user_likes.values(), key=lambda x: x["liked_at"], reverse=True)
    items, meta = paginate_offset(all_items, page, page_size)
    return LikeListResponse(items=items, meta=meta)


@router.post("/likes", response_model=LikeToggleResponse)
async def toggle_like(body: LikeToggleRequest, user: CurrentUser):
    """Toggle a like on a post."""
    user_id = user["id"]
    user_likes = USER_LIKES.setdefault(user_id, {})

    if body.post_id in user_likes:
        del user_likes[body.post_id]
        record_activity(
            user_id=user_id,
            type_code="POST",
            action_code="UNLIKE",
            entity_id=body.post_id,
            group_id=body.group_id,
            description=f"Unliked post #{body.post_id}",
        )
        return LikeToggleResponse(liked=False, entry=None)

    post = _find_post(body.post_id, body.group_id)
    if not post:
        raise NotFoundError("Post")

    entry = {
        "uuid": str(uuid.uuid4()),
        "type_code": "POST",
        "entity_id": body.post_id,
        "liked_at": datetime.now(timezone.utc).isoformat(),
        "post": _post_snapshot(post),
    }
    user_likes[body.post_id] = entry

    record_activity(
        user_id=user_id,
        type_code="POST",
        action_code="LIKE",
        entity_id=body.post_id,
        group_id=body.group_id,
        description=f"Liked post by {post['author']}",
        meta={"likeUuid": entry["uuid"]},
    )
    return LikeToggleResponse(liked=True, entry=entry)


@router.delete("/likes/{post_id}")
async def remove_like(post_id: int, user: CurrentUser):
    """Remove a like (explicit delete)."""
    user_id = user["id"]
    user_likes = USER_LIKES.get(user_id, {})
    if post_id not in user_likes:
        raise NotFoundError("Like")
    del user_likes[post_id]
    record_activity(
        user_id=user_id,
        type_code="POST",
        action_code="UNLIKE",
        entity_id=post_id,
        description=f"Removed like on post #{post_id}",
    )
    return {"removed": True}


# ══════════════════════════════════════════════════════════════════════════════
#  REPLIED
# ══════════════════════════════════════════════════════════════════════════════


@router.get("/replied", response_model=RepliedListResponse)
async def list_replied(
    user: CurrentUser,
    ctx: Platform,
    page: int = Query(1, ge=1),
    page_size: int | None = Query(default=None, ge=1, le=100),
):
    """Return paginated posts the user has replied to, newest first."""
    if page_size is None:
        page_size = ctx.page_size()

    user_replied = USER_REPLIED.get(user["id"], {})
    all_items = sorted(user_replied.values(), key=lambda x: x["replied_at"], reverse=True)
    items, meta = paginate_offset(all_items, page, page_size)
    return RepliedListResponse(items=items, meta=meta)


@router.post("/replied", response_model=RepliedOut, status_code=201)
async def record_reply(body: ReplyRecordRequest, user: CurrentUser):
    """Record that the user replied to a post."""
    user_id = user["id"]
    user_replied = USER_REPLIED.setdefault(user_id, {})

    post = _find_post(body.post_id, body.group_id)
    if not post:
        raise NotFoundError("Post")

    entry = {
        "uuid": str(uuid.uuid4()),
        "type_code": "REPLY",
        "entity_id": body.post_id,
        "replied_at": datetime.now(timezone.utc).isoformat(),
        "reply_text": body.reply_text,
        "post": _post_snapshot(post),
    }
    user_replied[body.post_id] = entry

    record_activity(
        user_id=user_id,
        type_code="POST",
        action_code="REPLY_SUBMIT",
        entity_id=body.post_id,
        group_id=body.group_id,
        description=f"Replied to post by {post['author']}",
        meta={"replyText": body.reply_text[:100]},
    )
    return entry


# ══════════════════════════════════════════════════════════════════════════════
#  ACTIVITY
# ══════════════════════════════════════════════════════════════════════════════


@router.get("/activities", response_model=ActivityListResponse)
async def list_activities(
    user: CurrentUser,
    ctx: Platform,
    type_code: str | None = Query(None, description="Filter by type_code"),
    action_code: str | None = Query(None, description="Filter by action_code"),
    page: int = Query(1, ge=1),
    page_size: int | None = Query(default=None, ge=1, le=500),
):
    """Return the user's activity log, newest first. Optional filters & pagination."""
    if page_size is None:
        page_size = ctx.activity_page_size()

    activities = USER_ACTIVITIES.get(user["id"], [])

    if type_code:
        activities = [a for a in activities if a["type_code"] == type_code]
    if action_code:
        activities = [a for a in activities if a["action_code"] == action_code]

    items, meta = paginate_offset(activities, page, page_size)
    return ActivityListResponse(items=items, meta=meta)


@router.post("/activities", response_model=ActivityOut, status_code=201)
async def create_activity(body: ActivityCreateRequest, user: CurrentUser):
    """Record a new activity entry."""
    return record_activity(
        user_id=user["id"],
        type_code=body.type_code,
        action_code=body.action_code,
        entity_id=body.entity_id,
        group_id=body.group_id,
        description=body.description,
        meta=body.meta,
    )


# ══════════════════════════════════════════════════════════════════════════════
#  TAGS
# ══════════════════════════════════════════════════════════════════════════════


@router.get("/tags", response_model=TagListResponse)
async def list_tags(user: CurrentUser):
    """Return all known tags with post counts, sorted alphabetically."""
    items = [
        TagInfo(tag=tag, slug=_tag_to_slug(tag), post_count=len(posts))
        for tag, posts in sorted(TAG_INDEX.items())
    ]
    return TagListResponse(items=items, count=len(items))


@router.get("/tags/{slug}/posts", response_model=TagPostsResponse)
async def get_tag_posts(slug: str, user: CurrentUser):
    """Return all posts for a tag slug."""
    tag_label = TAG_SLUG_MAP.get(slug)
    if not tag_label:
        raise NotFoundError("Tag", f"Tag '{slug}' not found")

    posts = TAG_INDEX.get(tag_label, [])
    return TagPostsResponse(tag=tag_label, slug=slug, posts=posts, count=len(posts))
