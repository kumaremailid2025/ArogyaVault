"""
Community API routes — feed, posts, replies, files, members, AI.

Industry-standard patterns:
  - Cursor-based pagination for the post feed (scalable, no offset drift)
  - Offset pagination for bounded lists (files, members, replies)
  - Rich media attachments on posts & replies (images, voice, documents)
  - Search, filter, and sort on posts
  - Single post detail endpoint
  - File upload endpoint
  - User dependency injection (ready for JWT auth)
  - Unified like tracking (community + vault synced)
  - Platform-aware pagination defaults (mobile=10, web=20)
  - X-Platform / X-App-Version / X-Device-Id header support
"""

from __future__ import annotations

import sys
import uuid as _uuid
from datetime import datetime, timezone
from pathlib import Path
from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, Query

from app.api.helpers import (
    build_attachments,
    author_from_post,
    make_author,
    paginate_offset,
    record_activity,
)
from app.api.store import (
    COMMUNITY_POSTS,
    POST_NEXT_ID,
    REPLY_NEXT_ID,
    POST_LIKES,
    POST_SUMMARIES,
    POST_AI_RESPONSES,
    COMMUNITY_FILES,
    FILE_NEXT_ID,
    QA_NEXT_ID,
    COMMUNITY_MEMBERS,
    USERS_BY_ID,
    # Vault stores for like sync
    USER_LIKES as VAULT_USER_LIKES,
    TAG_INDEX,
    TAG_SLUG_MAP,
    _post_snapshot,
    _tag_to_slug,
)
from app.api.schemas.community import (
    # Enums
    PostSortField,
    SortOrder,
    AttachmentType,
    # Pagination
    CursorPageMeta,
    # Attachments
    Attachment,
    # Posts
    AuthorOut,
    PostListOut,
    PostOut,
    PostCreate,
    PostReplyOut,
    ReplyCreate,
    LikeToggleResponse,
    PostListResponse,
    ReplyListResponse,
    # AI
    PostSummaryOut,
    RephraseRequest,
    RephraseResponse,
    # Files
    FileOut,
    FileUploadOut,
    FileQACreate,
    FileQAOut,
    RecentFileQAOut,
    FileListResponse,
    # Members
    MemberOut,
    MemberStatsOut,
    MemberActivityOut,
    MemberListResponse,
)
from app.core.deps import get_current_user, get_platform, PlatformContext
from app.core.exceptions import NotFoundError

# ── Add ai-service to sys.path so we can import its modules ──────────────────
_AI_SERVICE_ROOT = str(Path(__file__).resolve().parents[4] / "ai-service")
if _AI_SERVICE_ROOT not in sys.path:
    sys.path.insert(0, _AI_SERVICE_ROOT)

router = APIRouter(prefix="/community", tags=["community"])

# Type aliases for dependency injection
CurrentUser = Annotated[dict, Depends(get_current_user)]
Platform = Annotated[PlatformContext, Depends(get_platform)]

# ══════════════════════════════════════════════════════════════════════════════
#  HELPERS
# ══════════════════════════════════════════════════════════════════════════════


def _post_to_list_out(post: dict) -> dict:
    """Transform an internal post dict into PostListOut shape."""
    return {
        "id": post["id"],
        "group_id": post["group_id"],
        "author": author_from_post(post),
        "location": post.get("location", ""),
        "time": post.get("time", ""),
        "text": post.get("text", ""),
        "likes": post.get("likes", 0),
        "replyCount": len(post.get("replies", [])),
        "tag": post.get("tag", ""),
        "attachments": post.get("attachments", []),
        "is_pinned": post.get("is_pinned", False),
        "created_at": post.get("created_at"),
    }


def _reply_to_out(reply: dict) -> dict:
    """Transform an internal reply dict into PostReplyOut shape."""
    return {
        "id": reply.get("id", 0),
        "author": {
            "id": reply.get("author_id", "unknown"),
            "name": reply.get("author", "Unknown"),
            "initials": reply.get("initials", "??"),
            "role": reply.get("author_role"),
            "avatar_url": reply.get("avatar_url"),
        },
        "time": reply.get("time", ""),
        "text": reply.get("text", ""),
        "attachments": reply.get("attachments", []),
        "likes": reply.get("likes", 0),
        "created_at": reply.get("created_at"),
    }


