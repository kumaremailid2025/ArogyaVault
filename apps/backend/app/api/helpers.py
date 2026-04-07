"""
Shared helpers for API route handlers.

Eliminates duplication across community, vault, and invite routes by
centralising pagination, activity recording, attachment building, and
author construction in one importable module.
"""

from __future__ import annotations

import math
import uuid
from datetime import datetime, timezone
from typing import TYPE_CHECKING

from app.api.schemas.community import OffsetPageMeta
from app.api.store import USER_ACTIVITIES

if TYPE_CHECKING:
    from app.core.deps import PlatformContext


# ══════════════════════════════════════════════════════════════════════════════
#  OFFSET PAGINATION
# ══════════════════════════════════════════════════════════════════════════════


def paginate_offset(
    items: list,
    page: int,
    page_size: int,
) -> tuple[list, OffsetPageMeta]:
    """
    Apply offset pagination and return (page_items, meta).

    Used by every bounded-list endpoint (replies, files, members,
    favorites, likes, activities, invites).
    """
    total = len(items)
    total_pages = max(1, math.ceil(total / page_size))
    start = (page - 1) * page_size
    page_items = items[start : start + page_size]
    return page_items, OffsetPageMeta(
        page=page,
        page_size=page_size,
        total=total,
        total_pages=total_pages,
    )


# ══════════════════════════════════════════════════════════════════════════════
#  ACTIVITY RECORDING
# ══════════════════════════════════════════════════════════════════════════════


def record_activity(
    user_id: str,
    type_code: str,
    action_code: str,
    entity_id: int | str,
    group_id: str | None = None,
    description: str | None = None,
    meta: dict | None = None,
) -> dict:
    """
    Record an activity entry for a user.

    Shared by community (like sync), vault (favorites/likes/replies),
    and invite routes. Stores in the global USER_ACTIVITIES dict,
    newest first.
    """
    entry = {
        "id": str(uuid.uuid4()),
        "type_code": type_code,
        "action_code": action_code,
        "entity_id": entity_id,
        "datetime": datetime.now(timezone.utc).isoformat(),
        "user_id": user_id,
        "group_id": group_id,
        "description": description,
        "meta": meta,
    }
    USER_ACTIVITIES.setdefault(user_id, []).insert(0, entry)
    return entry


# ══════════════════════════════════════════════════════════════════════════════
#  ATTACHMENT BUILDING
# ══════════════════════════════════════════════════════════════════════════════


def build_attachments(raw_attachments: list) -> list[dict]:
    """
    Convert a list of AttachmentCreate schema objects into storage dicts
    with server-assigned UUIDs.

    Used by create_post and submit_reply in community routes.
    """
    result: list[dict] = []
    for att in raw_attachments:
        result.append({
            "id": str(uuid.uuid4()),
            "type": att.type.value,
            "url": att.url,
            "filename": att.filename,
            "mime_type": att.mime_type,
            "size_bytes": att.size_bytes,
            "duration_seconds": att.duration_seconds,
            "thumbnail_url": att.thumbnail_url,
            "transcription": att.transcription,
            "metadata": None,
        })
    return result


# ══════════════════════════════════════════════════════════════════════════════
#  AUTHOR CONSTRUCTION
# ══════════════════════════════════════════════════════════════════════════════


def make_author(user: dict, role: str | None = None) -> dict:
    """Build an AuthorOut-compatible dict from a user record."""
    return {
        "id": user.get("id", "unknown"),
        "name": user.get("name", "Unknown"),
        "initials": user.get("initials", "??"),
        "role": role,
        "avatar_url": user.get("avatar_url"),
    }


def author_from_post(post: dict) -> dict:
    """Build AuthorOut from the post's embedded author fields (legacy data)."""
    return {
        "id": post.get("author_id", "unknown"),
        "name": post.get("author", "Unknown"),
        "initials": post.get("initials", "??"),
        "role": post.get("author_role"),
        "avatar_url": post.get("avatar_url"),
    }