def _find_post_in_group(group_id: str, post_id: int) -> dict:
    """Find a post or raise 404."""
    posts = COMMUNITY_POSTS.get(group_id, [])
    post = next((p for p in posts if p["id"] == post_id), None)
    if not post:
        raise NotFoundError("Post")
    return post


# ══════════════════════════════════════════════════════════════════════════════
#  POSTS — cursor-paginated feed with search/filter/sort
# ══════════════════════════════════════════════════════════════════════════════


@router.get("/{group_id}/posts", response_model=PostListResponse)
async def list_posts(
    group_id: str,
    user: CurrentUser,
    ctx: Platform,
    # Pagination
    cursor: str | None = Query(None, description="Cursor (post ID) for next page"),
    limit: int | None = Query(default=None, ge=1, le=100, description="Posts per page"),
    # Search & filter
    q: str | None = Query(None, description="Full-text search on post text"),
    tag: str | None = Query(None, description="Filter by tag"),
    author: str | None = Query(None, description="Filter by author name"),
    # Sort
    sort: PostSortField = Query(PostSortField.CREATED, description="Sort field"),
    order: SortOrder = Query(SortOrder.DESC, description="Sort direction"),
):
    """
    Return paginated posts for a group with optional search, filter, and sort.

    Pagination uses cursor-based approach — pass the `next_cursor` from the
    response `meta` to get the next page.

    Default page size adapts to platform: mobile=10, web=20.
    """
    if limit is None:
        limit = ctx.feed_limit()

    all_posts = COMMUNITY_POSTS.get(group_id, [])

    # ── Filter ──
    filtered = all_posts
    if q:
        q_lower = q.lower()
        filtered = [p for p in filtered if q_lower in p.get("text", "").lower()]
    if tag:
        tag_lower = tag.lower()
        filtered = [p for p in filtered if p.get("tag", "").lower() == tag_lower]
    if author:
        author_lower = author.lower()
        filtered = [p for p in filtered if author_lower in p.get("author", "").lower()]

    # ── Sort ──
    sort_keys = {
        PostSortField.CREATED: lambda p: p["id"],  # ID is monotonic
        PostSortField.LIKES: lambda p: p.get("likes", 0),
        PostSortField.REPLIES: lambda p: len(p.get("replies", [])),
    }
    filtered.sort(key=sort_keys[sort], reverse=(order == SortOrder.DESC))

    total = len(filtered)

    # ── Cursor pagination ──
    start_idx = 0
    if cursor:
        try:
            cursor_id = int(cursor)
            for i, p in enumerate(filtered):
                if p["id"] == cursor_id:
                    start_idx = i + 1
                    break
        except ValueError:
            pass

    page = filtered[start_idx : start_idx + limit]

    has_next = (start_idx + limit) < total
    next_cursor = str(page[-1]["id"]) if has_next and page else None
    has_prev = start_idx > 0
    prev_cursor = str(filtered[start_idx - 1]["id"]) if has_prev else None

    items = [_post_to_list_out(p) for p in page]

    return PostListResponse(
        items=items,
        meta=CursorPageMeta(
            has_next=has_next,
            next_cursor=next_cursor,
            has_prev=has_prev,
            prev_cursor=prev_cursor,
            total=total,
        ),
    )


@router.get("/posts/{post_id}", response_model=PostOut)
async def get_post(post_id: int, group_id: str, user: CurrentUser):
    """Get a single post with all replies."""
    post = _find_post_in_group(group_id, post_id)

    return {
        **_post_to_list_out(post),
        "replies": [_reply_to_out(r) for r in post.get("replies", [])],
    }


@router.post("/{group_id}/posts", response_model=PostOut, status_code=201)
async def create_post(group_id: str, body: PostCreate, user: CurrentUser):
    """Create a new post in a group with optional attachments."""
    global REPLY_NEXT_ID

    next_id = POST_NEXT_ID.get(group_id, 0)
    POST_NEXT_ID[group_id] = next_id + 1

    now = datetime.now(timezone.utc)

    attachments = build_attachments(body.attachments)

    post = {
        "id": next_id,
        "group_id": group_id,
        "author_id": user["id"],
        "author": user["name"],
        "initials": user["initials"],
        "author_role": user.get("role"),
        "location": user.get("location", ""),
        "time": "Just now",
        "text": body.text,
        "likes": 0,
        "replyCount": 0,
        "tag": body.tag,
        "attachments": attachments,
        "replies": [],
        "is_pinned": False,
        "created_at": now.isoformat(),
    }

    if group_id not in COMMUNITY_POSTS:
        COMMUNITY_POSTS[group_id] = []
    COMMUNITY_POSTS[group_id].insert(0, post)

    # Update tag index
    if body.tag:
        slug = _tag_to_slug(body.tag)
        TAG_SLUG_MAP[slug] = body.tag
        TAG_INDEX.setdefault(body.tag, []).append(_post_snapshot(post))

    return {
        **_post_to_list_out(post),
        "replies": [],
    }


# ══════════════════════════════════════════════════════════════════════════════
#  REPLIES — offset-paginated, with attachment support
# ══════════════════════════════════════════════════════════════════════════════


@router.get("/posts/{post_id}/replies", response_model=ReplyListResponse)
async def get_replies(
    post_id: int,
    group_id: str,
    user: CurrentUser,
    ctx: Platform,
    page: int = Query(1, ge=1, description="Page number"),
    page_size: int | None = Query(default=None, ge=1, le=100, description="Replies per page"),
):
    """Get paginated replies for a post. Default page size adapts to platform."""
    if page_size is None:
        page_size = ctx.page_size()

    post = _find_post_in_group(group_id, post_id)
    all_replies = post.get("replies", [])

    page_items, meta = paginate_offset(all_replies, page, page_size)

    return ReplyListResponse(
        items=[_reply_to_out(r) for r in page_items],
        meta=meta,
    )


@router.post("/posts/{post_id}/replies", response_model=PostReplyOut, status_code=201)
async def submit_reply(
    post_id: int, group_id: str, body: ReplyCreate, user: CurrentUser
):
    """Add a reply to a post with optional attachments."""
    global REPLY_NEXT_ID

    post = _find_post_in_group(group_id, post_id)

    reply_id = REPLY_NEXT_ID
    REPLY_NEXT_ID += 1

    now = datetime.now(timezone.utc)

    attachments = build_attachments(body.attachments)

    reply = {
        "id": reply_id,
        "author_id": user["id"],
        "initials": user["initials"],
        "author": user["name"],
        "author_role": user.get("role"),
        "time": "Just now",
        "text": body.text,
        "attachments": attachments,
        "likes": 0,
        "created_at": now.isoformat(),
    }
    post.setdefault("replies", []).append(reply)
    post["replyCount"] = len(post["replies"])

    return _reply_to_out(reply)


# ══════════════════════════════════════════════════════════════════════════════
#  LIKES — unified with vault tracking
# ══════════════════════════════════════════════════════════════════════════════


@router.post("/posts/{post_id}/like", response_model=LikeToggleResponse)
async def toggle_like(post_id: int, group_id: str, user: CurrentUser):
    """
    Toggle like on a post. Syncs with vault likes so both community feed
    and My Liked Posts stay consistent.
    """
    user_id = user["id"]

    post = _find_post_in_group(group_id, post_id)

    key = (group_id, post_id, user_id)
    user_vault_likes = VAULT_USER_LIKES.setdefault(user_id, {})

    if key in POST_LIKES:
        # Unlike
        POST_LIKES.discard(key)
        post["likes"] = max(0, post.get("likes", 0) - 1)

        # Remove from vault likes
        user_vault_likes.pop(post_id, None)

        record_activity(
            user_id=user_id,
            type_code="POST",
            action_code="UNLIKE",
            entity_id=post_id,
            group_id=group_id,
            description=f"Unliked post by {post['author']}",
        )
        liked = False
    else:
        # Like
        POST_LIKES.add(key)
        post["likes"] = post.get("likes", 0) + 1

        # Sync to vault likes
        vault_entry = {
            "uuid": str(_uuid.uuid4()),
            "type_code": "POST",
            "entity_id": post_id,
            "liked_at": datetime.now(timezone.utc).isoformat(),
            "post": _post_snapshot(post),
        }
        user_vault_likes[post_id] = vault_entry

        record_activity(
            user_id=user_id,
            type_code="POST",
            action_code="LIKE",
            entity_id=post_id,
            group_id=group_id,
            description=f"Liked post by {post['author']}",
            meta={"likeUuid": vault_entry["uuid"]},
        )
        liked = True

    return LikeToggleResponse(
        post_id=post_id,
        liked=liked,
        total_likes=post["likes"],
    )


# ══════════════════════════════════════════════════════════════════════════════
#  AI — summaries & rephrasings
# ══════════════════════════════════════════════════════════════════════════════


@router.get("/posts/{post_id}/summary", response_model=PostSummaryOut)
async def get_post_summary_endpoint(
    post_id: int, group_id: str, user: CurrentUser
):
    """Get AI summary + response for a post."""
    post = _find_post_in_group(group_id, post_id)

    stored_summary = POST_SUMMARIES.get(post_id)
    stored_ai = POST_AI_RESPONSES.get(post_id)

    try:
        from app.services.summarizer import get_post_summary

        reply_texts = [r["text"] for r in post.get("replies", [])]
        summary, ai_response = await get_post_summary(
            post["text"],
            reply_texts,
            stored_summary=stored_summary,
            stored_ai_response=stored_ai,
        )
    except ImportError:
        summary = stored_summary or "AI summary is not available."
        ai_response = stored_ai or "AI response is not available."

    return PostSummaryOut(
        post_id=post_id,
        summary=summary,
        ai_response=ai_response,
    )


@router.post("/rephrase", response_model=RephraseResponse)
async def rephrase_text(body: RephraseRequest, user: CurrentUser):
    """Return two rephrased versions of the input text."""
    try:
        from app.services.rephraser import get_rephrasings

        rephrasings = await get_rephrasings(body.text)
    except ImportError:
        rephrasings = [
            "I would like to share that " + body.text[0].lower() + body.text[1:],
            " ".join(body.text.split()[: max(len(body.text.split()) // 2, 5)]) + ".",
        ]

    return RephraseResponse(original=body.text, rephrasings=rephrasings)


# ══════════════════════════════════════════════════════════════════════════════
#  FILES — offset-paginated, with upload
# ══════════════════════════════════════════════════════════════════════════════


@router.get("/{group_id}/files", response_model=FileListResponse)
async def list_files(
    group_id: str,
    user: CurrentUser,
    ctx: Platform,
    page: int = Query(1, ge=1),
    page_size: int | None = Query(default=None, ge=1, le=100),
    category: str | None = Query(None, description="Filter by category"),
    q: str | None = Query(None, description="Search filename"),
):
    """Return paginated files for a group with optional filter. Platform-adaptive page size."""
    if page_size is None:
        page_size = ctx.page_size()

    files = COMMUNITY_FILES.get(group_id, [])

    # Filters
    if category:
        cat_lower = category.lower()
        files = [f for f in files if f.get("category", "").lower() == cat_lower]
    if q:
        q_lower = q.lower()
        files = [f for f in files if q_lower in f.get("name", "").lower()]

    for f in files:
        f["qaCount"] = len(f.get("questions", []))

    page_items, meta = paginate_offset(files, page, page_size)

    return FileListResponse(
        items=page_items,
        meta=meta,
    )


@router.get("/files/{file_id}", response_model=FileOut)
async def get_file(file_id: int, group_id: str, user: CurrentUser):
    """Get a single file by ID."""
    files = COMMUNITY_FILES.get(group_id, [])
    file = next((f for f in files if f["id"] == file_id), None)
    if not file:
        raise NotFoundError("File")
    file["qaCount"] = len(file.get("questions", []))
    return file


@router.post("/{group_id}/files", response_model=FileUploadOut, status_code=201)
async def upload_file(
    group_id: str,
    user: CurrentUser,
    name: str = Query(..., description="File name"),
    type: str = Query("pdf", description="File type (pdf, xlsx, docx, jpg, png)"),
    size: str = Query("0 KB", description="File size display string"),
    category: str = Query("General", description="File category"),
):
    """
    Upload a file to a group (mock — stores metadata in-memory).

    In production this would accept multipart/form-data and store the
    file in object storage (S3/GCS), returning a signed URL.
    """
    global FILE_NEXT_ID

    file_id = FILE_NEXT_ID
    FILE_NEXT_ID += 1

    now = datetime.now(timezone.utc)
    file_entry = {
        "id": file_id,
        "group_id": group_id,
        "name": name,
        "type": type,
        "size": size,
        "uploadedBy": user["name"],
        "uploadedByInitials": user["initials"],
        "uploadedAt": now.strftime("%b %d, %Y"),
        "category": category,
        "aiSummary": f"AI summary for {name} will be generated shortly.",
        "qaCount": 0,
        "questions": [],
    }

    COMMUNITY_FILES.setdefault(group_id, []).append(file_entry)

    return FileUploadOut(
        id=file_id,
        group_id=group_id,
        name=name,
        type=type,
        size=size,
        uploadedBy=user["name"],
        uploadedByInitials=user["initials"],
        uploadedAt=file_entry["uploadedAt"],
        category=category,
        aiSummary=file_entry["aiSummary"],
    )


@router.post("/files/{file_id}/qa", response_model=FileQAOut, status_code=201)
async def ask_file_question(
    file_id: int, group_id: str, body: FileQACreate, user: CurrentUser
):
    """Ask a question about a file — returns AI-generated answer."""
    global QA_NEXT_ID

    files = COMMUNITY_FILES.get(group_id, [])
    file = next((f for f in files if f["id"] == file_id), None)
    if not file:
        raise NotFoundError("File")

    try:
        from app.services.qa import answer_file_question

        answer = await answer_file_question(
            body.question,
            file["name"],
            file.get("aiSummary", ""),
        )
    except ImportError:
        answer = (
            f"ArogyaAI is analysing \"{file['name']}\" to answer your question. "
            "This typically takes a few moments."
        )

    qa_id = QA_NEXT_ID
    QA_NEXT_ID += 1

    qa_entry = {
        "id": qa_id,
        "question": body.question,
        "askedBy": user["name"],
        "askedByInitials": user["initials"],
        "askedAt": datetime.now(timezone.utc).strftime("%b %d, %Y"),
        "answer": answer,
    }
    file.setdefault("questions", []).append(qa_entry)
    file["qaCount"] = len(file["questions"])

    return qa_entry


@router.get("/{group_id}/files/recent-qa", response_model=list[RecentFileQAOut])
async def recent_file_qa(group_id: str, user: CurrentUser):
    """Return the most recent Q&A across all files in a group."""
    files = COMMUNITY_FILES.get(group_id, [])
    recent: list[dict] = []
    for f in files:
        for qa in f.get("questions", []):
            recent.append(
                {
                    "fileId": f["id"],
                    "fileName": f["name"],
                    "fileCategory": f.get("category", ""),
                    "question": qa["question"],
                    "askedBy": qa["askedBy"],
                    "askedByInitials": qa["askedByInitials"],
                    "askedAt": qa["askedAt"],
                    "answer": qa["answer"],
                }
            )
    return recent[-10:][::-1]


# ══════════════════════════════════════════════════════════════════════════════
#  MEMBERS — offset-paginated, with search
# ══════════════════════════════════════════════════════════════════════════════


@router.get("/{group_id}/members", response_model=MemberListResponse)
async def list_members(
    group_id: str,
    user: CurrentUser,
    ctx: Platform,
    page: int = Query(1, ge=1),
    page_size: int | None = Query(default=None, ge=1, le=100),
    q: str | None = Query(None, description="Search by member name"),
    role: str | None = Query(None, description="Filter by role"),
    status: str | None = Query(None, description="Filter by status"),
):
    """Return paginated members for a group with optional search. Platform-adaptive page size."""
    if page_size is None:
        page_size = ctx.page_size()

    members = COMMUNITY_MEMBERS.get(group_id, [])

    if q:
        q_lower = q.lower()
        members = [m for m in members if q_lower in m.get("name", "").lower()]
    if role:
        role_lower = role.lower()
        members = [m for m in members if m.get("role", "").lower() == role_lower]
    if status:
        members = [m for m in members if m.get("status") == status]

    page_items, meta = paginate_offset(members, page, page_size)

    return MemberListResponse(
        items=page_items,
        meta=meta,
    )


@router.get("/members/{member_id}", response_model=MemberOut)
async def get_member(member_id: str, group_id: str, user: CurrentUser):
    """Get a single member by ID (UUID string)."""
    for members in COMMUNITY_MEMBERS.values():
        member = next((m for m in members if str(m["id"]) == member_id), None)
        if member:
            return member
    raise NotFoundError("Member")
